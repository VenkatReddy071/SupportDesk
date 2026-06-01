import express from "express";
import { loginUserController, verifyOTPController } from "../../controller/user/auth.js";
import { authMiddleware } from "../../security/middlewares/AuthMiddleware.js";
const authRouter=express.Router();

authRouter.post("/login", loginUserController);
authRouter.post("/verify-otp", verifyOTPController);

export default authRouter;