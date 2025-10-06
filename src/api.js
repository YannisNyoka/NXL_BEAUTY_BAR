// API utility functions for the NXL Beauty Bar application

const API_URL = import.meta.env.VITE_API_URL;

// Generic API call function with error handling
const apiCall = async (endpoint, options = {}) => {
  try {
    const url = `${API_URL}${endpoint}`;
    console.log(`Making API call to: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('API response data:', data);
    return { success: true, data };
  } catch (error) {
    console.error('API call failed:', error);
    return { success: false, error: error.message };
  }
};

// API functions
export const api = {
  // Test connection
  ping: () => apiCall('/api/ping'),

  // User operations
  signup: (userData) => apiCall('/api/user/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  signin: (credentials) => apiCall('/api/user/signin', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  getUsers: () => apiCall('/api/users'),

  // Appointment operations
  createAppointment: (appointmentData) => apiCall('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData),
  }),

  getAppointments: () => apiCall('/api/appointments'),

  // Appointment management (Note: These endpoints may need to be added to your backend)
  cancelAppointment: (appointmentId) => apiCall(`/api/appointments/${appointmentId}`, {
    method: 'DELETE',
  }),

  updateAppointment: (appointmentId, updateData) => apiCall(`/api/appointments/${appointmentId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  }),

  // Service operations
  createService: (serviceData) => apiCall('/api/services', {
    method: 'POST',
    body: JSON.stringify(serviceData),
  }),

  getServices: () => apiCall('/api/services'),

  // Employee operations
  createEmployee: (employeeData) => apiCall('/api/employees', {
    method: 'POST',
    body: JSON.stringify(employeeData),
  }),

  getEmployees: () => apiCall('/api/employees'),

  // Payment operations
  createPayment: (paymentData) => apiCall('/api/payments', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  }),

  getPayments: () => apiCall('/api/payments'),
};

export default api;