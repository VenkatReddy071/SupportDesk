import asyncHandler from "../../middlerwares/AsynHandler.js";
import { createRoleService } from "../../service/user/roles.js";

export const createRoleController=asyncHandler(async(req,res)=>{
    const payload=req.body;
    const role=await createRoleService(payload);
    res.status(201).json({
        success:true,
        data:role
    });
});

export const getRoleController=asyncHandler(async(req,res)=>{
    const {id}=req.params;
    const role=await findRoleService({_id:id});
    res.status(200).json({
        success:true,
        data:role
    });
});

