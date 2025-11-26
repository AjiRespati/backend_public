// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

// Define a standard structure for errors
interface ApiError extends Error {
  statusCode?: number;
  details?: any;
}

// Main error handler middleware
export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default values
  const statusCode = err.statusCode || 500;
  const message =
    err.message || 'An unexpected error occurred on the server.';
  const details = err.details || null;

  // Log detailed error using Winston
  logger.error(
    `[${req.method}] ${req.originalUrl} - ${statusCode} - ${message}${
      details ? ` | Details: ${JSON.stringify(details)}` : ''
    }`
  );

  // Send structured response to client
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

// Optional helper for throwing typed errors in controllers
export const createError = (
  statusCode: number,
  message: string,
  details?: any
) => {
  const error: ApiError = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
};



/// EXAMPLE USAGE

// import { Request, Response, NextFunction } from 'express';
// import { createError } from '../middlewares/error.middleware';
// import Product from '../models/product.model';

// export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const product = await Product.findByPk(req.params.id);
//     if (!product) throw createError(404, 'Product not found');
//     res.json(product);
//   } catch (err) {
//     next(err);
//   }
// };
