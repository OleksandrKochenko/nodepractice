const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();

const authRouter = require("./routes/auth");
const User = require("./models/user");

const PORT = process.env.PORT || 8080;
const DB_HOST = process.env.DB_HOST || "localhost";
const SESSION_SECRET = process.env.SESSION_SECRET || "secret";

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

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

// === Passport Local Strategy ===
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" }, // Use email instead of username
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) return done(null, false, { message: "User not found" });

        const isMatch = password === user.password; // Replace with a proper password hashing method. For example, use bcrypt to compare hashed passwords
        if (!isMatch)
          return done(null, false, { message: "Incorrect password" });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Passport cookie setup
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/auth", authRouter);

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
