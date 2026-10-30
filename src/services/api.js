import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token from localStorage to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('5star_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token expiration handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If 401 from protected route, clear token if expired
      if (localStorage.getItem('5star_token')) {
        // Do not force redirect on background checks, just handle in AuthContext
      }
    }
    return Promise.reject(error);
  }
);

// Helper for formatting Indian Rupee Currency
export const formatINR = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN');
};

// Helper for generating media stream URL from GridFS file ID
export const getMediaUrl = (fileId) => {
  if (!fileId) return '';
  return `${API_BASE_URL}/media/${fileId}`;
};

// Helper for media download URL
export const getMediaDownloadUrl = (fileId) => {
  if (!fileId) return '';
  return `${API_BASE_URL}/media/${fileId}/download`;
};

// Helper for public/share base URL (ensures official deployed Vercel domain is used)
export const getShareBaseUrl = () => {
  const envUrl = import.meta.env.VITE_SITE_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return window.location.origin;
  }
  return 'https://5starcinematography.vercel.app';
};

// API Endpoints
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyResetOtp: (email, otp) => api.post('/auth/verify-reset-otp', { email, otp }),
  resetPassword: (data) => api.post('/auth/reset-password', data)
};

export const packageApi = {
  getPackages: () => api.get('/packages'),
  getPackageById: (id) => api.get(`/packages/${id}`),
  createPackage: (formData) => api.post('/packages/admin', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updatePackage: (id, formData) => api.put(`/packages/admin/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deletePackage: (id) => api.delete(`/packages/admin/${id}`)
};

export const bookingApi = {
  createBooking: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my'),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  getAllBookings: (params) => api.get('/bookings/admin/all', { params }),
  updateStatus: (id, data) => api.patch(`/bookings/admin/${id}/status`, data),
  updateNotes: (id, data) => api.patch(`/bookings/admin/${id}/notes`, data),
  getCalendar: () => api.get('/bookings/admin/calendar'),
  getStats: () => api.get('/bookings/admin/dashboard/stats')
};

export const galleryApi = {
  getPublic: () => api.get('/galleries/public'),
  getAllAdmin: () => api.get('/galleries/admin/all'),
  getById: (id) => api.get(`/galleries/${id}`),
  getAdminById: (id) => api.get(`/galleries/admin/${id}`),
  getPrivateByToken: (token) => api.get(`/gallery/private/${token}`),
  create: (formData) => api.post('/galleries/admin', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/galleries/admin/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/galleries/admin/${id}`),
  uploadMedia: (galleryId, formData, onProgress) => api.post(`/galleries/admin/${galleryId}/media`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    }
  }),
  deleteMedia: (galleryId, mediaId) => api.delete(`/galleries/admin/${galleryId}/media/${mediaId}`),
  regenerateToken: (galleryId, customToken = '') => api.post(`/galleries/admin/${galleryId}/regenerate-token`, { customToken })
};

export const liveApi = {
  getActive: () => api.get('/live/active'),
  getPhotos: (page = 1) => api.get(`/live/photos?page=${page}`),
  getDownloadUrl: (photoId) => `${API_BASE_URL}/live/photos/${photoId}/download`,
  getDownloadAllUrl: () => `${API_BASE_URL}/live/photos/download-all`,
  getPermanentQR: () => api.get('/live/permanent-qr'),
  startEvent: (data) => api.post('/live/admin/start', data),
  uploadPhotos: (formData, onProgress) => api.post('/live/admin/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    }
  }),
  endEvent: () => api.post('/live/admin/end'),
  getArchives: () => api.get('/live/admin/archives'),
  getArchivePhotos: (eventId) => api.get(`/live/admin/archives/${eventId}`)
};

export const contactApi = {
  submit: (data) => api.post('/contact', data),
  getAll: () => api.get('/contact/admin'),
  updateStatus: (id, data) => api.patch(`/contact/admin/${id}`, data)
};

export const testimonialApi = {
  getPublic: () => api.get('/testimonials'),
  getAllAdmin: () => api.get('/testimonials/admin'),
  create: (data) => api.post('/testimonials/admin', data),
  update: (id, data) => api.put(`/testimonials/admin/${id}`, data),
  delete: (id) => api.delete(`/testimonials/admin/${id}`)
};

export default api;
