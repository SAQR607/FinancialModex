const express = require('express');
const router = express.Router();
const { getGlobalMessages, getRoomMessages, createMessage } = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');

router.use(authenticate);

router.get('/global', getGlobalMessages);
router.get('/room/:room_id', getRoomMessages);

router.post('/',
  [
    body('message_text').notEmpty().withMessage('Message text required')
  ],
  createMessage
);

module.exports = router;

