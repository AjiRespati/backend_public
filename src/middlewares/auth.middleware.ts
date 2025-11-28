import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from './error.middleware';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth) throw createError(401, 'Authorization header missing');
  const token = auth.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    (req as any).user = decoded;

    next();

  } catch (err: any) {
    if (err.name === "TokenExpiredError")
      return next(createError(401, "Token expired, please login again"));

    if (err.name === "JsonWebTokenError")
      return next(createError(403, "Invalid token signature"));

    next(createError(403, "Invalid or expired token"));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user)
      return next(createError(401, "Unauthorized: no user found in request"));

    if (!user.role)
      return next(createError(403, "User role missing from token"));

    if (!roles.includes(user.role))
      return next(createError(403, "Access denied: insufficient role"));

    next();
  };
};
