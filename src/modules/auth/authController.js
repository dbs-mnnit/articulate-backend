
import authService from "./authService.js";
import createError from "http-errors";
import { body, validationResult } from "express-validator";
import validator from "validator";
import passport from "../../configs/passportConfig.js";

// IANA timezone validator for express-validator .custom()
function isValidIanaTimeZone(tz) {
  try {
    if (typeof tz !== "string" || !tz) return false;
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

// Pull tz from headers or body
function extractTimezone(req) {
  const headerTz =
    req.headers["x-timezone"] ||
    req.headers["x-client-timezone"] ||
    req.headers["x-user-timezone"];
  return (req.body.timezone || headerTz || "").toString().trim();
}

class AuthController {
  async register(req, res, next) {
    try {
      const timezone = extractTimezone(req);

      if (req.body.google_credential) {
        await body("google_credential").notEmpty().withMessage("Google credential required").run(req);
        if (timezone) {
          await body("timezone")
            .custom(isValidIanaTimeZone)
            .withMessage("Invalid IANA timezone")
            .run(req);
        }
      } else {
        await Promise.all([
          body("first_name").notEmpty().withMessage("First name is required").run(req),
          body("last_name").optional().run(req),
          body("phone_country_code").optional().notEmpty().run(req),
          body("phone_number").optional().notEmpty().run(req),
          body("email").isEmail().withMessage("Invalid email format").run(req),
          body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters").run(req),
          body("role").optional().isIn(["user", "admin"]).withMessage("Invalid role").run(req),
          timezone
            ? body("timezone").custom(isValidIanaTimeZone).withMessage("Invalid IANA timezone").run(req)
            : Promise.resolve(),
        ]);
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) throw createError(400, errors.array()[0].msg);

      const {
        first_name,
        last_name,
        phone_country_code,
        phone_number,
        email,
        password,
        role,
        google_credential,
      } = req.body;

      const result = await authService.register({
        first_name,
        last_name,
        phone_country_code,
        phone_number,
        email,
        password,
        role,
        google_credential,
        timezone, // NEW
      });

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production"?"none":"lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        success: true,
        data: { user: result.user, accessToken: result.accessToken },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const timezone = extractTimezone(req);

      if (req.body.google_credential) {
        await body("google_credential").notEmpty().withMessage("Google credential required").run(req);
        if (timezone) {
          await body("timezone")
            .custom(isValidIanaTimeZone)
            .withMessage("Invalid IANA timezone")
            .run(req);
        }
      } else {
        await Promise.all([
          body("email").isEmail().withMessage("Invalid email format").run(req),
          body("password").notEmpty().withMessage("Password is required").run(req),
          timezone
            ? body("timezone").custom(isValidIanaTimeZone).withMessage("Invalid IANA timezone").run(req)
            : Promise.resolve(),
        ]);
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) throw createError(400, errors.array()[0].msg);

      const { email, password, google_credential } = req.body;
      const result = await authService.login({ email, password, google_credential, timezone });

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production"?"none":"lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        data: { user: result.user, accessToken: result.accessToken },
      });
    } catch (error) {
      next(error);
    }
  }

  // PASSPORT (legacy)
  async googleAuth(req, res, next) {
    try {
      passport.authenticate("google", { scope: ["profile", "email"], session: false })(req, res, next);
    } catch (error) {
      next(error);
    }
  }

  async googleAuthCallback(req, res, next) {
    try {
      passport.authenticate("google", { session: false }, async (err, user, info) => {
        if (err || !user) {
          return res.redirect(
            `${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(info?.message || "Authentication failed")}`
          );
        }

        const result = await authService.googleLogin(user);

        res.cookie("refreshToken", result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production"?"none":"lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.redirect(`${process.env.FRONTEND_URL}/auth/callback?accessToken=${result.accessToken}`);
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) throw createError(400, "Refresh token required");

      const result = await authService.refreshToken({ refreshToken });

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production"?"none":"lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        data: { user: result.user, accessToken: result.accessToken },
      });
    } catch (error) {
      res.clearCookie("refreshToken");
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      // console.log(process.env.NODE_ENV === "production")
      
      const refreshToken = req.cookies.refreshToken;
      const authHeader = req.headers["authorization"];
      const accessToken = authHeader && authHeader.split(" ")[1];

      if (!refreshToken) throw createError(400, "Refresh token required");

      await authService.logout(req.user.id, accessToken, refreshToken);
      res.clearCookie("refreshToken");

      res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profile = await authService.getProfile(userId);
      res.json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const { token } = req.query;
      const user = await authService.verifyEmail(token);

      res.json({
        success: true,
        data: {
          id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          timezone: user.timezone,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async resendVerificationEmail(req, res, next) {
    try {
      const { email } = req.body
      await authService.resendVerificationEmail(email);
      res.json({ success: true, message: "Verification email resent successfully" });
    } catch (error) {
      next(error);
    }
  }


  async forgotPassword(req, res, next) {
    try {
      await body("email").isEmail().withMessage("Invalid email format").run(req);
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw createError(400, errors.array()[0].msg);

      const { email } = req.body;
      await authService.forgotPassword(email);
      res.json({ success: true, message: "Password reset email sent successfully" });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      await Promise.all([
        body("token").notEmpty().withMessage("Reset token is required").run(req),
        body("newPassword").isLength({ min: 8 }).withMessage("New password must be at least 8 characters").run(req),
      ]);
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw createError(400, errors.array()[0].msg);

      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);
      res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      next(error);
    }
  }
 async verifyResetPasswordToken(req, res, next) {
  try {
    const { token } = req.query;
    if(!token){
      throw createError(404, "Token not found")
    }
    await authService.verifyResetPasswordToken(token);
    res.json({ success: true, message: "Token verified successfully" });
  } catch (error) {
    next(error);
  }
}


  async updateProfile(req, res, next) {
    try {
      await Promise.all([
        body("first_name").optional().notEmpty().withMessage("First name cannot be empty").run(req),
        body("last_name").optional().notEmpty().withMessage("Last name cannot be empty").run(req),
        body("phone_country_code").optional().matches(/^\+\d+$/).withMessage("Invalid country code format").run(req),
        body("phone_number").optional().matches(/^\d+$/).withMessage("Invalid phone number format").run(req),
        body("date_of_birth").optional().isISO8601().withMessage("Invalid date format").run(req),
        body("profile_picture")
          .optional()
          .custom((value) => {
            if (value === null || value === "" || validator.isURL(value)) return true;
            throw new Error("Invalid profile picture: must be URL, null, or empty string");
          })
          .run(req),
        // NEW: allow timezone update explicitly
        body("timezone")
          .optional()
          .custom(isValidIanaTimeZone)
          .withMessage("Invalid IANA timezone")
          .run(req),
      ]);

      const errors = validationResult(req);
      if (!errors.isEmpty()) throw createError(400, errors.array()[0].msg);

      const updateData = req.body;
      const file = req.file;
      const user = await authService.updateProfile(req.user.id, updateData, file);

      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      await Promise.all([
        body("oldPassword").notEmpty().withMessage("Current password is required").run(req),
        body("newPassword").isLength({ min: 8 }).withMessage("New password must be at least 8 characters").run(req),
      ]);
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw createError(400, errors.array()[0].msg);

      const { oldPassword, newPassword } = req.body;
      await authService.changePassword(req.user.id, oldPassword, newPassword);
      res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
