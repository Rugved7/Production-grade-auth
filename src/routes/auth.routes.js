

const express = require('express');
const {
  signup,
  login,
  refreshAccessToken,
  logout,
  logoutAll,
  getCurrentUser
} = require('../controllers/auth.controller');
const {
  validateSignup,
  validateLogin,
  handleValidationErrors
} = require('../middleware/validation.middleware');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.post('/signup', validateSignup, handleValidationErrors, signup);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);

// Protected routes (require authentication)
router.post('/logout-all', protect, logoutAll);
router.get('/me', protect, getCurrentUser);

module.exports = router;
