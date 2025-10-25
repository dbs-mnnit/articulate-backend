import mongoose from "mongoose";
const { Schema } = mongoose;

const emailVerificationOTPSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: '15m' } // expires after 15 minutes
  }
);

const EmailVerificationOTP = mongoose.model("EmailVerificationOTP", emailVerificationOTPSchema);

export default EmailVerificationOTP;
