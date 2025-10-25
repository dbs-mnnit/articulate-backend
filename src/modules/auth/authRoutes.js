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
  max: 500, // Limit to 5 requests per window
  message: { success: false, message: "Too many login attempts, please try again later" },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 300, // Limit to 3 requests per window
  message: { success: false, message: "Too many registration attempts, please try again later" },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 300, // Limit to 3 requests per window
  message: { success: false, message: "Too many password reset requests, please try again later" },
});

const googleAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit to 5 requests per window
  message: { success: false, message: "Too many Google auth attempts, please try again later" },
});

// Public routes
router.post("/register", registerLimiter, authController.register);
router.post("/verify-email", authenticateToken, authController.verifyEmail);
router.post("/login", loginLimiter, authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", forgotPasswordLimiter, authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/resend-verification-email", authenticateToken, authController.resendVerificationEmail);
router.get("/google", googleAuthLimiter, authController.googleAuth);
router.get("/google/callback", googleAuthLimiter, authController.googleAuthCallback);

// Protected routes
router.post("/logout", authenticateToken, authController.logout);
router.get("/profile", authenticateToken, authController.getProfile);
router.put("/profile", authenticateToken, upload.single("profile_picture"), authController.updateProfile);
router.put("/change-password", authenticateToken, authController.changePassword);

export default router;