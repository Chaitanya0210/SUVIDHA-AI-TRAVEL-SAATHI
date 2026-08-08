// -----------------------------------------------------------------------------
// Centralized Error Classes (src/utils/appError.js)
// -----------------------------------------------------------------------------

class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Invalid request parameters') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed. Please log in.') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'You do not have permission to access this resource.') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found.') {
    super(message, 404, 'NOT_FOUND');
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database operation failed.') {
    super(message, 503, 'DATABASE_ERROR');
  }
}

class ExternalServiceError extends AppError {
  constructor(message = 'External service unavailable.') {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR');
  }
}

class AIServiceError extends AppError {
  constructor(message = 'AI Generation service encountered an error.') {
    super(message, 502, 'AI_SERVICE_ERROR');
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
  ExternalServiceError,
  AIServiceError
};
