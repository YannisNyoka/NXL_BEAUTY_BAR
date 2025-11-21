import React from 'react';
import './ConfirmationPopup.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Accept selectedManicureType and selectedPedicureType as explicit props
const ConfirmationPopup = ({ name = "NXL Beauty Bar", dateTime = '', onBookAnother, selectedManicureType = '', selectedPedicureType = '' }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // Build a Google Calendar link from dateTime
  const buildCalendarLink = () => {
    if (!dateTime) return '#';
    // dateTime expected format: "October 2025 7, 09:00 am"
    const parts = dateTime.split(', ');
    if (parts.length !== 2) return '#';
    const [datePart, timePart] = parts; // "October 2025 7" and "09:00 am"
    const dateBits = datePart.split(' '); // [Month, Year, Day]
    if (dateBits.length !== 3) return '#';
    const [monthName, year, day] = dateBits;
    const startStr = `${monthName} ${day}, ${year} ${timePart}`; // "October 7, 2025 09:00 am"
    const startDate = new Date(startStr);
    // Default event length: 60 minutes
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const pad = (n) => String(n).padStart(2, '0');
    const toGoogleDate = (d) => (
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
      `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`
    );

    const dates = `${toGoogleDate(startDate)}/${toGoogleDate(endDate)}`;
    const text = encodeURIComponent(`${name} Appointment`);
    const details = encodeURIComponent([
      'Your appointment is confirmed.',
      selectedManicureType ? `Manicure: ${selectedManicureType}` : '',
      selectedPedicureType ? `Pedicure: ${selectedPedicureType}` : ''
    ].filter(Boolean).join('\n'));
    const location = encodeURIComponent('Consultations • Africa/Johannesburg');
    const ctz = 'Africa/Johannesburg';

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}&ctz=${ctz}`;
  };
  return (
    <div className="confirmation-popup-modal">
      <div className="confirmation-popup-content">
        <h2 style={{fontWeight:600, marginBottom:'1.2rem'}}>Appointment confirmed with {name}{name ? ' ' : ''}!</h2>
        <div style={{background:'#e8f5e8', border:'1px solid #4caf50', borderRadius:'6px', padding:'1rem', marginBottom:'1.5rem', textAlign:'center'}}>
          <div style={{color:'#2e7d32', fontWeight:500, fontSize:'1rem'}}>
            ✅ Payment Successful • 📧 Confirmation Email Sent
          </div>
          <div style={{color:'#666', fontSize:'0.9rem', marginTop:'0.3rem'}}>
            Check your email for appointment details and receipt
          </div>
        </div>
        <div className="confirmation-card" style={{minWidth:'420px', maxWidth:'98vw', padding:'2.2rem 2.5rem', border:'1px solid #eee'}}>
          <div style={{display:'flex', alignItems:'center', gap:'1.5rem'}}>
            <div className="calendar-icon" style={{fontSize:'2.7rem', position:'relative'}}>
              <span style={{position:'absolute', left:0, top:0, width:'2.7rem', height:'2.7rem', background:'#fff', borderRadius:'8px', border:'1.5px solid #bbb', display:'flex', alignItems:'center', justifyContent:'center'}}>
                <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="8" width="30" height="22" rx="4" fill="#fff" stroke="#bbb" strokeWidth="2"/>
                  <rect x="4" y="8" width="30" height="6" rx="2" fill="#f5f5f5"/>
                  <rect x="10" y="4" width="2" height="6" rx="1" fill="#bbb"/>
                  <rect x="26" y="4" width="2" height="6" rx="1" fill="#bbb"/>
                  <polyline points="12,20 17,25 26,16" stroke="#222" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
            <div className="confirmation-details" style={{marginLeft:'3.2rem'}}>
              <div className="confirmation-date" style={{fontWeight:700, fontSize:'1.15rem', marginBottom:'0.2rem'}}>{dateTime}</div>
              <div className="confirmation-location" style={{fontSize:'1rem', color:'#888', marginBottom:'0.5rem'}}>Consultations<br/>Africa/Johannesburg GMT +02:00</div>
              {selectedManicureType && (
                <div style={{margin:'0.7rem 0', fontWeight:600, color:'#d17b7b'}}>Manicure Type: {selectedManicureType}</div>
              )}
              {selectedPedicureType && (
                <div style={{margin:'0.7rem 0', fontWeight:600, color:'#d17b7b'}}>Pedicure Type: {selectedPedicureType}</div>
              )}
              <a href={buildCalendarLink()} target="_blank" rel="noopener noreferrer" className="add-calendar-link" style={{color:'#1976d2', textDecoration:'underline', fontWeight:500, fontSize:'1rem'}}>+ Add to Calendar</a>
              <input style={{marginLeft:'0.7rem', border:'1px solid #bbb', borderRadius:'4px', padding:'0.2rem 0.5rem', fontSize:'1rem', width:'120px'}} placeholder="" />
            </div>
          </div>
        </div>
        <div style={{marginTop:'2.2rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <button className="book-another-btn" style={{background:'none', color:'#222', fontWeight:500, fontSize:'1.08rem', border:'none', textDecoration:'underline', cursor:'pointer'}} onClick={() => navigate('/dashboard')}>
            Book another appointment &rarr;
          </button>
          <button className="signout-btn" style={{background:'#d17b7b', color:'#fff', fontWeight:500, fontSize:'1.08rem', border:'none', borderRadius:'6px', padding:'0.5rem 1.2rem', marginLeft:'1.5rem', cursor:'pointer'}} onClick={() => { logout(); navigate('/'); }}>
            Sign Out
          </button>
        </div>
      </div>
      <div className="see-you-soon-bar" style={{background:'#f1f1', color:'#fff', fontSize:'2.2rem', fontWeight:700, letterSpacing:'1.5px', borderRadius:'12px 12px 0 0', position:'fixed', left:0, bottom:0, width:'100vw', textAlign:'center', padding:'1.2rem 0'}}>See You Soon !</div>
    </div>
  );
};

export default ConfirmationPopup;
