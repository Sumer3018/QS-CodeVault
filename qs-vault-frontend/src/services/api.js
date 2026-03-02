import axios from 'axios';
import { supabase } from './supabase';

// Axios instance
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1'
});

// Supabase JWT interceptor
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();

  if (data?.session) {
    config.headers.Authorization = `Bearer ${data.session.access_token}`;
  }

  return config;
});

// ================= FILE SERVICES =================

export const uploadFile = (file, mode, variant) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("mode", mode);
  formData.append("variant", variant);

  return api.post("/files/upload", formData);  // ← IMPORTANT leading slash
};

export const deleteFile = (fileId) => {
  return api.delete(`/files/delete/${fileId}`);
};

export const getFiles = () => {
  return api.get('/files/list');
};

export const inspectFile = (fileId) => {
  return api.get(`/files/inspect/${fileId}`);
};

export const downloadEncryptedFile = async (fileId, filename) => {
  const response = await api.get(`/files/download/encrypted/${fileId}`, {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename + ".enc");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadDecryptedFile = async (fileId, filename) => {
  const response = await api.get(`/files/download/decrypted/${fileId}`, {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default api;