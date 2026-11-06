import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initQueues, registerJobProcessor } from './services/queueService.js';
import { syncUserEmails } from './services/gmailService.js';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;

// In standalone production, serve client build statically
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Nexora API server is running. In development, open the Vite dev server at http://localhost:5173');
    }
  });
});

// Start Server and bind port immediately for cloud health checks
async function startServer() {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`   NEXORA INTELLIGENCE PLATFORM BACKEND ACTIVE     `);
    console.log(`   Port: ${PORT} | Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Ready for requests at http://0.0.0.0:${PORT}`);
    console.log(`====================================================`);
  });

  // Connect to Database
  try {
    await connectDB();
  } catch (err) {
    console.error(`[MongoDB] Initial connection error: ${err.message}`);
    console.error(`[MongoDB] To fix: Add MONGO_URI in your Render Dashboard -> Environment.`);
  }

  // Initialize Queues
  try {
    await initQueues();
    registerJobProcessor('sync-gmail', async (data) => {
      if (data && data.userId) {
        console.log(`[Queue] Processing background email sync for user ${data.userId}`);
        return await syncUserEmails(data.userId);
      }
    });
  } catch (err) {
    console.warn(`[Queue] Queue initialization notice: ${err.message}`);
  }

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
