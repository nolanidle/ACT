import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import pool from "../config/db.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  updatePassword,
  verifyEmail as verifyUserEmail,
} from "../models/userModel.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../services/mailService.js";

dotenv.config();

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, subscription_tier: user.subscription_tier },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existing = await findUserByEmail(email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({ success: false, data: null, error: "Email already in use." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    await createUser(userId, email.toLowerCase().trim(), passwordHash, name.trim());

    // Create verification code
    const code = generateVerificationCode();
    const codeId = uuidv4();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await pool.execute(
      `INSERT INTO email_verification_codes (id, user_id, code, expires_at, used, created_at)
       VALUES (?, ?, ?, ?, FALSE, NOW())`,
      [codeId, userId, code, expiresAt]
    );

    // Send verification email (don't await to speed up response)
    sendVerificationEmail(email.toLowerCase().trim(), name.trim(), code).catch((err) => {
      console.error("Failed to send verification email:", err.message);
    });

    // Create streak record for new user
    await pool.execute(
      `INSERT IGNORE INTO streaks (id, user_id, current_streak, longest_streak, created_at, updated_at)
       VALUES (?, ?, 0, 0, NOW(), NOW())`,
      [uuidv4(), userId]
    );

    return res.status(201).json({
      success: true,
      data: {
        message: "Account created. Please check your email for a verification code.",
        userId,
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/verify-email
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, data: null, error: "Email and code are required." });
    }

    const user = await findUserByEmail(email.toLowerCase().trim());
    if (!user) {
      return res.status(404).json({ success: false, data: null, error: "User not found." });
    }

    if (user.email_verified) {
      return res.status(200).json({ success: true, data: { message: "Email already verified." }, error: null });
    }

    const [rows] = await pool.execute(
      `SELECT * FROM email_verification_codes
       WHERE user_id = ? AND code = ? AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [user.id, code]
    );

    if (rows.length === 0) {
      return res.status(400).json({ success: false, data: null, error: "Invalid or expired verification code." });
    }

    // Mark code as used
    await pool.execute(
      `UPDATE email_verification_codes SET used = TRUE WHERE id = ?`,
      [rows[0].id]
    );

    await verifyUserEmail(user.id);

    return res.status(200).json({
      success: true,
      data: { message: "Email verified successfully. You can now log in." },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ success: false, data: null, error: "Invalid email or password." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, data: null, error: "Invalid email or password." });
    }

    if (!user.email_verified) {
      return res.status(403).json({
        success: false,
        data: null,
        error: "Please verify your email address before logging in.",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/api/auth",
    });

    // Update last active
    await pool.execute(
      `UPDATE users SET last_active_date = CURDATE(), updated_at = NOW() WHERE id = ?`,
      [user.id]
    );

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          subscription_tier: user.subscription_tier,
          xp: user.xp,
          streak_count: user.streak_count,
        },
      },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh
export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ success: false, data: null, error: "No refresh token provided." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, data: null, error: "Invalid or expired refresh token." });
    }

    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, data: null, error: "User not found." });
    }

    const accessToken = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      data: { accessToken },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
export const logout = async (req, res, next) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
    });

    return res.status(200).json({
      success: true,
      data: { message: "Logged out successfully." },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, data: null, error: "Email is required." });
    }

    const user = await findUserByEmail(email.toLowerCase().trim());

    // Always return success to prevent user enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        data: { message: "If that email exists, a reset link has been sent." },
        error: null,
      });
    }

    // Invalidate existing reset tokens for this user
    await pool.execute(
      `UPDATE password_reset_codes SET used = TRUE WHERE user_id = ? AND used = FALSE`,
      [user.id]
    );

    const resetToken = uuidv4() + "-" + uuidv4();
    const tokenId = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.execute(
      `INSERT INTO password_reset_codes (id, user_id, token, expires_at, used, created_at)
       VALUES (?, ?, ?, ?, FALSE, NOW())`,
      [tokenId, user.id, resetToken, expiresAt]
    );

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

    sendPasswordResetEmail(user.email, user.name, resetUrl).catch((err) => {
      console.error("Failed to send password reset email:", err.message);
    });

    return res.status(200).json({
      success: true,
      data: { message: "If that email exists, a reset link has been sent." },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, data: null, error: "Token and new password are required." });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, data: null, error: "Password must be at least 8 characters." });
    }

    const [rows] = await pool.execute(
      `SELECT * FROM password_reset_codes
       WHERE token = ? AND used = FALSE AND expires_at > NOW()
       LIMIT 1`,
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ success: false, data: null, error: "Invalid or expired reset token." });
    }

    const resetRecord = rows[0];

    const passwordHash = await bcrypt.hash(password, 12);
    await updatePassword(resetRecord.user_id, passwordHash);

    await pool.execute(
      `UPDATE password_reset_codes SET used = TRUE WHERE id = ?`,
      [resetRecord.id]
    );

    return res.status(200).json({
      success: true,
      data: { message: "Password reset successfully. You can now log in with your new password." },
      error: null,
    });
  } catch (err) {
    next(err);
  }
};
