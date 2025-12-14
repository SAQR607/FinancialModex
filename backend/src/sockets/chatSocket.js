const { Message, Room, TeamMember } = require('../models');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return next(new Error('User not found'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};

const setupChatSocket = (io) => {
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.id} connected`);

    // Join global chat
    socket.join('global');

    // Join team room if user has a team
    socket.on('join_room', async (roomId) => {
      try {
        const room = await Room.findByPk(roomId, {
          include: [
            {
              model: require('../models').Team,
              as: 'team'
            }
          ]
        });

        if (!room) {
          return socket.emit('error', { message: 'Room not found' });
        }

        const teamMember = await TeamMember.findOne({
          where: { team_id: room.team_id, user_id: socket.user.id }
        });

        if (!teamMember) {
          return socket.emit('error', { message: 'Access denied' });
        }

        socket.join(`room_${roomId}`);
        socket.emit('joined_room', { roomId });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Leave room
    socket.on('leave_room', (roomId) => {
      socket.leave(`room_${roomId}`);
      socket.emit('left_room', { roomId });
    });

    // Handle global messages
    socket.on('global_message', async (data) => {
      try {
        const message = await Message.create({
          user_id: socket.user.id,
          message_text: data.message_text,
          is_global: true
        });

        io.to('global').emit('global_message', {
          id: message.id,
          message_text: message.message_text,
          user: socket.user.toJSON(),
          created_at: message.created_at
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle room messages
    socket.on('room_message', async (data) => {
      try {
        const { room_id, message_text } = data;

        const room = await Room.findByPk(room_id, {
          include: [
            {
              model: require('../models').Team,
              as: 'team'
            }
          ]
        });

        if (!room) {
          return socket.emit('error', { message: 'Room not found' });
        }

        const teamMember = await TeamMember.findOne({
          where: { team_id: room.team_id, user_id: socket.user.id }
        });

        if (!teamMember) {
          return socket.emit('error', { message: 'Access denied' });
        }

        const message = await Message.create({
          room_id,
          user_id: socket.user.id,
          message_text,
          is_global: false
        });

        io.to(`room_${room_id}`).emit('room_message', {
          id: message.id,
          message_text: message.message_text,
          user: socket.user.toJSON(),
          room_id,
          created_at: message.created_at
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.user.id} disconnected`);
    });
  });
};

module.exports = setupChatSocket;

