import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";

export const requestLogger = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime.bigint();

  // capture client IP
  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    "unknown";

  // capture original write/end methods for response
  const originalSend = res.send;

  (res as any).send = function (body: any) {
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000;

    const user = (req as any).user
      ? `User:${(req as any).user.id}`
      : "Guest";

    const logPayload = {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      ip,
      user,
      duration: `${durationMs.toFixed(2)} ms`,
      timestamp: new Date().toISOString(),
    };

    if (res.statusCode >= 400) {
      logger.warn(`⚠️ ${logPayload.method} ${logPayload.path}`, logPayload);
    } else {
      logger.info(`✅ ${logPayload.method} ${logPayload.path}`, logPayload);
    }

    // restore send and forward response
    return originalSend.call(this, body);
  };

  next();
};
