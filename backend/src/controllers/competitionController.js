const { Competition, Stage, Sponsor, Team, User } = require('../models');
const { Op } = require('sequelize');

const getAllCompetitions = async (req, res, next) => {
  try {
    const competitions = await Competition.findAll({
      include: [
        {
          model: Stage,
          as: 'stages',
          order: [['order', 'ASC']]
        },
        {
          model: Sponsor,
          as: 'sponsors'
        }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(competitions);
  } catch (error) {
    next(error);
  }
};

const getCompetitionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const competition = await Competition.findByPk(id, {
      include: [
        {
          model: Stage,
          as: 'stages',
          order: [['order', 'ASC']]
        },
        {
          model: Sponsor,
          as: 'sponsors'
        },
        {
          model: Team,
          as: 'teams',
          include: [
            {
              model: User,
              as: 'leader'
            }
          ]
        }
      ]
    });

    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    res.json(competition);
  } catch (error) {
    next(error);
  }
};

const createCompetition = async (req, res, next) => {
  try {
    const competition = await Competition.create({
      ...req.body,
      created_by: req.user.id
    });
    res.status(201).json(competition);
  } catch (error) {
    next(error);
  }
};

const updateCompetition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const competition = await Competition.findByPk(id);

    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    await competition.update(req.body);
    res.json(competition);
  } catch (error) {
    next(error);
  }
};

const deleteCompetition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const competition = await Competition.findByPk(id);

    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    await competition.destroy();
    res.json({ message: 'Competition deleted' });
  } catch (error) {
    next(error);
  }
};

const getActiveCompetition = async (req, res, next) => {
  try {
    const competition = await Competition.findOne({
      where: { is_active: true },
      include: [
        {
          model: Stage,
          as: 'stages',
          order: [['order', 'ASC']]
        },
        {
          model: Sponsor,
          as: 'sponsors',
          where: {
            [Op.or]: [
              { is_global: true },
              { competition_id: { [Op.col]: 'Competition.id' } }
            ]
          },
          required: false
        }
      ]
    });

    res.json(competition);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCompetitions,
  getCompetitionById,
  createCompetition,
  updateCompetition,
  deleteCompetition,
  getActiveCompetition
};

