import { createOTP, deleteOTP, findOTP } from "../../repositories/users/otp.js";

export const createOTPService=async(data,session)=>{
    const otp=await createOTP(data,session);
    return otp[0];
}

export const findOTPService=async(query,session)=>{
    const otp=await findOTP(query,session);
    return otp;
}

export const deleteOTPService=async(query,session)=>{
    const otp=await deleteOTP(query,session);
    return otp;
}