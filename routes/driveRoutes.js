const express = require('express');
const auth = require('../middleware/auth');
const drive = require('../controllers/driveController');

const router = express.Router();

const rawChunkParser = express.raw({
  type: ['application/octet-stream', 'application/bin'],
  limit: '30mb'
});

router.get('/items', auth, drive.listDrive);
router.get('/telegram-config', auth, drive.getTelegramConfig);
router.put('/telegram-config', auth, drive.updateTelegramConfig);

router.post('/folders', auth, drive.createFolder);
router.patch('/folders/:folderId/rename', auth, drive.renameFolder);
router.patch('/folders/:folderId/move', auth, drive.moveFolder);
router.delete('/folders/:folderId', auth, drive.deleteFolder);

router.post('/files/initiate-upload', auth, drive.initiateUpload);
router.put('/files/:fileId/chunks/:chunkIndex', auth, rawChunkParser, drive.uploadChunk);
router.post('/files/:fileId/complete-upload', auth, drive.completeUpload);
router.post('/files/:fileId/abort-upload', auth, drive.abortUpload);

router.get('/files/:fileId/download', auth, drive.downloadFile);
router.post('/files/:fileId/trash', auth, drive.trashFile);
router.post('/files/:fileId/restore', auth, drive.restoreFile);
router.delete('/files/:fileId/permanent', auth, drive.deleteFilePermanent);

router.post('/files/:fileId/share-links', auth, drive.createShareLink);

router.post('/reconstruct', auth, drive.reconstructExistingFiles);

module.exports = router;
