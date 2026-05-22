import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const login = (username, password) =>
  api.post('/auth/login', { username, password });

export const register = (data) => api.post('/auth/register', data);

export const verifyToken = (token) =>
  api.post(`/auth/verify-token?token=${token}`);

// Users
export const getProfile = () => api.get('/users/profile/me');
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const changePassword = (id, data) =>
  api.post(`/users/${id}/change-password`, data);

// Menus
export const getMenus = () => api.get('/menus/');
export const getMenu = (id) => api.get(`/menus/${id}`);

// Food Packages
export const getFoodPackages = () => api.get('/food-packages/');
export const getFoodPackagesByMenu = (menuId) =>
  api.get(`/food-packages/menu/${menuId}`);
export const getFoodPackagesBySession = (sessionId) =>
  api.get(`/food-packages/session/${sessionId}`);

// Booking Sessions
export const getBookingSessions = () => api.get('/booking-sessions/');

// Bookings
export const getBookings = () => api.get('/bookings/');
export const getBookingsByUser = (userId) =>
  api.get(`/bookings/user/${userId}`);
export const createBooking = (data) => api.post('/bookings/', data);
export const updateBooking = (id, data) => api.put(`/bookings/${id}`, data);
export const deleteBooking = (id) => api.delete(`/bookings/${id}`);

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BASE_URL}/${path}`;
};

export default api;
