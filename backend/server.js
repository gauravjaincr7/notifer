const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors({origin:true}));

// Send Email Endpoint
app.get('/send-email', async (req, res) => {
  try {
    const { email, threshold } = req.query;

    // Set up nodemailer transporter (you need to configure this with your email service)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'gauravjain.cr7@gmail.com',
        pass: process.env.PASS
      },
    });

    // Email content
    const mailOptions = {
      from: 'gauravjain.cr7@gmail.com',
      to: email,
      subject: 'Alert: Balance Below Threshold',
      text: `Your token balance has fallen below the threshold amount.`,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully.');
    res.status(200).json({ message: 'Email sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
