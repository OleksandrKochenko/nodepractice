const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
module.exports = isAuthenticated;
// This middleware checks if the user is authenticated before allowing access to protected routes.
