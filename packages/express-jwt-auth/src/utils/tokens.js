const jwt = require('jsonwebtoken');

function generateAccessToken(payload, secret, expiresIn = '15m') {
  return jwt.sign(payload, secret, { expiresIn });
}

function generateRefreshToken(payload, secret, expiresIn = '7d') {
  return jwt.sign(payload, secret, { expiresIn });
}

function verifyToken(token, secret) {
  return jwt.verify(token, secret);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken
};
