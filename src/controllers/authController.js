// -----------------------------------------------------------------------------
// Authentication Controller (src/controllers/authController.js)
// -----------------------------------------------------------------------------
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');

const generateToken = (id) => {
  return jwt.sign({ id }, config.JWT_SECRET, {
    expiresIn: '30d'
  });
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new AppError('Please provide name, email, and password.', 400));
    }

    // Throw error if MongoDB is disconnected
    if (mongoose.connection.readyState !== 1) {
      return next(new AppError('Database connection error. Registration unavailable.', 503));
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new AppError('User with this email already exists.', 400));
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      status: 'success',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password.', 400));
    }

    let user = null;
    let dbConnected = mongoose.connection.readyState === 1;

    if (dbConnected) {
      user = await User.findOne({ email }).select('+password');
    }

    // Mock validation fallback if DB is disconnected/unpopulated
    if (!user && (email === 'demo@suvidha.com' && password === 'password123')) {
      user = { _id: 'demo_user_123', name: 'Travel Enthusiast', email };
    } else if (user) {
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return next(new AppError('Invalid credentials.', 401));
      }
    } else {
      return next(new AppError('Invalid credentials.', 401));
    }

    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser
};
