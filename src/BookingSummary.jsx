import React, { useState } from 'react';
import './BookingSummary.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const BookingSummary = ({
  open,
  onClose,
  service,
  totalDuration,
  totalPrice,
  dateTime,
  name,
  contactNumber,
  onEdit,
  onContactNumberChange,
  selectedServices = [],
  servicesList = [],
  selectedEmployee = 'Noxolo',
  employeesList = [],
  selectedManicureType = '',
  selectedPedicureType = '',
  onBookingConfirmed // <-- add this
}) => {
  const [localContact, setLocalContact] = useState(contactNumber || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const navigate = useNavigate();
  if (!open) return null;

  // Get credentials from user context or prompt
  const { user } = useAuth();
  const email = user?.email;
  const password = user?.rawPassword; // You must store raw password on login/signup for this to work
  const authHeader = email && password ? { 'Authorization': 'Basic ' + btoa(email + ':' + password) } : {};

  const handleContactChange = (e) => {
    setLocalContact(e.target.value);
    if (onContactNumberChange) onContactNumberChange(e.target.value);
  };

  const handleConfirm = async () => {
    if (!localContact.trim()) {
      setError('Please enter your contact number before confirming.');
      return;
    }
    setError('');
    setLoading(true);
    setApiError('');
    setApiSuccess('');
    try {
      // 1. Save user (signup)
      const userPayload = { name, email, contactNumber: localContact };
      console.log('Signup payload:', userPayload);
  const API_URL = process.env.REACT_APP_API_URL;
  const userRes = await fetch(`${API_URL}/api/user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPayload)
      });
      console.log('Signup response status:', userRes.status);
      let userJson = {};
      try {
        userJson = await userRes.json();
      } catch (e) {
        console.log('Signup response parse error:', e);
      }
        console.log('Signup response body:', userJson);
        const userId = userJson.userId;

        // 2. Save each selected service and collect IDs
        const serviceIds = [];
        for (const svcName of selectedServices) {
          const svcObj = servicesList.find(s => s.name === svcName);
          if (!svcObj) continue;
          const servicePayload = {
            name: svcObj.name,
            price: svcObj.price,
            duration: svcObj.duration,
            stylist: selectedEmployee,
            userName: name,
            date: dateTime,
            time: dateTime
          };
          console.log('Service payload:', servicePayload);
          const svcRes = await fetch(`${API_URL}/api/services`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(servicePayload)
          });
          console.log('Service response status:', svcRes.status);
          let svcJson = {};
          try {
            svcJson = await svcRes.json();
          } catch (e) {
            console.log('Service response parse error:', e);
          }
          console.log('Service response body:', svcJson);
          const serviceId = svcJson.serviceId;
          serviceIds.push(serviceId);
        }

        // 3. Save selected employee/stylist
        const empObj = employeesList.find(e => e.name === selectedEmployee) || employeesList[0];
        const employeePayload = {
          name: empObj.name,
          email: empObj.email,
          phone: empObj.phone || '',
          position: empObj.position || 'Stylist',
          salary: empObj.salary || 0
        };
        console.log('Employee payload:', employeePayload);
  const employeeRes = await fetch(`${API_URL}/api/employees`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employeePayload)
        });
        console.log('Employee response status:', employeeRes.status);
        let employeeJson = {};
        try {
          employeeJson = await employeeRes.json();
        } catch (e) {
          console.log('Employee response parse error:', e);
        }
        console.log('Employee response body:', employeeJson);
        const employeeId = employeeJson.employeeId;

        // 4. Save appointment with all required fields
        const appointmentPayload = {
          userId: userId || '',
          serviceIds: Array.isArray(serviceIds) ? serviceIds : [],
          date: dateTime || '',
          userName: name,
          contactNumber: localContact,
          stylist: selectedEmployee,
          totalPrice,
          totalDuration,
          manicureType: selectedManicureType,
          pedicureType: selectedPedicureType
        };
        console.log('Appointment payload:', appointmentPayload);
  const appointmentRes = await fetch(`${API_URL}/api/appointments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appointmentPayload)
        });
        console.log('Appointment response status:', appointmentRes.status);
        let appointmentJson = {};
        try {
          appointmentJson = await appointmentRes.json();
        } catch (e) {
          console.log('Appointment response parse error:', e);
        }
        console.log('Appointment response body:', appointmentJson);
        const appointmentId = appointmentJson.appointmentId;
        if (!appointmentId) {
          console.error('Appointment creation failed, not posting payment.');
        } else {
          // 5. Save payment linked to appointment
          const paymentPayload = {
            appointmentId,
            amount: totalPrice,
            paymentMethod: 'card',
            status: 'paid'
          };
          console.log('Payment payload:', paymentPayload);
          const paymentRes = await fetch(`${API_URL}/api/payments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentPayload)
          });
          console.log('Payment response status:', paymentRes.status);
          let paymentJson = {};
          try {
            paymentJson = await paymentRes.json();
          } catch (e) {
            console.log('Payment response parse error:', e);
          }
          console.log('Payment response body:', paymentJson);
        }

        setApiSuccess('Booking details saved! Proceed to payment.');
        navigate('/payment', { state: { name, dateTime, appointmentId } });
        if (onClose) onClose();

        // Notify Dashboard to update bookedSlots
        if (onBookingConfirmed) {
          // Parse date and time from dateTime string
          // Example: "September 2, 2025, 09:00 am"
          let date = '';
          let time = '';
          if (dateTime) {
            const parts = dateTime.split(',');
            date = parts[0].trim();
            time = parts[1] ? parts[1].trim() : '';
          }
          onBookingConfirmed({
            date,
            time,
            userName: name
          });
        }
      } catch (err) {
        setApiError('Failed to save booking. Please try again.');
      } finally {
        setLoading(false);
      }
  };

  return (
    <div className="booking-summary-modal">
      <div className="booking-summary-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>Booking Summary</h2>
        <div className="summary-section">
          <div className="service-box">
            <span className="service-initial">C</span>
            <div className="service-details">
              <strong>Services: {service}</strong>
              {selectedServices.includes('Manicure') && selectedManicureType && (
                <div style={{marginTop:'0.3rem'}}><strong>Manicure Type:</strong> {selectedManicureType}</div>
              )}
              {selectedServices.includes('Pedicure') && selectedPedicureType && (
                <div style={{marginTop:'0.3rem'}}><strong>Pedicure Type:</strong> {selectedPedicureType}</div>
              )}
              <div>Total Duration: {totalDuration} min</div>
              <div>Total Price: R{totalPrice}</div>
            </div>
          </div>
          <div className="date-time-row">
            <span className="date-icon">📅</span>
            <span>{dateTime}</span>
            <button className="edit-btn" onClick={onEdit}>Edit: Time and Date</button>
          </div>
        </div>
        <div className="details-section">
          <h4>Please enter your details</h4>
          <div><strong>Name:</strong> {name}</div>
          <div><strong>Email:</strong> {email}</div>
          <div><strong>Stylist:</strong> {selectedEmployee}</div>
          <div style={{marginTop: '0.5rem'}}>
            <strong >Contact Number:</strong>
            <input
              type="tel"
              value={localContact}
              onChange={handleContactChange}
              placeholder="Enter your cellphone number"
              style={{marginLeft: '0.5rem', padding: '0.3rem', borderRadius: '4px', border: '1px solid #ccc'}}
            />
          </div>
          <div style={{color:'red', marginTop:'0.5rem', fontWeight:500}}>{error || apiError}</div>
          {apiSuccess && <div style={{color:'green', marginTop:'0.5rem', fontWeight:500}}>{apiSuccess}</div>}
        </div>
        <button className="confirm-btn" onClick={handleConfirm} disabled={loading}>
          {loading ? 'Saving...' : 'Confirm Appointment'}
        </button>
      </div>
    </div>
  );
};

export default BookingSummary;
