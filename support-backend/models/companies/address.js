import mongoose from "mongoose";

const address=new mongoose.Schema({
    cityName:{
        type:String,
        required:true,
       
    },
    location:{
        type:String,
        required:true,
      
    },
    landMark:{
        type:String,
        required:true,
       
    },
    pincode:{
        type:String,
        required:true,
        minlength:6,
        maxlength:6,
    }
},{timestamps:true})


const Address=mongoose.model('Address',address);
export default Address;