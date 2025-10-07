# Email Confirmation Template for NXL Beauty Bar

## Overview
This document outlines the email confirmation template that should be sent to customers after successful payment confirmation.

## Backend Email API Endpoint
**Endpoint:** `POST /api/send-confirmation-email`

### Request Payload
```javascript
{
  "customerEmail": "customer@example.com",
  "customerName": "Jane Doe",
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
}
```

## HTML Email Template

### Subject Line
`Appointment Confirmed - NXL Beauty Bar | {Date} at {Time}`

### Email Body (HTML)
```html
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
            <p>Dear {customerName},</p>
            
            <p>Thank you for booking with NXL Beauty Bar! Your appointment has been confirmed and payment has been successfully processed.</p>
            
            <div class="appointment-details">
                <h3 style="margin-top: 0; color: #c68d8d;">Appointment Details</h3>
                
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">{appointmentDate}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">{appointmentTime}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Services:</span>
                    <span class="detail-value">{servicesList}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Stylist:</span>
                    <span class="detail-value">{employeeName}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Duration:</span>
                    <span class="detail-value">{totalDuration} minutes</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Contact Number:</span>
                    <span class="detail-value">{contactNumber}</span>
                </div>
                
                <div class="detail-row total">
                    <span class="detail-label">Total Paid:</span>
                    <span class="detail-value">R{totalPrice}</span>
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
```

## Implementation Notes

### Backend Requirements
1. **Email Service Integration:** Use a service like Nodemailer with Gmail SMTP, SendGrid, or AWS SES
2. **Template Engine:** Use a template engine like Handlebars or EJS to replace placeholders
3. **Error Handling:** Gracefully handle email sending failures
4. **Environment Variables:** Store email credentials securely

### Email Service Configuration (Example with Nodemailer)
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // nxlbeautybar@gmail.com
    pass: process.env.EMAIL_PASSWORD // App-specific password
  }
});
```

### Frontend Integration
The frontend will call the email API after successful payment processing in `PaymentPage.jsx`.

## Testing
- Test with various email providers (Gmail, Outlook, Apple Mail)
- Verify all placeholders are properly replaced
- Test error handling when email service is unavailable
- Ensure responsive design on mobile email clients