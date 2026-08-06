// -----------------------------------------------------------------------------
// Destination Model (src/models/Destination.js)
// -----------------------------------------------------------------------------
const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Destination name is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  stateOrRegion: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['Mountain', 'Beach', 'Historic', 'City', 'Nature', 'Heritage', 'Desert', 'Island'],
    default: 'Nature'
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
  },
  budgetLevel: {
    type: String,
    enum: ['Budget', 'Mid-Range', 'Luxury'],
    default: 'Mid-Range'
  },
  estimatedCostPerDay: {
    type: Number,
    required: true
  },
  travelVibes: [{
    type: String,
    enum: ['Adventure', 'Nature', 'Relaxation', 'Heritage', 'Nightlife', 'Foodie', 'Shopping', 'Romance', 'Family', 'Beach']
  }],
  bestSeasons: [{
    type: String,
    enum: ['Spring', 'Summer', 'Autumn', 'Winter', 'Monsoon', 'All Year']
  }],
  idealDurationDays: {
    type: Number,
    default: 3
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 1,
    max: 5
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  topAttractions: [String],
  itinerary: [{
    day: Number,
    title: String,
    activities: [String],
    stayRecommendation: String,
    foodSpot: String
  }],
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Destination', destinationSchema);
