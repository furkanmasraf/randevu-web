import axios from 'axios';

declare const process: { env: { NODE_ENV: string } } | undefined;

const baseURL = 'https://randevu-sistemi-dv33.onrender.com';

const API = axios.create({
  baseURL: baseURL,
  withCredentials: true // Bu, hem local'de hem canlıda CORS sorununu çözmek için elzem.
});

API.interceptors.request.use((config) => {
  if (config.url?.includes('/auth/login')) {
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