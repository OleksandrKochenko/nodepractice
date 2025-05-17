const Ingredient = require("../models/ingredient");

const getAllIngredients = async (req, res, next) => {
  try {
    const ingredients = await Ingredient.find().select(
      "-__v -createdAt -updatedAt"
    );
    res.status(200).json(ingredients);
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    next(error);
  }
};

const getIngredientById = async (req, res, next) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id).select(
      "-__v -createdAt -updatedAt"
    );
    if (!ingredient) {
      return res.status(404).json({ message: "Ingredient not found" });
    }
    res.status(200).json(ingredient);
  } catch (error) {
    console.error("Error fetching ingredient:", error);
    next(error);
  }
};

const createIngredient = async (req, res, next) => {
  try {
    const newIngredient = new Ingredient(req.body);
    await newIngredient.save();
    res.status(201).json(newIngredient);
  } catch (error) {
    console.error("Error creating ingredient:", error);
    next(error);
  }
};

const updateIngredient = async (req, res, next) => {
  try {
    const updatedIngredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedIngredient) {
      return res.status(404).json({ message: "Ingredient not found" });
    }
    res.status(200).json(updatedIngredient);
  } catch (error) {
    console.error("Error updating ingredient:", error);
    next(error);
  }
};

const deleteIngredient = async (req, res, next) => {
  try {
    const deletedIngredient = await Ingredient.findByIdAndDelete(req.params.id);
    if (!deletedIngredient) {
      return res.status(404).json({ message: "Ingredient not found" });
    }
    res.status(200).json({
      message: "Ingredient deleted successfully",
      id: deletedIngredient._id,
    });
  } catch (error) {
    console.error("Error deleting ingredient:", error);
    next(error);
  }
};

module.exports = {
  getAllIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient,
};
