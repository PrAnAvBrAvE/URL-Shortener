import express from "express"
import 'dotenv/config';
import mongoose from "mongoose";
import pinoHttp from "pino-http";
import router from "./routes/url.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import logger from "./utils/logger.js";

const app = express();
const port = process.env.PORT || 3000

app.use(express.json())

app.use(pinoHttp({
    logger,
    customLogLevel(req, res, err) {
        if (err || res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
    }
}))

app.use(router)
app.use(errorHandler)

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        logger.info("Successfully connected to MongoDB");

        app.listen(port, () => {
            logger.info({ port }, "Server started");
        });
    } catch (error) {
        logger.fatal({ err: error }, "Failed to start server");
        process.exit(1);
    }
}

startServer();