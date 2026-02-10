const express = require('express');
const router = express.Router();
const {
    createFolder,
    listFolders,
    getFolder,
    renameFolder,
    deleteFolder,
    moveFolder
} = require('../controllers/folderController');
const auth = require('../middleware/auth');

router.post('/create', auth, createFolder);
router.get('/list', auth, listFolders);
router.get('/:id', auth, getFolder);
router.put('/:id/rename', auth, renameFolder);
router.delete('/:id', auth, deleteFolder);
router.put('/:id/move', auth, moveFolder);

module.exports = router;
