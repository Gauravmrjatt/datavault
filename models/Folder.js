const mongoose = require('mongoose');

const FolderSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
    path: { type: String, required: true },
    isTrashed: { type: Boolean, default: false },
    trashedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

FolderSchema.index({ ownerId: 1, parentId: 1, name: 1 }, { unique: true });
FolderSchema.index({ ownerId: 1, path: 1 });
FolderSchema.index({ ownerId: 1, isTrashed: 1 });

module.exports = mongoose.model('Folder', FolderSchema);
