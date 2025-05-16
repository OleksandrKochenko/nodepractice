const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
const rateLimit = require("express-rate-limit");

const isAuthenticated = require("./middlewares/isAuthenticated");
const isAuthorized = require("./middlewares/isAuthorized");
require("./passport.config"); // Import the passport configuration
const authRouter = require("./routes/auth");
const apiRouter = require("./routes/api");

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
app.use(passport.initialize()); // Initialize Passport to use it in the app
app.use(passport.session()); // Use Passport session to manage user sessions

// Rate limiting middleware

const limiter = rateLimit({
  windowMs: 0.1 * 60 * 1000, // 0.1 minutes (6 seconds)
  max: 2, // Limit each IP to 2 requests per windowMs
  message: "Too many requests, please try again later.",
  handler: (req, res, next) => {
    // Custom handler for rate limiting
    if (req.user) {
      // If the user is authenticated, allow the request
      return next();
    } else {
      console.log(`Rate limit reached for IP: ${req.ip}`);
      // If the user is not authenticated, send a 429 response
      return res.status(429).json({ message: "Too many requests" });
    }
  },
  // skip: (req, res) => {
  //   // Skip rate limiting for certain routes
  //   return req.path === "/auth/login" || req.path === "/auth/register";
  // },
});
app.use(limiter); // Apply rate limiting to all requests

// Base route (for testing purposes)
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Auth routes (using the auth router)
app.use("/auth", authRouter);
app.use(
  "/api",
  //isAuthenticated, isAuthorized,
  apiRouter
);

// Protected Route (for testing purposes)
app.get("/dashboard", isAuthenticated, (req, res) => {
  res.send(`Welcome ${req.user.username}`);
});

// 404 error handling middleware
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});
// Error handling middleware
app.use((err, req, res, next) => {
  const { status = 500, message } = err;
  res.status(status).json({ message });
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
