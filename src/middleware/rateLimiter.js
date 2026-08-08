// -----------------------------------------------------------------------------
// Rate Limiter Middleware (src/middleware/rateLimiter.js)
// -----------------------------------------------------------------------------
const rateLimit = require('express-rate-limit');

// General API rate limiter (100 requests per 15 min)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP. Please try again after 15 minutes.'
    }
  }
});

// Stricter rate limiter for Auth endpoints (15 attempts per 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_AUTH_ATTEMPTS',
      message: 'Too many authentication attempts. Please try again after 15 minutes.'
    }
  }
});

// Stricter rate limiter for AI Generation (10 generations per 15 min)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_AI_GENERATIONS',
      message: 'AI itinerary generation limit reached for your IP. Please try again after 15 minutes.'
    }
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  aiLimiter
};
