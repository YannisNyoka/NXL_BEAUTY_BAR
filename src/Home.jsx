import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from './api.js';
import noxoloImage from './assets/images/nxl nails.jpg';
import manicureImage from './assets/images/NxlPic5.jpg';
import pedicureImage from './assets/images/ToesImage.jpg';
import eyelashesImage from './assets/images/EyeLashesImage.jpg';




const SALON_ADDRESS = 'NXLBEAUTYBAR, 1948 Mahalefele Rd, Dube,Soweto,1800';

function getUserLocationAndRedirect() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;
      // Google Maps Directions URL with user's location to salon
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${encodeURIComponent(SALON_ADDRESS)}`;
      window.open(mapsUrl, '_blank');
    }, () => {
      // If user denies location, just open the salon location
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SALON_ADDRESS)}`;
      window.open(mapsUrl, '_blank');
    });
  } else {
    // Fallback if geolocation is not supported
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SALON_ADDRESS)}`;
    window.open(mapsUrl, '_blank');
  }
}

function Home() {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const [flipped, setFlipped] = useState({ manicure: false, pedicure: false, lashes: false });
  const flip = (key) => setFlipped(prev => ({ ...prev, [key]: !prev[key] }));
  
  useEffect(() => {
    // Test backend connection and fetch data
    const testConnectionAndFetchData = async () => {
      const API_URL = import.meta.env.VITE_API_URL;
      console.log('🔍 Testing API URL:', API_URL);
      setConnectionStatus(`Testing connection to: ${API_URL}`);
      
      try {
        // Test connection first
        console.log('🔍 Testing /api/ping endpoint...');
        const pingResult = await api.ping();
        if (pingResult.success) {
          console.log('✅ Backend connection successful:', pingResult.data);
          setConnectionStatus('✅ Backend connected successfully!');
          
          // Fetch users data
          const usersResult = await api.getUsers();
          if (usersResult.success) {
            console.log('✅ Users data:', usersResult.data);
          } else {
            console.error('❌ Failed to fetch users:', usersResult.error);
            setConnectionStatus('⚠️ Connected but failed to fetch users');
          }
        } else {
          console.error('❌ Backend connection failed:', pingResult.error);
          setConnectionStatus(`❌ Connection failed: ${pingResult.error}`);
        }
      } catch (error) {
        console.error('❌ Network error:', error);
        setConnectionStatus(`❌ Network error: ${error.message}`);
      }
    };
    
    testConnectionAndFetchData();
  }, []);
  const isConnected = connectionStatus.includes('✅');
  const isWarning = connectionStatus.includes('⚠️');
  const wifiColor = isConnected ? '#28a745' : '#dc3545';
  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="hero-title">WELCOME TO NXL BEAUTY BAR </h1>
        
        {/* Connection Status Indicator */}
        <div style={{
          padding: '10px', 
          margin: '10px 0', 
         
          borderRadius: '5px',
          fontSize: '14px',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <span aria-hidden="true" style={{display:'inline-flex'}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 18.5c.9 0 1.5.6 1.5 1.5S12.9 21.5 12 21.5 10.5 20.9 10.5 20 11.1 18.5 12 18.5Zm-3.3-2.9c.8-.8 1.9-1.3 3.3-1.3s2.5.5 3.3 1.3c.3.3.3.8 0 1.1-.3.3-.8.3-1.1 0-.5-.5-1.2-.8-2.2-.8s-1.7.3-2.2.8c-.3.3-.8.3-1.1 0-.3-.3-.3-.8 0-1.1Zm-3.3-3.2C7.4 10.4 9.6 9.5 12 9.5s4.6.9 6.6 2.9c.3.3.3.8 0 1.1-.3.3-.8.3-1.1 0-1.7-1.7-3.6-2.5-5.5-2.5s-3.8.8-5.5 2.5c-.3.3-.8.3-1.1 0-.3-.3-.3-.8 0-1.1ZM12 3.5c3.2 0 6.2 1.2 8.8 3.8.3.3.3.8 0 1.1-.3.3-.8.3-1.1 0C17.6 6.3 14.9 5.5 12 5.5S6.4 6.3 4.3 8.4c-.3.3-.8.3-1.1 0-.3-.3-.3-.8 0-1.1C5.8 4.7 8.8 3.5 12 3.5Z" fill={wifiColor}/>
            </svg>
          </span>
        </div>
        
        <p className="hero-subtitle">READY TO GIVE YOUR NAILS THE CARE THEY DESERVE?</p>
        
        <div className="nail-artist-section">
          <div className="nail-text">
            <span className="nail-na">NA</span>
            <div className="artist-image">
              <img src={noxoloImage} alt="Nail Artist" />
            </div>
            <span className="nail-il">IL</span>
          </div>
          <div className="artist-signature">
            <span className="polished-by">Polished by</span>
            <span className="artist-name"><i>NXL BEAUTY BAR</i></span>
          </div>
        </div>
        
        <div className="location-bar nav-link" style={{cursor:'pointer'}} onClick={getUserLocationAndRedirect}>
          <span className="location-icon">📍</span>
          <span className="location-text">JOHANNESBURG</span>
        </div>
      </div>

      {/* About Section */}
      <div className="about-section">
        <h2 className="section-title">Say hello to your nail artist</h2>
        <div className="about-content">
          <p>
            Welcome to NXL Beauty Bar! We are passionate about creating beautiful, 
            long-lasting Nails and Lashes that makes you feel confident and beautiful. 
            With years of experience in the beauty industry, we specialize in 
            all kinds of manicures and Pedicures, and eyelashes. Every client receives 
            personalized attention and care to ensure the perfect result to your satisfaction.
          </p>
        </div>
      </div>

      {/* Services Preview */}
      <div className="services-preview">
        <h2 className="section-title">Our Services</h2>
        <div className="services-grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:'24px'}}>
          {/* Manicure card */}
          <div className="service-card" style={{cursor:'pointer', perspective:'1000px'}} onClick={() => flip('manicure')}>
            <div style={{position:'relative', height:'320px', transition:'transform 0.6s', transformStyle:'preserve-3d', transform: flipped.manicure ? 'rotateY(180deg)' : 'none'}}>
              {/* Front */}
              <div style={{position:'absolute', inset:0, backfaceVisibility:'hidden', background:'#fff', borderRadius:'16px', boxShadow:'0 8px 20px rgba(0,0,0,0.08)', padding:'20px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'space-between'}}>
                <div className="service-icon artist-image" style={{width:'180px', height:'180px', borderRadius:'50%', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
                  <img src={manicureImage} alt="Manicure" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                </div>
                <div style={{textAlign:'center'}}>
                  <h3>Manicure</h3>
                  <p>Long-lasting, chip-resistant polish</p>
                </div>
              </div>
              {/* Back */}
              <div style={{position:'absolute', inset:0, backfaceVisibility:'hidden', transform:'rotateY(180deg)', background:'#fff', borderRadius:'16px', boxShadow:'0 8px 20px rgba(0,0,0,0.08)', padding:'22px', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
                <h3 style={{marginBottom:'8px'}}>Manicure </h3>
                <ul style={{listStyle:'none', padding:0, margin:0, textAlign:'center'}}>
                  <li>Rubberbase</li>
                  <li>Acrylic</li>
                  <li>Polygel</li>
                </ul>
                <small style={{marginTop:'12px', color:'#777'}}></small>
              </div>
            </div>
          </div>

          {/* Pedicure card */}
          <div className="service-card" style={{cursor:'pointer', perspective:'1000px'}} onClick={() => flip('pedicure')}>
            <div style={{position:'relative', height:'320px', transition:'transform 0.6s', transformStyle:'preserve-3d', transform: flipped.pedicure ? 'rotateY(180deg)' : 'none'}}>
              {/* Front */}
              <div style={{position:'absolute', inset:0, backfaceVisibility:'hidden', background:'#fff', borderRadius:'16px', boxShadow:'0 8px 20px rgba(0,0,0,0.08)', padding:'20px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'space-between'}}>
                <div className="service-icon artist-image" style={{width:'180px', height:'180px', borderRadius:'50%', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
                  <img src={pedicureImage} alt="Pedicure" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                </div>
                <div style={{textAlign:'center'}}>
                  <h3>Pedicure</h3>
                  <p>Custom designs and patterns</p>
                </div>
              </div>
              {/* Back */}
              <div style={{position:'absolute', inset:0, backfaceVisibility:'hidden', transform:'rotateY(180deg)', background:'#fff', borderRadius:'16px', boxShadow:'0 8px 20px rgba(0,0,0,0.08)', padding:'22px', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
                <h3 style={{marginBottom:'8px'}}>Pedicure </h3>
                <ul style={{listStyle:'none', padding:0, margin:0, textAlign:'center'}}>
                  <li>Classic Pedicure</li>
                  <li>Basic Pedicure</li>
                  <li>Acrilic Pedi</li>
                  <li>French Pedi</li>
                </ul>
                <small style={{marginTop:'12px', color:'#777'}}></small>
              </div>
            </div>
          </div>

          {/* Lashes card */}
          <div className="service-card" style={{cursor:'pointer', perspective:'1000px'}} onClick={() => flip('lashes')}>
            <div style={{position:'relative', height:'320px', transition:'transform 0.6s', transformStyle:'preserve-3d', transform: flipped.lashes ? 'rotateY(180deg)' : 'none'}}>
              {/* Front */}
              <div style={{position:'absolute', inset:0, backfaceVisibility:'hidden', background:'#fff', borderRadius:'16px', boxShadow:'0 8px 20px rgba(0,0,0,0.08)', padding:'20px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'space-between'}}>
                <div className="service-icon artist-image" style={{width:'180px', height:'180px', borderRadius:'50%', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
                  <img src={eyelashesImage} alt="Eye Lashes" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                </div>
                <div style={{textAlign:'center'}}>
                  <h3>Eye Lashes</h3>
                  <p>Professional extensions</p>
                </div>
              </div>
              {/* Back */}
              <div style={{position:'absolute', inset:0, backfaceVisibility:'hidden', transform:'rotateY(180deg)', background:'#fff', borderRadius:'16px', boxShadow:'0 8px 20px rgba(0,0,0,0.08)', padding:'22px', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
                <h3 style={{marginBottom:'8px'}}>Eyelashes</h3>
                <ul style={{listStyle:'none', padding:0, margin:0, textAlign:'center'}}>
                  <li>Classic Set</li>
                  <li>Volume Set</li>
                  <li>Hybrid</li>
                </ul>
                <small style={{marginTop:'12px', color:'#777'}}></small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="navigation-section">
        <h2 className="section-title">Ready to book?</h2>
        <div className="navigation-links">
          <Link to="/signup" className="nav-link primary">Create Account</Link>
          <Link to="/login" className="nav-link secondary">Sign In</Link>
          <Link to="/dashboard" className="nav-link secondary">Dashboard </Link>
        </div>

      </div>

      {/* Contact Info */}
      <div className="contact-info">
        <div className="contact-item">
          <span className="contact-icon" aria-hidden="true" style={{display:'inline-flex'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="22" height="22" rx="5" fill="#1877F2"/>
              <path d="M13.2 9.3h1.8V6.8h-1.8c-1.9 0-3.1 1.2-3.1 3.1v1.6H9.1v2.5h1.9v6h2.8v-6h2l.5-2.5h-2.5V9.9c0-.4.2-.6.9-.6z" fill="#ffffff"/>
            </svg>
          </span>
          <span><a href="https://www.facebook.com/share/17g73Pcr9j/" target="_blank" rel="noopener noreferrer">
  Facebook
</a>
</span>
        </div>
        <div className="contact-item">
          <span className="contact-icon" aria-hidden="true" style={{display:'inline-flex'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="igGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f58529"/>
                  <stop offset="50%" stopColor="#dd2a7b"/>
                  <stop offset="100%" stopColor="#8134af"/>
                </linearGradient>
              </defs>
              <rect x="1" y="1" width="22" height="22" rx="5" fill="url(#igGrad)"/>
              <rect x="7" y="7" width="10" height="10" rx="5" fill="none" stroke="#fff" strokeWidth="2"/>
              <circle cx="16.5" cy="7.5" r="1.3" fill="#fff"/>
            </svg>
          </span>
          <span><a href="https://www.instagram.com/nxlbeauty?igsh=Z2tnOTl0OXdmdmxz" target="_blank" rel="noopener noreferrer">
  Instagram
</a>
</span>
        </div>
        <div className="contact-item">
          <span className="contact-icon" aria-hidden="true" style={{display:'inline-flex'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="22" height="22" rx="5" fill="#000"/>
              <path d="M9 7.5c1.7 0 3.2.9 4.1 2.3v6.7h-2v-4.2c-.6-.4-1.4-.6-2.1-.6-1.9 0-3.5 1.2-3.5 3.1 0 1.6 1.2 2.9 2.8 3.1-2.2-.2-4-2.1-4-4.4 0-2.5 2.1-4.4 4.7-4.4zM15 7.2c.7.3 1.3.8 1.8 1.4v6.9h-1.8V7.2z" fill="#fff"/>
            </svg>
          </span>
          <span ><a href="https://www.tiktok.com/@nxlbeautybar?_r=1&_t=ZS-91Q3zPzMphH" target="_blank" rel="noopener noreferrer">
   TikTok
</a>
</span>
        </div>
      </div>

      {/* Booking Policy Section (Dropdown) */}
      <div className="booking-policy-section" style={{margin: '3rem auto', maxWidth: '700px', background: 'rgba(255,247,242,0.95)', borderRadius: '18px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)', padding: '0', fontFamily: 'Montserrat, sans-serif'}}>
        <BookingPolicyDropdown />
      </div>
    </div>
  );
}

// Dropdown component
function BookingPolicyDropdown() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        style={{
          width: '100%',
          background: '#d17b7b',
          color: '#fff',
          fontWeight: 700,
          fontSize: '1.2rem',
          border: 'none',
          borderRadius: '18px',
          padding: '1rem',
          cursor: 'pointer',
          marginBottom: open ? '1.2rem' : '0.5rem',
          boxShadow: open ? '0 2px 16px rgba(4, 4, 4, 0.07)' : 'none',
          transition: 'all 0.2s'
        }}
        onClick={() => setOpen(o => !o)}
      >
        {open ? 'Hide Booking Policy ▲' : 'Show Booking Policy ▼'}
      </button>
      {open && (
        <div style={{padding: '2.5rem 2rem'}}>
          <h2 style={{fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: '2rem', color: '#d17b7b', marginBottom: '1.2rem'}}>Booking Policy</h2>
          <p style={{fontSize:'1.08rem', color:'#444', marginBottom:'1.2rem', textAlign:'left'}}>Due to clients not arriving on time and cancelling last minute, we have put this policy in place:</p>
          <ul style={{textAlign: 'left', fontSize: '1.08rem', color: '#222', lineHeight: '2', paddingLeft: '1.2rem'}}>
            <li style={{color:'#d17b7b', fontWeight:600}}>Check availability (date & time) on the App or WhatsApp for an appointment.</li>
            <li style={{color:'#d17b7b', fontWeight:600}}>Non-refundable deposit of R100 or full amount confirms appointment.</li>
            <li>Send proof of payment.</li>
            <li>Payment must reflect before appointment.</li>
            <li>No e-wallet or cash send, money to be deposited straight into account.</li>
            <li style={{color:'#d17b7b', fontWeight:600}}>NO KIDS ALLOWED AT THE SALON.</li>
            <li>No nail polish or extensions on nails unless soak off or buff off was included.</li>
            <li>If you have something on your nails, you will be charged full soak off price to remove them.</li>
            <li style={{color:'#d17b7b', fontWeight:600}}>WE STRICTLY WORK FROM 9AM TO 5PM. Appointments before/after will be charged R50 extra per person.</li>
            <li>R50 will be charged for every 15 minutes you are late by.</li>
            <li>30 minutes late, your appointment will be canceled.</li>
            <li>Cancellation only allowed 48 hours prior to appointment. Failure will incur a penalty fee of R100.</li>
            <li style={{color:'#d17b7b', fontWeight:600}}>NO CASH. NO PAYMENT, NO APPOINTMENT. NO REFUND.</li>
            <li style={{color:'#d17b7b', fontWeight:600}}>ONLY THE PERSON WITH AN APPOINTMENT WILL BE ALLOWED IN THE SALON.</li>
          </ul>
          <div style={{marginTop:'1.5rem', textAlign:'center'}}>
            <h3 style={{fontWeight:700, fontSize:'1.2rem', color:'#222'}}>BANKING DETAILS</h3>
            <div style={{fontSize:'1.15rem', fontWeight:600, color:'#d17b7b'}}>6307553452</div>
            <div style={{fontSize:'1.15rem', fontWeight:600, color:'#d17b7b'}}>FNB (NXLBEAUTYBAR)</div>
          </div>
          <div style={{marginTop:'1.2rem', textAlign:'center', fontSize:'1.1rem', color:'#444'}}>
            <span style={{marginRight:'1.2rem'}}><b>Instagram:</b> @nxlbeautybar</span>
            <span style={{marginRight:'1.2rem'}}><b>TikTok:</b> @nxlbeautybar</span>
            <span><b>Facebook:</b> nxlbeautybar</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;