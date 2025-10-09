# 📧 EmailJS Setup Guide - 5 Minutes to Working Emails!

## ✅ EmailJS Package Already Installed!
The EmailJS package has been added to your project and the code is ready to go.

## 🚀 Quick Setup Steps

### Step 1: Create EmailJS Account (2 minutes)
1. Go to [https://www.emailjs.com](https://www.emailjs.com)
2. Click "Sign Up" 
3. Create account with your email
4. Verify your email address

### Step 2: Add Email Service (1 minute)
1. Go to **Email Services** in dashboard
2. Click **Add New Service**
3. Choose **Gmail** (recommended)
4. Follow the prompts to connect your Gmail account
5. **Copy the Service ID** (looks like `service_xxxxxxx`)

### Step 3: Create Email Template (2 minutes)
1. Go to **Email Templates** in dashboard
2. Click **Create New Template**
3. Copy this template content:

```html
Subject: Appointment Confirmed - NXL Beauty Bar | {{appointment_date}} at {{appointment_time}}

Dear {{customer_name}},

Your appointment at NXL Beauty Bar has been confirmed! 🎉

📅 **Appointment Details:**
• Date: {{appointment_date}}
• Time: {{appointment_time}}
• Services: {{services}}
• Stylist: {{employee}}
• Total Paid: R{{total_price}}
• Duration: {{total_duration}} minutes
• Contact: {{contact_number}}

📍 **Important Information:**
• Please arrive 10 minutes before your appointment
• Bring valid ID for verification
• The R100 booking fee is non-refundable
• To reschedule, contact us 24 hours in advance

📞 **Need Help?**
Email: {{salon_email}}
Phone: {{salon_phone}}

Thank you for choosing NXL Beauty Bar!

Best regards,
NXL Beauty Bar Team
```

4. **Copy the Template ID** (looks like `template_xxxxxxx`)

### Step 4: Get Public Key (30 seconds)
1. Go to **Account** → **General**
2. **Copy your Public Key** (looks like `xxxxxxxxxxxxxxx`)

### Step 5: Update Your Code (30 seconds)
1. Open `src/PaymentPage.jsx`
2. Find these lines around line 60:
```javascript
const SERVICE_ID = 'service_nxl_beauty'; // Replace with your service ID
const TEMPLATE_ID = 'template_booking_confirmation'; // Replace with your template ID  
const PUBLIC_KEY = 'your_public_key_here'; // Replace with your public key
```

3. Replace with your actual IDs:
```javascript
const SERVICE_ID = 'service_xxxxxxx'; // Your actual service ID
const TEMPLATE_ID = 'template_xxxxxxx'; // Your actual template ID  
const PUBLIC_KEY = 'xxxxxxxxxxxxxxx'; // Your actual public key
```

4. Uncomment the EmailJS sending code by removing `/*` and `*/` around:
```javascript
const result = await emailjs.send(
  SERVICE_ID,
  TEMPLATE_ID, 
  templateParams,
  PUBLIC_KEY
);

console.log('✅ Email sent successfully via EmailJS!', result);
setApiSuccess('Payment successful! Confirmation email sent.');
```

## 🎯 That's It! 

After these 5 simple steps:
- ✅ Customers get beautiful confirmation emails
- ✅ No backend complications
- ✅ No SendGrid headaches  
- ✅ 200 free emails per month
- ✅ Professional appearance
- ✅ Reliable delivery

## 📧 Email Preview
Customers will receive:
```
Subject: Appointment Confirmed - NXL Beauty Bar | October 9, 2025 at 10:30 AM

Dear Jane Doe,

Your appointment at NXL Beauty Bar has been confirmed! 🎉

📅 Appointment Details:
• Date: October 9, 2025
• Time: 10:30 AM
• Services: Manicure, Pedicure
• Stylist: Noxolo
• Total Paid: R250
• Duration: 90 minutes
• Contact: +27123456789

📍 Important Information:
• Please arrive 10 minutes before your appointment
• Bring valid ID for verification
• The R100 booking fee is non-refundable
• To reschedule, contact us 24 hours in advance

📞 Need Help?
Email: nxlbeautybar@gmail.com
Phone: +27 123 456 789

Thank you for choosing NXL Beauty Bar!

Best regards,
NXL Beauty Bar Team
```

## 🚀 Current Status
- ✅ EmailJS package installed
- ✅ Code implemented and ready
- ✅ Email template prepared
- ⏳ **Just need your 3 IDs from EmailJS dashboard**

**Once you add the 3 IDs and uncomment the code, emails will work immediately!**