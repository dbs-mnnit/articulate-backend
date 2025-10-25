import mongoose from "mongoose";
const { Schema } = mongoose;

const refreshTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});

export default mongoose.model("RefreshToken", refreshTokenSchema);
