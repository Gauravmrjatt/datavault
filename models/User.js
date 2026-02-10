const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    telegramUserId: { type: String, default: null },
    telegramConfig: {
      botTokenEnc: { type: String, default: null },
      storageChatId: { type: String, default: null },
      configuredAt: { type: Date, default: null }
    },
    quotaBytes: { type: Number, default: 1024 * 1024 * 1024 * 20 },
    usedBytes: { type: Number, default: 0 }
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);
