import {z} from "zod";
import mongoose from "mongoose";

const objectId=z.string().refine((val)=>
    mongoose.Types.ObjectId.isValid(val),
    {
        message:"Invalid ID"
    }
);


export const messageIdSchema=z.object({
    params:z.object({
        id:objectId
    })
})


export const sendMessageSchema=z.object({
    params:z.object({
        id:objectId
    }),
    body:z.object({
        text: z.string().optional(),
        image: z.string().optional()
    }).refine((data)=>
    (data.text && data.text.trim().length > 0) || (data.image && data.image.length > 0),
    {
        message:"Message must contain text or image"
    }
    )
})