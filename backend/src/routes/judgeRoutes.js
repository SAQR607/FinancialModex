const express = require('express');
const router = express.Router();
const { getAssignedTeams, submitScore, getScores } = require('../controllers/judgeController');
const { authenticate, authorize } = require('../middleware/auth');
const { body } = require('express-validator');

router.use(authenticate);
router.use(authorize('JUDGE'));

router.get('/competitions/:competition_id/teams', getAssignedTeams);

router.post('/scores',
  [
    body('competition_id').isInt().withMessage('Competition ID required'),
    body('stage_id').isInt().withMessage('Stage ID required'),
    body('team_id').isInt().withMessage('Team ID required'),
    body('score').isFloat({ min: 0 }).withMessage('Valid score required')
  ],
  submitScore
);

router.get('/scores', getScores);

module.exports = router;

