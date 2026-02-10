const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const mime = require('mime-types');
const mongoose = require('mongoose');
const File = require('../models/File');
const Folder = require('../models/Folder');
const UploadSession = require('../models/UploadSession');
const ShareLink = require('../models/ShareLink');
const User = require('../models/User');
const { sha256FromString } = require('../utils/hash');
const HttpError = require('../utils/httpError');
const { decryptText, encryptText } = require('../utils/crypto');
const { getTelegramConfig } = require('./userTelegramConfigService');
const {
  uploadChunk,
  getChunkBuffer,
  deleteChunkMessage,
  fetchRecentTelegramStorageUpdates
} = require('./telegramStorageService');

const DEFAULT_CHUNK_SIZE = 19 * 1024 * 1024;
const UPLOAD_TMP_ROOT = path.join(process.cwd(), 'tmp', 'uploads');

function ensureObjectId(id) {
  if (!id) return null;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(400, 'Invalid object id');
  }
  return id;
}

async function assertFolderOwnership(ownerId, folderId) {
  if (!folderId) return null;
  const folder = await Folder.findOne({ _id: folderId, ownerId, isTrashed: false });
  if (!folder) {
    throw new HttpError(404, 'Folder not found');
  }
  return folder;
}

async function ensureQuota(ownerId, bytesToAdd) {
  const user = await User.findById(ownerId);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }
  if (user.usedBytes + bytesToAdd > user.quotaBytes) {
    throw new HttpError(413, 'Storage quota exceeded');
  }
  return user;
}

function normalizeExtension(name) {
  const ext = path.extname(name || '');
  return ext.startsWith('.') ? ext.slice(1).toLowerCase() : ext.toLowerCase();
}

function getFileTelegramAccess(file) {
  if (!file?.telegramStorage?.botTokenEnc || !file?.telegramStorage?.storageChatId) {
    return null;
  }

  return {
    botToken: decryptText(file.telegramStorage.botTokenEnc),
    storageChatId: file.telegramStorage.storageChatId
  };
}

async function resolveFileTelegramAccess(file, ownerId) {
  const fileAccess = getFileTelegramAccess(file);
  if (fileAccess) return fileAccess;
  return getTelegramConfig(ownerId, { allowFallback: true, requireConfigured: true });
}

async function initiateUpload({ ownerId, name, size, mimeType, folderId, chunkSize = DEFAULT_CHUNK_SIZE, checksum }) {
  const safeName = String(name || '').trim();
  if (!safeName) throw new HttpError(400, 'File name is required');
  const parsedSize = Number(size || 0);
  if (!Number.isFinite(parsedSize) || parsedSize <= 0) {
    throw new HttpError(400, 'File size must be a positive number');
  }

  await assertFolderOwnership(ownerId, ensureObjectId(folderId));
  await ensureQuota(ownerId, parsedSize);

  const telegramConfig = await getTelegramConfig(ownerId, { allowFallback: true, requireConfigured: true });

  const computedChunkSize = Math.max(1024 * 1024, Number(chunkSize) || DEFAULT_CHUNK_SIZE);
  const totalChunks = Math.ceil(parsedSize / computedChunkSize);
  const uploadId = uuidv4();

  const file = await File.create({
    ownerId,
    folderId: folderId || null,
    name: safeName,
    extension: normalizeExtension(safeName),
    mimeType: mimeType || mime.lookup(safeName) || 'application/octet-stream',
    size: parsedSize,
    checksum: checksum || sha256FromString(`${ownerId}:${safeName}:${parsedSize}:${Date.now()}`),
    chunkSize: computedChunkSize,
    chunksCount: totalChunks,
    telegramStorage: {
      botTokenEnc: encryptText(telegramConfig.botToken),
      storageChatId: telegramConfig.storageChatId
    },
    status: 'uploading'
  });

  await UploadSession.create({
    ownerId,
    fileId: file._id,
    uploadId,
    totalChunks,
    chunkSize: computedChunkSize,
    status: 'pending',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 6)
  });

  return {
    fileId: file._id,
    uploadId,
    chunkSize: computedChunkSize,
    totalChunks
  };
}

