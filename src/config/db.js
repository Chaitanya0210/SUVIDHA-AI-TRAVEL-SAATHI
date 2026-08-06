// -----------------------------------------------------------------------------
// Database Configuration (src/config/db.js)
// -----------------------------------------------------------------------------
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/travel_recommendation_db', {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log(`🍃 MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Warning: ${error.message}`);
    console.warn(`💡 App running in resilient mode (In-memory seed data & fallback storage will be active).`);
    return false;
  }
};

module.exports = connectDB;
