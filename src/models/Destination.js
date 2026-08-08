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
  city: {
    type: String,
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
  suitableFor: [{
    type: String,
    enum: ['Solo', 'Couple', 'Friends', 'Family', 'Senior Citizens'],
    default: ['Solo', 'Couple', 'Friends', 'Family']
  }],
  foodOptions: [{
    type: String,
    enum: ['Pure Veg', 'Non-Veg', 'Jain', 'Street Food', 'Local Dhaba'],
    default: ['Pure Veg', 'Non-Veg', 'Street Food', 'Local Dhaba']
  }],
  averageLocalTransportCostInr: {
    type: Number,
    default: 500
  },
  popularityScore: {
    type: Number,
    default: 85,
    min: 1,
    max: 100
  },
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual aliases for uniform API compatibility
destinationSchema.virtual('averageDailyCost').get(function() {
  return this.estimatedCostPerDayInr;
});

destinationSchema.virtual('idealDuration').get(function() {
  return this.idealDurationDays;
});

destinationSchema.virtual('state').get(function() {
  return this.stateOrRegion;
});

// Database Indexes for Fast Search, Filtering & Recommendation Querying
destinationSchema.index({ name: 1 });
destinationSchema.index({ category: 1 });
destinationSchema.index({ budgetLevel: 1 });
destinationSchema.index({ travelVibes: 1 });
destinationSchema.index({ suitableFor: 1 });
destinationSchema.index({ popularityScore: -1 });
destinationSchema.index({ rating: -1 });
destinationSchema.index({ name: 'text', description: 'text', stateOrRegion: 'text' });

module.exports = mongoose.model('Destination', destinationSchema);
