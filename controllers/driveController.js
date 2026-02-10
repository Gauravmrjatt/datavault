const Folder = require('../models/Folder');
const File = require('../models/File');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { buildBreadcrumbs, computeFolderPath, sanitizeName } = require('../services/folderService');
const {
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
} = require('../services/fileService');
const { getTelegramConfig, saveTelegramConfig } = require('../services/userTelegramConfigService');

exports.listDrive = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;
  const payload = await listDriveItems({
    ownerId,
    folderId: req.query.folderId || null,
    includeTrashed: String(req.query.includeTrashed || 'false') === 'true',
    q: req.query.q || '',
    type: req.query.type || '',
    from: req.query.from || null,
    to: req.query.to || null
  });

  const breadcrumbs = await buildBreadcrumbs(ownerId, req.query.folderId || null);

  return res.status(200).json({ ...payload, breadcrumbs });
});

exports.createFolder = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;
  const name = sanitizeName(req.body.name);
  const parentId = req.body.parentId || null;

  const path = await computeFolderPath(ownerId, name, parentId);
  const folder = await Folder.create({ ownerId, name, parentId, path });

  return res.status(201).json({ folder });
});

exports.renameFolder = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;
  const folder = await Folder.findOne({ _id: req.params.folderId, ownerId, isTrashed: false });
  if (!folder) throw new HttpError(404, 'Folder not found');

  folder.name = sanitizeName(req.body.name);
  folder.path = await computeFolderPath(ownerId, folder.name, folder.parentId);
  await folder.save();

  return res.status(200).json({ folder });
});

exports.moveFolder = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;
  const folder = await Folder.findOne({ _id: req.params.folderId, ownerId, isTrashed: false });
  if (!folder) throw new HttpError(404, 'Folder not found');

  const targetParentId = req.body.parentId || null;
  if (String(folder._id) === String(targetParentId)) {
    throw new HttpError(400, 'Cannot move folder into itself');
  }

  folder.parentId = targetParentId;
  folder.path = await computeFolderPath(ownerId, folder.name, targetParentId);
  await folder.save();

  return res.status(200).json({ folder });
});

exports.deleteFolder = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;
  const folder = await Folder.findOne({ _id: req.params.folderId, ownerId });
  if (!folder) throw new HttpError(404, 'Folder not found');

  const hasChildren = await Folder.exists({ ownerId, parentId: folder._id, isTrashed: false });
  const hasFiles = await File.exists({ ownerId, folderId: folder._id, isTrashed: false, deletedAt: null });
  if (hasChildren || hasFiles) {
    throw new HttpError(409, 'Folder is not empty');
  }

  await Folder.deleteOne({ _id: folder._id });
  return res.status(200).json({ success: true });
});

exports.initiateUpload = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;
  const upload = await initiateUpload({
    ownerId,
    name: req.body.name,
    size: req.body.size,
    mimeType: req.body.mimeType,
    folderId: req.body.folderId || null,
    chunkSize: req.body.chunkSize,
    checksum: req.body.checksum || null
  });

  return res.status(201).json(upload);
});

exports.uploadChunk = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;
  const fileId = req.params.fileId;
  const chunkIndex = req.params.chunkIndex;
  const uploadId = req.body.uploadId || req.query.uploadId || req.headers['x-upload-id'];

  if (!uploadId) {
    throw new HttpError(400, 'uploadId is required');
  }

  const result = await uploadFileChunk({
    ownerId,
    fileId,
    uploadId,
    chunkIndex,
    chunkBuffer: req.body
  });

  return res.status(200).json(result);
});

exports.completeUpload = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;
  const file = await completeUpload({
    ownerId,
    fileId: req.params.fileId,
    uploadId: req.body.uploadId,
    checksum: req.body.checksum || null
  });

  return res.status(200).json({ file });
});

