const { Schema, model } = require("mongoose");

const pkgSizeSchema = new Schema({
  price: { type: Number, required: true }, // Price of the package
  weight_g: { type: Number, required: true }, // Weight in grams
  in_stock: { type: Number, default: 0 }, // Stock count
});

const productSchema = new Schema(
  {
    title: { type: String, required: true },
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    ingredients: [
      { type: Schema.Types.ObjectId, ref: "Ingredient", required: true },
    ],
    pkg_sizes: {
      md: { type: pkgSizeSchema, required: false },
      lg: { type: pkgSizeSchema, required: false },
      xl: { type: pkgSizeSchema, required: false },
    },
    img_url: {
      type: String,
      default: "https://picsum.photos/200/300",
    },
    is_veg: { type: Boolean, default: false },
    prep_time_min: { type: Number, default: 0 }, // Preparation time in minutes
    serving: { type: String, required: false }, // Serving recommendation
  },
  { versionKey: false, timestamps: true }
);

const Product = model("Product", productSchema);

module.exports = Product;