async function uploadFileChunk({ ownerId, fileId, uploadId, chunkIndex, chunkBuffer }) {
  const parsedChunkIndex = Number(chunkIndex);
  if (!Number.isInteger(parsedChunkIndex) || parsedChunkIndex < 0) {
    throw new HttpError(400, 'Invalid chunk index');
  }

  if (!chunkBuffer || !Buffer.isBuffer(chunkBuffer) || chunkBuffer.length === 0) {
    throw new HttpError(400, 'Chunk data is required');
  }

  const file = await File.findOne({ _id: fileId, ownerId, status: { $in: ['uploading', 'failed'] } });
  if (!file) {
    throw new HttpError(404, 'Upload file not found');
  }

  const session = await UploadSession.findOne({ fileId, ownerId, uploadId, status: { $in: ['pending', 'uploading'] } });
  if (!session) {
    throw new HttpError(404, 'Upload session not found or expired');
  }

  if (parsedChunkIndex >= session.totalChunks) {
    throw new HttpError(400, 'Chunk index exceeds total chunks');
  }

  if (session.receivedChunks.includes(parsedChunkIndex)) {
    return { duplicated: true, chunkIndex: parsedChunkIndex };
  }

  const telegramAccess = await resolveFileTelegramAccess(file, ownerId);

  const uploadDir = path.join(UPLOAD_TMP_ROOT, uploadId);
  await fs.ensureDir(uploadDir);
  const chunkPath = path.join(uploadDir, `${parsedChunkIndex}.part`);
  await fs.writeFile(chunkPath, chunkBuffer);

  const ref = await uploadChunk({
    chunkPath,
    chunkIndex: parsedChunkIndex,
    fileId: String(file._id),
    originalName: file.name,
    botToken: telegramAccess.botToken,
    chatId: telegramAccess.storageChatId
  });

  session.status = 'uploading';
  session.receivedChunks.push(parsedChunkIndex);
  await session.save();

  file.telegramRefs.push(ref);
  await file.save();

  await fs.remove(chunkPath);

  return {
    duplicated: false,
    chunkIndex: parsedChunkIndex,
    uploadedChunks: session.receivedChunks.length,
    totalChunks: session.totalChunks
  };
}

async function completeUpload({ ownerId, fileId, uploadId, checksum }) {
  const file = await File.findOne({ _id: fileId, ownerId, status: { $in: ['uploading', 'failed'] } });
  if (!file) throw new HttpError(404, 'File not found');

  const session = await UploadSession.findOne({ fileId, ownerId, uploadId, status: { $in: ['pending', 'uploading'] } });
  if (!session) throw new HttpError(404, 'Upload session not found');

  if (session.receivedChunks.length !== session.totalChunks) {
    throw new HttpError(409, 'Upload incomplete', {
      uploadedChunks: session.receivedChunks.length,
      totalChunks: session.totalChunks
    });
  }

  file.telegramRefs.sort((a, b) => a.chunkIndex - b.chunkIndex);
  file.status = 'active';
  file.checksum = checksum || file.checksum;
  await file.save();

  session.status = 'completed';
  await session.save();

  await User.updateOne({ _id: ownerId }, { $inc: { usedBytes: file.size } });
  await fs.remove(path.join(UPLOAD_TMP_ROOT, uploadId));

  return file;
}

