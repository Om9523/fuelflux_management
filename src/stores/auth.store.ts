import { create } from 'zustand';
import { api, decodeFakeJWT } from '../lib/api';
import { User, Role } from '../lib/mock-db';

interface AuthState {
  user: User | null;
  activeRole: Role | null;
  isAuthenticated: boolean;
  permissions: string[];
  isLoading: boolean;
  error: string | null;

  login: (emailOrPhone: string, password: string, rememberMe: boolean) => Promise<{ rolesCount: number; role?: Role }>;
  registerUser: (formData: any) => Promise<void>;
  verifyOTP: (identifier: string, code: string) => Promise<void>;
  resendOTP: (identifier: string, type: 'sms' | 'email') => Promise<void>;
  forgotPasswordRequest: (emailOrPhone: string) => Promise<void>;
  resetPassword: (emailOrPhone: string, password: string) => Promise<void>;
  switchRole: (role: Role) => Promise<void>;
  logout: () => void;
  initializeSession: () => void;
  refreshSession: () => Promise<void>;
}

// Helper to set cookie
const setCookie = (name: string, value: string, days = 7) => {
  if (typeof window === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

// Helper to delete cookie
const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
};

// Map role to permissions
const getPermissionsForRole = (role: Role): string[] => {
  switch (role) {
    case 'admin':
      return ['all_stations', 'manage_users', 'view_revenue', 'system_config', 'export_reports'];
    case 'pump_owner':
      return ['own_stations', 'manage_inventory', 'view_reports', 'manage_employees', 'view_sales'];
    case 'logistic':
      return ['fleet_status', 'manage_trips', 'fuel_dispatch', 'driver_attendance'];
    case 'investor':
      return ['view_analytics', 'view_financials', 'audit_logs'];
    case 'employee':
      return ['pump_attendance', 'process_sales', 'report_shortage'];
    default:
      return [];
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  activeRole: null,
  isAuthenticated: false,
  permissions: [],
  isLoading: false,
  error: null,

  initializeSession: () => {
    if (typeof window === 'undefined') return;
    
    const accessToken = localStorage.getItem('fuelflux_accessToken');
    const refreshToken = localStorage.getItem('fuelflux_refreshToken');
    const storedUser = localStorage.getItem('fuelflux_user');
    const activeRole = localStorage.getItem('fuelflux_activeRole') as Role | null;

    if (accessToken && refreshToken && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const decoded = decodeFakeJWT(accessToken);
        
        if (decoded && decoded.exp > Date.now() / 1000) {
          set({
            user,
            activeRole,
            isAuthenticated: true,
            permissions: activeRole ? getPermissionsForRole(activeRole) : [],
            error: null,
          });
        } else {
          // Token expired, clear or let interceptor handle on first request
          get().logout();
        }
      } catch (e) {
        get().logout();
      }
    } else {
      // LocalStorage is empty but we might have stale cookies! Clear them to break redirect loops!
      get().logout();
    }
  },

  login: async (emailOrPhone, password, rememberMe) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { emailOrPhone, password, rememberMe });
      const { user, accessToken, refreshToken } = response.data;

      // Save tokens in LocalStorage
      localStorage.setItem('fuelflux_accessToken', accessToken);
      localStorage.setItem('fuelflux_refreshToken', refreshToken);
      localStorage.setItem('fuelflux_user', JSON.stringify(user));

      // Sync tokens to cookies for Next.js Middleware Edge protection
      setCookie('fuelflux_accessToken', accessToken, rememberMe ? 7 : 1);
      setCookie('fuelflux_refreshToken', refreshToken, rememberMe ? 7 : 1);

      let activeRole: Role | null = null;
      if (user.roles && user.roles.length === 1) {
        const role = user.roles[0];
        activeRole = role;
        localStorage.setItem('fuelflux_activeRole', role);
        setCookie('fuelflux_activeRole', role, rememberMe ? 7 : 1);
      }

      set({
        user,
        activeRole,
        permissions: activeRole ? getPermissionsForRole(activeRole) : [],
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { rolesCount: user.roles.length, role: activeRole || undefined };
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Login failed' });
      throw err;
    }
  },

  registerUser: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/register', formData);
      set({ isLoading: false, error: null });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Registration failed' });
      throw err;
    }
  },

  verifyOTP: async (identifier, code) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/verify-otp', { identifier, code });
      set({ isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'OTP verification failed' });
      throw err;
    }
  },

  resendOTP: async (identifier, type) => {
    try {
      await api.post('/auth/resend-otp', { identifier, type });
    } catch (err: any) {
      throw err;
    }
  },

  forgotPasswordRequest: async (emailOrPhone) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/forgot-password-request', { emailOrPhone });
      set({ isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Password reset request failed' });
      throw err;
    }
  },

  resetPassword: async (emailOrPhone, password) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/reset-password', { emailOrPhone, password });
      set({ isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Password reset failed' });
      throw err;
    }
  },

  switchRole: async (role) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/select-role', { role });
      const { accessToken } = response.data;

      localStorage.setItem('fuelflux_accessToken', accessToken);
      localStorage.setItem('fuelflux_activeRole', role);
      
      setCookie('fuelflux_accessToken', accessToken, 7);
      setCookie('fuelflux_activeRole', role, 7);

      set({
        activeRole: role,
        permissions: getPermissionsForRole(role),
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to switch role' });
      throw err;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fuelflux_accessToken');
      localStorage.removeItem('fuelflux_refreshToken');
      localStorage.removeItem('fuelflux_user');
      localStorage.removeItem('fuelflux_activeRole');

      deleteCookie('fuelflux_accessToken');
      deleteCookie('fuelflux_refreshToken');
      deleteCookie('fuelflux_activeRole');
    }

    set({
      user: null,
      activeRole: null,
      isAuthenticated: false,
      permissions: [],
      error: null,
    });
  },

  refreshSession: async () => {
    set({ isLoading: true });
    try {
      const refreshToken = localStorage.getItem('fuelflux_refreshToken');
      if (!refreshToken) throw new Error('No refresh token found');

      const response = await api.post('/auth/refresh', { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data;

      localStorage.setItem('fuelflux_accessToken', accessToken);
      localStorage.setItem('fuelflux_refreshToken', newRefreshToken);
      setCookie('fuelflux_accessToken', accessToken, 7);
      setCookie('fuelflux_refreshToken', newRefreshToken, 7);

      set({ isLoading: false });
    } catch (err: any) {
      get().logout();
      throw err;
    }
  },
}));
