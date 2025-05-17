const Joi = require("joi");
// const {
//   userEmailRegExp,
//   userEmailMessage,
//   userPasswordMessage,
//   userNameMessage,
// } = require("../../constants/userConstants");

const ingredientCreationSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": `Ingredient name is required`,
  }),
  // Add other fields as needed
});

const categoryCreationSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": `Category name is required`,
  }),
});

// const userRegisterSchema = Joi.object({
//   name: Joi.string()
//     .required()
//     .messages({
//       "any.required": `${userNameMessage}`,
//     }),
//   email: Joi.string()
//     .pattern(userEmailRegExp)
//     .required()
//     .messages({
//       "any.required": `${userEmailMessage}`,
//       "string.pattern.base": `invalid email`,
//     }),
//   password: Joi.string()
//     .min(6)
//     .required()
//     .messages({
//       "any.required": `${userPasswordMessage}`,
//       "string.min": "invalid length of password",
//     }),
// });

// const userLoginSchema = Joi.object({
//   email: Joi.string()
//     .pattern(userEmailRegExp)
//     .required()
//     .messages({
//       "any.required": `${userEmailMessage}`,
//       "string.pattern.base": `invalid email`,
//     }),
//   password: Joi.string()
//     .required()
//     .messages({
//       "any.required": `${userPasswordMessage}`,
//     }),
// });

// const userUpdateSchema = Joi.object({
//   name: Joi.string(),
//   password: Joi.string().min(6).messages({
//     "string.min": "invalid length of password",
//   }),
// });

module.exports = {
  ingredientCreationSchema,
  categoryCreationSchema,
  // userRegisterSchema, userLoginSchema, userUpdateSchema
};
