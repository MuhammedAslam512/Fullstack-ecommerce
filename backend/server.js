const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const { app, setupGraphQLAndErrors } = require('./app'); // Import helper
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const initEmailWorker = require('./workers/emailWorker');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

const startServer = async () => {
  try {
    // 1. Connect MongoDB
    await connectDB();

    // 2. Start BullMQ Email Worker
    initEmailWorker();

    // 3. Setup Apollo GraphQL Server AND Error Handlers in correct order
    await setupGraphQLAndErrors(app);

    // 4. Start Server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🌐 GraphQL Playground available at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();