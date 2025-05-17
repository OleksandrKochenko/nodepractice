const isFileUpload = (req, res, next) => {
  if (!req.file) {
    const err = new Error("file upload is required");
    err.status = 400;
    return next(err);
  }
  next();
};

module.exports = isFileUpload;
