// API utility functions for the NXL Beauty Bar application

const API_URL = import.meta.env.VITE_API_URL;

// Generic API call function with error handling
const apiCall = async (endpoint, options = {}) => {
  try {
    const url = `${API_URL}${endpoint}`;
    console.log(`Making API call to: ${url}`);
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add Basic Auth header if credentials exist in localStorage
    const email = localStorage.getItem('userEmail');
    const password = localStorage.getItem('userPassword');
    if (email && password) {
      const credentials = btoa(`${email}:${password}`);
      headers['Authorization'] = `Basic ${credentials}`;
    }

    const response = await fetch(url, {
      headers,
      ...options,
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
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

  // Appointment management
  cancelAppointment: (appointmentId, reason) => apiCall(`/api/appointments/${appointmentId}/cancel`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  }),

  rescheduleAppointment: (appointmentId, { date, time }) => apiCall(`/api/appointments/${appointmentId}/reschedule`, {
    method: 'PUT',
    body: JSON.stringify({ date, time }),
  }),

  // Service operations
  createService: (serviceData) => apiCall('/api/services', {
    method: 'POST',
    body: JSON.stringify(serviceData),
  }),

  getServices: () => apiCall('/api/services'),

  updateService: (serviceId, updateData) => {
    // Send both durationMinutes and duration for backend compatibility
    const payload = {
      ...updateData,
      duration: updateData.durationMinutes ?? updateData.duration,
      durationMinutes: updateData.durationMinutes ?? updateData.duration,
    };
    return apiCall(`/api/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteService: (serviceId) => apiCall(`/api/services/${serviceId}`, {
    method: 'DELETE',
  }),

  // Availability operations
  getAvailability: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/api/availability?${query}` : '/api/availability';
    return apiCall(endpoint);
  },

  createAvailability: (slotData) => apiCall('/api/availability', {
    method: 'POST',
    body: JSON.stringify(slotData),
  }),

  deleteAvailability: (slotId) => apiCall(`/api/availability/${slotId}`, {
    method: 'DELETE',
  }),

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

  // Email operations - DISABLED: Using EmailJS instead
  // sendConfirmationEmail: (emailData) => apiCall('/api/send-confirmation-email', {
  //   method: 'POST',
  //   body: JSON.stringify(emailData),
  // }),
};

export default api;
