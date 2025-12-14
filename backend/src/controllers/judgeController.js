const { Judge, Team, Score, Stage, Competition } = require('../models');
const { Op } = require('sequelize');

const getAssignedTeams = async (req, res, next) => {
  try {
    const { competition_id } = req.params;

    const judge = await Judge.findOne({
      where: {
        competition_id,
        user_id: req.user.id
      }
    });

    if (!judge) {
      return res.status(404).json({ error: 'You are not assigned as a judge for this competition' });
    }

    let teams;
    if (judge.assigned_teams && judge.assigned_teams.length > 0) {
      teams = await Team.findAll({
        where: {
          id: { [Op.in]: judge.assigned_teams },
          competition_id
        },
        include: [
          {
            model: require('../models').User,
            as: 'leader'
          },
          {
            model: require('../models').TeamMember,
            as: 'members',
            include: [
              {
                model: require('../models').User,
                as: 'user'
              }
            ]
          }
        ]
      });
    } else {
      // If no specific teams assigned, get all teams
      teams = await Team.findAll({
        where: { competition_id },
        include: [
          {
            model: require('../models').User,
            as: 'leader'
          },
          {
            model: require('../models').TeamMember,
            as: 'members',
            include: [
              {
                model: require('../models').User,
                as: 'user'
              }
            ]
          }
        ]
      });
    }

    res.json(teams);
  } catch (error) {
    next(error);
  }
};

const submitScore = async (req, res, next) => {
  try {
    const { competition_id, stage_id, team_id, score, notes } = req.body;

    // Verify judge is assigned to this competition
    const judge = await Judge.findOne({
      where: {
        competition_id,
        user_id: req.user.id
      }
    });

    if (!judge) {
      return res.status(403).json({ error: 'You are not assigned as a judge for this competition' });
    }

    // Check if score already exists
    const [scoreRecord, created] = await Score.findOrCreate({
      where: {
        stage_id,
        team_id,
        judge_id: req.user.id
      },
      defaults: {
        competition_id,
        stage_id,
        team_id,
        judge_id: req.user.id,
        score: parseFloat(score),
        notes
      }
    });

    if (!created) {
      scoreRecord.score = parseFloat(score);
      scoreRecord.notes = notes;
      await scoreRecord.save();
    }

    res.json(scoreRecord);
  } catch (error) {
    next(error);
  }
};

const getScores = async (req, res, next) => {
  try {
    const { competition_id, stage_id } = req.query;
    const where = { judge_id: req.user.id };

    if (competition_id) where.competition_id = competition_id;
    if (stage_id) where.stage_id = stage_id;

    const scores = await Score.findAll({
      where,
      include: [
        {
          model: Team,
          as: 'team'
        },
        {
          model: Stage,
          as: 'stage'
        }
      ]
    });

    res.json(scores);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssignedTeams,
  submitScore,
  getScores
};

