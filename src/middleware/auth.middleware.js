
const User = require('../model/User.model');
const { verifyAccessToken } = require('../utils/tokenUtils');
const { ApiError, asyncHandler } = require('../utils/errorHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract token from "Bearer <token>"
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    throw new ApiError(401, 'Not authorized, no token provided');
  }

  try {
    // Verify token and extract payload
    const decoded = verifyAccessToken(token);

    // Fetch user from database (excluding password)
    const user = await User.findById(decoded.userId).select('-password');

    // Check if user still exists
    if (!user) {
      throw new ApiError(401, 'User no longer exists');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ApiError(403, 'User account is deactivated');
    }

    // Attach user to request object for use in route handlers
    req.user = user;
    next();
  } catch (error) {
    if (error.message === 'Access token expired') {
      throw new ApiError(401, 'Access token expired, please refresh token');
    }
    if (error.message === 'Invalid access token') {
      throw new ApiError(401, 'Invalid access token');
    }
    throw error;
  }
});

const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Silently fail for optional auth
    }
  }

  next();
});

module.exports = {
  protect,
  optionalAuth
};
