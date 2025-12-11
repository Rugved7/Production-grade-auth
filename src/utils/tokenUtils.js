

const jwt = require('jsonwebtoken');
const config = require('../config/env');
const RefreshToken = require('../model/RefreshToken.model');


const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.JWT.ACCESS_SECRET, {
    expiresIn: config.JWT.ACCESS_EXPIRY
  });
};


const generateRefreshToken = async (user, userAgent = null, ipAddress = null) => {
  const payload = {
    userId: user._id,
    tokenType: 'refresh'
  };

  const token = jwt.sign(payload, config.JWT.REFRESH_SECRET, {
    expiresIn: config.JWT.REFRESH_EXPIRY
  });

  // Calculate expiry date (7 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Store refresh token in database
  await RefreshToken.create({
    token,
    userId: user._id,
    expiresAt,
    userAgent,
    ipAddress
  });

  return token;
};


const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.JWT.ACCESS_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid access token');
    }
    throw error;
  }
};


const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.JWT.REFRESH_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
};


const revokeAllUserTokens = async (userId) => {
  await RefreshToken.updateMany(
    { userId, isRevoked: false },
    { isRevoked: true }
  );
};


const revokeRefreshToken = async (token) => {
  const refreshToken = await RefreshToken.findOne({ token });
  if (refreshToken) {
    await refreshToken.revoke();
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  revokeAllUserTokens,
  revokeRefreshToken
};
