import jwt from "jsonwebtoken";

export const generateAccessToken = (payload: object) =>
  jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "15m" }); // short lifetime

export const generateRefreshToken = (payload: object) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });

export const verifyToken = (token: string, secret: string) =>
  jwt.verify(token, secret);
