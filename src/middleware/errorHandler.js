// -----------------------------------------------------------------------------
// Global Error Handler Middleware (src/middleware/errorHandler.js)
// -----------------------------------------------------------------------------
const config = require('../config/env');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send clean messages to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Programming or unknown database/dependency error: don't leak details
    console.error('🔥 ERROR Details:', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong on the server'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (config.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};
