const express = require('express');
const router = express.Router();
const { createTeam, joinTeam, getMyTeam, leaveTeam } = require('../controllers/teamController');
const { authenticate, requireQualified } = require('../middleware/auth');
const { body } = require('express-validator');

router.use(authenticate);

router.get('/my-team', getMyTeam);

router.post('/create',
  requireQualified,
  [
    body('competition_id').isInt().withMessage('Competition ID required'),
    body('name').notEmpty().withMessage('Team name required')
  ],
  createTeam
);

router.post('/join',
  requireQualified,
  [
    body('invite_code').notEmpty().withMessage('Invite code required')
  ],
  joinTeam
);

router.delete('/:team_id/leave', leaveTeam);

module.exports = router;

