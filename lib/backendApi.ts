/**
 * backendApi.ts
 * Real Axios client for the FastAPI backend.
 *
 * Token priority:
 *   Admin routes  (/admin/*)   → fuelflux_admin_accessToken
 *   Employee routes (/employee/* + /auth/employee-login) → fuelflux_employee_accessToken
 *   All other routes           → fuelflux_accessToken  (pump owner)
 */

import axios from 'axios';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export const backendApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ── Token storage keys (single source of truth) ───────────────────────────────
export const TOKEN_KEYS = {
  PUMP_OWNER: 'fuelflux_accessToken',
  PUMP_OWNER_REFRESH: 'fuelflux_refreshToken',
  EMPLOYEE: 'fuelflux_employee_accessToken',
  EMPLOYEE_REFRESH: 'fuelflux_employee_refreshToken',
  EMPLOYEE_USER: 'fuelflux_employee_user',
  ADMIN: 'fuelflux_admin_accessToken',
};

/** Save employee tokens after login */
export const saveEmployeeSession = (accessToken: string, refreshToken: string, user: object) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEYS.EMPLOYEE, accessToken);
  localStorage.setItem(TOKEN_KEYS.EMPLOYEE_REFRESH, refreshToken);
  localStorage.setItem(TOKEN_KEYS.EMPLOYEE_USER, JSON.stringify(user));
};

/** Clear employee session on logout */
export const clearEmployeeSession = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEYS.EMPLOYEE);
  localStorage.removeItem(TOKEN_KEYS.EMPLOYEE_REFRESH);
  localStorage.removeItem(TOKEN_KEYS.EMPLOYEE_USER);
};

/** Get saved employee user object */
export const getEmployeeUser = () => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(TOKEN_KEYS.EMPLOYEE_USER);
  return raw ? JSON.parse(raw) : null;
};

// ── Request interceptor ───────────────────────────────────────────────────────
backendApi.interceptors.request.use(
  (config) => {
    if (typeof window === 'undefined') return config;

    const url = config.url || '';
    const isAdminRoute = url.startsWith('/admin');
    const isEmployeeRoute =
      url.startsWith('/employee') ||
      url === '/auth/employee-login' ||
      url.startsWith('/shifts/my-schedule') ||
      url === '/announcements/employee';

    let token: string | null = null;

    if (isAdminRoute) {
      token = localStorage.getItem(TOKEN_KEYS.ADMIN);
    } else if (isEmployeeRoute) {
      token = localStorage.getItem(TOKEN_KEYS.EMPLOYEE);
    } else {
      token = localStorage.getItem(TOKEN_KEYS.PUMP_OWNER);
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────────────────────
backendApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const url = error.config?.url || '';
      const isAdminRoute = url.startsWith('/admin');
      const isEmployeeRoute =
        url.startsWith('/employee') ||
        url.startsWith('/shifts/my-schedule') ||
        url === '/announcements/employee';

      if (isAdminRoute) {
        localStorage.removeItem(TOKEN_KEYS.ADMIN);
        window.location.href = '/admin/login?expired=true';
      } else if (isEmployeeRoute) {
        // Employee token expired → back to employee login
        clearEmployeeSession();
        window.location.href = '/employee/login?expired=true';
      }
      // pump_owner 401 → let individual pages handle it
    }

    const rawDetail = error.response?.data?.detail;

    // Keep original error for feature-locked responses
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