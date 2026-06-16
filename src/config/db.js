const mongoose = require('mongoose');
const { info, warn, error: logError } = require('../utils/logger');

/**
 * Connect to MongoDB database
 * Called once during application startup.
 */
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is required');
    }

    const databaseName =
      process.env.MONGO_URI.split('/').pop()?.split('?')[0] || 'unknown';

    info('Connecting to MongoDB', {
      environment: process.env.NODE_ENV || 'development',
      database: databaseName,
      connectionType: process.env.MONGO_URI.includes('localhost')
        ? 'local'
        : 'remote',
    });

    const connectionOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      retryWrites: true,
      retryReads: true,
      w: 'majority',
      readPreference: 'primary',
    };

    await mongoose.connect(process.env.MONGO_URI, connectionOptions);

    info('MongoDB connected successfully', {
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      database: mongoose.connection.name,
    });

    registerMongoConnectionEvents();
  } catch (error) {
    logError('MongoDB connection failed', {
      message: error.message,
      stack: error.stack,
    });

    throw error;
  }
};

/**
 * Register MongoDB connection lifecycle event listeners.
 */
const registerMongoConnectionEvents = () => {
  mongoose.connection.on('error', (error) => {
    logError('MongoDB runtime connection error', {
      message: error.message,
      stack: error.stack,
    });
  });

  mongoose.connection.on('disconnected', () => {
    warn('MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    info('MongoDB reconnected');
  });

  mongoose.connection.on('close', () => {
    info('MongoDB connection closed');
  });
};

/**
 * Close MongoDB connection gracefully.
 */
const closeDB = async () => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.connection.close();
  info('MongoDB connection closed gracefully');
};

module.exports = {
  connectDB,
  closeDB,
  mongoose,
};