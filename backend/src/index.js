import express from "express";
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import { errorHandler } from "./middleware/error.middleware.js";
import path from "path";
import cookieParser from "cookie-parser" 
import {connectDb} from "../src/lib/db.js"
import {app,server} from "./lib/socket.js"
import { requestLogger } from "./middleware/requestLogger.middleware.js";
import env from "./config/env.js";
import swaggerUi from "swagger-ui-express";
import logger from "./lib/logger.js";
import swaggerSpec from "./config/swagger.js";
import cors from "cors";


import dns from "node:dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const PORT=env.PORT
const __dirname=path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:"https://baatcheet-frontend-9oom.onrender.com",
    credentials:true,
}))


app.use(requestLogger);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth",authRoutes)
app.use("/api/message",messageRoutes)

app.use(errorHandler);

if (env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname,"../frontend/dist")));
  
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
  }

server.listen(PORT,()=>{
    logger.info(`Server is running on port: ${PORT}`);
    connectDb();
})

