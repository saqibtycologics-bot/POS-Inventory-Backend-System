require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./config/db');
const { info, error: logError } = require('./utils/logger');

//Start Server Function
const startServer = async () => {
  try {
    await connectDB();

    const PORT = Number(process.env.PORT) || 5000;

    app.listen(PORT, () => {
      info('Mini POS Inventory Backend server started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        baseUrl: process.env.BASE_URL || `http://localhost:${PORT}`,
      });
    });
  } catch (error) {
    logError('Server startup failed', {
      message: error.message,
      stack: error.stack,
    });

    process.exit(1);
  }
};

startServer();