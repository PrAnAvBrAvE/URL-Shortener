import express from "express"
import 'dotenv/config';
import mongoose from "mongoose";
import router from "./routes/url.routes.js";

const app = express();
const port = process.env.PORT || 3000

app.use(express.json())
app.use(router)

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Successfully connected to MongoDB");

        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
}

startServer();