const { QualificationQuestion, QualificationAnswer, User } = require('../models');

const getQuestions = async (req, res, next) => {
  try {
    const { competition_id } = req.params;
    const questions = await QualificationQuestion.findAll({
      where: { competition_id },
      order: [['order', 'ASC']]
    });
    res.json(questions);
  } catch (error) {
    next(error);
  }
};

const submitAnswers = async (req, res, next) => {
  try {
    const { competition_id } = req.params;
    const { answers } = req.body;

    // Check if user already submitted
    const existingAnswer = await QualificationAnswer.findOne({
      where: {
        user_id: req.user.id,
        question_id: { [require('sequelize').Op.in]: answers.map(a => a.question_id) }
      },
      include: [
        {
          model: QualificationQuestion,
          as: 'question',
          where: { competition_id }
        }
      ]
    });

    if (existingAnswer) {
      return res.status(400).json({ error: 'You have already submitted answers' });
    }

    // Create all answers
    const createdAnswers = await Promise.all(
      answers.map(answer =>
        QualificationAnswer.create({
          question_id: answer.question_id,
          user_id: req.user.id,
          answer_text: answer.answer_text
        })
      )
    );

    res.status(201).json({ message: 'Answers submitted successfully', answers: createdAnswers });
  } catch (error) {
    next(error);
  }
};

const getMyAnswers = async (req, res, next) => {
  try {
    const { competition_id } = req.params;
    const answers = await QualificationAnswer.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: QualificationQuestion,
          as: 'question',
          where: { competition_id }
        }
      ]
    });
    res.json(answers);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuestions,
  submitAnswers,
  getMyAnswers
};

