import asyncHandler from "../../middlerwares/AsynHandler.js";
import { generateJWT,generateRefreshToken,tempJWT, verifyTempJWT } from "../../security/JWT/JWT.js";
import { createOTPService, findOTPService } from "../../service/user/OTP.js";
import { loginUser, updateUser } from "../../service/user/userService.js";
import { sendEmail } from "../../utils/EmailService.js";
import generatePassword, { generateOTP } from "../../utils/RandomPasswordGenerator.js";
import { startSession } from "../../utils/sessionStart.js";

export const loginUserController=asyncHandler(async(req,res)=>{
    const session=await startSession();
    const user=await loginUser(req.body,session);
    const payload={
        userId:user._id,
        email:user.email,
        userRoles:user.userRoles
    }
    const token=tempJWT(payload);
    const otp=generateOTP(6);
    const otpData=await createOTPService({ userId: user._id, otp,expiresAt: new Date(Date.now() + 5 * 60 * 1000) }, session);
    console.log("OTP for login:", otpData);
    session.endSession();

    await sendEmail({
        to:user.email,
        subject:"Your OTP for Support Desk Login",
        html:`Your OTP for login is ${otp}. It will expire in 5 minutes.`
    });
    res.status(200).json({
        success:true,
        message:"Please verify the OTP sent to your email",
        data:{
            tempToken:token
        }
    });
});



export const verifyOTPController=asyncHandler(async(req,res)=>{
    const session=await startSession();
    const { tempToken, otp } = req.body;
    const decoded = verifyTempJWT(tempToken);
    console.log(decoded);
    if (!decoded) {
        return res.status(400).json({ message: "Invalid or expired token" });
    }
    const otpFromToken =await findOTPService({ userId: decoded.userId, otp: String(otp) }, session);
    if (!otpFromToken) {
        return res.status(400).json({ message: "Invalid OTP" });
    }
    const timeNow= new Date();
    if (otpFromToken.expiresAt < timeNow) {
        return res.status(400).json({ message: "OTP has expired" });
    }
    const user=await findUserById(decoded.userId).session(session);
    const payload={
        userId:user._id,
        email:user.email,
        userRoles:user.userRoles
    };
    const token=generateJWT(payload);
    const refreshToken=generateRefreshToken(payload);
    const updatedUser=await updateUser(decoded.userId,{ refreshToken },session);

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    session.endSession();
    res.status(200).json({
        success:true,
        message:"Login successful",
        data:{
            token:token,
            refreshToken:refreshToken
        }
    });
});
