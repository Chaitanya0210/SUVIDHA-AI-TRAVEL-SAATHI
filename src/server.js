// -----------------------------------------------------------------------------
// Industry-Standard Express.js Entry Point (server.js)
// -----------------------------------------------------------------------------

// Load environment variables from .env file into process.env
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');

// Initialize the Express Application
const app = express();

// -----------------------------------------------------------------------------
// Middleware Pipeline Configuration
// -----------------------------------------------------------------------------

// Enable Cross-Origin Resource Sharing (CORS) - permits frontend requests
app.use(cors());

// Parse incoming HTTP requests with JSON payloads (e.g., POST/PUT JSON body)
app.use(express.json());

// Parse URL-encoded data from HTML forms
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets from the 'public' folder
app.use(express.static(path.join(__dirname, '../public')));

// -----------------------------------------------------------------------------
// API Health Check & Sample Routes
// -----------------------------------------------------------------------------

// Basic health check endpoint to confirm backend server health
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Travel Recommendation API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// Fallback route: serve index.html for all client requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// -----------------------------------------------------------------------------
// Server Initialization
// -----------------------------------------------------------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
