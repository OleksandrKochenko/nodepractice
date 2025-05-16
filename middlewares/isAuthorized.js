const isAuthorized = (req, res, next) => {
  const { role } = req.user || "";
  if (role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Forbidden" });
};
module.exports = isAuthorized;
// This middleware checks if the user has the "admin" role before allowing access to protected routes.
