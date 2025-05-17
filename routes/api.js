const router = require("express").Router();

const convertXls = require("../middlewares/convertXls");
const isFileUpload = require("../middlewares/isFileUploaded");
const upload = require("../middlewares/uploadFile");
const Category = require("../models/category");
const Product = require("../models/product");
const {
  createIngredient,
  getIngredientById,
  getAllIngredients,
  updateIngredient,
  deleteIngredient,
} = require("../api_controllers/ingredients");
const {
  isValidId,
  validateIngredient,
  validateCategory,
} = require("../validation/validations");
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../api_controllers/categories");

router.get("/", async (req, res) => {
  res.send("Api protected route");
});

router.get("/categories", getAllCategories);
router.get("/categories/:id", isValidId, getCategoryById);
router.post("/categories", validateCategory, createCategory);
router.put("/categories/:id", isValidId, validateCategory, updateCategory);
router.delete("/categories/:id", isValidId, deleteCategory);

router.get("/ingredients", getAllIngredients);
router.get("/ingredients/:id", isValidId, getIngredientById);
router.post("/ingredients", validateIngredient, createIngredient);
router.put("/ingredients/:id", isValidId, validateIngredient, updateIngredient);
router.delete("/ingredients/:id", isValidId, deleteIngredient);

router.get("/products", async (req, res, next) => {
  try {
    const products = await Product.find()
      .select("-prep_time_min -serving")
      .limit(4)
      .populate("category_id")
      .populate("ingredients", "name, _id")
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

router.post(
  "/upload-xls",
  upload.single("file"),
  isFileUpload,
  convertXls,
  async (req, res, next) => {
    const { jsonData } = req;
    let countUpdated = 0;
    try {
      for (const item of jsonData) {
        try {
          const existingProduct = await Product.findById(item.id);
          if (!existingProduct) {
            console.error(`Product with ID ${item.id} not found`);
            continue; // Skip to the next item if the product is not found
          }

          const { pkg_sizes } = existingProduct;
          const newPkgSizes = {
            ...pkg_sizes,
            md: {
              price: pkg_sizes?.md?.price ?? 0,
              weight_g: pkg_sizes?.md?.weight_g ?? 0,
              in_stock: item?.md ?? pkg_sizes?.md?.in_stock ?? 0,
            },
            lg: {
              price: pkg_sizes?.lg?.price ?? 0,
              weight_g: pkg_sizes?.lg?.weight_g ?? 0,
              in_stock: item?.lg ?? pkg_sizes?.lg?.in_stock ?? 0,
            },
            xl: {
              price: pkg_sizes?.xl?.price ?? 0,
              weight_g: pkg_sizes?.xl?.weight_g ?? 0,
              in_stock: item?.xl ?? pkg_sizes?.xl?.in_stock ?? 0,
            },
          };

          for (const size of Object.keys(newPkgSizes)) {
            if (
              newPkgSizes[size].price === 0 &&
              newPkgSizes[size].weight_g === 0 &&
              newPkgSizes[size].in_stock === 0
            ) {
              delete newPkgSizes[size];
            }
          }

          await Product.findByIdAndUpdate(item.id, {
            $set: {
              serving: "updated info 5",
              pkg_sizes: newPkgSizes,
            },
          });
          countUpdated++;
        } catch (error) {
          console.error("Error updating product:", error);
          throw error;
        }
      }
      res.status(200).json({
        message: `${countUpdated} products updated successfully`,
      });
    } catch (error) {
      console.error("Error processing uploaded file:", error);
      return next(error);
    }
  }
);

module.exports = router;
