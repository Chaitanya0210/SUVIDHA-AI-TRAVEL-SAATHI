// -----------------------------------------------------------------------------
// Enhanced Health & System Status Controller (src/controllers/healthController.js)
// -----------------------------------------------------------------------------
const mongoose = require('mongoose');
const config = require('../config/env');

const getHealthStatus = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const isDbReady = dbState === 1;

  res.status(isDbReady ? 200 : 503).json({
    success: isDbReady,
    status: 'UP',
    appName: 'SUVIDHA AI TRAVEL SAATHI',
    version: '1.0.0',
    environment: config.NODE_ENV,
    checks: {
      liveness: 'UP',
      readiness: isDbReady ? 'READY' : 'NOT_READY',
      database: dbStatusMap[dbState] || 'unknown',
      aiEngine: config.GEMINI_API_KEY ? 'gemini_configured' : 'fallback_engine_active'
    },
    timestamp: new Date().toISOString()
  });
};

module.exports = { getHealthStatus };
