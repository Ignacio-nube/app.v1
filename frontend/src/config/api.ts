import axios from 'axios';

// Usar ruta relativa para aprovechar el proxy de Vite en desarrollo
// En producción, Vercel u otro hosting manejará esto
const API_URL = '/api';

// Crear instancia de Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error;

    if (response?.status === 401) {
      const storedToken = localStorage.getItem('token');
      const hasAuthHeader = Boolean(config?.headers?.Authorization);
      const isAuthLogin = (config?.url || '').includes('/auth/login');

      if (!isAuthLogin && (storedToken || hasAuthHeader)) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
