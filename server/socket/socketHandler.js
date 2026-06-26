const jwt = require('jsonwebtoken');
const store = require('../data/store');

function getToken(socket) {
  const authToken = socket.handshake.auth?.token;
  const header = socket.handshake.headers?.authorization;
  if (authToken) return authToken;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
}

function socketHandler(io) {
  io.use(async (socket, next) => {
    try {
      const token = getToken(socket);
      if (!token) return next();
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await store.getUserById(decoded.userId);
      next();
    } catch (error) {
      next();
    }
  });

  io.on('connection', async (socket) => {
    if (socket.user?._id) {
      await store.updateUser(socket.user._id, { isOnline: true });
      socket.join(`user:${socket.user._id}`);
      socket.broadcast.emit('presenceChanged', { userId: socket.user._id, isOnline: true });
    }

    socket.on('joinRoom', (roomId) => {
      if (roomId) socket.join(roomId);
    });

    socket.on('leaveRoom', (roomId) => {
      if (roomId) socket.leave(roomId);
    });

    socket.on('joinMatch', (matchId) => {
      if (matchId) socket.join(matchId);
    });

    socket.on('sendMessage', async (data, callback) => {
      try {
        if (!socket.user?._id) throw new Error('Authentication required.');
        const message = await store.createMessage(data.matchId, socket.user._id, data.content, data.attachments);
        io.to(data.matchId).emit('receiveMessage', message);
        callback?.({ ok: true, message });
      } catch (error) {
        callback?.({ ok: false, message: error.message });
      }
    });

    socket.on('typing', (data) => {
      if (!data?.matchId) return;
      socket.to(data.matchId).emit('userTyping', {
        matchId: data.matchId,
        userId: socket.user?._id,
        name: socket.user?.name
      });
    });

    socket.on('disconnect', async () => {
      if (socket.user?._id) {
        await store.updateUser(socket.user._id, { isOnline: false });
        socket.broadcast.emit('presenceChanged', { userId: socket.user._id, isOnline: false });
      }
    });
  });
}

module.exports = socketHandler;
