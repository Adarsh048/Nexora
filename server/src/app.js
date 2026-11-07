import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

import { connectDB } from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import timelineRoutes from './routes/timelineRoutes.js';
import gmailRoutes from './routes/gmailRoutes.js';
import inboxRoutes from './routes/inboxRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Robust dotenv loading supporting root directory, server directory, or custom paths
const serverEnv = path.resolve(process.cwd(), 'server/.env');
const rootEnv = path.resolve(process.cwd(), '.env');
if (fs.existsSync(serverEnv)) {
  dotenv.config({ path: serverEnv });
} else if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv });
} else {
  dotenv.config();
}

const app = express();

// Security & Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Robust CORS supporting local development, Vercel preview URLs, and production domains
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting for auth and API abuse prevention
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Health check endpoint (always accessible without DB dependency)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    product: 'Nexora Job Application Intelligence Platform',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Database connection readiness check (instant 0ms pass-through when connection is ready)
app.use('/api', async (req, res, next) => {
  if (req.path === '/health' || mongoose.connection.readyState === 1) return next();
  try {
    await connectDB();
    next();
  } catch (err) {
    return res.status(503).json({
      success: false,
      message: `Database connection error: ${err.message}. Please verify your MONGO_URI in Render settings.`,
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/gmail', gmailRoutes);
app.use('/api/inbox', inboxRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/notifications', notificationRoutes);

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

export default app;
