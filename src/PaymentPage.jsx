import React, { useState } from 'react';
import ConfirmationPopup from './ConfirmationPopup';
import { useAuth } from './AuthContext';
import { useLocation } from 'react-router-dom';
import { api } from './api.js';
import emailjs from '@emailjs/browser';


const PaymentPage = ({ onSave }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [method, setMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [country, setCountry] = useState('South Africa');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');

  // Use state from navigation if available
  const name = location.state?.name || (user ? `${user.firstName} ${user.lastName}` : '');
  const dateTime = location.state?.dateTime || ''; // TODO: Replace with real booking info
  const appointmentId = location.state?.appointmentId;

  // Get credentials from user context or prompt
  const email = user?.email;
  const password = user?.rawPassword; // You must store raw password on login/signup for this to work
  const authHeader = email && password ? { 'Authorization': 'Basic ' + btoa(email + ':' + password) } : {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setApiError('');
    setApiSuccess('');
    try {
      // Save payment details in PAYMENTS collection
      const paymentData = {
        appointmentId,
        amount: 100, // or use totalPrice if available
        paymentMethod: method,
        status: 'paid'
      };
      
      const result = await api.createPayment(paymentData);
      if (result.success) {
        // Send confirmation email after successful payment using EmailJS
        try {
          console.log('Sending confirmation email via EmailJS...');
          
          const templateParams = {
            to_email: email || user?.email,
            customer_name: name,
            appointment_date: location.state?.appointmentDate || dateTime || '',
            appointment_time: location.state?.appointmentTime || '',
            services: Array.isArray(location.state?.selectedServices) 
              ? location.state.selectedServices.join(', ') 
              : 'Beauty Services',
            employee: location.state?.selectedEmployee || 'Noxolo',
            total_price: location.state?.totalPrice || 100,
            total_duration: location.state?.totalDuration || 90,
            contact_number: location.state?.contactNumber || '',
            appointment_id: appointmentId || 'N/A',
            salon_email: 'nxlbeautybar@gmail.com',
            salon_phone: '+27 123 456 789'
          };
          
          console.log('Email template params:', templateParams);
          
          // TODO: Replace these with your actual EmailJS credentials
          // Get these from your EmailJS dashboard after setup
          const SERVICE_ID = 'service_f0lbtzg'; // Replace with your service ID
          const TEMPLATE_ID = 'template_sbxxbi'; // Replace with your template ID  
          const PUBLIC_KEY = 'l7AiKNhYSfG_q4eot'; // Replace with your public key
          
          // For now, we'll simulate the email sending since you need to set up EmailJS first
          console.log('📧 Email would be sent with EmailJS to:', templateParams.to_email);
          console.log('📧 Email content preview:');
          console.log(`
            Dear ${templateParams.customer_name},
            
            Your appointment at NXL Beauty Bar has been confirmed!
            
            📅 Date: ${templateParams.appointment_date}
            🕒 Time: ${templateParams.appointment_time}
            💄 Services: ${templateParams.services}
            👩‍💼 Stylist: ${templateParams.employee}
            💰 Total: R${templateParams.total_price}
            ⏱️ Duration: ${templateParams.total_duration} minutes
            📞 Contact: ${templateParams.contact_number}
            
            Important Information:
            • Please arrive 10 minutes early
            • R100 booking fee is non-refundable
            
            Contact us: ${templateParams.salon_email} | ${templateParams.salon_phone}
            
            Thank you for choosing NXL Beauty Bar!
          `);
          
          // Uncomment this when you have EmailJS set up:
          
          const result = await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID, 
            templateParams,
            PUBLIC_KEY
          );
          
          console.log('✅ Email sent successfully via EmailJS!', result);
          setApiSuccess('Payment successful! Confirmation email sent.');
          
          
          // For now, show success message
          setApiSuccess('Payment successful! (EmailJS setup required for confirmation emails)');
          
        } catch (emailError) {
          console.error('❌ EmailJS error:', emailError);
          // Don't fail the payment for email issues
        }
        
        setApiSuccess('Payment successful!');
        setShowConfirmation(true);
        if (onSave) onSave({ method, cardNumber, expiry, cvc, country });
      } else {
        setApiError(result.error || 'Payment failed. Please try again.');
      }
    } catch (err) {
      setApiError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showConfirmation) {
    return <ConfirmationPopup name={name} dateTime={dateTime} />;
  }

  return (
    <div className="payment-bg">
      <div className="payment-center">
        <h2 className="payment-title" style={{fontWeight:700, fontSize:'2rem', marginTop:'2.5rem', marginBottom:'2.5rem', textAlign:'center', letterSpacing:'0.5px'}}>
          A none Refundeble  Booking fee of R100 will be<br />charged to Secure your Booking
        </h2>
        <div className="payment-card">
          <form className="payment-form" onSubmit={handleSubmit}>
            <h3 style={{fontWeight:700, fontSize:'1.3rem', marginBottom:'0.5rem'}}>Your Billing Info</h3>
            <div style={{color:'#444', fontSize:'0.98rem', marginBottom:'1.2rem'}}>
              <span style={{marginRight:'0.4rem', color:'#888'}}>&#9432;</span>All fields are required.
            </div>
            <div className="payment-methods" style={{marginBottom:'1.2rem'}}>
              <button type="button" className={method === 'card' ? 'active' : ''} onClick={() => setMethod('card')} style={{fontWeight:600, fontSize:'1.05rem', display:'flex', alignItems:'center', gap:'0.5rem'}}>
                <span style={{fontSize:'1.2rem'}}>&#128179;</span> Card
              </button>
             
              <button type="button" className={method === 'paypal' ? 'active' : ''} onClick={() => setMethod('paypal')} style={{fontWeight:600, fontSize:'1.05rem', display:'flex', alignItems:'center', gap:'0.5rem'}}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" style={{width:'22px', height:'22px'}} /> PayPal
              </button>
            </div>
            {method === 'card' && (
              <>
                <label style={{fontWeight:600, fontSize:'1rem', marginBottom:'0.2rem'}}>Card Number</label>
                <div style={{display:'flex', alignItems:'center', border:'1.5px solid #bbb', borderRadius:'7px', background:'#fafbfc', marginBottom:'1.1rem', padding:'0.2rem 0.7rem'}}>
                  <input type="text" placeholder="1234 1234 1234 1234" value={cardNumber} onChange={e => setCardNumber(e.target.value)} maxLength={19} required style={{border:'none', outline:'none', background:'transparent', fontSize:'1.1rem', flex:1, padding:'0.7rem 0'}} />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" style={{width:'32px', marginLeft:'0.5rem'}} />
                  
                  
                </div>
                <div style={{display:'flex', gap:'1rem', marginBottom:'1.1rem'}}>
                  <div style={{flex:1}}>
                    <label style={{fontWeight:600, fontSize:'1rem', marginBottom:'0.2rem'}}>Expiration Date</label>
                    <input type="text" placeholder="MM / YY" value={expiry} onChange={e => setExpiry(e.target.value)} maxLength={5} required style={{width:'100%', padding:'0.7rem', border:'1.5px solid #bbb', borderRadius:'7px', fontSize:'1.1rem', background:'#fafbfc'}} />
                  </div>
                  <div style={{flex:1}}>
                    <label style={{fontWeight:600, fontSize:'1rem', marginBottom:'0.2rem'}}>Security Code</label>
                    <div style={{display:'flex', alignItems:'center'}}>
                      <input type="text" placeholder="CVC" value={cvc} onChange={e => setCvc(e.target.value)} maxLength={4} required style={{width:'100%', padding:'0.7rem', border:'1.5px solid #bbb', borderRadius:'7px', fontSize:'1.1rem', background:'#fafbfc'}} />
                      
                    </div>
                  </div>
                </div>
                <div style={{marginBottom:'1.1rem'}}>
                  <label style={{fontWeight:600, fontSize:'1rem', marginBottom:'0.2rem'}}>Country</label>
                  <select value={country} onChange={e => setCountry(e.target.value)} required style={{width:'100%', padding:'0.7rem', border:'1.5px solid #bbb', borderRadius:'7px', fontSize:'1.1rem', background:'#fafbfc'}}>
                    <option value="South Africa">South Africa</option>
                    <option value="Namibia">Namibia</option>
                    <option value="Botswana">Botswana</option>
                    <option value="Zimbabwe">Zimbabwe</option>
                  </select>
                </div>
              </>
            )}
            {/* Google Pay and PayPal can be implemented as needed */}
            <button type="submit" className="save-btn" disabled={loading} style={{width:'50%', background:'#c68d8dff', color:'#f30707ff', fontWeight:700, fontSize:'1.2rem', borderRadius:'7px', border:'none', padding :'0.9rem 0', marginTop:'0.7rem', marginBottom:'0.2rem', cursor:'pointer'}}>
              {loading ? 'Processing...' : 'Save'}
            </button>
            {apiError && <div style={{color:'red', marginTop:'0.5rem', fontWeight:500}}>{apiError}</div>}
            {apiSuccess && <div style={{color:'green', marginTop:'0.5rem', fontWeight:500}}>{apiSuccess}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
