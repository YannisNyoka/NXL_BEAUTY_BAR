import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { api } from './api';

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('adminActiveTab') || 'dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Persist active tab selection across refreshes
  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);
  
  // Appointments state
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  
  // Services state
  const [services, setServices] = useState([
    { id: 1, name: 'Manicure', duration: 45, price: 150 },
    { id: 2, name: 'Pedicure', duration: 20, price: 100 },
    { id: 3, name: 'Lashes', duration: 30, price: 120 },
    { id: 4, name: 'Tinting', duration: 20, price: 80 }
  ]);
  const [editingService, setEditingService] = useState(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceForm, setServiceForm] = useState({ name: '', duration: '', price: '' });
  
  // Persist services to localStorage and hydrate on load
  const servicesInitializedRef = useRef(false);
  
  useEffect(() => {
    const saved = localStorage.getItem('services');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setServices(parsed);
        }
      } catch (e) {
        // ignore JSON errors
      }
    }
    servicesInitializedRef.current = true;
  }, []);
  
  useEffect(() => {
    if (servicesInitializedRef.current) {
      localStorage.setItem('services', JSON.stringify(services));
    }
  }, [services]);
  
  // Unavailable dates/time slots state
  const [unavailableSlots, setUnavailableSlots] = useState([]);
  const [showUnavailableForm, setShowUnavailableForm] = useState(false);

  const [unavailableForm, setUnavailableForm] = useState({ date: '', time: '', reason: '', stylist: 'All', status: 'unavailable' });
  const unavailabilityInitializedRef = useRef(false);

  // Admin availability selection panels state
  const [adminCurrentMonth, setAdminCurrentMonth] = useState(new Date());
  const [adminSelectedDate, setAdminSelectedDate] = useState(null);
  const [adminSelectedTime, setAdminSelectedTime] = useState('');
  const timeSlots = {
    morning: ['09:00 am', '10:30 am'],
    afternoon: ['12:00 pm', '01:30 pm', '03:00 pm', '04:30 pm']
  };

  // Parse "October 2025 7" + "09:00 am" or "13:30" into a Date
  const parseTimeString = (timeStr) => {
    try {
      if (!timeStr) return { hours: 0, minutes: 0 };
      const ts = String(timeStr).trim().toLowerCase();
      let hours = 0;
      let minutes = 0;
      if (ts.includes('am') || ts.includes('pm')) {
        const [hm, suffix] = ts.split(' ').map(s => s.trim());
        const [h, m] = hm.split(':');
        hours = parseInt(h, 10) || 0;
        minutes = parseInt(m, 10) || 0;
        if (suffix === 'pm' && hours < 12) hours += 12;
        if (suffix === 'am' && hours === 12) hours = 0;
      } else {
        const [h, m] = ts.split(':');
        hours = parseInt(h, 10) || 0;
        minutes = parseInt(m, 10) || 0;
      }
      return { hours, minutes };
    } catch {
      return { hours: 0, minutes: 0 };
    }
  };

  const parseSlotDateTime = (slot) => {
    try {
      const dateStr = String(slot?.date || '').trim();
      const parts = dateStr.split(' '); // e.g., ['October', '2025', '7']
      if (parts.length < 3) return new Date(0);
      const [month, year, day] = parts;
      const base = new Date(`${month} ${day}, ${year}`);
      if (isNaN(base.getTime())) return new Date(0);

      if (slot?.time) {
        const { hours, minutes } = parseTimeString(slot.time);
        base.setHours(hours, minutes, 0, 0);
      } else {
        // If no time, expire only after the day ends
        base.setHours(23, 59, 59, 999);
      }
      return base;
    } catch {
      return new Date(0);
    }
  };

  const pruneExpiredUnavailableSlots = (slots) => {
    const now = new Date();
    return (Array.isArray(slots) ? slots : []).filter((s) => {
      const dt = parseSlotDateTime(s);
      return dt.getTime() >= now.getTime();
    });
  };

  const adminGetDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
    return days;
  };

  const adminGetMonthName = (date) => date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const adminHandleMonthChange = (direction) => {
    const next = new Date(adminCurrentMonth);
    next.setMonth(next.getMonth() + (direction === 'next' ? 1 : -1));
    setAdminCurrentMonth(next);
  };

  const adminHandleDateSelect = (day) => {
    if (!day) return;
    setAdminSelectedDate(day);
    setUnavailableForm(prev => ({ ...prev, date: `${adminGetMonthName(adminCurrentMonth)} ${day}` }));
  };

  const adminHandleTimeSelect = (time) => {
    setAdminSelectedTime(time);
    setUnavailableForm(prev => ({ ...prev, time }));
  };
  
  useEffect(() => {
    try {
      const savedUnavailability = localStorage.getItem('unavailableSlots');
      let parsed = [];
      if (savedUnavailability) {
        parsed = JSON.parse(savedUnavailability);
      }
      const pruned = pruneExpiredUnavailableSlots(parsed);
      setUnavailableSlots(pruned);
      if (Array.isArray(parsed) && pruned.length !== parsed.length) {
        localStorage.setItem('unavailableSlots', JSON.stringify(pruned));
      }
    } catch {}
    unavailabilityInitializedRef.current = true;
  }, []);
  
  useEffect(() => {
    if (unavailabilityInitializedRef.current) {
      localStorage.setItem('unavailableSlots', JSON.stringify(unavailableSlots));
    }
  }, [unavailableSlots]);

  // Periodically prune expired slots
  useEffect(() => {
    const interval = setInterval(() => {
      setUnavailableSlots(prev => {
        const pruned = pruneExpiredUnavailableSlots(prev);
        if (pruned.length !== prev.length) {
          localStorage.setItem('unavailableSlots', JSON.stringify(pruned));
        }
        return pruned;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'unavailableSlots') {
        try {
          const parsed = JSON.parse(e.newValue || '[]');
          if (Array.isArray(parsed)) {
            setUnavailableSlots(pruneExpiredUnavailableSlots(parsed));
          }
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  
  // Stats state
  const [stats, setStats] = useState({
    totalBookings: 0,
    cancellations: 0,
    totalRevenue: 0,
    upcomingAppointments: 0
  });
  
  // Check if user is admin
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/login');
    }
  }, [navigate]);
  
  // Fetch appointments on component mount
  useEffect(() => {
    fetchAppointments();
  }, []);
  
  // Calculate stats whenever appointments change
  useEffect(() => {
    calculateStats();
  }, [appointments]);
  
  // Handle window resize for mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const result = await api.getAppointments();
      if (result.success) {
        // Format appointments from API
        const formattedAppointments = result.data.map(appt => ({
          id: appt._id,
          date: appt.date,
          time: appt.time,
          clientName: appt.userName || appt.clientName || 'Unknown',
          services: appt.serviceIds || ['Service'],
          status: 'confirmed',
          totalPrice: appt.totalPrice || 0
        }));
        setAppointments(formattedAppointments);
      } else {
        // Use mock data if API fails
        setAppointments([
          {
            id: 1,
            date: 'October 2025 7',
            time: '09:00 am',
            clientName: 'Jane Doe',
            services: ['Manicure', 'Lashes'],
            status: 'confirmed',
            totalPrice: 270
          },
          {
            id: 2,
            date: 'October 2025 8',
            time: '12:00 pm',
            clientName: 'John Smith',
            services: ['Pedicure'],
            status: 'confirmed',
            totalPrice: 100
          },
          {
            id: 3,
            date: 'October 2025 9',
            time: '03:00 pm',
            clientName: 'Mary Johnson',
            services: ['Tinting'],
            status: 'confirmed',
            totalPrice: 80
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };
  
  const calculateStats = () => {
    const cancelledCount = JSON.parse(localStorage.getItem('cancelledAppointments') || '[]').length;
    const totalBookings = appointments.length;
    const totalRevenue = appointments.reduce((sum, apt) => sum + (apt.totalPrice || 0), 0);
    
    // Count upcoming appointments (future dates)
    const today = new Date();
    const upcoming = appointments.filter(apt => {
      try {
        const aptDate = new Date(apt.date);
        return aptDate >= today;
      } catch {
        return false;
      }
    }).length;
    
    setStats({
      totalBookings,
      cancellations: cancelledCount,
      totalRevenue,
      upcomingAppointments: upcoming
    });
  };
  
  const handleServiceAdd = (e) => {
    e.preventDefault();
    if (editingService) {
      // Edit existing service
      setServices(services.map(s => 
        s.id === editingService.id 
          ? { ...s, name: serviceForm.name, duration: parseInt(serviceForm.duration), price: parseInt(serviceForm.price) }
          : s
      ));
      setEditingService(null);
    } else {
      // Add new service
      const newService = {
        id: Date.now(),
        name: serviceForm.name,
        duration: parseInt(serviceForm.duration),
        price: parseInt(serviceForm.price)
      };
      setServices([...services, newService]);
    }
    setShowServiceForm(false);
    setServiceForm({ name: '', duration: '', price: '' });
  };
  
  const handleServiceEdit = (service) => {
    setEditingService(service);
    setServiceForm({ name: service.name, duration: service.duration, price: service.price });
    setShowServiceForm(true);
  };
  
  const handleServiceDelete = (id) => {
    if (confirm('Are you sure you want to delete this service?')) {
      setServices(services.filter(s => s.id !== id));
    }
  };
  
  const handleUnavailableSave = () => {
    const dateStr = adminSelectedDate ? `${adminGetMonthName(adminCurrentMonth)} ${adminSelectedDate}` : unavailableForm.date;
    const timeStr = adminSelectedTime || unavailableForm.time;

    if (!dateStr || !timeStr) {
      alert('Please select a date and time first.');
      return;
    }

    const newSlot = {
      id: Date.now(),
      date: dateStr,
      time: timeStr,
      reason: unavailableForm.reason,
      stylist: unavailableForm.stylist || 'All',
      status: unavailableForm.status || 'unavailable'
    };

    const updated = pruneExpiredUnavailableSlots([...unavailableSlots, newSlot]);
    setUnavailableSlots(updated);
    // Immediate persistence to prevent loss on refresh
    localStorage.setItem('unavailableSlots', JSON.stringify(updated));

    // Clear inline selection
    setUnavailableForm({ date: '', time: '', reason: '', stylist: 'All', status: 'unavailable' });
    setAdminSelectedDate(null);
    setAdminSelectedTime('');
  };
  
  const handleUnavailableDelete = (id) => {
    if (confirm('Are you sure you want to remove this unavailable slot?')) {
      const updated = unavailableSlots.filter(s => s.id !== id);
      setUnavailableSlots(updated);
      // Persist deletion immediately
      localStorage.setItem('unavailableSlots', JSON.stringify(updated));
    }
  };
  
  const handleAppointmentStatusChange = async (appointmentId, newStatus) => {
    if (newStatus === 'cancelled') {
      const cancelled = JSON.parse(localStorage.getItem('cancelledAppointments') || '[]');
      cancelled.push(appointmentId);
      localStorage.setItem('cancelledAppointments', JSON.stringify(cancelled));
      setAppointments(appointments.filter(apt => apt.id !== appointmentId));
    } else {
      setAppointments(appointments.map(apt => 
        apt.id === appointmentId ? { ...apt, status: newStatus } : apt
      ));
    }
    calculateStats();
  };
  
  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    logout();
    navigate('/login');
  };
  
  const renderDashboard = () => (
    <div className="admin-content">
      <h2 className="admin-title">Dashboard Overview</h2>
      
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📅</div>
          <div style={styles.statValue}>{stats.totalBookings}</div>
          <div style={styles.statLabel}>Total Bookings</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>❌</div>
          <div style={styles.statValue}>{stats.cancellations}</div>
          <div style={styles.statLabel}>Cancellations</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>💰</div>
          <div style={styles.statValue}>R{stats.totalRevenue.toLocaleString()}</div>
          <div style={styles.statLabel}>Total Revenue</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>⏰</div>
          <div style={styles.statValue}>{stats.upcomingAppointments}</div>
          <div style={styles.statLabel}>Upcoming</div>
        </div>
      </div>
      
      <div style={styles.recentSection}>
        <h3 style={styles.sectionTitle}>Recent Appointments</h3>
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Date</th>
                <th style={styles.tableHeader}>Time</th>
                <th style={styles.tableHeader}>Client</th>
                <th style={styles.tableHeader}>Services</th>
                <th style={styles.tableHeader}>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.slice(0, 5).map(appt => (
                <tr key={appt.id}>
                  <td style={styles.tableCell}>{appt.date}</td>
                  <td style={styles.tableCell}>{appt.time}</td>
                  <td style={styles.tableCell}>{appt.clientName}</td>
                  <td style={styles.tableCell}>
                    {Array.isArray(appt.services) ? appt.services.join(', ') : appt.services}
                  </td>
                  <td style={styles.tableCell}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: appt.status === 'confirmed' ? '#d4edda' : '#f8d7da',
                      color: appt.status === 'confirmed' ? '#155724' : '#721c24'
                    }}>
                      {appt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  
  const renderAppointments = () => (
    <div className="admin-content">
      <div style={styles.sectionHeader}>
        <h2 className="admin-title">Appointments Management</h2>
        <button onClick={fetchAppointments} style={styles.refreshBtn}>
          🔄 Refresh
        </button>
      </div>
      
      {loadingAppointments ? (
        <div style={styles.loading}>Loading appointments...</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Date</th>
                <th style={styles.tableHeader}>Time</th>
                <th style={styles.tableHeader}>Client Name</th>
                <th style={styles.tableHeader}>Services</th>
                <th style={styles.tableHeader}>Status</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="6" style={styles.emptyCell}>No appointments found</td>
                </tr>
              ) : (
                appointments.map(appt => (
                  <tr key={appt.id}>
                    <td style={styles.tableCell}>{appt.date}</td>
                    <td style={styles.tableCell}>{appt.time}</td>
                    <td style={styles.tableCell}>{appt.clientName}</td>
                    <td style={styles.tableCell}>
                      {Array.isArray(appt.services) ? appt.services.join(', ') : appt.services}
                    </td>
                    <td style={styles.tableCell}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: appt.status === 'confirmed' ? '#d4edda' : '#f8d7da',
                        color: appt.status === 'confirmed' ? '#155724' : '#721c24'
                      }}>
                        {appt.status}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.actionButtons}>
                        <button
                          onClick={() => handleAppointmentStatusChange(appt.id, 'cancelled')}
                          style={{ ...styles.actionBtn, backgroundColor: '#dc3545' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
  
  const renderServices = () => (
    <div className="admin-content">
      <div style={styles.sectionHeader}>
        <h2 className="admin-title">Services Management</h2>
        <button 
          onClick={() => { setShowServiceForm(true); setEditingService(null); setServiceForm({ name: '', duration: '', price: '' }); }} 
          style={styles.addBtn}
        >
          ➕ Add Service
        </button>
      </div>
      
      {showServiceForm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>{editingService ? 'Edit Service' : 'Add New Service'}</h3>
            <form onSubmit={handleServiceAdd}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Service Name:</label>
                <input
                  type="text"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  required
                  style={styles.input}
                  placeholder="e.g., Manicure"
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Duration (minutes):</label>
                <input
                  type="number"
                  value={serviceForm.duration}
                  onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                  required
                  style={styles.input}
                  placeholder="e.g., 45"
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Price (R):</label>
                <input
                  type="number"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                  required
                  style={styles.input}
                  placeholder="e.g., 150"
                />
              </div>
              
              <div style={styles.modalActions}>
                <button type="submit" style={{ ...styles.actionBtn, backgroundColor: '#28a745' }}>
                  {editingService ? 'Update' : 'Add'} Service
                </button>
                <button 
                  type="button" 
                  onClick={() => { setShowServiceForm(false); setEditingService(null); }}
                  style={{ ...styles.actionBtn, backgroundColor: '#6c757d' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Service Name</th>
              <th style={styles.tableHeader}>Duration</th>
              <th style={styles.tableHeader}>Price</th>
              <th style={styles.tableHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => (
              <tr key={service.id}>
                <td style={styles.tableCell}>{service.name}</td>
                <td style={styles.tableCell}>{service.duration} min</td>
                <td style={styles.tableCell}>R{service.price}</td>
                <td style={styles.tableCell}>
                  <div style={styles.actionButtons}>
                    <button
                      onClick={() => handleServiceEdit(service)}
                      style={{ ...styles.actionBtn, backgroundColor: '#007bff' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleServiceDelete(service.id)}
                      style={{ ...styles.actionBtn, backgroundColor: '#dc3545' }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  const renderAvailability = () => (
    <div className="admin-content">
      <div style={styles.sectionHeader}>
        <h2 className="admin-title">Availability Management</h2>
      </div>

      {/* Panels Row: Date + Time side by side */}
      <div style={styles.panelRow}>
        {/* Date Selection Panel */}
        <div className="booking-panel" style={styles.panelCol}>
          <div className="panel-header">
            <h3>SELECT DATE</h3>
            <div className="date-navigation">
              <button onClick={(e) => { e.stopPropagation(); adminHandleMonthChange('prev'); }}>‹</button>
              <span>{adminGetMonthName(adminCurrentMonth)}</span>
              <button onClick={(e) => { e.stopPropagation(); adminHandleMonthChange('next'); }}>›</button>
            </div>
          </div>
          <div className="panel-content">
            <div className="calendar">
              <div className="calendar-header">
                <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
              </div>
              <div className="calendar-grid">
                {adminGetDaysInMonth(adminCurrentMonth).map((day, idx) => (
                  <div
                    key={idx}
                    className={`calendar-day ${day ? 'available' : 'empty'} ${adminSelectedDate === day ? 'selected' : ''}`}
                    onClick={() => day && adminHandleDateSelect(day)}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Time Selection Panel */}
        <div className="booking-panel" style={styles.panelCol}>
          <div className="panel-header">
            <h3>TIME SLOTS</h3>
          </div>
          <div className="panel-content">
            <div className="time-section">
              <h4>Morning</h4>
              <div className="time-slots">
                {timeSlots.morning.map((time, i) => (
                  <div
                    key={i}
                    className={`time-slot ${adminSelectedTime === time ? 'selected' : ''}`}
                    onClick={() => adminHandleTimeSelect(time)}
                  >
                    {time}
                  </div>
                ))}
              </div>
            </div>
            <div className="time-section">
              <h4>Afternoon</h4>
              <div className="time-slots">
                {timeSlots.afternoon.map((time, i) => (
                  <div
                    key={i}
                    className={`time-slot ${adminSelectedTime === time ? 'selected' : ''}`}
                    onClick={() => adminHandleTimeSelect(time)}
                  >
                    {time}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Intuitive Selection Summary & Save */}
      <div style={{ ...styles.settingsCard, marginTop: '1rem' }}>
        <h3 style={styles.sectionTitle}>Selection Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <div style={styles.settingLabel}>Date</div>
            <div style={styles.settingValue}>{adminSelectedDate ? `${adminGetMonthName(adminCurrentMonth)} ${adminSelectedDate}` : '—'}</div>
          </div>
          <div>
            <div style={styles.settingLabel}>Time</div>
            <div style={styles.settingValue}>{adminSelectedTime || '—'}</div>
          </div>
          <div>
            <div style={styles.settingLabel}>Stylist</div>
            <select
              value={unavailableForm.stylist}
              onChange={(e) => setUnavailableForm(prev => ({ ...prev, stylist: e.target.value }))}
              style={{ ...styles.input, maxWidth: '240px' }}
            >
              <option>All</option>
              <option>Nail Tech 1</option>
              <option>Nail Tech 2</option>
            </select>
          </div>
          <div>
            <div style={styles.settingLabel}>Status</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setUnavailableForm({ ...unavailableForm, status: 'unavailable' })}
                style={{ ...styles.actionBtn, backgroundColor: unavailableForm.status === 'unavailable' ? '#ffc107' : '#e0e0e0', color: '#333' }}
              >
                Unavailable
              </button>
              <button
                type="button"
                onClick={() => setUnavailableForm({ ...unavailableForm, status: 'booked' })}
                style={{ ...styles.actionBtn, backgroundColor: unavailableForm.status === 'booked' ? '#d17b7b' : '#e0e0e0', color: '#fff' }}
              >
                Booked
              </button>
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={styles.settingLabel}>Reason (optional)</div>
            <input
              type="text"
              value={unavailableForm.reason}
              onChange={(e) => setUnavailableForm({ ...unavailableForm, reason: e.target.value })}
              style={styles.input}
              placeholder="e.g., Holiday or Maintenance"
            />
          </div>
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            type="button"
            onClick={handleUnavailableSave}
            style={{ ...styles.actionBtn, backgroundColor: '#28a745' }}
          >
            Save Slot
          </button>
        </div>
      </div>

      {/* Unavailable Slots List with badges */}
      <div style={styles.unavailableList}>
        {unavailableSlots.length === 0 ? (
          <div style={styles.emptyMessage}>No unavailable slots marked</div>
        ) : (
          unavailableSlots.map(slot => (
            <div key={slot.id} style={styles.unavailableItem}>
              <div style={styles.unavailableInfo}>
                <div style={styles.unavailableDate}>{slot.date}</div>
                <div style={styles.unavailableTime}>{slot.time}</div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', background: '#f0f0f0', color: '#333', fontSize: '0.85rem' }}>
                    {slot.stylist === 'All' ? 'All Stylists' : slot.stylist}
                  </span>
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', background: slot.status === 'booked' ? '#d17b7b' : '#ffc107', color: '#fff', fontSize: '0.85rem' }}>
                    {slot.status === 'booked' ? 'Booked' : 'Unavailable'}
                  </span>
                </div>
                {slot.reason && <div style={styles.unavailableReason}>{slot.reason}</div>}
              </div>
              <button
                onClick={() => handleUnavailableDelete(slot.id)}
                style={{ ...styles.actionBtn, backgroundColor: '#dc3545' }}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
  
  const renderSettings = () => (
    <div className="admin-content">
      <h2 className="admin-title">Settings</h2>
      
      <div style={styles.settingsCard}>
        <h3 style={styles.sectionTitle}>Account Settings</h3>
        <div style={styles.settingItem}>
          <div style={styles.settingLabel}>Admin User:</div>
          <div style={styles.settingValue}>{user?.firstName} {user?.lastName}</div>
        </div>
        <div style={styles.settingItem}>
          <div style={styles.settingLabel}>Email:</div>
          <div style={styles.settingValue}>{user?.email}</div>
        </div>
      </div>
      
      <div style={styles.settingsCard}>
        <h3 style={styles.sectionTitle}>Danger Zone</h3>
        <div style={styles.dangerZone}>
          <button onClick={handleLogout} style={{ ...styles.actionBtn, backgroundColor: '#dc3545' }}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
  
  // Toggle mobile menu when clicking a nav button
  const handleNavClick = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('adminActiveTab', tab);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };
  
  return (
    <div style={styles.container}>
      {/* Mobile Header */}
      {isMobile && (
        <div style={styles.mobileHeader}>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={styles.hamburgerButton}
          >
            ☰
          </button>
          <h2 style={styles.mobileHeaderTitle}>NXL Beauty Bar</h2>
        </div>
      )}
      
      {/* Sidebar */}
      <div style={{
        ...styles.sidebar,
        transform: isMobile ? (isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
        zIndex: 1000
      }}>
        {isMobile && (
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            style={styles.closeButton}
          >
            ✕
          </button>
        )}
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>NXL Beauty Bar</h2>
          <p style={styles.sidebarSubtitle}>Admin Panel</p>
        </div>
        
        <nav style={styles.nav}>
          <Link to="/" style={styles.navLink}>🏠 Home</Link>
          <Link to="/dashboard" style={styles.navLink}>👤 User Dashboard</Link>
          <button
            onClick={() => handleNavClick('dashboard')}
            style={{
              ...styles.navButton,
              backgroundColor: activeTab === 'dashboard' ? '#f0f0f0' : 'transparent'
            }}
          >
            📊 Admin Dashboard
          </button>
          <button
            onClick={() => handleNavClick('appointments')}
            style={{
              ...styles.navButton,
              backgroundColor: activeTab === 'appointments' ? '#f0f0f0' : 'transparent'
            }}
          >
            📅 Appointments
          </button>
          <button
            onClick={() => handleNavClick('services')}
            style={{
              ...styles.navButton,
              backgroundColor: activeTab === 'services' ? '#f0f0f0' : 'transparent'
            }}
          >
            💅 Services
          </button>
          <button
            onClick={() => handleNavClick('availability')}
            style={{
              ...styles.navButton,
              backgroundColor: activeTab === 'availability' ? '#f0f0f0' : 'transparent'
            }}
          >
            🚫 Availability
          </button>
          <button
            onClick={() => handleNavClick('settings')}
            style={{
              ...styles.navButton,
              backgroundColor: activeTab === 'settings' ? '#f0f0f0' : 'transparent'
            }}
          >
            ⚙️ Settings
          </button>
          
          <button
            onClick={handleLogout}
            style={{
              ...styles.navButton,
              marginTop: '2rem',
              backgroundColor: '#f8d7da',
              color: '#721c24'
            }}
          >
            🚪 Logout
          </button>
        </nav>
      </div>
      
      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div
          style={styles.overlay}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Main Content */}
      <div style={{
        ...styles.mainContent,
        marginLeft: isMobile ? '0' : '250px',
        padding: isMobile ? '1rem' : '2rem',
        paddingTop: isMobile ? '80px' : '2rem'
      }}>
        <div style={styles.headerBar}>
          <h1 style={{
            ...styles.pageTitle,
            fontSize: isMobile ? '1.5rem' : '2rem'
          }}>
            {activeTab === 'dashboard' && 'Dashboard Overview'}
            {activeTab === 'appointments' && 'Appointments Management'}
            {activeTab === 'services' && 'Services Management'}
            {activeTab === 'availability' && 'Availability Management'}
            {activeTab === 'settings' && 'Settings'}
          </h1>
        </div>
        
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'appointments' && renderAppointments()}
        {activeTab === 'services' && renderServices()}
        {activeTab === 'availability' && renderAvailability()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#F8F7F5',
    fontFamily: 'Montserrat, sans-serif'
  },
  sidebar: {
    width: '250px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e0e0e0',
    padding: '2rem 0',
    position: 'fixed',
    height: '100vh',
    overflowY: 'auto',
    transition: 'transform 0.3s ease-in-out'
  },
  sidebarHeader: {
    padding: '0 1.5rem 2rem 1.5rem',
    borderBottom: '1px solid #e0e0e0'
  },
  sidebarTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#333333',
    marginBottom: '0.5rem'
  },
  sidebarSubtitle: {
    fontSize: '0.9rem',
    color: '#666666'
  },
  nav: {
    padding: '1.5rem 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  navButton: {
    padding: '1rem 1.5rem',
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    color: '#333333',
    transition: 'background-color 0.2s',
    borderRadius: '0 25px 25px 0',
    marginRight: '1rem'
  },
  navLink: {
    padding: '1rem 1.5rem',
    textDecoration: 'none',
    textAlign: 'left',
    fontSize: '1rem',
    fontWeight: '500',
    color: '#333333',
    display: 'block',
    transition: 'background-color 0.2s',
    borderRadius: '0 25px 25px 0',
    marginRight: '1rem'
  },
  mainContent: {
    marginLeft: '250px',
    flex: 1,
    padding: '2rem',
    backgroundColor: '#F8F7F5'
  },
  headerBar: {
    marginBottom: '2rem'
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '600',
    color: '#333333'
  },
  adminContent: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  adminTitle: {
    fontSize: '1.8rem',
    fontWeight: '600',
    color: '#333333',
    marginBottom: '1.5rem'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: '1.5rem',
    borderRadius: '10px',
    textAlign: 'center',
    border: '1px solid #e0e0e0',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
  },
  statIcon: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem'
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#333333',
    marginBottom: '0.25rem'
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#666666',
    fontWeight: '500'
  },
  sectionTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#333333',
    marginBottom: '1rem'
  },
  recentSection: {
    marginTop: '2rem'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  addBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  refreshBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  tableContainer: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    padding: '1rem',
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #dee2e6',
    fontWeight: '600',
    color: '#333333'
  },
  tableCell: {
    padding: '1rem',
    borderBottom: '1px solid #dee2e6',
    color: '#666666'
  },
  emptyCell: {
    padding: '2rem',
    textAlign: 'center',
    color: '#999999',
    fontStyle: 'italic'
  },
  statusBadge: {
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem'
  },
  actionBtn: {
    padding: '0.5rem 1rem',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'opacity 0.2s'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '10px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#333333',
    marginBottom: '1.5rem'
  },
  formGroup: {
    marginBottom: '1.5rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: '#333333'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '1rem'
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end'
  },
  unavailableList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem'
  },
  unavailableItem: {
    backgroundColor: '#fff3cd',
    padding: '1.5rem',
    borderRadius: '10px',
    border: '1px solid ',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  unavailableInfo: {
    flex: 1
  },
  unavailableDate: {
    fontWeight: '600',
    color: '#333333',
    marginBottom: '0.25rem'
  },
  unavailableTime: {
    color: '#666666',
    marginBottom: '0.25rem'
  },
  unavailableReason: {
    color: '#999999',
    fontSize: '0.9rem',
    fontStyle: 'italic'
  },
  emptyMessage: {
    textAlign: 'center',
    padding: '3rem',
    color: '#999999',
    fontStyle: 'italic'
  },
  settingsCard: {
    backgroundColor: '#ffffff',
    padding: '1.5rem',
    borderRadius: '10px',
    border: '1px solid #e0e0e0',
    marginBottom: '1.5rem'
  },
  settingItem: {
    display: 'flex',
    padding: '1rem 0',
    borderBottom: '1px solid #e0e0e0'
  },
  settingLabel: {
    fontWeight: '600',
    color: '#333333',
    width: '150px'
  },
  settingValue: {
    color: '#666666',
    flex: 1
  },
  dangerZone: {
    marginTop: '1rem'
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    color: '#666666'
  },
  mobileHeader: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '60px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    alignItems: 'center',
    padding: '0 1rem',
    zIndex: 999
  },
  hamburgerButton: {
    border: 'none',
    background: 'transparent',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0.5rem',
    marginRight: '1rem'
  },
  mobileHeaderTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#333333'
  },
  closeButton: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    border: 'none',
    background: 'transparent',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0.5rem'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999
  },
  panelRow: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
    flexWrap: 'wrap'
  },
  panelCol: {
    flex: 1,
    minWidth: '320px'
  }
};

export default AdminDashboard;
