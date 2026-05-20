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

const Role=mongoose.model('Roles',Roles);
export default Role;