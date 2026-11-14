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
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "BAATCHEET backend is healthy"
    });
});

app.use(errorHandler);

export default app;
