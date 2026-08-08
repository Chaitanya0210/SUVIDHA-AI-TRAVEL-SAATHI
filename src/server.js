// -----------------------------------------------------------------------------
// SUVIDHA AI TRAVEL SAATHI - Main Express Server (src/server.js)
// -----------------------------------------------------------------------------
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import Centralized Config & DB
const config = require('./config/env');
const connectDB = require('./config/db');
const { seedDatabase } = require('./utils/seeder');

// Import Security & Logging Middlewares
const { requestLogger } = require('./middleware/logger');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

// Import Routers & Controllers
const v1Router = require('./routes/v1');
const { getHealthStatus } = require('./controllers/healthController');

// Initialize Express App
const app = express();

// Connect to MongoDB & Seed if Empty
connectDB().then((connected) => {
  if (connected) {
    seedDatabase(false); // Non-destructive seeding
  }
});

// -----------------------------------------------------------------------------
// Security & Middleware Configuration Pipeline
// -----------------------------------------------------------------------------

// Security HTTP Headers (Helmet configured to permit Leaflet/OpenStreetMap CDN scripts & tiles)
app.use(
  helmet({
    contentSecurityPolicy: false, // Disables CSP header block for Leaflet & FontAwesome external CDN scripts
    crossOriginEmbedderPolicy: false
  })
);

// Configured CORS Control
const allowedOrigins = [config.FRONTEND_URL, 'http://localhost:5000', 'http://127.0.0.1:5000'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  })
);

// Structured Request Logger
app.use(requestLogger);

// Request Payload Limits (Prevents oversized payload DoS attacks)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Global API Rate Limiter
app.use('/api', apiLimiter);

// Serve static frontend assets from public directory
app.use(express.static(path.join(__dirname, '../public')));

// -----------------------------------------------------------------------------
// API Route Mounts
// -----------------------------------------------------------------------------

// Health Check Endpoints (Available under both /api/v1/health and /api/health)
app.get('/api/v1/health', getHealthStatus);
app.get('/api/health', getHealthStatus);

// Auth Route Rate Limiter
app.use('/api/v1/auth', authLimiter);
app.use('/api/auth', authLimiter);

// Version 1 API Routes
app.use('/api/v1', v1Router);

// Legacy API Routes (Backward Compatibility for existing frontend)
app.use('/api', v1Router);

// Fallback route: serve index.html for SPA client navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// -----------------------------------------------------------------------------
// Global Error Handling Middleware (Must be defined last)
// -----------------------------------------------------------------------------
app.use(errorHandler);

// Server Initialization
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 SUVIDHA AI TRAVEL SAATHI Server Active on Port ${PORT}`);
  console.log(`🌍 Environment: ${config.NODE_ENV}`);
  console.log(`🔗 Local Application URL: http://localhost:${PORT}`);
  console.log(`🔗 API v1 Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`=======================================================`);
});
