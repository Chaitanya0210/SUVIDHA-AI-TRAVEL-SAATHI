// -----------------------------------------------------------------------------
// Interaction Model (src/models/Interaction.js) - User Behavior Tracking & ML Readiness
// -----------------------------------------------------------------------------
const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    index: true,
    default: null
  },
  sessionId: {
    type: String,
    index: true,
    default: null
  },
  destinationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    default: null
  },
  destinationName: {
    type: String,
    trim: true,
    default: ''
  },
  action: {
    type: String,
    required: [true, 'Interaction action is required'],
    enum: [
      'destination_view',
      'destination_click',
      'destination_search',
      'wishlist_add',
      'wishlist_remove',
      'trip_generated',
      'trip_saved',
      'trip_completed',
      'activity_selected',
      'activity_removed',
      'destination_rating'
    ]
  },
  metadata: {
    category: String,
    vibe: String,
    vibes: [String],
    budgetLevel: String,
    searchQuery: String,
    durationDays: Number,
    groupType: String
  }
}, {
  timestamps: true
});

// Database Indexes for Fast User Profile Aggregation & ML Feature Vector Queries
interactionSchema.index({ userId: 1, createdAt: -1 });
interactionSchema.index({ sessionId: 1, createdAt: -1 });
interactionSchema.index({ destinationId: 1, action: 1 });
interactionSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('Interaction', interactionSchema);
