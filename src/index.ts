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

// Database connection middleware for serverless (Vercel)
// Ensures DB is connected on each request
app.use(async (_req, _res, next) => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDatabase();
      configureCloudinary();
      initializeEmailService();
    }
  } catch (error) {
    console.error('Database connection error:', error);
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

// Start server (only for local development)
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    console.log('✅ Database connected successfully');

    // Configure Cloudinary
    configureCloudinary();

    // Initialize email service
    initializeEmailService();

    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
  startServer();
}

// Export app for Vercel serverless functions
// Vercel's @vercel/node automatically wraps Express apps
// We need to export the app directly
module.exports = app;

