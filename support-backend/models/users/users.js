import mongoose from "mongoose";

const userScheme=new mongoose.Schema({
    userName:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    email:{
        type:String,
         required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password:{
        type:String,
        minlength:8,
        maxlength:20,
        required:true,
    },
    refresToken:{
        typeString,
        required:true,
    },
    userRoles:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Role',
             required: true,
        }
    ],
    isActive:{
        type:Boolean,
        default:true,
    },
    name:{
        type:String,
        required:true,
    },
    address:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Address'
    },
    company:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Company",
        
    }

},{timestamps:true})

userScheme.path('userRoles').validate((value)=>{
    return value?.length>0;
},"Atleast one role is required ")
const userModal=mongoose.model('users',userScheme);

export default userModal;