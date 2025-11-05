import { useState, useEffect } from 'react';
import BookingSummary from './BookingSummary';
import { useAuth } from './AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { api } from './api.js';

function Dashboard() {
  // Pedicure types
  const pedicureTypes = [
    'Basic Pedicure',
    'French Pedicure',
    'Gel Pedicure',
    'Spa Pedicure',
    'Paraffin Pedicure',
    'Hot Stone Pedicure',
    'Fish Pedicure',
    'Mini Pedicure',
    'Athletic or Sports Pedicure',
    'Luxury/Deluxe Pedicure'
  ];
  const [selectedPedicureType, setSelectedPedicureType] = useState('');
  // Manicure types
  const manicureTypes = [
    'Basic manicure',
    'Classic gel manicure',
    'Hard gel manicure',
    'Acrylic full set',
    'Acrylic fill',
    'Acrylic overlay',
    'Full-coverage soft gel tips',
    'Polygel manicure',
    'Dip manicure',
    'Press-on manicure',
    'Shellac manicure',
    'Vinylux manicure'
  ];
  const [selectedManicureType, setSelectedManicureType] = useState('');
  const { user, logout, appointmentRefreshTrigger } = useAuth();
  const navigate = useNavigate();
  const [selectedServices, setSelectedServices] = useState([]);
  // Default to today's date if none selected
  const today = new Date();
  const defaultDay = today.getDate();
  const [selectedDate, setSelectedDate] = useState(defaultDay);
  const [selectedTime, setSelectedTime] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showSummary, setShowSummary] = useState(false);
  const [cellNumber, setCellNumber] = useState(user?.contactNumber || '');
  const [selectedEmployee, setSelectedEmployee] = useState('Noxolo');
  
  // Collapse state for each panel
  const [collapsedPanels, setCollapsedPanels] = useState({
    services: false,
    date: false,
    time: false,
    employee: false
  });

  // Load services from localStorage (admin-managed), fall back to defaults
  const [services, setServices] = useState([]);
  useEffect(() => {
      const saved = localStorage.getItem('services');
      if (saved) {
          try {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) {
                  // Convert admin services to user format if needed
                  setServices(parsed.map(s => ({
                      name: s.name,
                      duration: s.duration,
                      price: s.price
                  })));
                  return;
              }
          } catch (e) {
              // ignore JSON errors
          }
      }
      // Fallback defaults if nothing saved yet
      setServices([
          { name: 'Manicure', duration: 45, price: 150 },
          { name: 'Pedicure', duration: 20, price: 100 },
          { name: 'Lashes', duration: 30, price: 120 },
          { name: 'Tinting', duration: 20, price: 80 }
      ]);
  }, []);
  const timeSlots = {
    morning: [
      '09:00 am', '10:30 am'
    ],
    afternoon: [
      '12:00 pm', '01:30 pm', '03:00 pm', '04:30 pm'
    ]
  };

  const employees = [
    { name: 'Noxolo', email: 'nxlbeautybar@gmail.com', position: 'Stylist' },
    { name: 'Thandi', email: 'thandi@nxlbeautybar.com', position: 'Stylist' }
  ];

  // Change bookedSlots to state and include userName - now fetched from API
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  // Fetch appointments from API
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Listen for appointment refresh triggers from other components
  useEffect(() => {
    if (appointmentRefreshTrigger > 0) {
      fetchAppointments();
    }
  }, [appointmentRefreshTrigger]);

  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const result = await api.getAppointments();
      if (result.success) {
        // Get cancelled appointments from localStorage
        const cancelledAppointments = JSON.parse(localStorage.getItem('cancelledAppointments') || '[]');
        
        // Convert API appointments to dashboard format and filter out cancelled ones
        const formattedSlots = result.data
          .filter(appointment => !cancelledAppointments.includes(appointment._id)) // Exclude cancelled
          .map(appointment => ({
            date: appointment.date,
            time: appointment.time,
            userName: appointment.userName,
            serviceType: appointment.serviceIds ? 'Multiple Services' : 'Service',
            appointmentId: appointment._id
          }))
          .filter(slot => slot.time); // Filter out appointments without time
        setBookedSlots(formattedSlots);
      } else {
        console.error('Failed to fetch appointments:', result.error);
        // Keep some default data for demo purposes with new time slots
        setBookedSlots([
          { date: 'October 2025 7', time: '09:00 am', userName: 'Jane Doe', serviceType: 'Manicure' },
          { date: 'October 2025 8', time: '12:00 pm', userName: 'John Smith', serviceType: 'Pedicure' },
          { date: 'October 2025 9', time: '03:00 pm', userName: 'Mary Johnson', serviceType: 'Lashes' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const togglePanel = (panelName) => {
    setCollapsedPanels(prev => ({
      ...prev,
      [panelName]: !prev[panelName]
    }));
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleMonthChange = (direction) => {
    const newMonth = new Date(currentMonth);
    if (direction === 'next') {
      newMonth.setMonth(newMonth.getMonth() + 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() - 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleDateSelect = (day) => {
    if (day) {
      setSelectedDate(day);
    }
  };

  const handleServiceSelect = (service) => {
    setSelectedServices(prev => {
      if (prev.includes(service.name)) {
        // If deselecting Manicure or Pedicure, also clear selected type
        if (service.name === 'Manicure') setSelectedManicureType('');
        if (service.name === 'Pedicure') setSelectedPedicureType('');
        return prev.filter(s => s !== service.name);
      } else {
        return [...prev, service.name];
      }
    });
  };

  const handleBookAppointment = () => {
    if (selectedServices.length && selectedDate && selectedTime) {
      setShowSummary(true);
    } else {
      alert('Please select a service, date, and time');
    }
  };

  const handleCloseSummary = () => {
    setShowSummary(false);
  };

  const handleEditDateTime = () => {
    setShowSummary(false);
    // Optionally scroll to date/time selection
  };

  const isDateBooked = (date) => {
    const monthName = getMonthName(currentMonth);
    return bookedSlots.some(slot => slot.date === `${monthName} ${date}`);
  };

  const isTimeBooked = (date, time) => {
    const monthName = getMonthName(currentMonth);
    return bookedSlots.some(slot => slot.date === `${monthName} ${date}` && slot.time === time);
  };

  // Update booking confirmation callback to refresh appointments from API
  const handleBookingConfirmed = async (bookingInfo) => {
    // Immediately add to local state for instant feedback
    setBookedSlots(prev => [
      ...prev,
      {
        date: bookingInfo.date,
        time: bookingInfo.time,
        userName: bookingInfo.userName,
        serviceType: bookingInfo.serviceType || 'Service'
      }
    ]);

    // Refresh from API to get the most up-to-date data
    await fetchAppointments();
  };

  // Helper to get booked user name
  const getBookedUserName = (date, time) => {
    const monthName = getMonthName(currentMonth);
    const slot = bookedSlots.find(slot => slot.date === `${monthName} ${date}` && slot.time === time);
    return slot ? slot.userName : null;
  };

  // Helper to check if a slot is in the past
  const isPastSlot = (date, time) => {
    // date: e.g. "September 6, 2025"
    // time: e.g. "09:00 am"
    try {
      // Combine date and time into a single string
      const slotDateTimeStr = `${date}, ${time}`;
      // Parse using Date constructor
      const slotDate = new Date(slotDateTimeStr);
      const now = new Date();
      return slotDate < now;
    } catch (e) {
      return false;
    }
  };

  const isFutureOrPresentSlot = (date, time) => {
    try {
      const slotDateTimeStr = `${date}, ${time}`;
      const slotDate = new Date(slotDateTimeStr);
      const now = new Date();
      return slotDate >= now;
    } catch (e) {
      return false;
    }
  };

  // Helper to get all bookings for a time slot
  const getBookingsForSlot = (date, time) => {
    const monthName = getMonthName(currentMonth);
    const slotDate = `${monthName} ${date}`;
    return bookedSlots.filter(slot => slot.date === slotDate && slot.time === time && isFutureOrPresentSlot(slot.date, slot.time));
  };

  return (
    <div className="dashboard-container">
      <BookingSummary
        open={showSummary}
        onClose={handleCloseSummary}
        service={selectedServices.map(s => {
          const svc = services.find(x => x.name === s);
          return svc ? `${svc.name} (${svc.duration} min, R${svc.price})` : s;
        }).join(', ')}
        totalDuration={selectedServices.reduce((acc, s) => {
          const svc = services.find(x => x.name === s);
          return acc + (svc ? svc.duration : 0);
        }, 0)}
        totalPrice={selectedServices.reduce((acc, s) => {
          const svc = services.find(x => x.name === s);
          return acc + (svc ? svc.price : 0);
        }, 0)}
        dateTime={selectedDate && selectedTime ? `${getMonthName(currentMonth)} ${selectedDate}, ${selectedTime}` : ''}
        name={user?.firstName + ' ' + user?.lastName}
        email={user?.email}
        contactNumber={cellNumber}
        onEdit={handleEditDateTime}
        onContactNumberChange={setCellNumber}
        selectedServices={selectedServices}
        servicesList={services}
        selectedEmployee={selectedEmployee}
        employeesList={employees}
        selectedManicureType={selectedManicureType}
        selectedPedicureType={selectedPedicureType}
        onBookingConfirmed={handleBookingConfirmed}
      />
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>NXL Beauty Bar</h1>
        </div>
        <div className="header-right">
          <button 
            className="user-info" 
            onClick={handleProfileClick}
            style={{
              background: '',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <span className="user-icon">👤</span>
            <span className="user-name">{user?.firstName} {user?.lastName}</span>
          </button>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="welcome-section">
        <h2>Welcome!</h2>
        <p>Book your appointment in a few simple steps: Choose a service, pick your date and time. See you soon!</p>
      </div>

      {/* Main Booking Interface */}
      <div style={{fontWeight:400, fontSize:'1.08rem', margin:'1rem 0', textAlign:'left', color:'#888'}}>
         Time slots for:<br />
        <span style={{fontWeight:600, color:'#6c757d', fontSize:'1.13rem'}}>
          {getMonthName(currentMonth)} {selectedDate}
        </span>
      </div>
      <div className="booking-interface">
        {/* Services Panel */}
        <div className="booking-panel">
          <div className="panel-header" onClick={() => togglePanel('services')}>
            <h3>SERVICES</h3>
            <span className={`dropdown-arrow ${collapsedPanels.services ? 'collapsed' : ''}`}>
              {collapsedPanels.services ? '▶' : '▼'}
            </span>
          </div>
          {!collapsedPanels.services && (
            <div className="panel-content">
              {services.map((service, index) => (
                <div 
                  key={index}
                  className={`service-item ${selectedServices.includes(service.name) ? 'selected' : ''}`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <span className="service-name">{service.name}</span>
                  <span className="service-duration">{service.duration} min</span>
                  <span className="service-price">R{service.price}</span>
                </div>
              ))}
              {/* Manicure dropdown */}
              {selectedServices.includes('Manicure') && (
                <div style={{marginTop:'1rem'}}>
                  <label htmlFor="manicure-type" style={{fontWeight:600}}>Select Manicure Type:</label>
                  <select
                    id="manicure-type"
                    value={selectedManicureType}
                    onChange={e => setSelectedManicureType(e.target.value)}
                    style={{marginLeft:'0.7rem', padding:'0.4rem', borderRadius:'6px'}}
                  >
                    <option value="">-- Choose --</option>
                    {manicureTypes.map((type, idx) => (
                      <option key={idx} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              )}
              {/* Pedicure dropdown */}
              {selectedServices.includes('Pedicure') && (
                <div style={{marginTop:'1rem'}}>
                  <label htmlFor="pedicure-type" style={{fontWeight:600}}>Select Pedicure Type:</label>
                  <select
                    id="pedicure-type"
                    value={selectedPedicureType}
                    onChange={e => setSelectedPedicureType(e.target.value)}
                    style={{marginLeft:'0.7rem', padding:'0.4rem', borderRadius:'6px'}}
                  >
                    <option value="">-- Choose --</option>
                    {pedicureTypes.map((type, idx) => (
                      <option key={idx} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Date Selection Panel */}
        <div className="booking-panel">
          <div className="panel-header" onClick={() => togglePanel('date')}>
            <h3>SELECT DATE</h3>
            <div className="date-navigation">
              <button onClick={(e) => { e.stopPropagation(); handleMonthChange('prev'); }}>‹</button>
              <span>{getMonthName(currentMonth)}</span>
              <button onClick={(e) => { e.stopPropagation(); handleMonthChange('next'); }}>›</button>
            </div>
            <span className={`dropdown-arrow ${collapsedPanels.date ? 'collapsed' : ''}`}>
              {collapsedPanels.date ? '▶' : '▼'}
            </span>
          </div>
          {!collapsedPanels.date && (
            <div className="panel-content">
              <div className="calendar">
                <div className="calendar-header">
                  <span>Mo</span>
                  <span>Tu</span>
                  <span>We</span>
                  <span>Th</span>
                  <span>Fr</span>
                  <span>Sa</span>
                  <span>Su</span>
                </div>
                <div className="calendar-grid" style={{ position: 'relative' }}>
                  {loadingAppointments && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(255, 255, 255, 0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10,
                      borderRadius: '8px'
                    }}>
                      <div style={{ color: '#666', fontSize: '14px' }}>
                        Loading appointments...
                      </div>
                    </div>
                  )}
                  {getDaysInMonth(currentMonth).map((day, index) => (
                    <div 
                      key={index}
                      className={`calendar-day ${day ? 'available' : 'empty'} ${selectedDate === day ? 'selected' : ''}`}
                      onClick={() => day && handleDateSelect(day)}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Time Selection Panel */}
        <div className="booking-panel">
          <div className="panel-header" onClick={() => togglePanel('time')}>
            <h3>TIME SLOTS</h3>
            <span className={`dropdown-arrow ${collapsedPanels.time ? 'collapsed' : ''}`}>
              {collapsedPanels.time ? '▶' : '▼'}
            </span>
          </div>
          {!collapsedPanels.time && (
            <div className="panel-content">
              <div className="time-section">
                <h4>Morning</h4>
                <div className="time-slots">
                  {timeSlots.morning.map((time, index) => {
                    const bookings = getBookingsForSlot(selectedDate, time);
                    return (
                      <div key={index} className="time-slot-stack">
                        {/* Render all bookings for this slot */}
                        {bookings.map((booking, bIdx) => (
                          <div
                            key={bIdx}
                            className="time-slot booked"
                            title={`Booked by: ${booking.userName}\nService: ${booking.serviceType}\nTime: ${time}`}
                            style={{ 
                              background: '#ffe5e5', 
                              borderLeft: '4px solid #d17b7b', 
                              marginBottom: '4px', 
                              padding: '0.7rem 0.8rem', 
                              minHeight: '48px', 
                              display: 'flex', 
                              flexDirection: 'column', 
                              justifyContent: 'center',
                              cursor: 'not-allowed'
                            }}
                          >
                            <div style={{ fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {booking.userName?.length > 14 ? booking.userName.slice(0, 14) + '...' : booking.userName}
                            </div>
                            <div style={{ fontSize: '0.98rem', color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {booking.serviceType?.length > 18 ? booking.serviceType.slice(0, 18) + '...' : booking.serviceType || ''}
                            </div>
                          </div>
                        ))}
                        {/* If not booked, show slot as available */}
                        {bookings.length === 0 && (
                          <div
                            className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                            style={{ minHeight: '48px', display: 'flex', alignItems: 'center' }}
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="time-section">
                <h4>Afternoon</h4>
                <div className="time-slots">
                  {timeSlots.afternoon.map((time, index) => {
                    const bookings = getBookingsForSlot(selectedDate, time);
                    return (
                      <div key={index} className="time-slot-stack">
                        {bookings.map((booking, bIdx) => (
                          <div
                            key={bIdx}
                            className="time-slot booked"
                            title={`Booked by: ${booking.userName}\nService: ${booking.serviceType}\nTime: ${time}`}
                            style={{ 
                              background: '#ffe5e5', 
                              borderLeft: '4px solid #d17b7b', 
                              marginBottom: '4px', 
                              padding: '0.7rem 0.8rem', 
                              minHeight: '48px', 
                              display: 'flex', 
                              flexDirection: 'column', 
                              justifyContent: 'center',
                              cursor: 'not-allowed'
                            }}
                          >
                            <div style={{ fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {booking.userName?.length > 14 ? booking.userName.slice(0, 14) + '...' : booking.userName}
                            </div>
                            <div style={{ fontSize: '0.98rem', color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {booking.serviceType?.length > 18 ? booking.serviceType.slice(0, 18) + '...' : booking.serviceType || ''}
                            </div>
                          </div>
                        ))}
                        {bookings.length === 0 && (
                          <div
                            className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                            style={{ minHeight: '48px', display: 'flex', alignItems: 'center' }}
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
             
            </div>
          )}
        </div>

        {/* Employee Selection Panel */}
        <div className="booking-panel">
          <div className="panel-header" onClick={() => togglePanel('employee')}>
            <h3>SELECT STYLIST</h3>
            <span className={`dropdown-arrow ${collapsedPanels.employee ? 'collapsed' : ''}`}>
              {collapsedPanels.employee ? '▶' : '▼'}
            </span>
          </div>
          {!collapsedPanels.employee && (
            <div className="panel-content">
              {employees.map((emp, idx) => (
                <div
                  key={idx}
                  className={`employee-item ${selectedEmployee === emp.name ? 'selected' : ''}`}
                  onClick={() => setSelectedEmployee(emp.name)}
                  style={{padding:'0.7rem', margin:'0.3rem 0', borderRadius:'8px', cursor:'pointer', background:selectedEmployee===emp.name?'#ffe5e5':'#fff'}}
                >
                  <span style={{fontWeight:600}}>{emp.name}</span> <span style={{color:'#888', marginLeft:'0.7rem'}}>{emp.position}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Book Appointment Button */}
      <div className="booking-actions">
        <button 
          className="book-appointment-btn"
          onClick={handleBookAppointment}
        >
          BOOK APPOINTMENT
        </button>
      </div>

      {/* Navigation */}
      <div className="dashboard-navigation">
        <button onClick={handleLogout} className="logout-button">
          Sign Out
        </button>
        <Link to="/" className="back-home-link">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;