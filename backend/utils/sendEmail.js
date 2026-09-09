// ─────────────────────────────────────────
// NODEMAILER EMAIL SENDER UTILITY
// ─────────────────────────────────────────
const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'ShopNest Support'} <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Nodemailer Delivered Email to: ${to} (Message ID: ${info.messageId})`);
    return info;

  } catch (error) {
    console.error('❌ Nodemailer Delivery Error:', error.message);
    throw error; // Rethrow so BullMQ Worker knows it failed and retries!
  }
};

module.exports = sendEmail;