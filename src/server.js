// -----------------------------------------------------------------------------
// SUVIDHA AI TRAVEL SAATHI - Main Express Server (src/server.js)
// -----------------------------------------------------------------------------
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import Route Handlers
const destinationRoutes = require('./routes/destinationRoutes');
const aiPlannerRoutes = require('./routes/aiPlannerRoutes');
const authRoutes = require('./routes/authRoutes');

const { seedDestinations } = require('./controllers/destinationController');

// Initialize Express App
const app = express();

// Connect to MongoDB Database
connectDB().then((connected) => {
  if (connected) {
    seedDestinations();
  }
});

// Middleware Configuration
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Mount API Routes
app.use('/api/destinations', destinationRoutes);
app.use('/api/ai-planner', aiPlannerRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    appName: 'SUVIDHA AI TRAVEL SAATHI',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Fallback route: serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Server Initialization
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 SUVIDHA AI TRAVEL SAATHI Server Active on Port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Local Application URL: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
