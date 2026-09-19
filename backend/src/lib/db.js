import mongoose from "mongoose";
import env from "../config/env.js";
import logger from "./logger.js";

export const connectDb=async()=>{
    try{
        const conn=await mongoose.connect(env.MONGODB_URI);
        logger.info(`MongoDb connected successfully. ${conn.connection.host}`);
    }
    catch(error){
        logger.error(error);
    }
};