import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);


// Leave endpoints
export const getLeaveBalance = () => api.get('/leaves/balance');
export const applyLeave = (leaveData) => api.post('/leaves/apply', leaveData);
export const getMyLeaves = () => api.get('/leaves/my-leaves');
export const getPendingLeaves = () => api.get('/leaves/pending');
export const updateLeaveStatus = (leaveId, status, rejectionReason = '') =>
  api.put('/leaves/update-status', { leaveId, status, rejectionReason });
export const getMyApprovedLeaves = (month) =>
  api.get(`/leaves/my-approved?month=${month}`);

export const getAllApprovedLeaves = (month) =>
  api.get(`/leaves/approved?month=${month}`);


// User endpoints
export const getAllEmployees = () => api.get('/users/employees');

export default api;
