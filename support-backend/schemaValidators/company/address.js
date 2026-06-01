import Joi from "joi";

export const Address = Joi.object({
    cityName: Joi.string()
        .required()
        .messages({
            'string.base': 'cityName must be string',
            'string.required': 'cityName is required'
        }),
    location: Joi.string()
        .required()
        .messages({
            'string.base': 'location must be string',
            'string.required': 'location is required'
        }),

    landMark: Joi.string()
        .required()
        .messages({
            'string.base': 'landMark must be string',
            'string.required': 'landMark is required'
        }),
     
    pincode:Joi.string()
    .min(6)
    .max(6)
    .required()
    .messages({
        'string.base':'pincode must be string',
        'string.required':'pincode is required',
        'string.mim':'Pincode must have atleast 6 characters',
        'string.max':'Pincode cannot exceed a 6 characters'
    }),
})