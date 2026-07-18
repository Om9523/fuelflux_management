/**
 * backendApi.ts
 * Real Axios client for the FastAPI backend.
 * Admin routes → admin token | User routes → user token
 */

import axios from 'axios';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export const backendApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ── Request interceptor: Admin vs User token ──────────────────
backendApi.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const isAdminRoute = config.url?.startsWith('/admin');

      const token = isAdminRoute
        ? localStorage.getItem('fuelflux_admin_accessToken')  // Admin: 30min token
        : localStorage.getItem('fuelflux_accessToken');        // User: 7day token

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: normalise errors ────────────────────
backendApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Admin token expired → redirect to admin login
    if (error.response?.status === 401) {
      const isAdminRoute = error.config?.url?.startsWith('/admin');
      if (isAdminRoute && typeof window !== 'undefined') {
        localStorage.removeItem('fuelflux_admin_accessToken');
        localStorage.removeItem('fuelflux_admin_user');
        window.location.href = '/admin/login?expired=true';
      }
    }

    const rawDetail = error.response?.data?.detail;

    // FEATURE_LOCKED / NO_SUBSCRIPTION / LIMIT_REACHED come as a JSON object,
    // not a string. Keep the original axios error in that case so
    // isFeatureLockedError() can read err.response.data.detail directly.
    if (rawDetail && typeof rawDetail === 'object' && rawDetail.locked) {
      return Promise.reject(error);
    }

    const message =
      (typeof rawDetail === 'string' ? rawDetail : null) ||
      error.response?.data?.message ||
      error.message ||
      'Server error occurred';

    return Promise.reject(new Error(message));
  }
);

export default backendApi;