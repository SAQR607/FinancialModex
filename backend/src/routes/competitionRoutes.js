const express = require('express');
const router = express.Router();
const {
  getAllCompetitions,
  getCompetitionById,
  createCompetition,
  updateCompetition,
  deleteCompetition,
  getActiveCompetition
} = require('../controllers/competitionController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/active', getActiveCompetition);
router.get('/', getAllCompetitions);
router.get('/:id', getCompetitionById);

router.post('/', authenticate, authorize('ADMIN'), createCompetition);
router.put('/:id', authenticate, authorize('ADMIN'), updateCompetition);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteCompetition);

module.exports = router;

