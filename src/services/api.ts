import axios from 'axios';

// Artık şüpheye yer yok, direkt canlı URL'i kullanıyoruz.
const API = axios.create({
  baseURL: 'https://randevu-sistemi-dv33.onrender.com',
  withCredentials: true 
});

API.interceptors.request.use((config) => {
  // Login ve Register isteklerinde token göndermiyoruz
  if (config.url?.includes('/auth/login') || config.url?.includes('/auth/register')) {
    return config;
  }

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;