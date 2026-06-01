import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userScheme = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        minlength: 8,
        maxlength: 20,
        required: true,
    },
    refresToken: {
        type: String,
        default: null,
    },
    userRoles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role',
            required: true,
        }
    ],
    isActive: {
        type: Boolean,
        default: true,
    },
    name: {
        type: String,
        required: true,
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",

    },
    isFirstTimeUser: {
        type: Boolean,
        default: true,
    }

}, { timestamps: true })

userScheme.path('userRoles').validate((value) => {
    return value?.length > 0;
}, "Atleast one role is required ")

userScheme.pre('save', function (next) {
   if(this.isModified('password')){
    this.password = this.password;
    next();
   }
   const salt= bcrypt.genSaltSync(10);
   this.password = bcrypt.hashSync(this.password, salt);
})
userScheme.index({ userName: 1 });
userScheme.index({ email: 1 });
userScheme.index({ company: 1 });
userScheme.index({

    userName: 1,
    email: 1,
    company: 1,
    userRoles: 1,
})
const userModal = mongoose.model('users', userScheme);

export default userModal;