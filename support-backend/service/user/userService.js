import userModal from "../../models/users/users.js";
import { createUsers, findUserByEmail, findUsersByCompany } from "../../repositories/users/user.js";
import generatePassword from "../../utils/RandomPasswordGenerator.js";
import bcrypt from "bcryptjs";
export const createUser=async(data,session)=>{
    const existUser=await findUserByEmail(data.email,session);
    if(existUser){
        throw new Error("User already exists");
    }
    const user=await createUsers(data,session);
    return user[0];
}

export const getUsersByCompany=async(companyId,session)=>{
    const users=await findUsersByCompany(companyId,session);
    return users;
}

export const loginUser=async(payload,session)=>{
    const user=await findUserByEmail(payload.email,session);
    if(!user){
        throw new Error("Invalid email or password");
    }
    const isPasswordValid= await bcrypt.compare(payload.password, user.password);
    if(!isPasswordValid){
        throw new Error("Invalid email or password");
    }
    return user;
}


export const updateUser=async(userId,data,session)=>{
    const user=await updateUser(userId,data,session);
    return user;
}