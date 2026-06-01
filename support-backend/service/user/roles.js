import { createRole, findRole } from "../../repositories/users/role.js";

export const createRoleService=async (roleData,session) => {
    const find=await findRole({roleName:roleData.roleName});
    if(find){
        throw new Error("Role already exists");
    }
    const role=await createRole(roleData,session);
    return role[0];
};

export const getRoleService=async (query,session) => {
    const role = await findRole(query,session);
    return role;
};

export const updateRoleService=async (roleId, roleData) => {
    const role = await findRole({_id:roleId});
    if(!role){
        throw new Error("Role not found");
    }
    Object.assign(role, roleData);
    await role.save();
    return role;
};

export const deleteRoleService=async (roleId) => {
    const role = await findRole({_id:roleId});
    if(!role){
        throw new Error("Role not found");
    }
    await role.remove();
    return role;
};