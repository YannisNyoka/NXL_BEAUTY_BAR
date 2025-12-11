const API_URL = import.meta.env.VITE_API_URL;

// Get auth token from localStorage and encode as Basic Auth
const getAuthHeader = () => {
  const credentials = localStorage.getItem('authCredentials');
  if (credentials) {
    const encoded = btoa(credentials); // Base64 encode email:password
    return {
      'Authorization': `Basic ${encoded}`
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
  signin: (email, password) => apiCall('/user/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  signup: (data) => apiCall('/user/signup', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Services
  getServices: () => apiCall('/services'),
  createService: (data) => apiCall('/services', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateService: (id, data) => apiCall(`/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteService: (id) => apiCall(`/services/${id}`, {
    method: 'DELETE'
  }),

  // Appointments
  getAppointments: () => apiCall('/appointments'),
  createAppointment: (data) => apiCall('/appointments', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  cancelAppointment: (id) => apiCall(`/appointments/${id}`, {
    method: 'DELETE'
  }),
  updateAppointment: (id, data) => apiCall(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Availability
  getAvailability: () => apiCall('/availability'),
  createAvailability: (data) => apiCall('/availability', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deleteAvailability: (id) => apiCall(`/availability/${id}`, {
    method: 'DELETE'
  }),

  // Users
  getUsers: () => apiCall('/users'),

  // Health check
  ping: () => apiCall('/ping')
};
export default api;
