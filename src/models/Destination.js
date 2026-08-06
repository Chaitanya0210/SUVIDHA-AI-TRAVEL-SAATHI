// -----------------------------------------------------------------------------
// Destination Model (src/models/Destination.js) - Tailored for Indian Tourism
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
    default: 'India',
    trim: true
  },
  stateOrRegion: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Hill Station', 'Beach', 'Heritage', 'Spiritual', 'Nature', 'Desert', 'Island', 'Backwaters'],
    default: 'Hill Station'
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80'
  },
  budgetLevel: {
    type: String,
    enum: ['Pocket-Friendly', 'Standard', 'Royal-Luxury'],
    default: 'Standard'
  },
  estimatedCostPerDayInr: {
    type: Number,
    required: true
  },
  travelVibes: [{
    type: String,
    enum: ['Adventure', 'Nature', 'Relaxation', 'Heritage', 'Nightlife', 'Foodie', 'Spiritual', 'Honeymoon', 'Family', 'Beach', 'Himalayan Trek', 'Shopping']
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
    default: 4.8,
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
