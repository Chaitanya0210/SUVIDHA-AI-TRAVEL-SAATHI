// -----------------------------------------------------------------------------
// Trip Model (src/models/Trip.js)
// -----------------------------------------------------------------------------
const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  destinationName: {
    type: String,
    required: true
  },
  country: String,
  durationDays: {
    type: Number,
    required: true
  },
  budgetLevel: String,
  travelVibe: String,
  estimatedTotalCost: Number,
  itinerary: [{
    day: Number,
    theme: String,
    morning: String,
    afternoon: String,
    evening: String,
    stay: String,
    estimatedDayCost: Number
  }],
  aiRationale: String,
  coordinates: {
    lat: Number,
    lng: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Trip', tripSchema);
