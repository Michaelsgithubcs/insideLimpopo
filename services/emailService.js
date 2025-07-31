const nodemailer = require('nodemailer');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: process.env.MAIL_PORT || 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.MAIL_USER || 'mosewadesmond919@gmail.com',
    pass: process.env.MAIL_PASS || 'your_app_password_here',
  },
  tls: {
    rejectUnauthorized: false // For local testing only
  }
});

/**
 * Send a newsletter email to multiple recipients
 * @param {string[]} recipients - Array of subscriber emails
 * @param {string} subject - Email subject
 * @param {string} htmlContent - Email content in HTML
 */
async function sendNewsletter(recipients, subject, htmlContent) {
  try {
    if (!recipients || recipients.length === 0) {
      console.warn('⚠️ No recipients provided for newsletter.');
      return;
    }

    const mailOptions = {
      from: process.env.MAIL_FROM || '"Inside Limpopo" <mosewadesmond919@gmail.com>',
      to: recipients.join(','), // join array into a comma-separated string
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Newsletter sent to ${recipients.length} recipient(s). Message ID: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error('❌ Failed to send newsletter:', err.message);
    throw err;
  }
}

module.exports = { sendNewsletter };
