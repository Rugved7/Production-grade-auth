const mongoose = require("mongoose");
const { useId } = require("react");

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  expiresAt: {
    type: Date,
    required: true,
  },

  isRevoked: {
    type: Boolean,
    default: false,
  },
  timestamps: true,
});

refreshTokenSchema.index({ token: 1, userId: 1 });
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });

// automatic cleanup of expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

refreshTokenSchema.statics.findValidToken = async function (token) {
  return this.findOne({
    token,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  }).populate("userId", "-password");
};

refreshTokenSchema.methods.revoke = async function () {
  this.isRevoked = true;
  return this.save();
};

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
