import axios from 'axios';
import { getRuntimeConfig } from '../config/runtimeConfig';

const { apiBaseUrl } = getRuntimeConfig();

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || apiBaseUrl || '/api',
  timeout: 15000,
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message;
    return Promise.reject(new Error(message));
  }
);

export default http;
