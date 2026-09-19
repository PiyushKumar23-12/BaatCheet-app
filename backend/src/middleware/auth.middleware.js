import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import UnauthorizedError from "../errors/UnauthorizedError.js";
import env from "../config/env.js";
import logger from "../lib/logger.js";

export const protectRoute=async(req,res,next)=>{
    try{
        const token=req.cookies.jwt;
        if(!token){
            throw new UnauthorizedError("Authentication required");
        }
        const decoded=jwt.verify(token,env.JWT_SECRET)
        if(!decoded){
            throw new UnauthorizedError("Unauthorized-Invalid token.");
            // return res.status(401).json({message:"Unauthorized-Invalid token."});
        }
        const user=await User.findById(decoded.userId).select("-password");

        if(!user){
            throw new UnauthorizedError("Invalid authentication");
            // return res.status(404).json({message:"User not found."});
        }

        req.user=user
        next()
    }
    catch(error){

        logger.error("Error in Profile Middleware:",error.message);
        return res.status(500).json({message:"Internal Server Error"});
    }
}