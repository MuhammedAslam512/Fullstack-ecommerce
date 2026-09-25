// ─────────────────────────────────────────
// ERROR HANDLER MIDDLEWARE
// Runs when something goes wrong
// ─────────────────────────────────────────

const logger = require('../config/logger')

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - IP: ${req.ip}`);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong!',
    // Only show error stack in development
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    })
  });
};

module.exports = errorHandler;