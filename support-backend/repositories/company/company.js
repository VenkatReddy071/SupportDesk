import Company from "../../models/companies/company";

export const findCompany=async(query)=>{
    return await Company.findOne(query);
}

export const createCompany=async(data,session)=>{
    return await Company.create([data],{session})
}