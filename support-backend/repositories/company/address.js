import Address from "../../models/companies/address.js";

export const createAddress=async(data,session)=>{
    return await Address.create([data],{session});
}