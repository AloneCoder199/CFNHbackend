const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendDonationEmail = async (donorEmail, amount) => {
  const mailOptions = {
    from: `"Donation Alert" <${process.env.EMAIL_USER}>`,
    to: process.env.NOTIFY_EMAIL,
    subject: "🎉 New Donation Received",
    html: `
      <h2>🟢 New Donation Alert</h2>
      <p><strong>Email:</strong> ${donorEmail}</p>
      <p><strong>Amount:</strong> $${(amount / 100).toFixed(2)} USD</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendDonationEmail;
