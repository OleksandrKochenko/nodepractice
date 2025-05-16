const Category = require("../models/category");
const Ingredient = require("../models/ingredient");
const Product = require("../models/product");
const router = require("express").Router();

router.get("/", async (req, res) => {
  res.send("Api protected route");
});

router.get("/categories", async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    next(error);
  }
});

router.get("/products", async (req, res, next) => {
  try {
    const products = await Product.find()
      .select("-prep_time_min -serving")
      .limit(1)
      .populate("category_id")
      .populate("ingredients")
      .lean();

    // Replace `category_id` with `category` in the response
    const updatedProducts = products.map((product) => {
      product.category = product.category_id; // Copy populated category_id to category
      delete product.category_id; // Remove the original category_id field
      return product;
    });

    res.status(200).json(updatedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    next(error);
  }
});

router.post(
  "/products",
  // add validateBody middleware here
  async (req, res, next) => {
    try {
      const newProduct = new Product(req.body);
      await newProduct.save();
      res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      next(error);
    }
  }
);

router.get("/ingredients", async (req, res, next) => {
  try {
    const ingredients = await Ingredient.find();
    res.status(200).json(ingredients);
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    next(error);
  }
});

module.exports = router;
