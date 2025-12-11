const User = require("../model/User.model");
const RefreshToekn = require("../model/RefreshToken.model");
const {
  generateAccessToken,
  generateRefreshToken,
  revokeAllUserTokens,
  revokeRefreshToken,
  verifyRefreshToken,
} = require("../utils/tokenUtils");
const { ApiError, asyncHandler } = require("../utils/errorHandler");
const config = require("../config/env");

// Signup Endpoint
const signup = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  const existsUser = await User.findOne({ email });
  if (existsUser) {
    throw new ApiError(409, "Email is in use");
  }

  const user = await User.create({
    email,
    password,
    name,
  });

  const accessToken = generateAccessToken({
    userId: user._id,
    email: user.email,
  });

  const refreshToken = await generateRefreshToken(
    user,
    req.headers["user-agent"],
    req.ip
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: config.COOKIE.HTTP_ONLY,
    secure: config.COOKIE.SECURE,
    sameSite: config.COOKIE.SAME_SITE,
    maxAge: config.COOKIE.MAX_AGE,
  });

  res.send(201).json({
    success: true,
    message: "User Registered Successfully",
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      accessToken,
    },
  });
});

// Login Endpoint
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid credentials entered");
  }
  if (!user.isActive) {
    throw new ApiError(403, "User's account is deactivated");
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const refreshToken = await generateRefreshToken(
    user,
    req.headers["user-agent"],
    req.ip
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: config.COOKIE.HTTP_ONLY,
    secure: config.COOKIE.SECURE,
    sameSite: config.COOKIE.SAME_SITE,
    maxAge: config.COOKIE.MAX_AGE,
  });

  res.status(200).json({
    success: true,
    message: "Login Successful",
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      accessToken,
    },
  });
});

// Refresh-AccessToken
const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh Token not found");
  }

  const decoded = verifyRefreshToken(refreshToken);

  const tokenDoc = await RefreshToken.findValidToken(refreshToken);
  if (!tokenDoc) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const newAccessToken = generateAccessToken({
    userId: decoded.userId,
    email: tokenDoc.userId.email,
  });

  res.status(200).json({
    success: true,
    message: "Access token refreshed successfully",
    data: {
      accessToken: newAccessToken,
    },
  });
});

// Logout Endpoint
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

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout user from all devices
 * @access  Protected (requires valid access token)
 */
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
