import mongoose from "mongoose";
import asyncHandler from "../../middlerwares/AsynHandler.js";
import { createCompanySchema } from "../../schemaValidators/company/company.js";
import { createAddressService } from "../../service/company/addersService.js";

import { createCompanyService } from "../../service/company/companyService.js";
import { createUser } from "../../service/user/userService.js";
import generatePassword from "../../utils/RandomPasswordGenerator.js";
import { sendEmail } from "../../utils/EmailService.js";
import { getRoleService } from "../../service/user/roles.js";

export const createCompany = asyncHandler(async (req, res) => {
    const payload = req.body;
    const session=await mongoose.startSession();
    session.startTransaction();

    const address=await createAddressService(payload.address,session);

    const company=await createCompanyService(payload,address._id,session);
    const role=await getRoleService({roleName:"ADMIN"},session);
    const password=generatePassword();
    const userPayload={
        name:payload.companyName,
        email:payload.email,
        userRoles:role._id,
        company:company._id,
        userName:payload.email.split("@")[0],
        password:password,
        address:address._id,
    }
    const user=await createUser(userPayload,session);
    await session.commitTransaction();
    await sendEmail({
        to:user.email,
        subject:"Welcome to Support Desk",
        html:`Your account has been created successfully. Your password is ${password}. Please change your password after login.`
    })
   
    res.status(201).json({
        success: true,
        data: company
    })
})

export const companysCount = asyncHandler(async (req, res) => {
    const count = await companysCountService();
    res.status(200).json({ success: true, data: count });
})