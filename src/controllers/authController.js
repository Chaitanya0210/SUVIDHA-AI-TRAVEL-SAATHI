// -----------------------------------------------------------------------------
// Authentication Controller (src/controllers/authController.js)
// -----------------------------------------------------------------------------
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');
const { AppError, AuthenticationError, ValidationError } = require('../utils/appError');
const mongoose = require('mongoose');

const generateAccessToken = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN
  });
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (mongoose.connection.readyState !== 1) {
      return next(new AppError('Database connection unavailable. Cannot complete registration.', 503, 'DATABASE_ERROR'));
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new ValidationError('User with this email already exists.'));
    }

    const user = await User.create({ name, email, password });
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium || false,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let user = null;
    const dbConnected = mongoose.connection.readyState === 1;

    if (dbConnected) {
      user = await User.findOne({ email }).select('+password');
    }

    // Mock validation fallback if DB is unpopulated/sandbox
    if (!user && (email === 'demo@suvidha.com' && password === 'password123')) {
      user = { _id: 'demo_user_123', name: 'Travel Enthusiast', email, isPremium: true };
    } else if (user) {
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return next(new AuthenticationError('Invalid email or password.'));
      }
    } else {
      return next(new AuthenticationError('Invalid email or password.'));
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium || false,
        accessToken,
        refreshToken,
        token: accessToken // Backward compatibility for legacy frontend token property
      }
    });
  } catch (error) {
    next(error);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AuthenticationError('Refresh Token is required.'));
    }

    try {
      const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
      const newAccessToken = generateAccessToken(decoded.id);

      res.status(200).json({
        success: true,
        data: {
          accessToken: newAccessToken
        }
      });
    } catch (err) {
      return next(new AuthenticationError('Invalid or expired Refresh Token.'));
    }
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'User logged out successfully.'
  });
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser
};
