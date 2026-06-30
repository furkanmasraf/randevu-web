import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Her istek gönderilmeden önce localStorage'daki güncel token'ı yakalayıp Header'a ekler
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;