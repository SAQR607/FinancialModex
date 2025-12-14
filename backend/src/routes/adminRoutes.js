const express = require('express');
const router = express.Router();
const {
  approveUser,
  rejectUser,
  getAllUsers,
  createQualificationQuestion,
  updateQualificationQuestion,
  deleteQualificationQuestion,
  assignJudge,
  getAllTeams,
  broadcastMessage
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { body } = require('express-validator');

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/users', getAllUsers);
router.put('/users/:userId/approve', approveUser);
router.put('/users/:userId/reject', rejectUser);

router.post('/competitions/:competition_id/questions',
  [
    body('question_text').notEmpty().withMessage('Question text required'),
    body('order').isInt().withMessage('Order must be an integer')
  ],
  createQualificationQuestion
);
router.put('/questions/:id', updateQualificationQuestion);
router.delete('/questions/:id', deleteQualificationQuestion);

router.post('/judges/assign',
  [
    body('competition_id').isInt().withMessage('Competition ID required'),
    body('user_id').isInt().withMessage('User ID required')
  ],
  assignJudge
);

router.get('/teams', getAllTeams);

router.post('/broadcast',
  [
    body('message_text').notEmpty().withMessage('Message text required')
  ],
  broadcastMessage
);

module.exports = router;

