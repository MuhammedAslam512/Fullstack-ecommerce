// ─────────────────────────────────────────────────────────────
// BULLMQ EMAIL QUEUE (PRODUCER)
// ─────────────────────────────────────────────────────────────
const { Queue } = require('bullmq');
const redisConnection = require('../config/redisConfig');

// Create 'emailQueue' instance
const emailQueue = new Queue('emailQueue', {
  connection: redisConnection
});

// Helper function to add Welcome Email job to Queue
const addWelcomeEmailJob = async (user) => {
  try {
    await emailQueue.add(
      'sendWelcomeEmail',
      {
        email: user.email,
        name: user.name
      },
      {
        attempts: 3, // Retry up to 3 times if email fails
        backoff: {
          type: 'exponential',
          delay: 5000 // Wait 5s, 10s, 20s between retries
        },
        removeOnComplete: true // Auto-clean finished jobs
      }
    );
    console.log(`📥 Added Welcome Email job to Queue for: ${user.email}`);
  } catch (err) {
    console.error('Failed to add job to emailQueue:', err.message);
  }
};

// Helper function to add Password Reset Email job to Queue
const addResetPasswordEmailJob = async (user, resetUrl) => {
  try {
    await emailQueue.add(
      'sendResetPasswordEmail',
      {
        email: user.email,
        name: user.name,
        resetUrl
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: true
      }
    );
    console.log(`📥 Added Reset Password Email job to Queue for: ${user.email}`);
  } catch (err) {
    console.error('Failed to add reset job to emailQueue:', err.message);
  }
};

module.exports = {
  emailQueue,
  addWelcomeEmailJob,
  addResetPasswordEmailJob
};