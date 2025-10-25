import authRepo from "./authRepo.js";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import imagekit from "../../configs/imagekitConfig.js";
const WORK_ENV = process.env.NODE_ENV;

class AuthService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async register({ first_name, last_name, phone_country_code, phone_number, email, password, role }) {
    const existingUser = await authRepo.findUserByEmail(email);
    if (existingUser) {
      throw createError(400, "Email already exists");
    }

    const hashedPassword = await authRepo.hashPassword(password);
    const user = await authRepo.createUser({
      first_name,
      last_name,
      phone_country_code,
      phone_number,
      email,
      password: hashedPassword,
      role,
    });

    const accessToken = authRepo.generateAccessToken(user);
    const refreshToken = authRepo.generateRefreshToken(user);
    await authRepo.saveRefreshToken(user._id, refreshToken);

    if (WORK_ENV === "production") {
      const otp = await authRepo.generateOTP(user._id);
      await this.sendVerificationEmail(user.email, otp);
    }

    return {
      user: { id: user._id, first_name, last_name, email, role, isEmailVerified: user.isEmailVerified },
      accessToken,
      refreshToken,
    };
  }

  async login({ email, password }) {
    const user = await authRepo.findUserByEmail(email);
    if (!user || !user.isActive) {
      throw createError(401, "Invalid credentials or account inactive");
    }

    if (!user.password) {
      throw createError(401, "Account uses Google OAuth, please use Google login");
    }

    const isValidPassword = await authRepo.comparePassword(password, user.password);
    if (!isValidPassword) {
      throw createError(401, "Invalid credentials");
    }

    const accessToken = authRepo.generateAccessToken(user);
    const refreshToken = authRepo.generateRefreshToken(user);
    await authRepo.saveRefreshToken(user._id, refreshToken);

    return {
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  async googleLogin(user) {
    if (!user.isActive) {
      throw createError(401, "Account is inactive");
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
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken({ refreshToken }) {
    try {
      if (await authRepo.isTokenBlacklisted(refreshToken)) {
        throw createError(401, "Blacklisted refresh token");
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
      const user = await authRepo.findUserById(decoded.id);
      if (!user || !(await authRepo.verifyRefreshToken(decoded.id, refreshToken))) {
        throw createError(401, "Invalid refresh token");
      }

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
        },
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw createError(401, "Invalid or expired refresh token");
    }
  }

  async logout(userId, accessToken, refreshToken) {
    if (accessToken) {
      const decoded = jwt.decode(accessToken);
      if (decoded && decoded.exp) {
        await authRepo.blacklistToken(accessToken, "access", new Date(decoded.exp * 1000));
      }
    }
    if (refreshToken) {
      const decoded = jwt.decode(refreshToken);
      if (decoded && decoded.exp) {
        await authRepo.blacklistToken(refreshToken, "refresh", new Date(decoded.exp * 1000));
        await authRepo.removeRefreshToken(userId, refreshToken);
      }
    }
  }

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
      createdAt: user.createdAt,
    };
  }

  async verifyEmail(userId, otp) {
    const isValid = await authRepo.verifyOTP(userId, otp);
    if (!isValid && WORK_ENV === "production") {
      throw createError(400, "Invalid or expired OTP");
    }

    const user = await authRepo.updateUser(userId, { isEmailVerified: true });
    if (!user) {
      throw createError(404, "User not found");
    }
    return user;
  }

  async resendVerificationEmail(userId) {
    const user = await authRepo.findUserById(userId);
    if (!user) {
      throw createError(404, "User not found");
    }
    if (user.isEmailVerified) {
      throw createError(400, "Email already verified");
    }

    const otp = await authRepo.generateOTP(user._id);
    await this.sendVerificationEmail(user.email, otp);
  }

  async forgotPassword(email) {
    const user = await authRepo.findUserByEmail(email);
    if (!user) {
      throw createError(404, "User not found");
    }

    const resetToken = await authRepo.generateResetToken(user._id);
    await this.sendPasswordResetEmail(user.email, resetToken);
  }

  async resetPassword(token, newPassword) {
    const user = await authRepo.verifyResetToken(token);
    if (!user) {
      throw createError(400, "Invalid or expired reset token");
    }

    const hashedPassword = await authRepo.hashPassword(newPassword);
    await authRepo.updateUser(user._id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
    });
  }

  async updateProfile(userId, updateData, file) {
    const allowedFields = [
      "first_name",
      "last_name",
      "phone_country_code",
      "phone_number",
      "date_of_birth",
      "profile_picture",
    ];
    const filteredData = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    const existingUser = await authRepo.findUserById(userId);
    if (!existingUser) {
      throw createError(404, "User not found");
    }

    // Handle file upload (takes priority over body.profile_picture)
    if (file) {
      // Delete old profile picture if exists
      if (existingUser.profile_picture) {
        const filePath = new URL(existingUser.profile_picture).pathname.slice(1);
        await imagekit.deleteFileByPath(filePath);
      }

      // Upload new
      const uploadResponse = await imagekit.upload({
        file: file.buffer,
        fileName: file.originalname,
        folder: `/profiles/${userId}`,
      });
      filteredData.profile_picture = uploadResponse.url;
    } else if (updateData.profile_picture !== undefined) {
      if (updateData.profile_picture === "" || updateData.profile_picture === null) {
        // Delete old if removing
        if (existingUser.profile_picture) {
          const filePath = new URL(existingUser.profile_picture).pathname.slice(1);
          await imagekit.deleteFileByPath(filePath);
        }
        filteredData.profile_picture = null;
      } else {
        filteredData.profile_picture = updateData.profile_picture;
      }
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
    };
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await authRepo.findUserById(userId);
    if (!user) {
      throw createError(404, "User not found");
    }

    if (!user.password) {
      throw createError(400, "Account uses Google OAuth, use Google login or reset password");
    }

    const isValidPassword = await authRepo.comparePassword(oldPassword, user.password);
    if (!isValidPassword) {
      throw createError(401, "Invalid current password");
    }

    const hashedPassword = await authRepo.hashPassword(newPassword);
    await authRepo.updateUser(userId, { password: hashedPassword });
  }

  async sendVerificationEmail(email, otp) {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Email Verification OTP",
      text: `Your OTP for email verification is: ${otp}. It expires in 15 minutes.`,
      html: `<p>Your OTP for email verification is: <strong>${otp}</strong>. It expires in 15 minutes.</p>`,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Password Reset Request",
      text: `You requested a password reset. Click the link to reset your password: ${resetUrl}. This link expires in 1 hour.`,
      html: `<p>You requested a password reset. Click the link to reset your password: <a href="${resetUrl}">${resetUrl}</a>. This link expires in 1 hour.</p>`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

export default new AuthService();