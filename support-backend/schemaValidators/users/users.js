import Joi from "joi";

export const registerValidation = Joi.object({
  userName: Joi.string()
    .trim()
    .lowercase()
    .min(3)
    .max(30)
    .required()
    .messages({
      "string.base": "Username must be a string",
      "string.empty": "Username is required",
      "string.min": "Username must contain at least 3 characters",
      "string.max": "Username cannot exceed 30 characters",
      "any.required": "Username is required",
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),

  password: Joi.string()
    .min(8)
    .max(20)
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 8 characters",
      "string.max": "Password cannot exceed 20 characters",
      "any.required": "Password is required",
    }),

  name: Joi.string()
    .trim()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.empty": "Name is required",
      "string.min": "Name must contain at least 3 characters",
      "string.max": "Name cannot exceed 50 characters",
      "any.required": "Name is required",
    }),

  userRoles: Joi.array()
    .items(Joi.string())
    .min(1)
    .required()
    .messages({
      "array.base": "Roles must be an array",
      "array.min": "At least one role is required",
      "any.required": "Roles are required",
    }),

  address: Joi.string()
    .optional()
    .messages({
      "string.base": "Address must be a string",
    }),
});