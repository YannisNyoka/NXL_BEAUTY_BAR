const API_URL = import.meta.env.VITE_API_URL;

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    return {
      'Authorization': `Bearer ${token}`
    };
  }
  return {};
};

const apiCall = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `API Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

export const api = {
  // Auth
  signin: (email, password) => apiCall('/api/user/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  signup: (data) => apiCall('/api/user/signup', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Services
  getServices: () => apiCall('/api/services'),
  createService: (data) => apiCall('/api/services', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateService: (id, data) => apiCall(`/api/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteService: (id) => apiCall(`/api/services/${id}`, {
    method: 'DELETE'
  }),

  // Appointments
  getAppointments: () => apiCall('/api/appointments'),
  createAppointment: (data) => apiCall('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  cancelAppointment: (id) => apiCall(`/api/appointments/${id}`, {
    method: 'DELETE'
  }),
  updateAppointment: (id, data) => apiCall(`/api/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Availability
  getAvailability: () => apiCall('/api/availability'),
  createAvailability: (data) => apiCall('/api/availability', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deleteAvailability: (id) => apiCall(`/api/availability/${id}`, {
    method: 'DELETE'
  }),

  // Users
  getUsers: () => apiCall('/api/users'),

  // Health check
  ping: () => apiCall('/api/ping')
};
export default api;
