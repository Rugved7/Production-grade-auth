/**
 * Environment Configuration Module
 * Centralizes all environment variables with validation
 */

require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET'
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

module.exports = {
  // Server configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,

  // Database configuration
  MONGODB_URI: process.env.MONGODB_URI,

  // JWT configuration
  JWT: {
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
    REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d'
  },

  // Cookie configuration
  COOKIE: {
    SECURE: process.env.COOKIE_SECURE === 'true',
    SAME_SITE: process.env.COOKIE_SAME_SITE || 'strict',
    HTTP_ONLY: true,
    MAX_AGE: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  }
};
