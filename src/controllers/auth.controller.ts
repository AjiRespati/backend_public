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

// =============================
// REGISTER
// =============================
export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  const existing = await User.findOne({ where: { email } });
  if (existing) throw createError(400, "Email already exists");

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role });
  res.status(201).json({ success: true, data: user });
};

// =============================
// LOGIN
// =============================
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) throw createError(404, "User not found");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw createError(401, "Invalid credentials");

  const accessToken = generateAccessToken({ id: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

  await user.update({ refreshToken });

  res.json({ success: true, accessToken, refreshToken });
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
// PASSWORD RESET REQUEST
// =============================
export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) throw createError(404, "No account found for this email");

  const token = crypto.randomBytes(32).toString("hex");
  await user.update({ resetToken: token });

  // Normally send via email, but for now return token directly
  res.json({
    success: true,
    message: "Password reset link generated",
    resetLink: `/api/auth/reset-password/${token}`,
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
