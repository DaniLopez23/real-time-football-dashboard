/**
 * API Client Configuration
 * 
 * Configuración base de axios para las peticiones HTTP
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

// Interceptor para requests (opcional - agregar tokens, logs, etc)
apiClient.interceptors.request.use(
  (config) => {
    // Aquí puedes agregar tokens de autenticación si es necesario
    // config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses (opcional - manejo global de errores)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // La petición fue hecha pero no hubo respuesta
      console.error('Network Error:', error.message);
    } else {
      // Algo ocurrió al configurar la petición
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);
