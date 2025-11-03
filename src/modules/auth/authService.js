// authService.js

import authRepo from "./authRepo.js";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import imagekit from "../../configs/imagekitConfig.js";
import { OAuth2Client } from "google-auth-library";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from "../../utils/emails.js";

const WORK_ENV = process.env.NODE_ENV;
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- util: validate IANA timezone ------------------------------------
function isValidIanaTimeZone(tz) {
  try {
    if (typeof tz !== "string" || !tz) return false;
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

class AuthService {
  // GOOGLE HELPERS ----------------------------------------------------

  /**
   * verifyGoogleCredential
   * Takes an ID token from Google One Tap / Sign-In client
   * Returns profile info we'll use or create in DB.
   */
  async verifyGoogleCredential(googleCredential) {
    if (!googleCredential) {
      throw createError(400, "Missing Google credential");
    }

    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: googleCredential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch {
      throw createError(401, "Invalid Google credential");
    }

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw createError(400, "Google credential missing email");
    }

    return {
      email: payload.email,
      first_name: payload.given_name || payload.name || "User",
      last_name: payload.family_name || "",
      profile_picture: payload.picture || "",
      isEmailVerified: !!payload.email_verified,
    };
  }

  /**
   * loginWithGoogleProfile
   * - Upserts the user by email
   * - Applies timezone if provided by frontend (first login)
   * - Issues tokens
   */
  async loginWithGoogleProfile(googleProfile, timezone) {
    const normalizedTz = isValidIanaTimeZone(timezone) ? timezone : undefined;

    const user = await authRepo.findOrCreateUserByEmail(googleProfile.email, {
      first_name: googleProfile.first_name,
      last_name: googleProfile.last_name,
      email: googleProfile.email,
      password: null, // Google users don't have local password by default
      profile_picture: googleProfile.profile_picture,
      isEmailVerified: googleProfile.isEmailVerified,
      role: "user",
      timezone: normalizedTz || "UTC",
    });

    if (!user.isActive) {
      throw createError(401, "Account is inactive");
    }

    // If Google confirms email, mark verified
    if (googleProfile.isEmailVerified && !user.isEmailVerified) {
      await authRepo.updateUser(user._id, { isEmailVerified: true });
      user.isEmailVerified = true;
    }

    // If we got a valid tz and user's tz is default/empty, set it
    if (normalizedTz && (user.timezone === "UTC" || !user.timezone)) {
      await authRepo.updateUser(user._id, { timezone: normalizedTz });
      user.timezone = normalizedTz;
    }

    const accessToken = authRepo.generateAccessToken(user);
    const refreshToken = authRepo.generateRefreshToken(user);

    await authRepo.saveRefreshToken(user._id, refreshToken);

    return {
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        timezone: user.timezone,
      },
      accessToken,
      refreshToken,
    };
  }

  // AUTH FLOWS --------------------------------------------------------

  /**
   * register
   * Handles both traditional signup and Google-based signup
   * - Hashes password for local signup
   * - Sets timezone to provided IANA or "UTC"
   * - Generates OTP in production and emails it
   */
  async register({
    first_name,
    last_name,
    phone_country_code,
    phone_number,
    email,
    password,
    role,
    google_credential,
    timezone,
  }) {
    // Google-based signup path
    if (google_credential) {
      const googleProfile = await this.verifyGoogleCredential(
        google_credential
      );
      return await this.loginWithGoogleProfile(googleProfile, timezone);
    }

    // Email/password signup path
    const existingUser = await authRepo.findUserByEmail(email);
    if (existingUser) {
      throw createError(400, "Email already exists");
    }

    const hashedPassword = await authRepo.hashPassword(password);
    const tz = isValidIanaTimeZone(timezone) ? timezone : "UTC";

    const user = await authRepo.createUser({
      first_name,
      last_name,
      phone_country_code,
      phone_number,
      email,
      password: hashedPassword,
      role,
      timezone: tz,
    });

    const accessToken = authRepo.generateAccessToken(user);
    const refreshToken = authRepo.generateRefreshToken(user);
    await authRepo.saveRefreshToken(user._id, refreshToken);

    // Send verification OTP only in production (you can loosen this for staging)

    try {
      const token = await authRepo.generateResetToken(user._id);
      await sendVerificationEmail(user.email, token); // now delegated
      await sendWelcomeEmail(user.email, user.first_name);
    } catch (error) {
      console.log("register error", error);
    }

    return {
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        timezone: user.timezone,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * login
   * Handles both traditional login and Google login.
   * - On first login for password accounts, if client sends timezone and user's timezone is unset/UTC,
   *   we adopt it (first-touch capture). This is critical for correct per-user day bucketing
   *   in analytics/UI later. :contentReference[oaicite:3]{index=3}
   */
  async login({ email, password, google_credential, timezone }) {
    // Google login branch
    if (google_credential) {
      const googleProfile = await this.verifyGoogleCredential(
        google_credential
      );
      return await this.loginWithGoogleProfile(googleProfile, timezone);
    }

    // Email/password branch
    const user = await authRepo.findUserByEmail(email);

    if (!user || !user.isActive) {
      throw createError(401, "Invalid credentials or account inactive");
    }

    // Google-only account trying password login
    if (!user.password) {
      throw createError(
        401,
        "Account uses Google OAuth, please use Google login"
      );
    }

    const isValidPassword = await authRepo.comparePassword(
      password,
      user.password
    );
    if (!isValidPassword) {
      throw createError(401, "Invalid credentials");
    }

    // adopt timezone if provided and user is still default
    const normalizedTz = isValidIanaTimeZone(timezone) ? timezone : undefined;
    if (normalizedTz && (user.timezone === "UTC" || !user.timezone)) {
      await authRepo.updateUser(user._id, { timezone: normalizedTz });
      user.timezone = normalizedTz;
    }

    const accessToken = authRepo.generateAccessToken(user);
    const refreshToken = authRepo.generateRefreshToken(user);

    await authRepo.saveRefreshToken(user._id, refreshToken);

    return {
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        timezone: user.timezone,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * googleLogin
   * (legacy passport/redirect style)
   */
  async googleLogin(userFromPassport) {
    if (!userFromPassport.isActive) {
      throw createError(401, "Account is inactive");
    }

    const accessToken = authRepo.generateAccessToken(userFromPassport);
    const refreshToken = authRepo.generateRefreshToken(userFromPassport);
    await authRepo.saveRefreshToken(userFromPassport._id, refreshToken);

    return {
      user: {
        id: userFromPassport._id,
        first_name: userFromPassport.first_name,
        last_name: userFromPassport.last_name,
        email: userFromPassport.email,
        role: userFromPassport.role,
        isEmailVerified: userFromPassport.isEmailVerified,
        timezone: userFromPassport.timezone,
      },
      accessToken,
      refreshToken,
    };
  }

  // TOKENS / SESSION ---------------------------------------------------

  /**
   * refreshToken
   * Rotates refresh tokens, blacklists old one, returns new access+refresh.
   */
  async refreshToken({ refreshToken }) {
    try {
      // Blocked already?
      if (await authRepo.isTokenBlacklisted(refreshToken)) {
        throw createError(401, "Blacklisted refresh token");
      }

      // Verify signature
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_TOKEN_SECRET
      );

      // Fetch user
      const user = await authRepo.findUserById(decoded.id);
      if (
        !user ||
        !(await authRepo.verifyRefreshToken(decoded.id, refreshToken))
      ) {
        throw createError(401, "Invalid refresh token");
      }

      // Rotate tokens
      const newAccessToken = authRepo.generateAccessToken(user);
      const newRefreshToken = authRepo.generateRefreshToken(user);

      await authRepo.saveRefreshToken(user._id, newRefreshToken);
      await authRepo.removeRefreshToken(user._id, refreshToken);

      return {
        user: {
          id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          timezone: user.timezone,
        },
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (err) {
      throw createError(401, "Invalid or expired refresh token");
    }
  }

  /**
   * logout
   * Blacklist current access + refresh token.
   */
  async logout(userId, accessToken, refreshToken) {
    if (accessToken) {
      const decoded = jwt.decode(accessToken);
      if (decoded && decoded.exp) {
        await authRepo.blacklistToken(
          accessToken,
          "access",
          new Date(decoded.exp * 1000)
        );
      }
    }

    if (refreshToken) {
      const decoded = jwt.decode(refreshToken);
      if (decoded && decoded.exp) {
        await authRepo.blacklistToken(
          refreshToken,
          "refresh",
          new Date(decoded.exp * 1000)
        );
        await authRepo.removeRefreshToken(userId, refreshToken);
      }
    }
  }

  // PROFILE / SECURITY -------------------------------------------------

  /**
   * getProfile
   * Return safe public profile plus timezone so frontend can localize UX.
   */
  async getProfile(userId) {
    const user = await authRepo.findUserById(userId);
    if (!user) {
      throw createError(404, "User not found");
    }

    return {
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      phone_country_code: user.phone_country_code,
      phone_number: user.phone_number,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      isActive: user.isActive,
      date_of_birth: user.date_of_birth,
      profile_picture: user.profile_picture,
      timezone: user.timezone, // critical for per-user mood calendar  :contentReference[oaicite:4]{index=4}
      createdAt: user.createdAt,
    };
  }

  /**
   * verifyEmail
   * Validate OTP and mark email verified.
   */
  async verifyEmail(token) {
    const isValid = await authRepo.verifyResetToken(token);
    if (!isValid) {
      throw createError(400, "Invalid or expired Token");
    }
    const userId = isValid.id;
    const user = await authRepo.updateUser(userId, {
      isEmailVerified: true,
      resetToken: null,
      resetTokenExpires: null,
    });
    if (!user) {
      throw createError(404, "User not found");
    }
    return user;
  }

  /**
   * resendVerificationEmail
   * Generates a new OTP and sends it.
   */
  async resendVerificationEmail(email) {
    const user = await authRepo.findUserByEmail(email);
    if (!user) {
      throw createError(404, "User not found");
    }
    if (user.isEmailVerified) {
      throw createError(400, "Email already verified");
    }

    const token = await authRepo.generateResetToken(user.id);
    await sendVerificationEmail(email, token);
  }

  /**
   * forgotPassword
   * Generates reset token and emails reset link.
   */
  async forgotPassword(email) {
    const user = await authRepo.findUserByEmail(email);
    if (!user) {
      throw createError(404, "User not found");
    }

    const resetToken = await authRepo.generateResetToken(user._id);
    await sendPasswordResetEmail(user.email, resetToken);
  }

  /**
   * resetPassword
   * Validates reset token and updates password.
   */
  async resetPassword(token, newPassword) {
    const user = await authRepo.verifyResetToken(token);
    if (!user) {
      throw createError(400, "Invalid or expired reset token");
    }
    // const user = await authRepo.findUserByEmail(token)

    const hashedPassword = await authRepo.hashPassword(newPassword);
    await authRepo.updateUser(user._id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
    });
  }

  async verifyResetPasswordToken(token) {
    const user = await authRepo.verifyResetToken(token);
    if (!user) {
      throw createError(400, "Invalid or expired reset token");
    }
    return;
  }

  /**
   * updateProfile
   * Allows editing basic profile fields + avatar + timezone.
   * We whitelist allowed fields and do IANA validation on timezone.
   */
  async updateProfile(userId, updateData, file) {
    const allowedFields = [
      "first_name",
      "last_name",
      "phone_country_code",
      "phone_number",
      "date_of_birth",
      "profile_picture",
      "timezone", // user can manually set preferred IANA tz
    ];

    const filteredData = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    if (filteredData.timezone && !isValidIanaTimeZone(filteredData.timezone)) {
      throw createError(400, "Invalid IANA timezone");
    }

    const existingUser = await authRepo.findUserById(userId);
    if (!existingUser) {
      throw createError(404, "User not found");
    }

    // Profile picture upload logic
    if (file) {
      const uploadResponse = await imagekit.upload({
        file: file.buffer,
        fileName: file.originalname,
        folder: `/profiles/${userId}`,
      });
      filteredData.profile_picture = uploadResponse.url;
    } else if (updateData.profile_picture !== undefined) {
      // explicit remove/reset or keep value
      filteredData.profile_picture =
        updateData.profile_picture === "" || updateData.profile_picture === null
          ? null
          : updateData.profile_picture;
    }

    const user = await authRepo.updateUser(userId, filteredData);
    if (!user) {
      throw createError(404, "User not found");
    }

    return {
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      phone_country_code: user.phone_country_code,
      phone_number: user.phone_number,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      isActive: user.isActive,
      date_of_birth: user.date_of_birth,
      profile_picture: user.profile_picture,
      timezone: user.timezone,
    };
  }

  /**
   * changePassword
   * Requires oldPassword, rejects Google-only accounts.
   */
  async changePassword(userId, oldPassword, newPassword) {
    const user = await authRepo.findUserById(userId);
    if (!user) {
      throw createError(404, "User not found");
    }

    if (!user.password) {
      throw createError(
        400,
        "Account uses Google OAuth, use Google login or reset password"
      );
    }

    const isValidPassword = await authRepo.comparePassword(
      oldPassword,
      user.password
    );
    if (!isValidPassword) {
      throw createError(401, "Invalid current password");
    }

    const hashedPassword = await authRepo.hashPassword(newPassword);
    await authRepo.updateUser(userId, {
      password: hashedPassword,
    });
  }
}

export default new AuthService();
