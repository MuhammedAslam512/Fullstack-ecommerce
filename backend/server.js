const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const { app, setupGraphQLAndErrors } = require('./app'); // Import helper
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const initEmailWorker = require('./workers/emailWorker');
const logger = require('./config/logger')
const {connectRabbitMQ} = require('./config/rabbitmq')
const startInventoryWorker = require('./workers/inventoryWorker')

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

const startServer = async () => {
  try {
    // 1. Connect MongoDB
    await connectDB();

    // 2. Start BullMQ Email Worker
    initEmailWorker();

    await connectRabbitMQ();
    startInventoryWorker()

    // 3. Setup Apollo GraphQL Server AND Error Handlers in correct order
    await setupGraphQLAndErrors(app);

    // 4. Start Server
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`🌐 GraphQL Playground available at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


// -------------------------------------------------------------
// GRACEFUL SHUTDOWN HANDLER (ZERO DOWNTIME REQUIREMENT)
//  ------------------------------------------------------------
const gracefulShutdown = (signal) => {
  logger.info(`⚠️ Received ${signal}. Starting Graceful Shutdown...`);

  // Stop accepting new HTTP connections
  server.close(async () => {
    logger.info('HTTP & WebSocket server closed.');

    try {
      // Close Database connections safely
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      logger.info('MongoDB connection closed.');

      process.exit(0); // Exit cleanly
    } catch (err) {
      logger.error(`Error during graceful shutdown: ${err.message}`);
      process.exit(1);
    }
  });

  // Force exit after 10 seconds if connections hang
  setTimeout(() => {
    logger.error('Could not close connections in time, forcing exit');
    process.exit(1);
  }, 10000);
};

// Listen for process termination signals from Docker / Kubernetes / Render
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
