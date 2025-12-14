const express = require('express');
const router = express.Router();
const { getQuestions, submitAnswers, getMyAnswers } = require('../controllers/qualificationController');
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');

router.use(authenticate);

router.get('/competitions/:competition_id/questions', getQuestions);
router.get('/competitions/:competition_id/my-answers', getMyAnswers);

router.post('/competitions/:competition_id/answers',
  [
    body('answers').isArray().withMessage('Answers must be an array'),
    body('answers.*.question_id').isInt().withMessage('Question ID required'),
    body('answers.*.answer_text').notEmpty().withMessage('Answer text required')
  ],
  submitAnswers
);

module.exports = router;

