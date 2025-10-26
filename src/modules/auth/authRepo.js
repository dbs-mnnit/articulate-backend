
// export default new AuthRepository();
import User from "../../models/User.js";
import RefreshToken from "../../models/RefreshToken.js";
import BlacklistedToken from "../../models/BlacklistedToken.js";
import EmailVerificationOTP from "../../models/EmailVerificationOTP.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

class AuthRepository {
  async findUserByEmail(email) {
    return await User.findOne({ email });
  }

  async findUserById(id) {
    return await User.findById(id);
  }

  // find or create (Google or SSO flows), optionally set timezone if not set yet
  async findOrCreateUserByEmail(email, userData) {
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create(userData);
    } else {
      const updates = {};
      if (userData.first_name && !user.first_name) updates.first_name = userData.first_name;
      if (userData.last_name && !user.last_name) updates.last_name = userData.last_name;
      if (userData.profile_picture && !user.profile_picture) updates.profile_picture = userData.profile_picture;
      if (userData.phone_country_code && !user.phone_country_code) updates.phone_country_code = userData.phone_country_code;
      if (userData.phone_number && !user.phone_number) updates.phone_number = userData.phone_number;
      // NEW: adopt timezone only if user hasn't set it yet or it's the default
      if (userData.timezone && (!user.timezone || user.timezone === "UTC")) {
        updates.timezone = userData.timezone;
      }

      if (Object.keys(updates).length > 0) {
        user = await User.findByIdAndUpdate(user._id, { $set: updates }, { new: true });
      }
    }

    return user;
  }

  async createUser(userData) {
    return await User.create(userData);
  }

  async updateUser(id, updateData) {
    return await User.findByIdAndUpdate(id, { $set: updateData }, { new: true });
  }

  async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  generateAccessToken(user) {
    return jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY,
    });
  }

  async saveRefreshToken(userId, refreshToken) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({ userId, token: refreshToken, expiresAt });
  }

  async verifyRefreshToken(userId, refreshToken) {
    const token = await RefreshToken.findOne({ userId, token: refreshToken });
    return !!token;
  }

  async removeRefreshToken(userId, refreshToken) {
    await RefreshToken.deleteOne({ userId, token: refreshToken });
  }

  async blacklistToken(token, type, expiresAt) {
    await BlacklistedToken.create({ token, type, expiresAt });
  }

  async isTokenBlacklisted(token) {
    const blacklisted = await BlacklistedToken.findOne({ token });
    return !!blacklisted;
  }

  async generateOTP(userId) {
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);
    await EmailVerificationOTP.create({ userId, otp: hashedOTP });
    return otp;
  }

  async verifyOTP(userId, otp) {
    const record = await EmailVerificationOTP.findOne({ userId });
    if (!record) return false;
    const isValid = await bcrypt.compare(otp, record.otp);
    if (isValid) {
      await EmailVerificationOTP.deleteOne({ userId });
    }
    return isValid;
  }

  async generateResetToken(userId) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await User.findByIdAndUpdate(userId, { resetToken: token, resetTokenExpires: expiresAt });
    return token;
  }

  async verifyResetToken(token) {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() },
    });
    return user;
  }
}

export default new AuthRepository();
