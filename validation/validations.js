const { isValidObjectId } = require("mongoose");
const {
  ingredientCreationSchema,
  categoryCreationSchema,
} = require("./joiSchemas");

const validateIngredient = (req, res, next) => {
  const { error } = ingredientCreationSchema.validate(req.body);
  if (error) {
    error.status = 400;
    return next(error);
  }
  next();
};

const validateCategory = (req, res, next) => {
  const { error } = categoryCreationSchema.validate(req.body);
  if (error) {
    error.status = 400;
    return next(error);
  }
  next();
};

const isValidId = (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    const error = new Error("Invalid ID format");
    error.status = 400;
    return next(error);
  }
  next();
};

module.exports = {
  validateIngredient,
  validateCategory,
  isValidId,
};
