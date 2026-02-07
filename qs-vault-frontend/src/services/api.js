import axios from 'axios';
import { supabase } from './supabase';

// Create Axios instance pointing to your FastAPI backend
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- CRITICAL CHANGE: SUPABASE INTERCEPTOR ---
// Before every request, ask Supabase for the current user's session token.
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  
  if (data?.session?.access_token) {
    config.headers.Authorization = `Bearer ${data.session.access_token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- AUTH SERVICES ---
// (Deleted. The Frontend now calls supabase.auth directly in Login.js)

// --- FILE SERVICES ---
export const uploadFile = async (file, mode = 'hybrid') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('mode', mode); 
  
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
  // We need to fetch the session token manually for the blob request 
  // because axios interceptors can sometimes behave oddly with responseType: 'blob' 
  // depending on the version, but usually the interceptor above covers it.
  const response = await api.get(`/files/download/${fileId}`, {
    responseType: 'blob', 
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