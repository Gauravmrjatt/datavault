const mongoose = require('mongoose');

const UploadSessionSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true, unique: true },
    uploadId: { type: String, required: true, unique: true },
    totalChunks: { type: Number, required: true },
    chunkSize: { type: Number, required: true },
    receivedChunks: { type: [Number], default: [] },
    status: {
      type: String,
      enum: ['pending', 'uploading', 'completed', 'aborted', 'failed'],
      default: 'pending'
    },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

UploadSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
UploadSessionSchema.index({ ownerId: 1, status: 1 });

module.exports = mongoose.model('UploadSession', UploadSessionSchema);
