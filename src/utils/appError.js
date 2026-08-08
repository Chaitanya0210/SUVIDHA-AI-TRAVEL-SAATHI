// -----------------------------------------------------------------------------
// AppError Class (src/utils/appError.js)
// -----------------------------------------------------------------------------

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode || 500;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Flag for distinguished operational errors

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
