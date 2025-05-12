const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("./models/user");

// === Passport Local Strategy ===
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" }, // Use email instead of username
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user || !user.password)
          return done(null, false, { message: "User not found" });

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

// === Passport Google OAuth Strategy ===
passport.use(
  new GoogleStrategy(
    {
      // options for googleStrategy
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      // passport callback function
      try {
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
          // User already exists, log them in
          return done(null, existingUser);
        } else {
          // Create a new user
          try {
            const newUser = new User({
              username: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
            });

            // Save the user without a callback
            await newUser.save();

            // User saved successfully, log them in
            return done(null, newUser);
          } catch (err) {
            console.error("Error saving user:", err);
            return done(err);
          }
        }
      } catch (error) {
        console.error("Error during Google authentication:", error);
        return done(error);
      }
    }
  )
);

// Passport serialization and deserialization
// Serialize user to store in session and set in cookie
passport.serializeUser((user, done) => done(null, user._id));
// Deserialize user from session and retrieve from database
// This is called on every request to check if the user is logged in
// It retrieves the user from the database using the ID stored in the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
