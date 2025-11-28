import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/user.model";
import { createError } from "../middlewares/error.middleware";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../utils/token.utils";
import crypto from "crypto";
import { sendMail } from "../utils/mailer";

// =============================
// REGISTER + EMAIL VERIFICATION
// =============================
export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  const existing = await User.findOne({ where: { email } });
  if (existing) throw createError(400, "Email already exists");

  const hashed = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString("hex");

  const user = await User.create({
    name,
    email,
    password: hashed,
    role,
    verificationToken,
    isVerified: false,
  });

  const verificationLink = `https://www.ajirespati.com/verify-email/${verificationToken}`;

  await sendMail(
    email,
    "Verify your Aji Respati POS account",
    `
    <h2>Welcome to Aji Respati POS!</h2>
    <p>Click below to verify your email:</p>
    <a href="${verificationLink}">Verify Email</a>
    <p>This link will expire in 24 hours.</p>
    `
  );

  res.status(201).json({
    success: true,
    message: "Registration successful! Please verify your email.",
  });
};

// =============================
// EMAIL VERIFICATION
// =============================
export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.params;
  const user = await User.findOne({ where: { verificationToken: token } });
  if (!user) throw createError(400, "Invalid or expired verification token");

  await user.update({ isVerified: true, verificationToken: null });
  res.json({ success: true, message: "Email successfully verified!" });
};


// =============================
// LOGIN
// =============================

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ where: { email } });
  if (!user) throw createError(404, "User not found");

  // Ensure password field exists
  const storedHash =
    user.password ||
    (user.getDataValue && user.getDataValue("password")) ||
    null;

  if (!storedHash) {
    console.error("⚠️ Missing password field on user instance:", user.toJSON());
    throw createError(500, "User record corrupted: no password field");
  }

  // Compare password safely
  const valid = await bcrypt.compare(password, storedHash);
  if (!valid) throw createError(401, "Invalid credentials");

  // Check verification state
  if (!user.getDataValue("isVerified"))
    throw createError(403, "Please verify your email before logging in");

  // Generate tokens
  const accessToken = generateAccessToken({
    id: user.getDataValue("id"),
    name: user.getDataValue("name"),
    email: user.getDataValue("email"),
    role: user.getDataValue("role"),
  });
  const refreshToken = generateRefreshToken({
    id: user.getDataValue("id"),
    name: user.getDataValue("name"),
    email: user.getDataValue("email"),
    role: user.getDataValue("role"),
  });

  await user.update({ refreshToken });

  res.json({
    success: true,
    accessToken,
    refreshToken,
    user: {
      id: user.getDataValue("id"),
      name: user.getDataValue("name"),
      email: user.getDataValue("email"),
      role: user.getDataValue("role"),
    },
  });
};

// =============================
// REFRESH TOKEN
// =============================
export const refresh = async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) throw createError(400, "Missing refresh token");

  const user = await User.findOne({ where: { refreshToken: token } });
  if (!user) throw createError(403, "Invalid refresh token");

  try {
    verifyToken(token, process.env.JWT_REFRESH_SECRET!);
    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    res.json({ success: true, accessToken });
  } catch {
    throw createError(403, "Expired or invalid refresh token");
  }
};

// =============================
// LOGOUT
// =============================
export const logout = async (req: Request, res: Response) => {
  const user = await User.findByPk((req as any).user.id);
  if (user) await user.update({ refreshToken: null });
  res.json({ success: true, message: "Logged out successfully" });
};

// =============================
// PASSWORD RESET REQUEST (with email)
// =============================
export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) throw createError(404, "No account found for this email");

  const token = crypto.randomBytes(32).toString("hex");
  await user.update({ resetToken: token });

  const resetLink = `https://www.ajirespati.com/reset-password/${token}`;

  await sendMail(
    email,
    "Reset your Aji Respati POS password",
    `
    <h2>Reset your password</h2>
    <p>Click below to reset your password:</p>
    <a href="${resetLink}">Reset Password</a>
    <p>If you didn’t request this, you can ignore this email.</p>
    `
  );

  res.json({
    success: true,
    message: "Password reset link sent to your email",
  });
};

// =============================
// PASSWORD RESET CONFIRM
// =============================
export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  const user = await User.findOne({ where: { resetToken: token } });
  if (!user) throw createError(400, "Invalid or expired reset token");

  const hashed = await bcrypt.hash(newPassword, 10);
  await user.update({ password: hashed, resetToken: null });

  res.json({ success: true, message: "Password successfully reset" });
};
