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
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || ''
};

// Validate critical parameters
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ WARNING: JWT_SECRET environment variable is missing. Using default fallback key.');
}

if (!process.env.MONGO_URI) {
  console.warn('⚠️ WARNING: MONGO_URI environment variable is missing. Using default local fallback.');
}

module.exports = config;
