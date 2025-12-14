const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Room, TeamMember } = require('../models');

const authenticateWebRTC = async (socket, next) => {
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

const setupWebRTC = (io) => {
  const webrtcNamespace = io.of('/webrtc');
  
  webrtcNamespace.use(authenticateWebRTC);

  webrtcNamespace.on('connection', (socket) => {
    console.log(`WebRTC: User ${socket.user.id} connected`);

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

        socket.join(`webrtc_room_${roomId}`);
        socket.to(`webrtc_room_${roomId}`).emit('user_joined', {
          userId: socket.user.id,
          userName: socket.user.full_name
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('offer', (data) => {
      socket.to(`webrtc_room_${data.roomId}`).emit('offer', {
        offer: data.offer,
        from: socket.user.id
      });
    });

    socket.on('answer', (data) => {
      socket.to(`webrtc_room_${data.roomId}`).emit('answer', {
        answer: data.answer,
        from: socket.user.id
      });
    });

    socket.on('ice-candidate', (data) => {
      socket.to(`webrtc_room_${data.roomId}`).emit('ice-candidate', {
        candidate: data.candidate,
        from: socket.user.id
      });
    });

    socket.on('leave_room', (roomId) => {
      socket.to(`webrtc_room_${roomId}`).emit('user_left', {
        userId: socket.user.id
      });
      socket.leave(`webrtc_room_${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log(`WebRTC: User ${socket.user.id} disconnected`);
    });
  });
};

module.exports = setupWebRTC;

