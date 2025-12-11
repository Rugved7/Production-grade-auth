/**
 * RefreshToken Model
 * Manages refresh tokens separately for better control and security
 * Allows token revocation and tracking
 */

const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    isRevoked: {
      type: Boolean,
      default: false
    },
    // Optional: Track device/IP for security monitoring
    userAgent: {
      type: String
    },
    ipAddress: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient token lookup
refreshTokenSchema.index({ token: 1, userId: 1 });
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });

// Index for automatic cleanup of expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Static method to find valid (non-revoked, non-expired) token
 * @param {string} token - Refresh token string
 * @returns {Promise<Object|null>} Token document or null
 */
refreshTokenSchema.statics.findValidToken = async function (token) {
  return this.findOne({
    token,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  }).populate('userId', '-password');
};

/**
 * Instance method to revoke token
 * @returns {Promise<Object>} Updated token document
 */
refreshTokenSchema.methods.revoke = async function () {
  this.isRevoked = true;
  return this.save();
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
