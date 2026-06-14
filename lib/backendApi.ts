/**
 * backendApi.ts
 * Real Axios client for the FastAPI backend.
 * Base URL is taken from NEXT_PUBLIC_API_URL (.env.local).
 * JWT token is automatically attached from localStorage.
 */

import axios from 'axios';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export const backendApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ── Request interceptor: attach JWT token ─────────────────────────────────────
backendApi.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('fuelflux_accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: normalise error messages ───────────────────────────
backendApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'Server error occurred';
    return Promise.reject(new Error(message));
  }
);

export default backendApi;
