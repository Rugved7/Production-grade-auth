
const User = require('../model/User.model');
const RefreshToken = require('../model/RefreshToken.model');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens
} = require('../utils/tokenUtils');
const { ApiError, asyncHandler } = require('../utils/errorHandler');
const config = require('../config/env');

const signup = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'Email already registered');
  }

  // Create new user (password will be hashed by pre-save middleware)
  const user = await User.create({
    email,
    password,
    name
  });

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user._id,
    email: user.email
  });

  const refreshToken = await generateRefreshToken(
    user,
    req.headers['user-agent'],
    req.ip
  );

  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: config.COOKIE.HTTP_ONLY,
    secure: config.COOKIE.SECURE, // true in production with HTTPS
    sameSite: config.COOKIE.SAME_SITE,
    maxAge: config.COOKIE.MAX_AGE
  });

  // Send response
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      },
      accessToken
    }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and explicitly include password field
  const user = await User.findOne({ email }).select('+password');

  // Check if user exists
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user._id,
    email: user.email
  });

  const refreshToken = await generateRefreshToken(
    user,
    req.headers['user-agent'],
    req.ip
  );

  // Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: config.COOKIE.HTTP_ONLY,
    secure: config.COOKIE.SECURE,
    sameSite: config.COOKIE.SAME_SITE,
    maxAge: config.COOKIE.MAX_AGE
  });

  // Send response
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      },
      accessToken
    }
  });
});


const refreshAccessToken = asyncHandler(async (req, res) => {
  // Get refresh token from cookie
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token not found');
  }

  // Verify refresh token signature
  const decoded = verifyRefreshToken(refreshToken);

  // Check if token exists in database and is valid
  const tokenDoc = await RefreshToken.findValidToken(refreshToken);
  if (!tokenDoc) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  // Generate new access token
  const newAccessToken = generateAccessToken({
    userId: decoded.userId,
    email: tokenDoc.userId.email
  });

  res.status(200).json({
    success: true,
    message: 'Access token refreshed successfully',
    data: {
      accessToken: newAccessToken
    }
  });
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    // Revoke refresh token from database
    await revokeRefreshToken(refreshToken);
  }

  // Clear refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: config.COOKIE.HTTP_ONLY,
    secure: config.COOKIE.SECURE,
    sameSite: config.COOKIE.SAME_SITE
  });

  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});


const logoutAll = asyncHandler(async (req, res) => {
  // Revoke all refresh tokens for the user
  await revokeAllUserTokens(req.user._id);

  // Clear refresh token cookie
  res.clearCookie('refreshToken', {
    httpOnly: config.COOKIE.HTTP_ONLY,
    secure: config.COOKIE.SECURE,
    sameSite: config.COOKIE.SAME_SITE
  });

  res.status(200).json({
    success: true,
    message: 'Logged out from all devices successfully'
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });
});

module.exports = {
  signup,
  login,
  refreshAccessToken,
  logout,
  logoutAll,
  getCurrentUser
};
