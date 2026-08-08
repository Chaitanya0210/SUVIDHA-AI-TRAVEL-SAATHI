// -----------------------------------------------------------------------------
// Subscription Controller (src/controllers/subscriptionController.js)
// -----------------------------------------------------------------------------
const User = require('../models/User');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');

/**
 * Handles simulated UPI / Razorpay / Card payment upgrade to SUVIDHA Gold
 */
const upgradeSubscription = async (req, res, next) => {
  try {
    const { userId, plan = 'monthly', paymentMethod = 'UPI', paymentId } = req.body;

    const expiryDays = plan === 'annual' ? 365 : 30;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    const generatedPaymentId = paymentId || `PAY_BHARAT_${Date.now()}`;

    // Validate database connection
    if (mongoose.connection.readyState !== 1) {
      // If DB is offline but it's the demo client user, allow sandbox bypass
      if (userId === 'demo_user_123') {
        const mockUser = {
          _id: 'demo_user_123',
          name: 'Travel Enthusiast',
          isPremium: true,
          subscriptionPlan: plan,
          subscriptionExpiry: expiryDate,
          paymentId: generatedPaymentId
        };
        return res.status(200).json({
          status: 'success',
          message: `Successfully upgraded to SUVIDHA Gold ${plan.toUpperCase()} Membership (Sandbox)!`,
          data: mockUser
        });
      }
      return next(new AppError('Database connection error. Payment upgrade failed.', 503));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    user.isPremium = true;
    user.subscriptionPlan = plan;
    user.subscriptionExpiry = expiryDate;
    user.paymentId = generatedPaymentId;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: `Successfully upgraded to SUVIDHA Gold ${plan.toUpperCase()} Membership!`,
      data: {
        _id: user._id,
        name: user.name,
        isPremium: user.isPremium,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionExpiry: user.subscriptionExpiry,
        paymentId: user.paymentId
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active subscription status and perks
 */
const getSubscriptionStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    let isPremium = false;
    let plan = 'free';

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(userId);
      if (user) {
        isPremium = user.isPremium;
        plan = user.subscriptionPlan;
      }
    } else {
      // Offline fallback for demo sandbox user
      if (userId === 'demo_user_123') {
        isPremium = true;
        plan = 'annual';
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        isPremium,
        plan,
        perks: [
          'Direct Deep-Link Cab Booking (Ola, Uber, Rapido)',
          '1-Click Food Ordering (Swiggy, Zomato)',
          'Instant Hotel Stays (MakeMyTrip, Goibibo, OYO)',
          'Direct Bus & Train Tickets (RedBus, IRCTC)',
          'Priority AI Trip Generation & PDF Downloads'
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upgradeSubscription,
  getSubscriptionStatus
};
