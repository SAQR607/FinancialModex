const { User, Competition, QualificationQuestion, Judge, Team, TeamMember } = require('../models');
const { Op } = require('sequelize');

const approveUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if we've already approved 100 users
    const approvedCount = await User.count({ where: { is_approved: true } });
    if (approvedCount >= 100 && !user.is_approved) {
      return res.status(400).json({ error: 'Maximum 100 users can be approved' });
    }

    user.is_approved = true;
    user.is_qualified = true;
    user.role = 'TEAM_LEADER';
    await user.save();

    res.json({ user: user.toJSON() });
  } catch (error) {
    next(error);
  }
};

const rejectUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.is_approved = false;
    user.is_qualified = false;
    await user.save();

    res.json({ user: user.toJSON() });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { role, is_approved, is_qualified } = req.query;
    const where = {};

    if (role) where.role = role;
    if (is_approved !== undefined) where.is_approved = is_approved === 'true';
    if (is_qualified !== undefined) where.is_qualified = is_qualified === 'true';

    const users = await User.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    res.json(users.map(u => u.toJSON()));
  } catch (error) {
    next(error);
  }
};

const createQualificationQuestion = async (req, res, next) => {
  try {
    const { competition_id } = req.params;
    const question = await QualificationQuestion.create({
      ...req.body,
      competition_id
    });
    res.status(201).json(question);
  } catch (error) {
    next(error);
  }
};

const updateQualificationQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const question = await QualificationQuestion.findByPk(id);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    await question.update(req.body);
    res.json(question);
  } catch (error) {
    next(error);
  }
};

const deleteQualificationQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const question = await QualificationQuestion.findByPk(id);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    await question.destroy();
    res.json({ message: 'Question deleted' });
  } catch (error) {
    next(error);
  }
};

const assignJudge = async (req, res, next) => {
  try {
    const { competition_id, user_id } = req.body;
    
    const [judge, created] = await Judge.findOrCreate({
      where: { competition_id, user_id },
      defaults: { competition_id, user_id }
    });

    if (!created) {
      return res.status(409).json({ error: 'Judge already assigned' });
    }

    res.status(201).json(judge);
  } catch (error) {
    next(error);
  }
};

const getAllTeams = async (req, res, next) => {
  try {
    const { competition_id } = req.query;
    const where = {};

    if (competition_id) where.competition_id = competition_id;

    const teams = await Team.findAll({
      where,
      include: [
        {
          model: User,
          as: 'leader'
        },
        {
          model: TeamMember,
          as: 'members',
          include: [
            {
              model: User,
              as: 'user'
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(teams);
  } catch (error) {
    next(error);
  }
};

const broadcastMessage = async (req, res, next) => {
  try {
    const { message_text } = req.body;
    const { Message } = require('../models');

    const message = await Message.create({
      user_id: req.user.id,
      message_text,
      is_global: true
    });

    // Emit to all connected clients via Socket.IO
    req.app.get('io').emit('global_message', {
      id: message.id,
      message_text: message.message_text,
      user: req.user.toJSON(),
      created_at: message.created_at
    });

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  approveUser,
  rejectUser,
  getAllUsers,
  createQualificationQuestion,
  updateQualificationQuestion,
  deleteQualificationQuestion,
  assignJudge,
  getAllTeams,
  broadcastMessage
};

