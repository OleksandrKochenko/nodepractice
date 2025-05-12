const passport = require("passport");
const User = require("../models/user");
const router = require("express").Router();

// Auth base route (For testing purposes)
router.get("/", (req, res) => {
  res.send("Auth route");
});

// Routes for authentication using local strategy
// Register route
router.post("/register", async (req, res) => {
  const { username, email, password, googleId = "" } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }
    // Hash password later using bcrypt
    const user = new User({ username, password, email, googleId });
    await user.save();
    res.status(201).send("User registered", user);
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});
// Login route
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

// Routes for authentication using OAuth strategy
// Google Auth route
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/login",
  }),
  (req, res) => {
    // Explicitly log in the user to update the session
    req.logIn(req.user, (err) => {
      if (err) {
        console.error("Error logging in after Google authentication:", err);
        return res.status(500).send("An error occurred during login");
      }
      // Successful authentication, redirect to dashboard or send a response
      res.redirect("/dashboard");
    });
  }
);

// Logout route
router.post("/logout", (req, res) => {
  req.logout(() => {
    res.send("Logged out");
  });
});

module.exports = router;
