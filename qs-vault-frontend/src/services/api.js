import axios from 'axios';

// Create Axios instance pointing to your FastAPI backend
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1', // Ensure this matches your Python port
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically add the JWT token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Services
export const login = async (username, password) => {
  // OAuth2 requires x-www-form-urlencoded
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);

  // We override the global JSON header just for this request
  const response = await api.post('/auth/login', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded' 
    }
  });
  return response.data;
};

export const register = async (username, password) => {
  return api.post('/auth/register', { username, password });
};

// File Services
export const uploadFile = async (file, mode = 'hybrid') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('mode', mode); // Send the mode!
  
  return api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteFile = async (fileId) => {
  return api.delete(`/files/delete/${fileId}`);
};

export const getFiles = async () => {
  return api.get('/files/list');
};

export const inspectFile = async (fileId) => {
  return api.get(`/files/inspect/${fileId}`);
};

export const downloadFile = async (fileId, filename) => {
  const response = await api.get(`/files/download/${fileId}`, {
    responseType: 'blob', // Crucial for downloading binary files correctly
  });
  
  // Create a blob link to trigger the browser download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default api;