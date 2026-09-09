// ─────────────────────────────────────────────────────────────
// BULLMQ EMAIL WORKER (CONSUMER)
// ─────────────────────────────────────────────────────────────
const { Worker } = require('bullmq');
const redisConnection = require('../config/redisConfig');
const sendEmail = require('../utils/sendEmail');

const initEmailWorker = () => {
  const worker = new Worker(
    'emailQueue',
    async (job) => {
      console.log(`⚙️ Worker Processing Job #${job.id} [${job.name}]...`);

      if (job.name === 'sendWelcomeEmail') {
        const { email, name } = job.data;
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
            <h2 style="color: #2563eb;">🎉 Welcome to ShopNest, ${name}!</h2>
            <p>Thank you for creating an account with us. Enjoy seamless shopping!</p>
          </div>
        `;

        await sendEmail({
          to: email,
          subject: '🎉 Welcome to ShopNest!',
          html
        });
      }

      if (job.name === 'sendResetPasswordEmail') {
        const { email, name, resetUrl } = job.data;
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
            <h2>🔐 Password Reset Request</h2>
            <p>Hello ${name}, click below to reset your password:</p>
            <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>This link expires in 10 minutes.</p>
          </div>
        `;

        await sendEmail({
          to: email,
          subject: '🔐 Password Reset - Action Required',
          html
        });
      }
    },
    { connection: redisConnection }
  );

  worker.on('completed', (job) => {
    console.log(`✅ Background Job #${job.id} [${job.name}] Completed Successfully!`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Background Job #${job?.id} Failed:`, err.message);
  });

  console.log('⚡ BullMQ Email Worker Listening for Jobs...');
};

module.exports = initEmailWorker;