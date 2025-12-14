const express = require('express');
const router = express.Router();
const { upload, uploadFile, getTeamFiles, deleteFile } = require('../controllers/fileController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/upload', upload.single('file'), uploadFile);
router.get('/team/:team_id', getTeamFiles);
router.delete('/:id', deleteFile);

module.exports = router;