async function abortUpload({ ownerId, fileId, uploadId }) {
  const file = await File.findOne({ _id: fileId, ownerId });
  const session = await UploadSession.findOne({ ownerId, fileId, uploadId });

  if (session) {
    session.status = 'aborted';
    await session.save();
  }

  if (file) {
    const telegramAccess = await resolveFileTelegramAccess(file, ownerId);
    for (const ref of file.telegramRefs) {
      await deleteChunkMessage(ref.chatId, ref.messageId, telegramAccess.botToken);
    }
    await File.deleteOne({ _id: file._id });
  }

  await fs.remove(path.join(UPLOAD_TMP_ROOT, uploadId));
  return { success: true };
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

async function listDriveItems({ ownerId, folderId = null, includeTrashed = false, q = '', type = '', from = null, to = null }) {
  const fileQuery = {
    ownerId,
    folderId: folderId || null,
    deletedAt: null
  };

  const folderQuery = {
    ownerId,
    parentId: folderId || null
  };

  if (!includeTrashed) {
    fileQuery.isTrashed = false;
    folderQuery.isTrashed = false;
  }

  if (q) {
    fileQuery.name = { $regex: q, $options: 'i' };
    folderQuery.name = { $regex: q, $options: 'i' };
  }

  if (type) {
    fileQuery.mimeType = { $regex: type, $options: 'i' };
  }

  const fromDate = parseDate(from);
  const toDate = parseDate(to);
  if (fromDate || toDate) {
    fileQuery.updatedAt = {};
    if (fromDate) fileQuery.updatedAt.$gte = fromDate;
    if (toDate) fileQuery.updatedAt.$lte = toDate;
  }

  const [files, folders, stats] = await Promise.all([
    File.find(fileQuery).sort({ updatedAt: -1 }).lean(),
    Folder.find(folderQuery).sort({ name: 1 }).lean(),
    File.aggregate([
      { $match: { ownerId: new mongoose.Types.ObjectId(ownerId), isTrashed: false, deletedAt: null, status: 'active' } },
      { $group: { _id: null, used: { $sum: '$size' }, files: { $sum: 1 } } }
    ])
  ]);

  return {
    folders,
    files,
    stats: {
      usedBytes: stats[0]?.used || 0,
      totalFiles: stats[0]?.files || 0
    }
  };
}

async function getFileForOwner(fileId, ownerId, includeTrashed = false) {
  const query = { _id: ensureObjectId(fileId), ownerId, deletedAt: null };
  if (!includeTrashed) query.isTrashed = false;
  const file = await File.findOne(query);
  if (!file) throw new HttpError(404, 'File not found');
  return file;
}

async function buildFileStreamData(file, rangeHeader = null) {
  const chunks = file.telegramRefs.sort((a, b) => a.chunkIndex - b.chunkIndex);
  if (chunks.length === 0) {
    throw new HttpError(409, 'File has no telegram chunks');
  }

  const telegramAccess = getFileTelegramAccess(file);
  if (!telegramAccess?.botToken) {
    throw new HttpError(400, 'File does not have Telegram access metadata');
  }

  let start = 0;
  let end = file.size - 1;

  if (rangeHeader?.startsWith('bytes=')) {
    const [rawStart, rawEnd] = rangeHeader.replace('bytes=', '').split('-');
    start = rawStart ? Number(rawStart) : 0;
    end = rawEnd ? Number(rawEnd) : end;
    if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start < 0 || end >= file.size) {
      throw new HttpError(416, 'Invalid range header');
    }
  }

  const buffers = [];
  let cursor = 0;
  for (const ref of chunks) {
    const chunkStart = cursor;
    const chunkEnd = cursor + ref.size - 1;
    cursor = chunkEnd + 1;

    if (chunkEnd < start || chunkStart > end) continue;

    const chunkBuffer = await getChunkBuffer(ref.telegramFileId, telegramAccess.botToken);
    const sliceStart = Math.max(0, start - chunkStart);
    const sliceEnd = Math.min(chunkBuffer.length, end - chunkStart + 1);
    buffers.push(chunkBuffer.subarray(sliceStart, sliceEnd));
  }

  return {
    buffer: Buffer.concat(buffers),
    start,
    end,
    totalSize: file.size,
    partial: Boolean(rangeHeader)
  };
}

async function trashFile({ ownerId, fileId }) {
  const file = await getFileForOwner(fileId, ownerId, true);
  if (file.isTrashed) return file;
  file.isTrashed = true;
  file.status = 'trashed';
  file.trashedAt = new Date();
  await file.save();
  return file;
}

async function restoreFile({ ownerId, fileId }) {
  const file = await getFileForOwner(fileId, ownerId, true);
  if (!file.isTrashed) return file;
  file.isTrashed = false;
  file.status = 'active';
  file.trashedAt = null;
  await file.save();
  return file;
}

