import mongoose from "mongoose";

const blacklistedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  type: { type: String, enum: ['access', 'refresh'], required: true },
  expiresAt: { type: Date, required: true }
});

export default mongoose.model("BlacklistedToken", blacklistedTokenSchema);
