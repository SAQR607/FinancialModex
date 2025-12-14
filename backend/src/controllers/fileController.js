const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { UploadedFile, Team, TeamMember } = require('../models');
const { Op } = require('sequelize');

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/vnd.ms-excel', 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.google-apps.spreadsheet'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and Excel files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  }
});

const uploadFile = async (req, res, next) => {
  try {
    const { team_id, room_id } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify user is team member
    const teamMember = await TeamMember.findOne({
      where: { team_id, user_id: req.user.id }
    });

    if (!teamMember) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ error: 'You are not a member of this team' });
    }

    const fileRecord = await UploadedFile.create({
      team_id,
      user_id: req.user.id,
      room_id: room_id || null,
      file_name: req.file.originalname,
      file_path: req.file.path,
      file_type: req.file.mimetype,
      file_size: req.file.size
    });

    res.status(201).json(fileRecord);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

const getTeamFiles = async (req, res, next) => {
  try {
    const { team_id } = req.params;

    // Verify user is team member
    const teamMember = await TeamMember.findOne({
      where: { team_id, user_id: req.user.id }
    });

    if (!teamMember) {
      return res.status(403).json({ error: 'You are not a member of this team' });
    }

    const files = await UploadedFile.findAll({
      where: { team_id },
      include: [
        {
          model: require('../models').User,
          as: 'uploader'
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(files);
  } catch (error) {
    next(error);
  }
};

const deleteFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const file = await UploadedFile.findByPk(id);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Only uploader or team leader can delete
    const team = await Team.findByPk(file.team_id);
    if (file.user_id !== req.user.id && team.leader_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to delete this file' });
    }

    // Delete physical file
    if (fs.existsSync(file.file_path)) {
      fs.unlinkSync(file.file_path);
    }

    await file.destroy();
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upload,
  uploadFile,
  getTeamFiles,
  deleteFile
};

