import RoleSchema from "../../models/users/roles.js";

export const createRole=async(data,session)=>{
    return await RoleSchema.create([data],{session});
}

export const findRole=async(query,session)=>{
    return await RoleSchema.findOne(query).session(session);
}
