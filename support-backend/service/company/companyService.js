import asyncHandler from "../../middlerwares/AsynHandler.js";
import { findCompany,createCompany,compantCount } from "../../repositories/company/company.js";
import ApiError from "../../middlerwares/ApiError.js";

export const createCompanyService=async(payload,addressId,session)=>{
   const existingCompany=await findCompany({email:payload.email});
   console.log("existing company",existingCompany,payload,addressId);
   if(existingCompany){
    throw new ApiError("Company already exist with these email id",404);
   }

   const findCompanyWithNameAndSubDomain=await findCompany({companyName:payload.companyName,subDomain:payload.subDomain});
   if(findCompanyWithNameAndSubDomain){
    throw new ApiError("Company already exist with these company name and subdomain",404);
   }
   const newCompany=await createCompany({...payload,address:addressId},session);

   return newCompany[0];
}


export const companysCountService=async ()=>{

    return await compantCount();
}


export const getCompanyService=async (companyId)=>{
    const company=await findCompany({_id:companyId});
    return company;
}