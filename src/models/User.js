import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    first_name: { type: String, required: true },
    // last_name optional because Google can return single-name profiles
    last_name: { type: String, required: false },

    email: { type: String, required: true, unique: true },

    // password optional for OAuth users
    password: { type: String, required: false },

    phone_country_code: { type: String },
    phone_number: { type: String },

    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    date_of_birth: { type: Date },

    profile_picture: { type: String },

    role: { type: String, enum: ["user", "admin"], default: "user" },

    resetToken: { type: String },
    resetTokenExpires: { type: Date },

    // NEW: user's canonical IANA timezone (ex: "Asia/Kolkata", "America/New_York")
    timezone: {
      type: String,
      required: true,
      default: "UTC",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
