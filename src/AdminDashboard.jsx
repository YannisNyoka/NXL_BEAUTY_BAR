import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { api } from './api';

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
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
  const [unavailableForm, setUnavailableForm] = useState({ date: '', time: '', reason: '', stylist: 'All' });
  const unavailabilityInitializedRef = useRef(false);
  
  useEffect(() => {
    const savedUnavailability = localStorage.getItem('unavailableSlots');
    if (savedUnavailability) {
      try {
        const parsed = JSON.parse(savedUnavailability);
        if (Array.isArray(parsed)) {
          setUnavailableSlots(parsed);
        }
      } catch (e) {
        // ignore JSON errors
      }
    }
    unavailabilityInitializedRef.current = true;
  }, []);
  
  useEffect(() => {
    if (unavailabilityInitializedRef.current) {
      localStorage.setItem('unavailableSlots', JSON.stringify(unavailableSlots));
    }
  }, [unavailableSlots]);
  
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
  
  const handleUnavailableAdd = (e) => {
    e.preventDefault();
    const newSlot = {
      id: Date.now(),
      date: unavailableForm.date,
      time: unavailableForm.time,
      reason: unavailableForm.reason,
      stylist: unavailableForm.stylist || 'All'
    };
    setUnavailableSlots([...unavailableSlots, newSlot]);
    setShowUnavailableForm(false);
    setUnavailableForm({ date: '', time: '', reason: '', stylist: 'All' });
  };
  
  const handleUnavailableDelete = (id) => {
    if (confirm('Are you sure you want to remove this unavailable slot?')) {
      setUnavailableSlots(unavailableSlots.filter(s => s.id !== id));
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
        <button 
          onClick={() => setShowUnavailableForm(true)} 
          style={styles.addBtn}
        >
          ➕ Mark Unavailable
        </button>
      </div>
      
      {showUnavailableForm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>Mark Time Slot Unavailable</h3>
            <form onSubmit={handleUnavailableAdd}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date:</label>
                <input
                  type="text"
                  value={unavailableForm.date}
                  onChange={(e) => setUnavailableForm({ ...unavailableForm, date: e.target.value })}
                  required
                  style={styles.input}
                  placeholder="e.g., October 2025 10"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Stylist:</label>
                <select
                  value={unavailableForm.stylist}
                  onChange={(e) => setUnavailableForm({ ...unavailableForm, stylist: e.target.value })}
                  style={styles.input}
                >
                  <option value="All">All Stylists</option>
                  <option value="Noxolo">Noxolo</option>
                  <option value="Thandi">Thandi</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Time:</label>
                <input
                  type="text"
                  value={unavailableForm.time}
                  onChange={(e) => setUnavailableForm({ ...unavailableForm, time: e.target.value })}
                  required
                  style={styles.input}
                  placeholder="e.g., 12:00 pm"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Reason (optional):</label>
                <input
                  type="text"
                  value={unavailableForm.reason}
                  onChange={(e) => setUnavailableForm({ ...unavailableForm, reason: e.target.value })}
                  style={styles.input}
                  placeholder="e.g., Holiday"
                />
              </div>
              <div style={styles.modalActions}>
                <button type="submit" style={{ ...styles.actionBtn, backgroundColor: '#28a745' }}>
                  Add Unavailable
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowUnavailableForm(false)}
                  style={{ ...styles.actionBtn, backgroundColor: '#6c757d' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div style={styles.unavailableList}>
        {unavailableSlots.length === 0 ? (
          <div style={styles.emptyMessage}>No unavailable slots marked</div>
        ) : (
          unavailableSlots.map(slot => (
            <div key={slot.id} style={styles.unavailableItem}>
              <div style={styles.unavailableInfo}>
                <div style={styles.unavailableDate}>{slot.date}</div>
                <div style={styles.unavailableTime}>{slot.time}</div>
                <div style={{ fontStyle: 'italic', color: '#555' }}>
                  {slot.stylist === 'All' ? 'All Stylists' : slot.stylist}
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
    border: '1px solid #ffc107',
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
  }
};

export default AdminDashboard;