async function permanentlyDeleteFile({ ownerId, fileId }) {
  const file = await getFileForOwner(fileId, ownerId, true);
  const telegramAccess = await resolveFileTelegramAccess(file, ownerId);

  for (const ref of file.telegramRefs) {
    await deleteChunkMessage(ref.chatId, ref.messageId, telegramAccess.botToken);
  }

  await File.updateOne(
    { _id: file._id },
    {
      $set: {
        deletedAt: new Date(),
        telegramRefs: [],
        isTrashed: true,
        status: 'failed'
      }
    }
  );

  await User.updateOne({ _id: ownerId }, { $inc: { usedBytes: -Math.max(file.size, 0) } });
  await ShareLink.updateMany({ fileId: file._id, revokedAt: null }, { $set: { revokedAt: new Date() } });

  return { success: true };
}

async function createShareLink({ ownerId, fileId, permission = 'download', expiresAt = null, isPublic = true }) {
  await getFileForOwner(fileId, ownerId);
  const token = uuidv4().replace(/-/g, '');

  const shareLink = await ShareLink.create({
    token,
    ownerId,
    fileId,
    permission,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    isPublic
  });

  return shareLink;
}

async function resolveShareToken(token) {
  const share = await ShareLink.findOne({ token, revokedAt: null });
  if (!share) throw new HttpError(404, 'Share link not found');
  if (share.expiresAt && share.expiresAt.getTime() < Date.now()) {
    throw new HttpError(410, 'Share link expired');
  }
  const file = await File.findOne({ _id: share.fileId, deletedAt: null, isTrashed: false });
  if (!file) throw new HttpError(404, 'Shared file no longer exists');

  await ShareLink.updateOne({ _id: share._id }, { $inc: { accessCount: 1 } });
  return { share, file };
}

async function reconstructFromTelegramUpdates(ownerId) {
  const telegramConfig = await getTelegramConfig(ownerId, { allowFallback: true, requireConfigured: true });
  const updates = await fetchRecentTelegramStorageUpdates(1000, telegramConfig.botToken);
  const grouped = new Map();

  for (const update of updates) {
    const msg = update.channel_post || update.message;
    const caption = msg?.caption;
    const doc = msg?.document;
    if (!caption || !doc) continue;

    if (telegramConfig.storageChatId && String(msg.chat?.id || msg.chat?.username || '') !== String(telegramConfig.storageChatId)) {
      const username = msg.chat?.username ? `@${msg.chat.username}` : null;
      if (username !== String(telegramConfig.storageChatId)) {
        continue;
      }
    }

    let payload;
    try {
      payload = JSON.parse(caption);
    } catch (_err) {
      continue;
    }

    if (!payload?.dv || !payload?.fileId || typeof payload.chunkIndex !== 'number') continue;

    if (!grouped.has(payload.fileId)) grouped.set(payload.fileId, []);
    grouped.get(payload.fileId).push({
      chunkIndex: payload.chunkIndex,
      messageId: msg.message_id,
      chatId: String(msg.chat?.id || telegramConfig.storageChatId || ''),
      telegramFileId: doc.file_id,
      telegramFileUniqueId: doc.file_unique_id,
      size: doc.file_size || 0,
      checksum: payload.checksum || sha256FromString(doc.file_unique_id)
    });
  }

  let restored = 0;
  for (const [fileId, refs] of grouped.entries()) {
    if (!mongoose.Types.ObjectId.isValid(fileId)) continue;
    const file = await File.findOne({ _id: fileId, ownerId });
    if (!file) continue;
    if (file.telegramRefs?.length) continue;

    refs.sort((a, b) => a.chunkIndex - b.chunkIndex);
    file.telegramRefs = refs;
    file.telegramStorage = {
      botTokenEnc: encryptText(telegramConfig.botToken),
      storageChatId: telegramConfig.storageChatId
    };
    file.status = 'active';
    file.isTrashed = false;
    file.trashedAt = null;
    await file.save();
    restored += 1;
  }

  return { scannedUpdates: updates.length, restoredFiles: restored };
}

module.exports = {
  initiateUpload,
  uploadFileChunk,
  completeUpload,
  abortUpload,
  listDriveItems,
  getFileForOwner,
  buildFileStreamData,
  trashFile,
  restoreFile,
  permanentlyDeleteFile,
  createShareLink,
  resolveShareToken,
  reconstructFromTelegramUpdates
};
