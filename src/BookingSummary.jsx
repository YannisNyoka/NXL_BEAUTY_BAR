import React, { useState } from 'react';
import './BookingSummary.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { api } from './api.js';

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
  const { user, triggerAppointmentRefresh } = useAuth();
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
      // 1. Save user (signup) - split name into firstName and lastName
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || 'Customer';
      
      const userPayload = { 
        firstName, 
        lastName, 
        email, 
        password: 'TempPass123!' // Temporary password for booking users
      };
      console.log('Signup payload:', userPayload);
      
      const userResult = await api.signup(userPayload);
      console.log('Signup result:', userResult);
      
      if (!userResult.success) {
        console.log('Signup failed:', userResult.error);
        // Continue with booking even if user already exists
      }
      
      const userId = userResult.data?.userId || 'temp-user-id';

      // Parse dateTime to extract date and time separately
      let appointmentDate = dateTime || '';
      let appointmentTime = '';
      
      if (dateTime) {
        // dateTime format: "October 2025 7, 09:00 am"
        const parts = dateTime.split(', ');
        if (parts.length === 2) {
          appointmentDate = parts[0]; // "October 2025 7"
          appointmentTime = parts[1]; // "09:00 am"
        }
      }

      // 2. Create appointment with separate date and time fields
      const appointmentPayload = {
        userId: userId,
        serviceNames: selectedServices, // Pass service names instead of IDs
        date: appointmentDate,
        time: appointmentTime, // Add separate time field
        userName: name,
        contactNumber: localContact,
        stylist: selectedEmployee,
        totalPrice: totalPrice,
        totalDuration: totalDuration,
        manicureType: selectedManicureType,
        pedicureType: selectedPedicureType
      };
      console.log('Appointment payload:', appointmentPayload);
      
      const appointmentResult = await api.createAppointment(appointmentPayload);
      console.log('Appointment result:', appointmentResult);
      
      if (!appointmentResult.success) {
        throw new Error(appointmentResult.error || 'Failed to create appointment');
      }
      
      const appointmentId = appointmentResult.data?.appointmentId;
      
      if (!appointmentId) {
        throw new Error('Failed to get appointment ID');
      }

      // 3. Create payment for the appointment
      const paymentPayload = {
        appointmentId,
        amount: totalPrice,
        paymentMethod: 'card',
        status: 'paid'
      };
      console.log('Payment payload:', paymentPayload);
      
      const paymentResult = await api.createPayment(paymentPayload);
      console.log('Payment result:', paymentResult);
      
      if (!paymentResult.success) {
        console.warn('Payment creation failed:', paymentResult.error);
      }

      // Success!
      setApiSuccess('Booking details saved! Proceed to payment.');
      navigate('/payment', {
        state: {
          name: name,
          dateTime: dateTime,
          appointmentId: appointmentId,
          appointmentDate: appointmentDate,
          appointmentTime: appointmentTime,
          selectedServices: selectedServices,
          selectedEmployee: selectedEmployee,
          totalPrice: totalPrice,
          totalDuration: totalDuration,
          contactNumber: localContact
        }
      });

      if (onClose) onClose();
      if (onBookingConfirmed) {
        let appointmentDate = '', appointmentTime = '';
        if (dateTime) {
          const parts = dateTime.split(', ');
          appointmentDate = parts[0]?.trim() || '';
          appointmentTime = parts[1]?.trim() || '';
        }
        onBookingConfirmed({
          date: appointmentDate,
          time: appointmentTime,
          userName: name
        });
      }

      // Trigger appointment refresh across all components
      triggerAppointmentRefresh();
      
    } catch (err) {
      console.error('Booking failed:', err);
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
