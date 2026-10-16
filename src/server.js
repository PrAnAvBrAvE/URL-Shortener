import 'dotenv/config';
import mongoose from "mongoose";

import app from "./app.js"
import logger from "./utils/logger.js";

const port = process.env.PORT || 3000

async function startServer() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not configured");
        }

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