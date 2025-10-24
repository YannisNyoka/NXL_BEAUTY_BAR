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

  // Initialize EmailJS
  React.useEffect(() => {
    emailjs.init('l7AiKNhYSfG_q4eot'); // Initialize with your public key
  }, []);

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
        // Send confirmation email ONLY via EmailJS (no backend calls)
        console.log('💳 Payment successful! Now sending email confirmation...');
        console.log('🔍 Environment check:');
        console.log('- API URL:', import.meta.env.VITE_API_URL);
        console.log('- Should NOT see localhost calls below this line');
        
        try {
          // Ensure EmailJS is properly initialized
          if (typeof emailjs === 'undefined') {
            console.error('EmailJS not loaded properly');
            throw new Error('EmailJS not loaded');
          }
          
          console.log('📧 Starting EmailJS email send process...');
          
          // Use the exact EmailJS format that works
          const emailParams = {
            customer_name: name,
            appointment_date: location.state?.appointmentDate || dateTime || '',
            appointment_time: location.state?.appointmentTime || '',
            services: Array.isArray(location.state?.selectedServices) 
              ? location.state.selectedServices.join(', ') 
              : 'manicure',
            employee: location.state?.selectedEmployee || 'Noxolo',
            total_price: `${location.state?.totalPrice || 250}`,
            total_duration: `${Math.floor((location.state?.totalDuration || 90) / 60)}:${(location.state?.totalDuration || 90) % 60 || '30'}h`,
            contact_number: location.state?.contactNumber?.replace(/\D/g, '') || '782685826',
            salon_email: 'nxlbeautybar@gmail.com',
            salon_phone: '0685113394',
            email: email || user?.email || 'nxlbeautybar@gmail.com'
          };
          
          console.log('📧 EmailJS Configuration:');
          console.log('- Service ID: service_f0lbtzg');
          console.log('- Template ID: template_sbxxbii');
          console.log('- Recipient:', emailParams.email);
          console.log('- Customer:', emailParams.customer_name);
          console.log('- Date/Time:', emailParams.appointment_date, emailParams.appointment_time);
          
          // Send email via EmailJS ONLY - no other API calls
          console.log('🚀 Sending email via EmailJS...');
          const emailResult = await emailjs.send(
            'service_f0lbtzg',
            'template_sbxxbii', 
            emailParams
          );
          
          console.log('✅ EmailJS Success:', emailResult);
          setApiSuccess(`Payment successful! Confirmation email sent to ${emailParams.email}`);
          
        } catch (emailError) {
          console.error('❌ EmailJS error:', emailError);
          console.error('EmailJS error details:', emailError.text || emailError.message);
          
          // Check if it's a network/fetch error
          if (emailError.message?.includes('Failed to fetch') || emailError.message?.includes('timeout')) {
            console.error('🌐 Network issue detected. Possible causes:');
            console.error('1. Internet connectivity problem');
            console.error('2. EmailJS service temporarily unavailable');
            console.error('3. Corporate firewall blocking EmailJS');
            console.error('4. CORS policy blocking the request');
            
            // Try a simple fallback notification
            try {
              // Fallback: Log the email that should be sent
              console.log('📧 EMAIL CONTENT THAT WOULD BE SENT:');
              console.log('To:', emailParams.email);
              console.log('Subject: Appointment Confirmed - NXL Beauty Bar');
              console.log(`
Dear ${emailParams.customer_name},

Your appointment at NXL Beauty Bar has been confirmed! 🎉

📅 Date: ${emailParams.appointment_date}
🕒 Time: ${emailParams.appointment_time}
💄 Services: ${emailParams.services}
👩‍💼 Stylist: ${emailParams.employee}
💰 Total: ${emailParams.total_price}
⏱️ Duration: ${emailParams.total_duration}
📞 Contact: ${emailParams.contact_number}

Contact us: ${emailParams.salon_email} | ${emailParams.salon_phone}

Thank you for choosing NXL Beauty Bar!
              `);
            } catch (fallbackError) {
              console.error('Fallback also failed:', fallbackError);
            }
          }
          
          // Payment still succeeded, just email failed
          setApiSuccess('Payment successful! Email confirmation failed - please save appointment details.');
        }
        
        // Always show confirmation popup after payment, regardless of email status
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
