import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from './config/database';
import { configureCloudinary } from './config/cloudinary';
import { initializeEmailService } from './services/email.service';
import { errorMiddleware } from './middlewares/error.middleware';
import routes from './routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());

// CORS configuration
// Allow multiple origins for development and production
const allowedOrigins = [
  'http://localhost:3000',
  'https://cleartax-frontend.vercel.app',
  'https://finvidhi.com',
  'https://www.finvidhi.com',
  process.env.FRONTEND_URL,
].filter(Boolean); // Remove any undefined values

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // For production, also check if FRONTEND_URL is set and matches
      if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
        return callback(null, true);
      }
      
      // Allow the origin if it matches the pattern (for Vercel preview deployments)
      if (origin.includes('vercel.app') || origin.includes('localhost')) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Single, de-duplicated DB connection attempt. Multiple concurrent callers share
// the same in-flight promise instead of firing parallel mongoose.connect() calls.
let connectingPromise: Promise<void> | null = null;
const ensureConnected = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) return;
  if (!connectingPromise) {
    connectingPromise = connectDatabase()
      .then(() => {
        configureCloudinary();
        initializeEmailService();
      })
      .catch((error) => {
        console.error('Database connection attempt failed:', (error as Error).message);
      })
      .finally(() => {
        connectingPromise = null;
      });
  }
  await connectingPromise;
};

// Database connection middleware (serverless + resilient local).
// Ensures DB is connected on each request; if it still isn't, fail fast with a
// clean 503 for API routes instead of hanging or throwing noisy 500s. /health
// intentionally stays available so infra can see the process is alive.
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    await ensureConnected();
  }

  if (mongoose.connection.readyState !== 1 && req.path.startsWith('/api')) {
    res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable. Please try again shortly.',
    });
    return;
  }

  next();
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

// Background reconnect loop: keeps trying to reach the DB without blocking the
// server. Stops once connected.
let reconnectTimer: NodeJS.Timeout | null = null;
const scheduleReconnect = () => {
  if (reconnectTimer) return;
  reconnectTimer = setInterval(async () => {
    if (mongoose.connection.readyState === 1) {
      clearInterval(reconnectTimer!);
      reconnectTimer = null;
      return;
    }
    await ensureConnected();
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Database reconnected');
      clearInterval(reconnectTimer!);
      reconnectTimer = null;
    } else {
      console.warn('⏳ Database still unreachable; will retry...');
    }
  }, 10000);
};

// Start server (only for local development).
// The server ALWAYS starts listening — even if the initial DB connection fails —
// so it returns clean 503s and keeps /health alive instead of exiting and letting
// the process manager crash-loop into nginx 502s. It reconnects in the background.
const startServer = async () => {
  try {
    await connectDatabase();
    console.log('✅ Database connected successfully');
    configureCloudinary();
    initializeEmailService();
  } catch (error) {
    console.error('⚠️  Failed to connect to the database on startup:', (error as Error).message);
    console.error('   Server will start anyway and keep retrying the DB connection in the background.');
    scheduleReconnect();
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🩺 Health check: http://localhost:${PORT}/health`);
  });
};

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
  startServer();
}

// Export app for Vercel serverless functions
// Vercel's @vercel/node automatically wraps Express apps
// We need to export the app directly
module.exports = app;

