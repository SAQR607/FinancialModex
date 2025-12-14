const { Message, Room, TeamMember } = require('../models');
const { Op } = require('sequelize');

const getGlobalMessages = async (req, res, next) => {
  try {
    const messages = await Message.findAll({
      where: { is_global: true },
      include: [
        {
          model: require('../models').User,
          as: 'user',
          attributes: ['id', 'full_name', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 100
    });

    res.json(messages.reverse());
  } catch (error) {
    next(error);
  }
};

const getRoomMessages = async (req, res, next) => {
  try {
    const { room_id } = req.params;

    // Verify user has access to this room
    const room = await Room.findByPk(room_id, {
      include: [
        {
          model: require('../models').Team,
          as: 'team'
        }
      ]
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const teamMember = await TeamMember.findOne({
      where: { team_id: room.team_id, user_id: req.user.id }
    });

    if (!teamMember) {
      return res.status(403).json({ error: 'You do not have access to this room' });
    }

    const messages = await Message.findAll({
      where: { room_id },
      include: [
        {
          model: require('../models').User,
          as: 'user',
          attributes: ['id', 'full_name', 'email']
        }
      ],
      order: [['created_at', 'ASC']]
    });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

const createMessage = async (req, res, next) => {
  try {
    const { room_id, message_text, is_global } = req.body;

    if (is_global) {
      const message = await Message.create({
        user_id: req.user.id,
        message_text,
        is_global: true
      });

      // Emit via Socket.IO
      req.app.get('io').emit('global_message', {
        id: message.id,
        message_text: message.message_text,
        user: req.user.toJSON(),
        created_at: message.created_at
      });

      return res.status(201).json(message);
    }

    if (room_id) {
      // Verify access to room
      const room = await Room.findByPk(room_id, {
        include: [
          {
            model: require('../models').Team,
            as: 'team'
          }
        ]
      });

      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      const teamMember = await TeamMember.findOne({
        where: { team_id: room.team_id, user_id: req.user.id }
      });

      if (!teamMember) {
        return res.status(403).json({ error: 'You do not have access to this room' });
      }

      const message = await Message.create({
        room_id,
        user_id: req.user.id,
        message_text,
        is_global: false
      });

      // Emit to room via Socket.IO
      req.app.get('io').to(`room_${room_id}`).emit('room_message', {
        id: message.id,
        message_text: message.message_text,
        user: req.user.toJSON(),
        room_id,
        created_at: message.created_at
      });

      return res.status(201).json(message);
    }

    res.status(400).json({ error: 'Either room_id or is_global must be provided' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGlobalMessages,
  getRoomMessages,
  createMessage
};

