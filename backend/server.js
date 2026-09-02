const dotenv = require('dotenv');
dotenv.config();

const http = require('http'); // Native HTTP module
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');

const PORT = process.env.PORT || 5000;

// Wrap Express with HTTP Server
const server = http.createServer(app);

// Initialize WebSockets
initSocket(server);

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`⚡ WebSockets ready`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();