import axios from 'axios';

// Toma la URL de producción configurada en Vercel/env o usa localhost por defecto en desarrollo
const API_URL = import.meta.env.VITE_API_URL || 'https://api.sigejod.com/api';

const client = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let accessToken = null;
let refreshPromise = null;

export const setAccessToken = (token) => {
  accessToken = token || null;
};

export const getAccessToken = () => accessToken;

client.interceptors.request.use(
  (config) => {
    const isAuthRequest = ['/auth/login', '/auth/refresh', '/auth/logout'].includes(config.url);

    if (accessToken && !isAuthRequest) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';
    const isAuthRequest = ['/auth/refresh', '/auth/login', '/auth/logout'].includes(requestUrl);

    if (error.response?.status !== 401 || !originalRequest || isAuthRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = client
        .post('/auth/refresh', null, {
          withCredentials: true,
        })
        .then((response) => {
          const nextToken = response.data?.accessToken;
          if (!nextToken) {
            throw new Error('La respuesta de refresh no contiene accessToken.');
          }

          setAccessToken(nextToken);
          return nextToken;
        })
        .catch((refreshError) => {
          setAccessToken(null);
          throw refreshError;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    return refreshPromise.then((token) => {
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return client(originalRequest);
    });
  }
);

export default client;
