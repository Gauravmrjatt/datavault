const express = require('express');
const router = express.Router();
const { uploadFile, downloadFile, myFiles, shareFile, deleteFile } = require('../controllers/fileController');
const auth = require('../middleware/auth');

router.post('/upload', auth, uploadFile);
router.get('/download/:messageId', auth, downloadFile);
router.get('/my-files', auth, myFiles);
router.post('/share/:id', auth, shareFile);
router.delete('/:id', auth, deleteFile);
module.exports = router;