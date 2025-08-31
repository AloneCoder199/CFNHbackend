const nodemailer = require("nodemailer");
require("dotenv").config();

// ✅ Setup reusable transporter (Gmail SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, // 465 => true, 587 => false (TLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Avoid some hosting SSL issues
  },
});

/**
 * Send donation alert email to admin
 * @param {string} donorEmail - Donor's email address
 * @param {number} amount - Donation amount in cents
 */
const sendDonationEmail = async (donorEmail, amount) => {
  try {
    const formattedAmount = (amount / 100).toFixed(2);

    const mailOptions = {
      from: `"Compassion Donations" <${process.env.EMAIL_USER}>`,
      to: process.env.NOTIFY_EMAIL, // admin email
      subject: "🎉 New Donation Received",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #4CAF50;">🟢 New Donation Alert</h2>
          <p><strong>Donor Email:</strong> ${donorEmail}</p>
          <p><strong>Amount:</strong> $${formattedAmount} USD</p>
          <hr/>
          <p style="font-size: 12px; color: #777;">
            This is an automated message from your donation system.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📩 Donation email sent: ${info.messageId}`);

  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    // Optional: log error to a file or monitoring tool here
  }
};

module.exports = sendDonationEmail;
