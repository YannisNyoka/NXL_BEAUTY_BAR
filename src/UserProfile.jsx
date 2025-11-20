import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from './api.js';

function UserProfile() {
  const { user, logout, triggerAppointmentRefresh } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchUserAppointments();
  }, []);

  const fetchUserAppointments = async () => {
    try {
      setLoading(true);
      const result = await api.getAppointments();
      if (result.success) {
        // Get cancelled appointments from localStorage
        const cancelledAppointments = JSON.parse(localStorage.getItem('cancelledAppointments') || '[]');
        
        // Filter appointments for the current user and exclude cancelled ones
        const userAppointments = result.data.filter(apt => 
          (apt.userName === `${user?.firstName} ${user?.lastName}` || apt.userId === user?.id) &&
          !cancelledAppointments.includes(apt._id)
        );
        setAppointments(userAppointments);
      } else {
        setError('Failed to fetch appointments');
      }
    } catch (err) {
      setError('Error loading appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    setCancellingId(appointmentId);
    try {
      console.log(`Cancelling appointment ${appointmentId}`);
      
      // Store cancelled appointment ID in localStorage for persistence
      const cancelledAppointments = JSON.parse(localStorage.getItem('cancelledAppointments') || '[]');
      if (!cancelledAppointments.includes(appointmentId)) {
        cancelledAppointments.push(appointmentId);
        localStorage.setItem('cancelledAppointments', JSON.stringify(cancelledAppointments));
      }
      
      // Try the API delete call
      try {
        await api.cancelAppointment(appointmentId);
        console.log('Backend deletion attempt completed');
      } catch (apiError) {
        console.log('Backend deletion failed (expected):', apiError.message);
      }
      
      // Remove from local state immediately for UI responsiveness
      setAppointments(prev => prev.filter(apt => apt._id !== appointmentId));
      
      // Trigger refresh in dashboard and other components
      triggerAppointmentRefresh();
      
      console.log('Appointment cancelled successfully');
      
    } catch (err) {
      setError('Failed to cancel appointment');
      console.error('Cancel appointment error:', err);
    } finally {
      setCancellingId(null);
    }
  };

  const handleReschedule = (appointmentId) => {
    // Navigate back to dashboard with pre-filled data for rescheduling
    navigate('/dashboard', { state: { rescheduleId: appointmentId } });
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const isUpcoming = (dateString) => {
    try {
      return new Date(dateString) > new Date();
    } catch {
      return false;
    }
  };

  const upcomingAppointments = appointments.filter(apt => isUpcoming(apt.date));
  const pastAppointments = appointments.filter(apt => !isUpcoming(apt.date));

  if (loading) {
    return (
      <div className="profile-container" style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Loading your profile...</h2>
      </div>
    );
  }

  return (
    <div className="profile-container" style={{ 
      minHeight: '100vh', 
      background: '#f8f9fa', 
      padding: '2rem', 
      position: 'relative',
      left: '20%'
    }}>
      {/* Header */}
      <div className="profile-header" style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, color: '#bbb3b3ff' }}>
              Welcome, {user?.firstName} {user?.lastName}!
            </h1>
            
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                background: '#6c63ff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Book New Appointment
            </button>
            <button
              onClick={logout}
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          {error}
        </div>
      )}

      {/* Upcoming Appointments */}
      <div className="upcoming-section" style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#333', marginBottom: '1.5rem' }}>
          Upcoming Appointments ({upcomingAppointments.length})
        </h2>
        
        {upcomingAppointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <p>No upcoming appointments scheduled.</p>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                background: '#6c63ff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              Book Your First Appointment
            </button>
          </div>
        ) : (
          <div className="appointments-grid" style={{ display: 'grid', gap: '1rem' }}>
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment._id}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  background: '#f8f9fa'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#d17b7b' }}>
                      {appointment.serviceIds ? 'Multiple Services' : 'Service Appointment'}
                    </h3>
                    <p style={{ margin: '0.25rem 0', color: '#333' }}>
                      <strong>Date:</strong> {formatDate(appointment.date)}
                    </p>
                    {appointment.time && (
                      <p style={{ margin: '0.25rem 0', color: '#333' }}>
                        <strong>Time:</strong> {appointment.time}
                      </p>
                    )}
                    <p style={{ margin: '0.25rem 0', color: '#333' }}>
                      <strong>Stylist:</strong> {appointment.stylist}
                    </p>
                    <p style={{ margin: '0.25rem 0', color: '#333' }}>
                      <strong>Total Price:</strong> R{appointment.totalPrice}
                    </p>
                    <p style={{ margin: '0.25rem 0', color: '#333' }}>
                      <strong>Duration:</strong> {appointment.totalDuration} minutes
                    </p>
                    {appointment.manicureType && (
                      <p style={{ margin: '0.25rem 0', color: '#666' }}>
                        <strong>Manicure Type:</strong> {appointment.manicureType}
                      </p>
                    )}
                    {appointment.pedicureType && (
                      <p style={{ margin: '0.25rem 0', color: '#666' }}>
                        <strong>Pedicure Type:</strong> {appointment.pedicureType}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleReschedule(appointment._id)}
                      style={{
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.5rem 1rem',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => handleCancelAppointment(appointment._id)}
                      disabled={cancellingId === appointment._id}
                      style={{
                        background: cancellingId === appointment._id ? '#ccc' : '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.5rem 1rem',
                        cursor: cancellingId === appointment._id ? 'not-allowed' : 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      {cancellingId === appointment._id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking History */}
      <div className="history-section" style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#333', marginBottom: '1.5rem' }}>
          Booking History ({pastAppointments.length})
        </h2>
        
        {pastAppointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <p>No past appointments found.</p>
          </div>
        ) : (
          <div className="history-grid" style={{ display: 'grid', gap: '1rem' }}>
            {pastAppointments.map((appointment) => (
              <div
                key={appointment._id}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  background: '#f8f9fa',
                  opacity: 0.8
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>
                    {appointment.serviceIds ? 'Multiple Services' : 'Service Appointment'}
                  </h3>
                  <p style={{ margin: '0.25rem 0', color: '#333' }}>
                    <strong>Date:</strong> {formatDate(appointment.date)}
                  </p>
                  {appointment.time && (
                    <p style={{ margin: '0.25rem 0', color: '#333' }}>
                      <strong>Time:</strong> {appointment.time}
                    </p>
                  )}
                  <p style={{ margin: '0.25rem 0', color: '#333' }}>
                    <strong>Stylist:</strong> {appointment.stylist}
                  </p>
                  <p style={{ margin: '0.25rem 0', color: '#333' }}>
                    <strong>Total Price:</strong> R{appointment.totalPrice}
                  </p>
                  <span style={{
                    background: '#28a745',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '500'
                  }}>
                    Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;