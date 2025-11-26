// src/config/logger.ts
import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

// === Log file paths ===
const logDir = path.join(__dirname, '../../logs');

// === Log format ===
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return stack
      ? `${timestamp} [${level.toUpperCase()}]: ${message}\nStack: ${stack}`
      : `${timestamp} [${level.toUpperCase()}]: ${message}`;
  })
);

// === Rotating file transports ===
const infoTransport = new winston.transports.DailyRotateFile({
  dirname: logDir,
  filename: 'info-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info',
});

const errorTransport = new winston.transports.DailyRotateFile({
  dirname: logDir,
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
});

// === Console transport (for local dev) ===
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
});

// === Logger instance ===
export const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [infoTransport, errorTransport, consoleTransport],
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, 'exceptions.log') }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, 'rejections.log') }),
  ],
});
