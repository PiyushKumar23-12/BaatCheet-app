// import { Server } from "socket.io";
// import http from "http";
// import express from "express";
// import logger from "./logger.js";

// const app=express();
// const server=http.createServer(app);

// const io=new Server(server,{
//     cors:{
//         origin:["https://baatcheet-frontend-9oom.onrender.com"]
//     }
// })

// export function getReceiverSocketId(userId){
//     return userSocketMap[userId];
// }

// const userSocketMap={};

// io.on("connection",(socket) =>{
//     logger.info("User connected.",socket.id);
//     const userId=socket.handshake.query.userId;
//     if(userId){
//         userSocketMap[userId]=socket.id;
//         io.emit("getOnlineUsers",Object.keys(userSocketMap));
//     }
//     socket.on("disconnect",()=>{
//         logger.info("User disconnected",socket.id)
//         delete userSocketMap[userId];
//         io.emit("getOnlineUsers",Object.keys(userSocketMap));
//     })
// })

// export {io,app,server};


import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import logger from "./logger.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["https://baatcheet-frontend-9oom.onrender.com"],
        credentials: true
    }
});

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

const userSocketMap = {};

// Authenticate socket using the existing JWT cookie
io.use((socket, next) => {
    const cookieHeader = socket.handshake.headers.cookie || "";
    const match = cookieHeader.match(/(?:^|;\s*)jwt=([^;]*)/);

    if (!match) {
        return next(new Error("Authentication required"));
    }

    let token;

    try {
        token = decodeURIComponent(match[1]);
        const decoded = jwt.verify(token, env.JWT_SECRET);

        if (!decoded.userId) {
            return next(new Error("Invalid authentication token"));
        }

        socket.userId = decoded.userId;
        next();
    } catch {
        next(new Error("Invalid or expired authentication token"));
    }
});

io.on("connection", (socket) => {
    const userId = String(socket.userId);

    logger.info("Authenticated user connected", socket.id);

    userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        logger.info("User disconnected", socket.id);

        // Avoid removing a newer connection for the same user
        if (userSocketMap[userId] === socket.id) {
            delete userSocketMap[userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
    });
});

export { io, app, server };
