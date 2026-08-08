// -----------------------------------------------------------------------------
// Structured Request Logger Middleware (src/middleware/logger.js)
// -----------------------------------------------------------------------------
const crypto = require('crypto');

const sanitizePayload = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = { ...obj };
  const sensitiveKeys = ['password', 'token', 'authorization', 'jwt', 'refreshToken', 'apiKey', 'secret'];

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizePayload(sanitized[key]);
    }
  }
  return sanitized;
};

const requestLogger = (req, res, next) => {
  const start = Date.now();
  req.requestId = crypto.randomUUID ? crypto.randomUUID() : `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      responseTimeMs: `${duration}ms`,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    };

    if (res.statusCode >= 400) {
      console.warn(`[HTTP WARN] ${logData.method} ${logData.url} ${logData.status} ${logData.responseTimeMs} - RequestID: ${logData.requestId}`);
    } else {
      console.log(`[HTTP INFO] ${logData.method} ${logData.url} ${logData.status} ${logData.responseTimeMs} - RequestID: ${logData.requestId}`);
    }
  });

  next();
};

module.exports = { requestLogger, sanitizePayload };
