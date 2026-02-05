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

/**
 * Send custom styled emails to individual recipients
 */
async function sendCustomEmails(emails, subject, message) {
  try {
    const validEmails = (emails || []).filter(e => e && e.includes("@"));
    if (validEmails.length === 0) {
      console.warn("⚠️ No valid recipients for custom emails.");
      return;
    }

    for (const email of validEmails) {
      const mailOptions = {
        from: process.env.MAIL_FROM || '"Inside Limpopo" <mosewadesmond919@gmail.com>',
        to: email,
        subject: subject || "Inside Limpopo Update",
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6fa; padding: 20px; color: #333;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: #003366; color: #ffffff; padding: 25px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: bold;">${subject || "Inside Limpopo Update"}</h1>
            </div>
            
            <!-- Body -->
            <div style="padding: 25px;">
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0;">
                ${message || "Hello, here’s your update!"}
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background: #f1f1f1; text-align: center; padding: 15px; font-size: 13px; color: #666;">
              <p style="margin: 0;">Thank you for subscribing to <strong>Inside Limpopo</strong>!</p>
              <p style="margin: 8px 0;">
                <a href="http://localhost:3000/subscribe/unsubscribe" style="color: #003366; text-decoration: none;">Unsubscribe</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #999;">&copy; ${new Date().getFullYear()} Inside Limpopo. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,

      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Custom email sent to ${email}. Message ID: ${info.messageId}`);
    }
  } catch (err) {
    console.error("❌ Failed to send custom emails:", err.message);
    throw err;
  }
}

module.exports = { sendCustomEmails, sendNewsletter };
