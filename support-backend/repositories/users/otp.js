import OTPSchema from "../../models/users/otp.js";

export const createOTP = async (data, session) => {
    return await OTPSchema.create([data], { session });
}

export const findOTP = async (query,session) => {
    return await OTPSchema.findOne(query).session(session);
}

export const deleteOTP = async (query, session) => {
    return await OTPSchema.deleteOne(query).session(session);
}