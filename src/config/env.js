// -----------------------------------------------------------------------------
// Environment Configuration Manager (src/config/env.js)
// -----------------------------------------------------------------------------
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const config = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/travel_recommendation_db',
  JWT_SECRET: process.env.JWT_SECRET || 'suvidha_ai_travel_saathi_super_secret_jwt_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'suvidha_ai_travel_saathi_refresh_secret_2026',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5000'
};

// Validate critical parameters in production
if (config.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET) {
    console.error('❌ CRITICAL SECURITY RISK: JWT_SECRET is not configured in environment!');
  }
  if (!process.env.MONGO_URI) {
    console.error('❌ CRITICAL CONFIG ERROR: MONGO_URI is not configured!');
  }
}

module.exports = config;
