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
  createService: async (serviceData) => {
    // Primary
    let res = await apiCall('/api/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
    if (res.success) return res;
    // Fallbacks without /api prefix and admin namespace
    res = await apiCall('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
    if (res.success) return res;
    res = await apiCall('/api/admin/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
    if (res.success) return res;
    return apiCall('/admin/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  },

  getServices: async () => {
    let res = await apiCall('/api/services');
    if (res.success) return res;
    res = await apiCall('/services');
    if (res.success) return res;
    res = await apiCall('/api/admin/services');
    if (res.success) return res;
    return apiCall('/admin/services');
  },

  updateService: async (serviceId, updateData) => {
    // Send both durationMinutes and duration for backend compatibility
    const payload = {
      ...updateData,
      duration: updateData.durationMinutes ?? updateData.duration,
      durationMinutes: updateData.durationMinutes ?? updateData.duration,
    };
    // Primary: RESTful path /api/services/:id
    let res = await apiCall(`/api/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (res.success) return res;
    // Fallback A: PUT /api/services with { id, ...payload }
    res = await apiCall('/api/services', {
      method: 'PUT',
      body: JSON.stringify({ id: serviceId, ...payload }),
    });
    if (res.success) return res;
    // Fallback B: POST /api/services/:id/update
    res = await apiCall(`/api/services/${serviceId}/update`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.success) return res;
    // Non-/api equivalents
    res = await apiCall(`/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (res.success) return res;
    res = await apiCall('/services', {
      method: 'PUT',
      body: JSON.stringify({ id: serviceId, ...payload }),
    });
    if (res.success) return res;
    res = await apiCall(`/services/${serviceId}/update`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.success) return res;
    // Admin namespace
    res = await apiCall(`/api/admin/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (res.success) return res;
    res = await apiCall(`/admin/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res;
  },

  deleteService: async (serviceId) => {
    // Primary: DELETE /api/services/:id
    let res = await apiCall(`/api/services/${serviceId}`, {
      method: 'DELETE',
    });
    if (res.success) return res;
    // Fallback A: DELETE /api/services with { id }
    res = await apiCall('/api/services', {
      method: 'DELETE',
      body: JSON.stringify({ id: serviceId }),
    });
    if (res.success) return res;
    // Fallback B: POST /api/services/:id/delete
    res = await apiCall(`/api/services/${serviceId}/delete`, {
      method: 'POST',
      body: JSON.stringify({ id: serviceId }),
    });
    if (res.success) return res;
    // Non-/api equivalents
    res = await apiCall(`/services/${serviceId}`, {
      method: 'DELETE',
    });
    if (res.success) return res;
    res = await apiCall('/services', {
      method: 'DELETE',
      body: JSON.stringify({ id: serviceId }),
    });
    if (res.success) return res;
    res = await apiCall(`/services/${serviceId}/delete`, {
      method: 'POST',
      body: JSON.stringify({ id: serviceId }),
    });
    if (res.success) return res;
    // Admin namespace
    res = await apiCall(`/api/admin/services/${serviceId}`, {
      method: 'DELETE',
    });
    if (res.success) return res;
    res = await apiCall(`/admin/services/${serviceId}`, {
      method: 'DELETE',
    });
    return res;
  },

  // Availability operations
  getAvailability: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/api/availability?${query}` : '/api/availability';
    let res = await apiCall(endpoint);
    if (res.success) return res;
    // Fallback: admin namespace
    const fallback = query ? `/api/admin/availability?${query}` : '/api/admin/availability';
    res = await apiCall(fallback);
    if (res.success) return res;
    // Fallback: alternate naming
    const fallback2 = query ? `/api/unavailable?${query}` : '/api/unavailable';
    res = await apiCall(fallback2);
    if (res.success) return res;
    // Non-/api equivalents
    const fallback3 = query ? `/availability?${query}` : '/availability';
    res = await apiCall(fallback3);
    if (res.success) return res;
    const fallback4 = query ? `/admin/availability?${query}` : '/admin/availability';
    return apiCall(fallback4);
  },

  createAvailability: async (slotData) => {
    // Try primary
    let res = await apiCall('/api/availability', {
      method: 'POST',
      body: JSON.stringify(slotData),
    });
    if (res.success) return res;
    // Fallback: admin namespace
    res = await apiCall('/api/admin/availability', {
      method: 'POST',
      body: JSON.stringify(slotData),
    });
    if (res.success) return res;
    // Fallback: alternate naming
    res = await apiCall('/api/unavailable', {
      method: 'POST',
      body: JSON.stringify(slotData),
    });
    if (res.success) return res;
    // Fallback: explicit create
    res = await apiCall('/api/availability/create', {
      method: 'POST',
      body: JSON.stringify(slotData),
    });
    if (res.success) return res;
    // Non-/api equivalents
    res = await apiCall('/availability', {
      method: 'POST',
      body: JSON.stringify(slotData),
    });
    if (res.success) return res;
    res = await apiCall('/admin/availability', {
      method: 'POST',
      body: JSON.stringify(slotData),
    });
    return res;
  },

  deleteAvailability: async (slotId) => {
    // Try primary
    let res = await apiCall(`/api/availability/${slotId}`, {
      method: 'DELETE',
    });
    if (res.success) return res;
    // Fallback: admin namespace
    res = await apiCall(`/api/admin/availability/${slotId}`, {
      method: 'DELETE',
    });
    if (res.success) return res;
    // Fallback: alternate naming
    res = await apiCall(`/api/unavailable/${slotId}`, {
      method: 'DELETE',
    });
    if (res.success) return res;
    // Fallback: explicit delete
    res = await apiCall(`/api/availability/${slotId}/delete`, {
      method: 'POST',
      body: JSON.stringify({ id: slotId }),
    });
    if (res.success) return res;
    // Non-/api equivalents
    res = await apiCall(`/availability/${slotId}`, {
      method: 'DELETE',
    });
    if (res.success) return res;
    res = await apiCall(`/admin/availability/${slotId}`, {
      method: 'DELETE',
    });
    return res;
  },

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
