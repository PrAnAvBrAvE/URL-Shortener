import express from "express"
import pinoHttp from "pino-http";
import router from "./routes/url.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import logger from "./utils/logger.js";

const app = express();

app.use(pinoHttp({
    logger,
    customLogLevel(req, res, err) {
        if (err || res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
    }
}))

app.use(express.json())
app.use(router)
app.use(errorHandler)

export default app;