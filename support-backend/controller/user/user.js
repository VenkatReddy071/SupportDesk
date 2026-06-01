import { createUser,getUsersByCompany,loginUser } from "../../service/user/userService";
import { startSession } from "../../utils/sessionStart.js";

export const createUserController=asyncHandler(async(req,res)=>{
    const session=await startSession();
    const user=await createUser(req.body,session);

    session.endSession();
    res.status(201).json({
        success:true,
        message:"User created successfully",
        data:user
    });
});



export const getUsersByCompanyController=asyncHandler(async(req,res)=>{
    const session=await startSession();
    const users=await getUsersByCompany(req.params.companyId,session);
    session.endSession();
    res.status(200).json({
        success:true,
        message:"Users retrieved successfully",
        data:users
    });
});
