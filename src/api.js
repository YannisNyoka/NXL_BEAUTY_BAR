// API utility functions for the NXL Beauty Bar application
import { VITE_API_URL } from 'your-env-config-module'; // Assuming import.meta.env is handled via Vite setup

const API_URL = VITE_API_URL; // Using a placeholder for VITE_API_URL for clarity

// Generic API call function with error handling
const apiCall = async (endpoint, options = {}) => {
  try {
    // Ensure a leading slash for a clean URL construction
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_URL}${cleanEndpoint}`;
    console.log(`Making API call to: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      // Remove the body from GET/DELETE requests if not explicitly specified by user
      ...options,
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        // Backend's error object uses 'error' field for messages
        errorMessage = errorData.error || errorData.message || errorMessage; 
      } catch (e) {
        // Response is not JSON
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('API response data:', data);
    return { success: true, data };
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    return { success: false, error: error.message };
  }
};

// API functions
export const api = {
  // Test connection
  ping: () => apiCall('api/ping'),

  // User operations
  signup: (userData) => apiCall('api/user/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  signin: (credentials) => apiCall('api/user/signin', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  getUsers: () => apiCall('api/users'),

  // Appointment operations
  createAppointment: (appointmentData) => apiCall('api/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData),
  }),

  getAppointments: () => apiCall('api/appointments'),

  // Appointment management - NOTE: Backend currently only has DELETE route
  // These routes (cancel/reschedule) need to be implemented in the backend if needed.
  cancelAppointment: (appointmentId, reason) => apiCall(`api/appointments/${appointmentId}`, {
    // Assuming cancel means DELETE, as backend only has DELETE and PUT (update)
    method: 'DELETE', 
    // The front-end AdminDashboard handles 'cancellation' logic by calling this API function
    // and then filtering the appointments list in the local state.
    // If full cancellation logic is needed, the backend needs a specific route (e.g., PUT /api/appointments/:id/cancel)
 // For now, we use the DELETE route, which the backend supports.
 }),

  rescheduleAppointment: (appointmentId, { date, time }) => apiCall(`api/appointments/${appointmentId}`, {
    method: 'PUT',
    body: JSON.stringify({ date, time }),
  }),

  // Service operations
  createService: (serviceData) => apiCall('api/services', {
    method: 'POST',
    body: JSON.stringify(serviceData),
  }),

  // Keeping a small fallback for GET for robustness, though /api/services is primary.
  getServices: async () => {
    let res = await apiCall('api/services');
    if (res.success) return res;
    // Fallback to non-API prefix (which was seen in one of the 404 logs)
    return apiCall('services'); 
  },

  // FIX: Only use the correct, single RESTful PUT route
  updateService: (serviceId, updateData) => {
    const payload = {
      ...updateData,
      duration: updateData.durationMinutes ?? updateData.duration,
      durationMinutes: updateData.durationMinutes ?? updateData.duration,
    };
    return apiCall(`api/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // FIX: Only use the correct, single RESTful DELETE route
  deleteService: (serviceId) => apiCall(`api/services/${serviceId}`, {
    method: 'DELETE',
  }),

  // Availability operations
  getAvailability: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `api/availability?${query}` : 'api/availability';
    let res = await apiCall(endpoint);
    if (res.success) return res;
    // Fallback to non-API prefix
    const fallback = query ? `availability?${query}` : 'availability';
    return apiCall(fallback);
  },

  createAvailability: (slotData) => apiCall('api/availability', {
    method: 'POST',
    body: JSON.stringify(slotData),
  }),

  // FIX: Only use the correct, single RESTful DELETE route
  deleteAvailability: (slotId) => apiCall(`api/availability/${slotId}`, {
    method: 'DELETE',
  }),

  // Employee operations
  createEmployee: (employeeData) => apiCall('api/employees', {
    method: 'POST',
    body: JSON.stringify(employeeData),
  }),

  getEmployees: () => apiCall('api/employees'),

  // Payment operations
  createPayment: (paymentData) => apiCall('api/payments', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  }),

  getPayments: () => apiCall('api/payments'),

  // Email operations
  sendConfirmationEmail: (emailData) => apiCall('api/send-confirmation-email', {
    method: 'POST',
    body: JSON.stringify(emailData),
  }),
};

export default api;