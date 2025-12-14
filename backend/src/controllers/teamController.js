const { Team, TeamMember, User, Room } = require('../models');
const { Op } = require('sequelize');

const createTeam = async (req, res, next) => {
  try {
    const { competition_id, name } = req.body;

    // Check if user already has a team
    const existingTeam = await Team.findOne({
      where: { leader_id: req.user.id, competition_id }
    });

    if (existingTeam) {
      return res.status(400).json({ error: 'You already have a team for this competition' });
    }

    // Check if user is qualified
    if (!req.user.is_qualified || !req.user.is_approved) {
      return res.status(403).json({ error: 'You must be qualified and approved to create a team' });
    }

    const team = await Team.create({
      competition_id,
      name,
      leader_id: req.user.id
    });

    // Add leader as team member
    await TeamMember.create({
      team_id: team.id,
      user_id: req.user.id
    });

    // Create team room
    await Room.create({
      team_id: team.id,
      name: `${name} Room`
    });

    res.status(201).json(team);
  } catch (error) {
    next(error);
  }
};

const joinTeam = async (req, res, next) => {
  try {
    const { invite_code } = req.body;

    const team = await Team.findOne({
      where: { invite_code },
      include: [
        {
          model: TeamMember,
          as: 'members'
        }
      ]
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.is_locked) {
      return res.status(400).json({ error: 'Team is locked' });
    }

    // Check if user is already a member
    const existingMember = await TeamMember.findOne({
      where: { team_id: team.id, user_id: req.user.id }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'You are already a member of this team' });
    }

    // Check team size (max 5)
    if (team.members.length >= 5) {
      team.is_locked = true;
      team.is_complete = true;
      await team.save();
      return res.status(400).json({ error: 'Team is full' });
    }

    // Add member
    await TeamMember.create({
      team_id: team.id,
      user_id: req.user.id
    });

    // Check if team is now complete
    const updatedTeam = await Team.findByPk(team.id, {
      include: [
        {
          model: TeamMember,
          as: 'members'
        }
      ]
    });

    if (updatedTeam.members.length >= 5) {
      updatedTeam.is_locked = true;
      updatedTeam.is_complete = true;
      await updatedTeam.save();
    }

    res.json({ message: 'Successfully joined team', team: updatedTeam });
  } catch (error) {
    next(error);
  }
};

const getMyTeam = async (req, res, next) => {
  try {
    const team = await Team.findOne({
      where: {
        [Op.or]: [
          { leader_id: req.user.id },
          { '$members.user_id$': req.user.id }
        ]
      },
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
        },
        {
          model: Room,
          as: 'room'
        }
      ]
    });

    if (!team) {
      return res.status(404).json({ error: 'No team found' });
    }

    res.json(team);
  } catch (error) {
    next(error);
  }
};

const leaveTeam = async (req, res, next) => {
  try {
    const { team_id } = req.params;

    const team = await Team.findByPk(team_id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.leader_id === req.user.id) {
      return res.status(400).json({ error: 'Team leader cannot leave. Transfer leadership first.' });
    }

    await TeamMember.destroy({
      where: { team_id, user_id: req.user.id }
    });

    // Unlock team if it was locked
    if (team.is_locked) {
      team.is_locked = false;
      team.is_complete = false;
      await team.save();
    }

    res.json({ message: 'Left team successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTeam,
  joinTeam,
  getMyTeam,
  leaveTeam
};

