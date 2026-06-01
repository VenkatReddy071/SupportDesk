import mongoose from "mongoose";

const Roles=new mongoose.Schema({
    roleName:{
        type:String,
        unique:true,
        trim:true,
        uppercase:true,
    },
    description:{
        type:String,
        minlength:3,
        maxlength:300,
    }
},{timestamps:true})

Roles.index({roleName:1});
const RoleSchema=mongoose.model('Roles',Roles);
export default RoleSchema;