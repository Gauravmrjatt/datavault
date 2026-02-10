const mongoose = require('mongoose');

const ShareLinkSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    permission: { type: String, enum: ['view', 'download'], default: 'download' },
    expiresAt: { type: Date, default: null },
    isPublic: { type: Boolean, default: false },
    revokedAt: { type: Date, default: null },
    accessCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

ShareLinkSchema.index({ token: 1 }, { unique: true });
ShareLinkSchema.index({ fileId: 1, revokedAt: 1 });

module.exports = mongoose.model('ShareLink', ShareLinkSchema);
