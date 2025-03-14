import express from "express";
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import dotenv from "dotenv"
import path from "path";
import cookieParser from "cookie-parser" 
import {connectDb} from "../src/lib/db.js"
import {app,server} from "./lib/socket.js"
import cors from "cors";

dotenv.config();

const PORT=process.env.PORT
const __dirname=path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:"https://baatcheet-frontend-9oom.onrender.com ",
    credentials:true,
}))


app.use("/api/auth",authRoutes)
app.use("/api/message",messageRoutes)


if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname,"../frontend/dist")));
  
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
  }

server.listen(PORT,()=>{
    console.log("Server is running on port:"+ PORT);
    connectDb();
})

