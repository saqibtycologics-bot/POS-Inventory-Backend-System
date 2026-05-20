const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');

//Import Routes
const authRoutes = require('./routes/auth.routes');
const storeRoutes = require('./routes/store.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');
const variantRoutes = require('./routes/variant.routes');
const stockRoutes = require('./routes/stock.routes');
const saleRoutes = require('./routes/sale.routes');
const reportRoutes = require('./routes/report.routes');

const { mongoose } = require('./config/db');
const { httpLogger } = require('./utils/logger');

const {
  generalRateLimit,
} = require('./middlewares/rateLimit.middleware');

const {
  notFoundHandler,
  errorHandler,
} = require('./middlewares/error.middleware');

const app = express();

//Proxy Configuration for detecting ip addresses for cors & rate limiters
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(helmet());

//Cors Middleware use
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : ['http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      /**
       * Allow requests with no origin:
       * - Postman
       * - Thunder Client
       * - server-to-server requests
       */
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(
  express.json({
    limit: '10mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  })
);

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(compression());

/**
 * Health endpoint
 * Useful for:
 * - development testing
 * - deployment monitoring
 * - load balancers
 * - uptime checks
 */
app.get('/health', (req, res) => {
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return res.status(200).json({
    success: true,
    message: 'Mini POS Inventory Backend is healthy.',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStateMap[mongoose.connection.readyState] || 'unknown',
      host: mongoose.connection.host || 'unknown',
      database: mongoose.connection.name || 'unknown',
    },
  });
});

/**
 * HTTP access logging using Morgan piped into Winston.
 */
app.use(httpLogger);
app.use(generalRateLimit);

//Api's Routes
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api', variantRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/reports', reportRoutes);

//Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;