import mongoose, { Mongoose } from "mongoose";

const CompanySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        unique: true,
    },
    subDomain: {
        type: String,
        required: true,
        unique: true,
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address"
    }
}, { timestamps: true })


CompanySchema.index({ companyName: 1 });

CompanySchema.index({ subDomain: 1 });

CompanySchema.index({
    companyName: 1,

    subDomain: 1
})

const Company = mongoose.model("Company", CompanySchema);
export default Company;