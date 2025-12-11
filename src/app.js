const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth.routes');
const { errorHandler } = require('./utils/errorHandler');
const config = require('./config/env');

const app = express();

app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: config.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : 'http://localhost:3000',
    credentials: true // Allow cookies to be sent
  })
);

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login/signup requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true // Don't count successful requests
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

// ===========================================
// Body Parsing Middleware
// ===========================================

app.use(express.json({ limit: '10kb' })); // Limit body size to 10kb
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

// 404 handler for undefined routes
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});


app.use(errorHandler);

module.exports = app;
