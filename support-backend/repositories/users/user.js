import mongoose from "mongoose";
import userModal from "../../models/users/users";

export const findUser = async (query) => {
    return await userModal.findOne(query);
}

export const createUsers = async (data, session) => {
    return await userModal.create(data);
}
export const findUsersByCompany = async (companyId) => {
    return await userModal.aggregate([
        {
            $match: {
                company: new mongoose.Types.ObjectId(companyId)
            }
        },
        {
            $lookup: {
                from: "companies",
                localField: 'company',
                foreignField: "_id",
                as: "companyDetails"
            },
        },
        {
            $unwind:
                "$companyDetails"

        },
        {
            $project: {
                password: 0,
                refreshToken: 0,
                "companyDetails.__v": 0
            }
        }
    ])
}