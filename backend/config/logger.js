
// WINSTON PRODUCTION LOGGER CONFIGURATION

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// 1. Define Log Levels & Colors
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(colors);

// 2. Custom Development Format (Colored & Readable)
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
  )
);

// 3. Custom Production Format (Structured JSON for Cloud Log Dashboards)
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// 4. Daily File Rotation Transports (Auto-deletes logs older than 14 days)
const errorFileTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../logs/error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '14d', // Keep logs for 14 days
  format: prodFormat
});

const combinedFileTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../logs/combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: prodFormat
});

// 5. Create Winston Logger Instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels,
  transports: [
    // Console output
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat
    }),
    // File outputs
    errorFileTransport,
    combinedFileTransport
  ]
});

module.exports = logger;