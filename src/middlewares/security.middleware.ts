// src/middlewares/security.middleware.ts
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { Application } from 'express';
import { logger } from '../config/logger';

/**
 * Applies production security middleware
 *  - Helmet: adds security headers
 *  - RateLimiter: blocks brute-force and DDoS attempts
 *  - Compression: gzip response bodies for speed
 */
export const applySecurityMiddleware = (app: Application): void => {
  // === 1️⃣ Helmet for HTTP security headers ===
  app.use(
    helmet({
      contentSecurityPolicy: false, // disable CSP for REST APIs
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // === 2️⃣ Compression for faster response ===
  app.use(compression());

  // === 3️⃣ Rate limiting (100 req / 15 min per IP) ===
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: { message: 'Too many requests, please try again later.' },
    },
    handler: (req, res, next, options) => {
      logger.warn(`Rate limit exceeded for ${req.ip}`);
      res.status(options.statusCode).json(options.message);
    },
  });

  app.use('/api', limiter);

  // Log applied middleware
  logger.info('🛡 Security middleware applied: Helmet, Compression, RateLimiter');
};
