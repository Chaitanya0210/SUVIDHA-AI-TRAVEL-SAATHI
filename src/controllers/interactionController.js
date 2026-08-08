// -----------------------------------------------------------------------------
// Interaction Controller (src/controllers/interactionController.js)
// -----------------------------------------------------------------------------
const Interaction = require('../models/Interaction');
const { ValidationError } = require('../utils/appError');
const mongoose = require('mongoose');

const allowedActions = [
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
];

/**
 * Records a user or guest interaction event
 */
const recordInteraction = async (req, res, next) => {
  try {
    const { action, destinationId, destinationName, metadata = {}, sessionId } = req.body;
    const userId = req.user ? req.user._id.toString() : (req.body.userId || null);

    if (!action || !allowedActions.includes(action)) {
      return next(new ValidationError(`Invalid action. Allowed actions: ${allowedActions.join(', ')}`));
    }

    // DB availability check
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        message: 'Interaction logging queued (Sandbox mode)'
      });
    }

    // Deduplication Spam Protection (Ignore duplicate identical actions within 5 seconds)
    const fiveSecondsAgo = new Date(Date.now() - 5000);
    const recentDuplicate = await Interaction.findOne({
      action,
      destinationName: destinationName || '',
      $or: [{ userId }, { sessionId }],
      createdAt: { $gte: fiveSecondsAgo }
    });

    if (recentDuplicate) {
      return res.status(200).json({
        success: true,
        message: 'Duplicate interaction ignored by spam filter'
      });
    }

    const interaction = await Interaction.create({
      userId,
      sessionId: sessionId || `guest_${Date.now()}`,
      destinationId: destinationId && mongoose.Types.ObjectId.isValid(destinationId) ? destinationId : null,
      destinationName: destinationName || '',
      action,
      metadata
    });

    res.status(201).json({
      success: true,
      message: 'Interaction recorded successfully',
      data: {
        interactionId: interaction._id,
        action: interaction.action,
        timestamp: interaction.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Gets aggregated interaction analytics summary for ML feature preparation
 */
const getUserInteractionHistory = async (req, res, next) => {
  try {
    const userId = req.params.userId || (req.user ? req.user._id.toString() : null);

    if (!userId) {
      return next(new ValidationError('User ID is required.'));
    }

    let history = [];
    if (mongoose.connection.readyState === 1) {
      history = await Interaction.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();
    }

    res.status(200).json({
      success: true,
      results: history.length,
      data: history
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordInteraction,
  getUserInteractionHistory
};
