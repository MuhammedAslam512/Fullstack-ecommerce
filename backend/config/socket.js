const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`⚡ WebSocket Client Connected: ${socket.id}`);

    socket.on('join_room', (roomName) => {
      socket.join(roomName);
      console.log(`👤 Socket ${socket.id} joined room: ${roomName}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ WebSocket Client Disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};

module.exports = { initSocket, getIO };