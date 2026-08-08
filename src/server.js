// -----------------------------------------------------------------------------
// SUVIDHA AI TRAVEL SAATHI - Main Express Server (src/server.js)
// -----------------------------------------------------------------------------
const path = require('path');
const express = require('express');
const cors = require('cors');

// Import Centralized Config & DB
const config = require('./config/env');
const connectDB = require('./config/db');
const { seedDatabase } = require('./utils/seeder');

// Import Router Versions & Middleware
const v1Router = require('./routes/v1');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express App
const app = express();

// Connect to MongoDB & Seed if Empty
connectDB().then((connected) => {
  if (connected) {
    seedDatabase(false); // Only seeds if collection is empty
  }
});

// Middleware Configuration Pipeline
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets from public directory
app.use(express.static(path.join(__dirname, '../public')));

// -----------------------------------------------------------------------------
// API Route Mounts
// -----------------------------------------------------------------------------

// Version 1 API Routes
app.use('/api/v1', v1Router);

// Legacy API Routes (Backward Compatibility for existing frontend)
app.use('/api', v1Router);

// Health check endpoint (Available under both /api/v1/health and /api/health)
const healthHandler = (req, res) => {
  res.status(200).json({
    status: 'success',
    appName: 'SUVIDHA AI TRAVEL SAATHI',
    version: '1.0.0',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString()
  });
};

app.get('/api/v1/health', healthHandler);
app.get('/api/health', healthHandler);

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
