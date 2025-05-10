const passport = require("passport");
const User = require("../models/user");
const router = require("express").Router();

router.get("/", (req, res) => {
  res.send("Auth route");
});

router.get("/google", (req, res) => {
  res.send("Google Auth route");
});

// Register
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }
    // Hash password later using bcrypt
    const user = new User({ username, password, email });
    await user.save();
    res.status(201).send("User registered", user);
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      // Handle server error
      return res.status(500).send({ message: "An error occurred", error: err });
    }
    if (!user) {
      // Authentication failed
      return res
        .status(401)
        .send({ message: info.message || "Invalid credentials" });
    }
    // Log the user in
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).send({ message: "Login failed", error: err });
      }
      // Authentication successful
      return res.status(200).send({ message: "Login successful", user });
    });
  })(req, res, next);
});

router.get("/login", (req, res) => {
  res.send("Login page");
});

// Protected Route
router.get("/dashboard", (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`Welcome ${req.user.username}`);
  } else {
    res.status(401).send("Unauthorized");
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.logout(() => {
    res.send("Logged out");
  });
});

module.exports = router;
