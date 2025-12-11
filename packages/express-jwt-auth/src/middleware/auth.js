const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

/**
 * Creates a reusable Express JWT authentication middleware.
 * 
 * @param {Object} options 
 * @param {string} options.secret - JWT secret key
 * @param {boolean} [options.required=true] - Whether token is required
 */
module.exports = function createAuthMiddleware({ secret, required = true } = {}) {
  if (!secret) {
    throw new Error("createAuthMiddleware requires a 'secret' option");
  }

  return function authMiddleware(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      if (required === false) return next(); // Allow unauthenticated access
      return next(new ApiError(401, "Authorization token missing"));
    }

    try {
      const payload = jwt.verify(token, secret);
      req.user = payload;
      next();
    } catch (err) {
      return next(new ApiError(401, "Invalid or expired token"));
    }
  };
};
