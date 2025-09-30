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
  useEffect(() => {
    // Test backend connection and fetch data
    const testConnectionAndFetchData = async () => {
      // Test connection first
      const pingResult = await api.ping();
      if (pingResult.success) {
        console.log('✅ Backend connection successful:', pingResult.data);
        
        // Fetch users data
        const usersResult = await api.getUsers();
        if (usersResult.success) {
          console.log('✅ Users data:', usersResult.data);
        } else {
          console.error('❌ Failed to fetch users:', usersResult.error);
        }
      } else {
        console.error('❌ Backend connection failed:', pingResult.error);
        console.log('Make sure your backend server is running on http://localhost:3001');
      }
    };
    
    testConnectionAndFetchData();
  }, []);
  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="hero-title">WELCOME TO NXL BEAUTY BAR BOOKING SITE</h1>
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
            <span className="polished-by">polished by</span>
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
        <h2 className="section-title">say hello to your nail artist</h2>
        <div className="about-content">
          <p>
            Welcome to NXL Beauty Bar creations! We are passionate about creating beautiful, 
            long-lasting nails that makes you feel confident and beautiful. 
            With years of experience in the beauty industry, we specialize in 
            all kinds of manicures and Pedicures, and eyelashes. Every client receives 
            personalized attention and care to ensure the perfect result to your satisfaction.
          </p>
        </div>
      </div>

      {/* Services Preview */}
      <div className="services-preview">
        <h2 className="section-title">our services</h2>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon artist-image">
              <img src= {manicureImage}/>
            </div>
            <h3> Manicure</h3>
            <p>Long-lasting, chip-resistant polish</p>
          </div>
          <div className="service-card">
            <div className="service-icon artist-image">
              <img src={pedicureImage}/></div>
            <h3>Pedicure</h3>
            <p>Custom designs and patterns</p>
          </div>
          <div className="service-card">
            <div className="service-icon artist-image">
              <img src={eyelashesImage}/>
              </div>
            <h3>Eye Lashes</h3>
            <p>Professional acrylic extensions</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="navigation-section">
        <h2 className="section-title">ready to book?</h2>
        <div className="navigation-links">
          <Link to="/signup" className="nav-link primary">Create Account</Link>
          <Link to="/login" className="nav-link secondary">Sign In</Link>
          <Link to="/dashboard" className="nav-link secondary">Dashboard </Link>
        </div>
      </div>

      {/* Contact Info */}
      <div className="contact-info">
        <div className="contact-item">
          <span className="contact-icon">📞</span>
          <span>(+27)68 511-3394</span>
        </div>
        <div className="contact-item">
          <span className="contact-icon">📧</span>
          <span>NXLBEAUTYBAR@GMAIL.COM</span>
        </div>
        <div className="contact-item">
          <span className="contact-icon">📱</span>
          <span>@nxlbeauty</span>
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
          boxShadow: open ? '0 2px 16px rgba(0,0,0,0.07)' : 'none',
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