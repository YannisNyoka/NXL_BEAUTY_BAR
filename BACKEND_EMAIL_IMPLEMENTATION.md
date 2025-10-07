# Backend Email Endpoint Implementation Guide

## Required Dependencies
Add to your backend package.json:
```bash
npm install nodemailer
```

## Environment Variables
Add to your .env file:
```env
EMAIL_USER=nxlbeautybar@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=nxlbeautybar@gmail.com
```

## Backend Route Implementation

### 1. Email Configuration (config/email.js)
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

module.exports = transporter;
```

### 2. Email Template Function (utils/emailTemplate.js)
```javascript
const generateConfirmationEmail = (customerName, appointmentDetails) => {
  const { date, time, services, employee, totalPrice, totalDuration, contactNumber } = appointmentDetails;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Appointment Confirmation</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #c68d8d, #f30707); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .appointment-details { background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; border-bottom: 1px solid #eee; padding-bottom: 8px; }
            .detail-label { font-weight: bold; color: #333; }
            .detail-value { color: #666; }
            .total { font-size: 18px; font-weight: bold; color: #c68d8d; }
            .footer { background-color: #f8f8f8; padding: 20px; text-align: center; color: #666; font-size: 14px; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">NXL Beauty Bar</div>
                <h1>Appointment Confirmed!</h1>
            </div>
            
            <div class="content">
                <p>Dear ${customerName},</p>
                
                <p>Thank you for booking with NXL Beauty Bar! Your appointment has been confirmed and payment has been successfully processed.</p>
                
                <div class="appointment-details">
                    <h3 style="margin-top: 0; color: #c68d8d;">Appointment Details</h3>
                    
                    <div class="detail-row">
                        <span class="detail-label">Date:</span>
                        <span class="detail-value">${date}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Time:</span>
                        <span class="detail-value">${time}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Services:</span>
                        <span class="detail-value">${Array.isArray(services) ? services.join(', ') : services}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Stylist:</span>
                        <span class="detail-value">${employee}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Duration:</span>
                        <span class="detail-value">${totalDuration} minutes</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Contact Number:</span>
                        <span class="detail-value">${contactNumber}</span>
                    </div>
                    
                    <div class="detail-row total">
                        <span class="detail-label">Total Paid:</span>
                        <span class="detail-value">R${totalPrice}</span>
                    </div>
                </div>
                
                <h3 style="color: #c68d8d;">Important Information:</h3>
                <ul>
                    <li>Please arrive 10 minutes before your appointment time</li>
                    <li>The R100 booking fee is non-refundable</li>
                    <li>To reschedule or cancel, please contact us at least 24 hours in advance</li>
                    <li>Bring a valid ID for verification</li>
                </ul>
                
                <p><strong>Need to make changes?</strong> Contact us:</p>
                <p>📧 Email: nxlbeautybar@gmail.com<br>
                   📱 Phone: +27 123 456 789</p>
            </div>
            
            <div class="footer">
                <p>Thank you for choosing NXL Beauty Bar!</p>
                <p>Visit us at: 123 Beauty Street, Cape Town, South Africa</p>
                <p>This is an automated confirmation email. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

module.exports = { generateConfirmationEmail };
```

### 3. API Route (routes/email.js)
```javascript
const express = require('express');
const router = express.Router();
const transporter = require('../config/email');
const { generateConfirmationEmail } = require('../utils/emailTemplate');

// POST /api/send-confirmation-email
router.post('/send-confirmation-email', async (req, res) => {
  try {
    const { customerEmail, customerName, appointmentDetails } = req.body;
    
    // Validate required fields
    if (!customerEmail || !customerName || !appointmentDetails) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: customerEmail, customerName, appointmentDetails'
      });
    }

    // Generate email HTML
    const emailHtml = generateConfirmationEmail(customerName, appointmentDetails);
    
    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'nxlbeautybar@gmail.com',
      to: customerEmail,
      subject: `Appointment Confirmed - NXL Beauty Bar | ${appointmentDetails.date} at ${appointmentDetails.time}`,
      html: emailHtml
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    
    res.json({
      success: true,
      message: 'Confirmation email sent successfully',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send confirmation email',
      details: error.message
    });
  }
});

module.exports = router;
```

### 4. Add to main server file (app.js or server.js)
```javascript
const emailRoutes = require('./routes/email');
app.use('/api', emailRoutes);
```

## Gmail App Password Setup
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password for "Mail"
4. Use this App Password in EMAIL_PASSWORD environment variable

## Testing
Test the endpoint with curl:
```bash
curl -X POST http://localhost:3001/api/send-confirmation-email \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "test@example.com",
    "customerName": "John Doe",
    "appointmentDetails": {
      "date": "October 2025 7",
      "time": "10:30 am",
      "services": ["Manicure", "Pedicure"],
      "employee": "Noxolo",
      "totalPrice": 250,
      "totalDuration": 90,
      "contactNumber": "+27123456789",
      "appointmentId": "675432109876543210987654"
    }
  }'
```