import mongoose from "mongoose";

export const startSession=async(req,res,next)=>{
    const session=await mongoose.startSession();
    session.startTransaction();
    return session;
};