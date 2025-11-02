import express from "express";
import authController from "./authController.js";
import authenticateToken from "../../middlewares/authMiddleware.js";
import rateLimit from "express-rate-limit";
import upload from "../../middlewares/uploadFile.js";
import passport from "../../configs/passportConfig.js";

const router = express.Router();

// Initialize Passport
router.use(passport.initialize());


// Rate limiting for public routes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // (comment said 5, but code said 500) keeping code the same
  message: { success: false, message: "Too many login attempts, please try again later" },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 300,
  message: { success: false, message: "Too many registration attempts, please try again later" },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 300,
  message: { success: false, message: "Too many password reset requests, please try again later" },
});

const googleAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { success: false, message: "Too many Google auth attempts, please try again later" },
});

// Public routes

router.post("/register", registerLimiter, authController.register); // now supports classic + google_credential
router.get("/verify-email", authController.verifyEmail);
router.post("/login", loginLimiter, authController.login); // now supports classic + google_credential
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", forgotPasswordLimiter, authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.get("/verify-reset-password-token", authController.verifyResetPasswordToken);
router.post("/resend-verification-email", authController.resendVerificationEmail);


// Legacy/redirect-based Google OAuth (passport)
router.get("/google", googleAuthLimiter, authController.googleAuth);
router.get("/google/callback", googleAuthLimiter, authController.googleAuthCallback);

// Protected routes
router.post("/logout", authenticateToken, authController.logout);
router.get("/profile", authenticateToken, authController.getProfile);
router.put("/profile", authenticateToken, upload.single("profile_picture"), authController.updateProfile);
router.put("/change-password", authenticateToken, authController.changePassword);

export default router;