exports.abortUpload = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;
  const result = await abortUpload({
    ownerId,
    fileId: req.params.fileId,
    uploadId: req.body.uploadId
  });

  return res.status(200).json(result);
});

exports.downloadFile = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;
  const file = await getFileForOwner(req.params.fileId, ownerId);
  const range = req.headers.range || null;
  const payload = await buildFileStreamData(file, range);

  const headers = {
    'Content-Type': file.mimeType,
    'Content-Disposition': `attachment; filename="${file.name}"`,
    'Accept-Ranges': 'bytes'
  };

  if (payload.partial) {
    headers['Content-Range'] = `bytes ${payload.start}-${payload.end}/${payload.totalSize}`;
    headers['Content-Length'] = String(payload.buffer.length);
    res.writeHead(206, headers);
  } else {
    headers['Content-Length'] = String(payload.totalSize);
    res.writeHead(200, headers);
  }

  res.end(payload.buffer);
});

exports.trashFile = asyncHandler(async (req, res) => {
  const file = await trashFile({ ownerId: req.user._id, fileId: req.params.fileId });
  return res.status(200).json({ file });
});

exports.restoreFile = asyncHandler(async (req, res) => {
  const file = await restoreFile({ ownerId: req.user._id, fileId: req.params.fileId });
  return res.status(200).json({ file });
});

exports.deleteFilePermanent = asyncHandler(async (req, res) => {
  const result = await permanentlyDeleteFile({ ownerId: req.user._id, fileId: req.params.fileId });
  return res.status(200).json(result);
});

exports.createShareLink = asyncHandler(async (req, res) => {
  const link = await createShareLink({
    ownerId: req.user._id,
    fileId: req.params.fileId,
    permission: req.body.permission || 'download',
    expiresAt: req.body.expiresAt || null,
    isPublic: req.body.isPublic !== false
  });

  return res.status(201).json({
    link: {
      token: link.token,
      url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/s/${link.token}`,
      permission: link.permission,
      expiresAt: link.expiresAt,
      isPublic: link.isPublic
    }
  });
});

exports.getSharedFile = asyncHandler(async (req, res) => {
  const { share, file } = await resolveShareToken(req.params.token);
  return res.status(200).json({
    token: share.token,
    permission: share.permission,
    file: {
      id: file._id,
      name: file.name,
      size: file.size,
      mimeType: file.mimeType,
      updatedAt: file.updatedAt
    }
  });
});

exports.downloadSharedFile = asyncHandler(async (req, res) => {
  const { file } = await resolveShareToken(req.params.token);
  const payload = await buildFileStreamData(file, req.headers.range || null);

  const headers = {
    'Content-Type': file.mimeType,
    'Content-Disposition': `attachment; filename="${file.name}"`,
    'Accept-Ranges': 'bytes'
  };

  if (req.headers.range) {
    headers['Content-Range'] = `bytes ${payload.start}-${payload.end}/${payload.totalSize}`;
    headers['Content-Length'] = String(payload.buffer.length);
    res.writeHead(206, headers);
  } else {
    headers['Content-Length'] = String(payload.totalSize);
    res.writeHead(200, headers);
  }

  res.end(payload.buffer);
});

exports.reconstructExistingFiles = asyncHandler(async (req, res) => {
  const result = await reconstructFromTelegramUpdates(req.user._id);
  return res.status(200).json(result);
});

exports.getTelegramConfig = asyncHandler(async (req, res) => {
  const config = await getTelegramConfig(req.user._id, { allowFallback: true, requireConfigured: false });
  return res.status(200).json({
    configured: config.configured,
    source: config.source,
    storageChatId: config.storageChatId,
    botTokenMasked: config.botTokenMasked,
    configuredAt: config.configuredAt
  });
});

exports.updateTelegramConfig = asyncHandler(async (req, res) => {
  const result = await saveTelegramConfig(req.user._id, {
    botToken: req.body.botToken,
    storageChatId: req.body.storageChatId
  });
  return res.status(200).json(result);
});
