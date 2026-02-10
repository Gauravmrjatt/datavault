const express = require('express');
const drive = require('../controllers/driveController');

const router = express.Router();

router.get('/:token', drive.getSharedFile);
router.get('/:token/download', drive.downloadSharedFile);

module.exports = router;
