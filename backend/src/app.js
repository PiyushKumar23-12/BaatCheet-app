import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { errorHandler } from "./middleware/error.middleware.js";
import cookieParser from "cookie-parser";
import { app } from "./lib/socket.js";
import { requestLogger } from "./middleware/requestLogger.middleware.js";
import env from "./config/env.js";
import swaggerUi from "swagger-ui-express";
import logger from "./lib/logger.js";
import swaggerSpec from "./config/swagger.js";
import cors from "cors";
import path from "path";

const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use(
    cors({
        origin: "https://baatcheet-frontend-9oom.onrender.com",
        credentials: true,
    })
);

app.use(requestLogger);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

app.use(errorHandler);

if (env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}

export default app;
