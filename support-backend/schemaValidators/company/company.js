import Joi from "joi";
import { Address } from "./address";

export const createCompany = Joi.object({
    companyName: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.base': 'Company name must be a string.!',
            'string.empty': 'Company name is required.!',
            'string.mim': 'Company name must have atleast 3 characters',
            'string.max': 'Company name cannot exceed a 100 characters'
        }),
    subDomain: Joi.string()
        .required()
        .messages({
            'string.base': 'Subdomain must be string',
            'string.empty': 'Subdomain is required'
        }),
    address: Address.required()

})