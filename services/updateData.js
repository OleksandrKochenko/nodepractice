const fs = require("fs/promises");
const path = require("path");
const xlsx = require("xlsx");
const { ObjectId } = require("mongodb"); // For ObjectId syntax

// Path to the input JSON file
const inputFilePath = path.join(__dirname, "products.json");

const createCategories = async () => {
  // Path to the output JSON file
  const outputFilePath = path.join(__dirname, "categories.json");
  try {
    // Read the products.json file
    const data = await fs.readFile(inputFilePath, "utf8");

    // Parse the JSON data
    const productsData = JSON.parse(data);

    // Extract categories
    const categories = productsData.map((category) => ({
      name: category.categoryName,
    }));

    // Write the categories to a new file
    await fs.writeFile(outputFilePath, JSON.stringify(categories, null, 2));
    console.log(
      `Categories have been extracted and saved to ${outputFilePath}`
    );
  } catch (error) {
    console.error("Error processing files:", error);
  }
};

const createIngredients = async () => {
  // Path to the output JSON file
  const enOutputFilePath = path.join(__dirname, "enIngredients.json");
  const uaOutputFilePath = path.join(__dirname, "uaIngredients.json");

  try {
    // Read the products.json file
    const data = await fs.readFile(inputFilePath, "utf8");

    // Parse the JSON data
    const productsData = JSON.parse(data);

    // Extract ingredients
    const enIngredients = [];
    const uaIngredients = [];
    productsData.forEach((category) => {
      category.products.forEach((product) => {
        const enIngredientArr = product.ingredients.en.split(", ");
        const uaIngredientArr = product.ingredients.ua.split(", ");
        enIngredientArr.forEach((ingredient) => {
          const existingIngredient = enIngredients.find(
            (item) => item === ingredient
          );
          if (!existingIngredient) {
            enIngredients.push(
              ingredient
                .replace(/[().]/g, "") // Remove ".", "(", and ")"
                .replace(/\s+/g, " ") // Replace multiple spaces with a single space
                .trim() // Remove leading and trailing spaces
            );
          }
        });
        uaIngredientArr.forEach((ingredient) => {
          const existingIngredient = uaIngredients.find(
            (item) => item === ingredient
          );
          if (!existingIngredient) {
            uaIngredients.push(
              ingredient
                .replace(/[().]/g, "") // Remove ".", "(", and ")"
                .replace(/\s+/g, " ") // Replace multiple spaces with a single space
                .trim() // Remove leading and trailing spaces
            );
          }
        });
      });
    });

    // Write the ingredients to a new file
    await fs.writeFile(
      enOutputFilePath,
      JSON.stringify(enIngredients, null, 2)
    );
    await fs.writeFile(
      uaOutputFilePath,
      JSON.stringify(uaIngredients, null, 2)
    );
    console.log(`Ingredients have been extracted and saved`);
  } catch (error) {
    console.error("Error processing files:", error);
  }
};

const uniqueArrays = async () => {
  const enInputFilePath = path.join(__dirname, "enIngredients.json");
  const uaInputFilePath = path.join(__dirname, "uaIngredients.json");
  const enOutputFilePath = path.join(__dirname, "enUniqueIngredients.json");
  const uaOutputFilePath = path.join(__dirname, "uaUniqueIngredients.json");
  try {
    // Read the products.json file
    const enData = await fs.readFile(enInputFilePath, "utf8");
    const uaData = await fs.readFile(uaInputFilePath, "utf8");

    // Parse the JSON data
    const enIngredients = JSON.parse(enData);
    const uaIngredients = JSON.parse(uaData);

    // Remove duplicates
    const uniqueEnIngredients = [...new Set(enIngredients)];
    const uniqueUaIngredients = [...new Set(uaIngredients)];

    // Write the unique ingredients to a new file
    await fs.writeFile(
      enOutputFilePath,
      JSON.stringify(uniqueEnIngredients, null, 2)
    );
    await fs.writeFile(
      uaOutputFilePath,
      JSON.stringify(uniqueUaIngredients, null, 2)
    );
    console.log(`Unique ingredients have been extracted and saved`);
  } catch (error) {
    console.error("Error processing files:", error);
  }
};

const createExcelFromTwoJsonFiles = async () => {
  try {
    // Paths to the JSON files
    const enFilePath = path.join(__dirname, "enUniqueIngredients.json");
    const uaFilePath = path.join(__dirname, "uaUniqueIngredients.json");

    // Read and parse the JSON files
    const enData = JSON.parse(await fs.readFile(enFilePath, "utf8")); // Parse JSON into an array
    const uaData = JSON.parse(await fs.readFile(uaFilePath, "utf8")); // Parse JSON into an array

    // Ensure both arrays have the same length
    const maxLength = Math.max(enData.length, uaData.length);
    const enDataPadded = [
      ...enData,
      ...Array(maxLength - enData.length).fill(""),
    ];
    const uaDataPadded = [
      ...uaData,
      ...Array(maxLength - uaData.length).fill(""),
    ];

    // Combine the data into rows for two columns
    const worksheetData = [["en", "ua"]]; // Add headers
    for (let i = 0; i < maxLength; i++) {
      worksheetData.push([enDataPadded[i], uaDataPadded[i]]);
    }

    // Convert the data to a worksheet
    const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);

    // Create a new workbook and append the worksheet
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Ingredients");

    // Path to save the Excel file
    const outputFilePath = path.join(__dirname, "ingredients.xlsx");

    // Write the workbook to a file
    xlsx.writeFile(workbook, outputFilePath);

    console.log(`Excel file has been created at ${outputFilePath}`);
  } catch (error) {
    console.error("Error creating Excel file:", error);
  }
};

