const fs = require("fs/promises");
const path = require("path");
const xlsx = require("xlsx");

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

createExcelFromTwoJsonFiles();
// createCategories();
// createIngredients();
// uniqueArrays();
