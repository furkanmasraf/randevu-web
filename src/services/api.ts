import axios from 'axios';

const baseURL = 'https://randevu-sistemi-dv33.onrender.com';

const API = axios.create({
  baseURL: baseURL,
  withCredentials: true 
});

API.interceptors.request.use((config) => {
  // Giriş ve Kayıt yollarını interceptor'dan muaf tut
  const publicPaths = ['/auth/login', '/auth/register'];
  if (publicPaths.some(path => config.url?.includes(path))) {
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