const updateCategories = async () => {
  const productsPath = path.join(__dirname, "products.json");
  const categoriesPath = path.join(__dirname, "multicook.categories.json");
  const outputPath = path.join(__dirname, "productsWithCatUpdated.json");

  // Read and parse files
  const productsData = JSON.parse(await fs.readFile(productsPath, "utf8"));
  const categoriesData = JSON.parse(await fs.readFile(categoriesPath, "utf8"));

  // Build a map: { name.en: _id }
  const categoryMap = {};
  categoriesData.forEach((cat) => {
    const key = cat.name.en;
    // Support both string and {$oid: ...} formats
    categoryMap[key] =
      cat._id && cat._id.$oid
        ? { $oid: cat._id.$oid }
        : typeof cat._id === "string"
        ? { $oid: cat._id }
        : cat._id;
  });

  // Update every categoryId in products.json
  productsData.forEach((category) => {
    const catName = category.categoryName.en;
    const newCatId = categoryMap[catName] || null;
    category.categoryId = newCatId;
    if (Array.isArray(category.products)) {
      category.products.forEach((product) => {
        product.categoryId = newCatId;
      });
    }
  });

  // Write updated data to output file
  await fs.writeFile(outputPath, JSON.stringify(productsData, null, 2));
  console.log(
    "Updated categoryId fields in products and products[].categoryId"
  );
};

const flattenProducts = async () => {
  const inputPath = path.join(__dirname, "productsWithCatUpdated.json");
  const outputPath = path.join(__dirname, "productsFlat.json");

  const categories = JSON.parse(await fs.readFile(inputPath, "utf8"));

  // Flatten all products into a single array
  const flatProducts = categories.flatMap((category) =>
    (category.products || []).map((product) => ({
      ...product,
    }))
  );

  await fs.writeFile(outputPath, JSON.stringify(flatProducts, null, 2));
  console.log("Flattened products saved to productsFlat.json");
};

const updateIngredients = async () => {
  const productsPath = path.join(__dirname, "productsFlat.json");
  const ingredientsPath = path.join(__dirname, "multicook.ingredients.json");
  const outputPath = path.join(__dirname, "productsFlatWithIngredientIds.json");

  // Read and parse files
  const products = JSON.parse(await fs.readFile(productsPath, "utf8"));
  const ingredients = JSON.parse(await fs.readFile(ingredientsPath, "utf8"));

  // Build a map: { en: _id }
  const ingredientMap = {};
  ingredients.forEach((ing) => {
    // Assuming ing.en is the English name and ing._id is the ObjectId
    ingredientMap[ing.en.trim().toLowerCase()] =
      ing._id && ing._id.$oid ? { $oid: ing._id.$oid } : ing._id;
  });

  // Update products
  products.forEach((product) => {
    if (product.ingredients && product.ingredients.en) {
      const ingredientNames = product.ingredients.en
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      // Map to _ids, skip if not found
      const ingredientIds = ingredientNames
        .map((name) => ingredientMap[name])
        .filter(Boolean);

      product.ingredients = ingredientIds;
    }
  });

  await fs.writeFile(outputPath, JSON.stringify(products, null, 2));
  console.log(
    "Updated products with ingredient _ids saved to productsFlatWithIngredientIds.json"
  );
};

const finalizeProducts = async () => {
  const inputPath = path.join(__dirname, "productsFlatWithIngredientIds.json");
  const outputPath = path.join(__dirname, "productsFinal.json");

  const products = JSON.parse(await fs.readFile(inputPath, "utf8"));

  products.forEach((product) => {
    // 1. Remove productImg and productId
    delete product.productImg;
    delete product.productId;

    // 2. Add inStock: 0 to each variant if variants exist and is an array
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      product.variants.forEach((variant) => {
        variant.inStock = 0;
      });

      // 3. Replace variants array with object { md: ..., lg: ... }
      const variantsObj = {};
      if (product.variants[0]) variantsObj.md = product.variants[0];
      if (product.variants[1]) variantsObj.lg = product.variants[1];
      product.variants = variantsObj;
    }
  });

  await fs.writeFile(outputPath, JSON.stringify(products, null, 2));
  console.log("productsFinal.json created!");
};

const createVariantsWithStores = async () => {
  const productsPath = path.join(__dirname, "multicook.products.json"); // Use this file now
  const storesPath = path.join(__dirname, "multicook.stores.json");
  const outputPath = path.join(__dirname, "variantsWithStores.json");

  const products = JSON.parse(await fs.readFile(productsPath, "utf8"));
  const stores = JSON.parse(await fs.readFile(storesPath, "utf8"));

  const result = [];

  products.forEach((product) => {
    // Use MongoDB _id as productId
    const productId =
      product._id && product._id.$oid
        ? { $oid: product._id.$oid }
        : product._id;

    if (
      product.variants &&
      typeof product.variants === "object" &&
      Object.keys(product.variants).length > 0
    ) {
      stores.forEach((store) => {
        result.push({
          productId,
          storeId:
            store._id && store._id.$oid ? { $oid: store._id.$oid } : store._id,
          variants: product.variants,
        });
      });
    }
  });

  await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
  console.log("variantsWithStores.json created using multicook.products.json!");
};

createVariantsWithStores();
// finalizeProducts();
// updateIngredients();
// flattenProducts();
// updateCategories();
// createExcelFromTwoJsonFiles();
// createCategories();
// createIngredients();
// uniqueArrays();
