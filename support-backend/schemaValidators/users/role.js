import Joi from "joi";

const roleSchema=Joi.object({
    roleName:Joi.string()
    .trim()
    .uppercase()
    .messages({
        "string.base":"Role name must be a string",
        "string.empty":"Role name is required",
    }),
    description:Joi.string()
    .min(3)
    .max(300)
    .messages({
        "string.base":"Description must be a string",
        "string.empty":"Description is required",
        "string.min":"Description must be at least 3 characters long",
        "string.max":"Description must be at most 300 characters long"
    })
});