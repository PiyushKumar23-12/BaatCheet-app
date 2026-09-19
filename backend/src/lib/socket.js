import { Server } from "socket.io";
import http from "http";
import express from "express";
import logger from "./logger.js";

const app=express();
const server=http.createServer(app);

const io=new Server(server,{
    cors:{
        origin:["https://baatcheet-frontend-9oom.onrender.com"]
    }
})

export function getReceiverSocketId(userId){
    return userSocketMap[userId];
}

const userSocketMap={};

io.on("connection",(socket) =>{
    logger.info("User connected.",socket.id);
    const userId=socket.handshake.query.userId;
    if(userId){
        userSocketMap[userId]=socket.id;
        io.emit("getOnlineUsers",Object.keys(userSocketMap));
    }
    socket.on("disconnect",()=>{
        logger.info("User disconnected",socket.id)
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap));
    })
})

export {io,app,server};