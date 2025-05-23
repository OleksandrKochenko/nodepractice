const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: function () {
        return !this.googleId; // Require password only if googleId is not present
      },
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    googleId: { type: String },
  },
  { versionKey: false, timestamps: true }
);

const User = model("User", userSchema);

module.exports = User;
