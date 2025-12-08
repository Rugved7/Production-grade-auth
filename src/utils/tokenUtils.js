const jwt = require("jsonwebtoken");
const config = require("../config/env");
const RefershToken = require("../model/RefreshToken.model");

const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.JWT.ACCESS_TOKEN, {
    expiresIn: config.JWT.ACCESS_TOKEN_EXPIRY,
  });
};

const wgenerateRefreshToken = async (
  user,
  userAgent = null,
  ipAddress = null
) => {
  const payload = {
    userId: user._id,
    tokenType: "refresh",
  };
 
  const token = jwt.sign(payload, config.JWT.REFRESH_TOKEN, {
    expiresIn: config.JWT.REFRESH_TOKEN_EXPIRY,
  });

  await RefershToken.create({
    token,
    userId: user._id,
    expiresAt,
    userAgent,
    ipAddress,
  });
  return token;
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.JWT.ACCESS_TOKEN);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Access token expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid access token");
    }
    throw error;
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.JWT.REFRESH_TOKEN);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Access token expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid access token");
    }
    throw error;
  }
};

const revokeAllUserTokens = async (userId) => {
  await RefershToken.updateMany(
    { userId, isRevoked: false },
    { isRevoked: true }
  );
};

const revokeRefreshToken = async (token) => {
  const refreshToken = await RefershToken.findOne({ token });
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
  revokeRefreshToken,
};
