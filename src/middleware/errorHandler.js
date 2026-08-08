// -----------------------------------------------------------------------------
// Global Error Handler Middleware (src/middleware/errorHandler.js)
// -----------------------------------------------------------------------------
const config = require('../config/env');
const { ValidationError, AuthenticationError, DatabaseError } = require('../utils/appError');

const handleCastErrorDB = (err) => {
  return new ValidationError(`Invalid ${err.path}: ${err.value}`);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/)[0] : 'field';
  return new ValidationError(`Duplicate field value: ${value}. Please use another value.`);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  return new ValidationError(`Invalid input data. ${errors.join('. ')}`);
};

const handleJWTError = () => new AuthenticationError('Invalid token. Please log in again.');
const handleJWTExpiredError = () => new AuthenticationError('Your token has expired. Please log in again.');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      code: err.errorCode || 'INTERNAL_SERVER_ERROR',
      message: err.message,
      stack: err.stack
    }
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      success: false,
      error: {
        code: err.errorCode || 'OPERATIONAL_ERROR',
        message: err.message
      }
    });
  } else {
    // Log unexpected non-operational errors
    console.error('🔥 UNEXPECTED SERVER ERROR:', err);

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong on the server.'
      }
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';

  let error = Object.assign(err);
  error.message = err.message;

  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  if (config.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};
