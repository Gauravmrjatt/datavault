const mongoose = require('mongoose');

const TelegramChunkRefSchema = new mongoose.Schema(
  {
    chunkIndex: { type: Number, required: true },
    messageId: { type: Number, required: true },
    chatId: { type: String, required: true },
    telegramFileId: { type: String, required: true },
    telegramFileUniqueId: { type: String, required: true },
    size: { type: Number, required: true },
    checksum: { type: String, required: true }
  },
  { _id: false }
);

const FileSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
    name: { type: String, required: true, trim: true },
    extension: { type: String, default: '' },
    mimeType: { type: String, default: 'application/octet-stream' },
    size: { type: Number, required: true },
    checksum: { type: String, required: true },
    chunkSize: { type: Number, required: true },
    chunksCount: { type: Number, required: true },
    telegramStorage: {
      botTokenEnc: { type: String, default: null },
      storageChatId: { type: String, default: null }
    },
    telegramRefs: { type: [TelegramChunkRefSchema], default: [] },
    status: {
      type: String,
      enum: ['uploading', 'active', 'trashed', 'failed'],
      default: 'uploading'
    },
    isTrashed: { type: Boolean, default: false },
    trashedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
    restoreToken: { type: String, default: null }
  },
  { timestamps: true }
);

FileSchema.index({ ownerId: 1, folderId: 1, name: 1 });
FileSchema.index({ ownerId: 1, isTrashed: 1 });
FileSchema.index({ ownerId: 1, name: 'text' });

module.exports = mongoose.model('File', FileSchema);
