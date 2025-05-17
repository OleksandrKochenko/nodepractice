const Category = require("../models/category");

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().select(
      "-__v -createdAt -updatedAt"
    );
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).select(
      "-__v -createdAt -updatedAt"
    );
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const newCategory = new Category(req.body);
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({
      message: "Category deleted successfully",
      id: deletedCategory._id,
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
