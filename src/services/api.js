import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/api', // Spring Boot backend API adresin (gerekirse portu değiştir)
  headers: {
    'Content-Type': 'application/json',
  },
});

// İstek atılırken LocalStorage'da token varsa otomatik olarak Header'a ekle
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;