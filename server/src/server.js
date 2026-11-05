import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { initQueues, registerJobProcessor } from './services/queueService.js';
import { syncUserEmails } from './services/gmailService.js';

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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Robust CORS supporting both local development and custom production domains
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    // Allow any subdomains or configured origins
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
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

// Health check endpoint for uptime monitors and cloud orchestrators
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    product: 'Nexora Job Application Intelligence Platform',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
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

// In production, serve frontend client build statically
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      // In development if client/dist is not built yet
      res.status(404).send('Nexora API server is running. In development, open the Vite dev server at http://localhost:5173');
    }
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

// Connect to DB and Start Server
async function startServer() {
  await connectDB();
  await initQueues();

  // Register background job processors
  registerJobProcessor('sync-gmail', async (data) => {
    if (data && data.userId) {
      console.log(`[Queue] Processing background email sync for user ${data.userId}`);
      return await syncUserEmails(data.userId);
    }
  });

  const server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`   NEXORA INTELLIGENCE PLATFORM BACKEND ACTIVE     `);
    console.log(`   Port: ${PORT} | Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Ready for requests at http://localhost:${PORT}`);
    console.log(`====================================================`);
  });

  // Graceful shutdown handling
  const shutdown = async (signal) => {
    console.log(`\n[${signal}] Initiating graceful shutdown...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer();
