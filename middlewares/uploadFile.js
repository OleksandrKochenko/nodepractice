const multer = require("multer");

const path = require("path");

const destination = path.resolve("upload"); // defines folder to upload files from http requests: /temp

const storage = multer.diskStorage({
  destination,
  filename: (req, file, cb) => {
    // Create a new unique file name for storing in the temp folder
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`; // Format date as YYYY-MM-DD
    const uniquePreffix = `${formattedDate}-${Math.round(Math.random() * 1e5)}`; // Add random number for uniqueness
    const { originalname } = file;
    const filename = `${uniquePreffix}_${originalname}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

module.exports = upload;
