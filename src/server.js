require('dotenv').config();

const app = require('./app');
const { connectDB, closeDB } = require('./config/db');
const { info, error: logError } = require('./utils/logger');

let server;

const SHUTDOWN_TIMEOUT_MS = 10000;

const closeHttpServer = () =>
  new Promise((resolve, reject) => {
    if (!server) {
      resolve();
      return;
    }

    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      info('HTTP server closed');
      resolve();
    });
  });

const shutdown = async (signal) => {
  info(`Received ${signal}. Shutting down gracefully...`);

  const forceExitTimer = setTimeout(() => {
    logError('Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  forceExitTimer.unref();

  try {
    await closeHttpServer();
    await closeDB();
    clearTimeout(forceExitTimer);
    process.exit(0);
  } catch (error) {
    logError('Error during graceful shutdown', {
      signal,
      message: error.message,
      stack: error.stack,
    });
    clearTimeout(forceExitTimer);
    process.exit(1);
  }
};

const registerGracefulShutdown = () => {
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
};

const startServer = async () => {
  try {
    await connectDB();

    const PORT = Number(process.env.PORT) || 5000;

    server = app.listen(PORT, () => {
      info('Mini POS Inventory Backend server started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        baseUrl: process.env.BASE_URL || `http://localhost:${PORT}`,
      });
    });

    registerGracefulShutdown();
  } catch (error) {
    logError('Server startup failed', {
      message: error.message,
      stack: error.stack,
    });

    process.exit(1);
  }
};

startServer();
