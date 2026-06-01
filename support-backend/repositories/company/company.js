import Company from "../../models/companies/company.js";

export const findCompany=async(query)=>{
    return await Company.findOne(query);
}

export const createCompany=async(data,session)=>{

    return await Company.create([data],{session})
}

export const compantCount=async()=>{
    return await Company.aggregate([
        {
          $group:{
            _id:null,

            totalCompanies:{
                $sum:1,
            },

            activeCompanies:{
                $sum:{
                    $cond:["$isActive",1,0],
                }
            },
            inActiveCompanies:{
                $sum:{
                    $cond:['isActive',0,1]
                }
            }
          }
        }
    ])
}