const xlsx = require("xlsx");
const fs = require("fs");
// const path = require("path");

const convertXls = (req, res, next) => {
  // const filePath = path.join(__dirname, "../upload", req.file.filename);
  const workbook = xlsx.readFile(req.file.path);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert the worksheet to JSON
  const jsonData = xlsx.utils.sheet_to_json(worksheet);

  // Remove the uploaded file after conversion
  fs.unlinkSync(req.file.path);

  // Attach the JSON data to the request object
  req.jsonData = jsonData;

  next();
};
module.exports = convertXls;
