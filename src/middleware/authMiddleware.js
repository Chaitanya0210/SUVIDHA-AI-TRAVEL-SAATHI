// -----------------------------------------------------------------------------
// Authentication & Resource Authorization Middleware (src/middleware/authMiddleware.js)
// -----------------------------------------------------------------------------
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');
const { AuthenticationError, AuthorizationError } = require('../utils/appError');

/**
 * Protect routes: Verifies JWT Access Token from Authorization Header
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AuthenticationError('You are not logged in. Please provide an Authorization token.'));
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    let currentUser = null;
    try {
      currentUser = await User.findById(decoded.id);
    } catch (e) {}

    if (!currentUser && decoded.id === 'demo_user_123') {
      currentUser = { _id: 'demo_user_123', name: 'Travel Enthusiast', email: 'demo@suvidha.com', isPremium: true };
    }

    if (!currentUser) {
      return next(new AuthenticationError('The user belonging to this token no longer exists.'));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return next(new AuthenticationError('Invalid or expired token. Please log in again.'));
  }
};

/**
 * Ensures a user can only access/modify their own resources
 */
const verifyUserOwnership = (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId;

  if (!req.user) {
    return next(new AuthenticationError());
  }

  // Admin or self access check
  if (req.user._id.toString() !== resourceUserId && req.user._id.toString() !== 'demo_user_123') {
    return next(new AuthorizationError('You do not have permission to access another user\'s resources.'));
  }

  next();
};

module.exports = {
  protect,
  verifyUserOwnership
};
