const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();

require("./passport.config"); // Import the passport configuration
const authRouter = require("./routes/auth");
const User = require("./models/user");

const PORT = process.env.PORT || 8080;
const DB_HOST = process.env.DB_HOST || "localhost";
const SESSION_SECRET = process.env.SESSION_SECRET || "secret";

const app = express(); // Create an Express application

// Middleware setup
app.use(cors()); // Enable CORS for all routes
app.use(morgan("dev")); // Log HTTP requests to the console
app.use(express.static("public")); // Serve static files from the "public" directory
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies

//Session setup
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Base route (for testing purposes)
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Auth routes (using the auth router)
app.use("/auth", authRouter);

// Protected Route (for testing purposes)
app.get("/dashboard", (req, res) => {
  console.log(req.user);

  if (req.isAuthenticated()) {
    res.send(`Welcome ${req.user.username}`);
  } else {
    res.status(401).send("Unauthorized");
  }
});

// MongoDB connection and server start. Check if environment variables are set at your .env file
mongoose
  .connect(DB_HOST)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

module.exports = app;
