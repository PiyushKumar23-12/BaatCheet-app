import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId } from "../lib/socket.js";
import Message from "../models/message.model.js";
import {io} from "../lib/socket.js"
import User from "../models/user.model.js";


export const getUsers=async({id})=>{
    // try{
        const filteredUsers=await User.find({_id:{$ne:id}}).select("-password");
        return filteredUsers;
    // }
    // catch(error){
    //     console.log("Error in getUsers service:",error.message);
    //     throw error;
    // }
}

export const sendMessage=async({senderId,receiverId,text,image})=>{
    // try {
        let imageUrl;
        if(image){
            const uploadResponse=await cloudinary.uploader.upload(image);
            imageUrl=uploadResponse.secure_url;
        }
        const newMessage=new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl,
        });
        await newMessage.save();
        const receiverSocketId=getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage);
        }
        return newMessage;
    // }
    //  catch (error) {
    //     console.log("Error in sendMessages service:",error.message);
    //     throw error;
    // }
};

export const getMessage=async({myId,userToChatId})=>{
    // try{
        const messages=await Message.find({
            $or:[
                {senderId:myId,receiverId:userToChatId},
                {senderId:userToChatId,receiverId:myId},
            ]
        })
        return messages;
    // } catch (error) {
    //     console.log("Error in getMessages service:",error.message);
    //     throw error; 
    // }
}