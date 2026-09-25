// ─────────────────────────────────────────────────────────────
// MORGAN HTTP REQUEST LOGGING MIDDLEWARE
// ─────────────────────────────────────────────────────────────
const morgan = require('morgan');
const logger = require('../config/logger');

// Stream Morgan HTTP logs into Winston 'http' level
const stream = {
  write: (message) => logger.http(message.trim())
};

// Morgan Log Format: "GET /api/products 200 45ms"
const morganFormat = ':method :url :status :res[content-length] - :response-time ms';

const morganMiddleware = morgan(morganFormat, { stream });

module.exports = morganMiddleware;