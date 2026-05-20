const path = require('path');
const winston = require('winston');
require('winston-daily-rotate-file');
const morgan = require('morgan');

/**
 * Log directory
 */
const logsDir = path.join(__dirname, '../../logs');

/**
 * Shared log format for files
 * JSON logs are easier to parse later in monitoring tools.
 */
const fileLogFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Console format for development readability
 */
const consoleLogFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaData = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaData}`;
  })
);

/**
 * Main Winston logger
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: fileLogFormat,
  defaultMeta: {
    service: 'mini-pos-backend',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    /**
     * Combined logs:
     * info, warn, error, debug depending on LOG_LEVEL
     */
    new winston.transports.DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),

    /**
     * Error-only logs
     */
    new winston.transports.DailyRotateFile({
      level: 'error',
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
});

/**
 * Console logs in non-production environments
 */
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleLogFormat,
    })
  );
}

/**
 * Morgan HTTP request logger
 * Morgan creates request log strings, Winston stores them centrally.
 */
const httpLogger = morgan('combined', {
  stream: {
    write: (message) => {
      logger.info(message.trim(), {
        type: 'http_request',
      });
    },
  },
});

/**
 * Friendly wrapper methods
 * Keeps import style clean across the project:
 * const { info, error, warn } = require('../utils/logger');
 */
const info = (message, meta = {}) => logger.info(message, meta);
const warn = (message, meta = {}) => logger.warn(message, meta);
const error = (message, meta = {}) => logger.error(message, meta);
const debug = (message, meta = {}) => logger.debug(message, meta);

module.exports = {
  logger,
  httpLogger,
  info,
  warn,
  error,
  debug,
};