// src/app.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { logger } from './config/logger';
import routes from './routes';
import sequelize from './config/db';
import { errorHandler } from './middlewares/error.middleware';
import { applySecurityMiddleware } from './middlewares/security.middleware';

dotenv.config();

const app: Application = express();

// ===== Global Middleware =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply security protection
applySecurityMiddleware(app);

// HTTP logging middleware (Morgan + Winston)
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// =====
