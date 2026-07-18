import { create } from 'zustand';
import { authService, UserData } from '../services/auth.service';

export type Role = 'admin' | 'pump_owner' | 'logistic' | 'investor' | 'employee';

interface AuthState {
  user: UserData | null;
  activeRole: Role | null;
  isAuthenticated: boolean;
  permissions: string[];
  isLoading: boolean;
  error: string | null;

  login: (emailOrPhone: string, password: string, rememberMe: boolean) => Promise<{ rolesCount: number }>;
  registerUser: (formData: { email: string; phone: string; name: string; password: string }) => Promise<void>;
  verifyOTP: (emailOrPhone: string, code: string) => Promise<any>;
  sendOTP: (emailOrPhone: string) => Promise<void>;
  forgotPasswordRequest: (emailOrPhone: string) => Promise<void>;
  resetPassword: (emailOrPhone: string, newPassword: string, token: string) => Promise<void>;
  switchRole: (role: Role) => Promise<void>;
  logout: () => Promise<void>;
  initializeSession: () => void;
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
    const storedUser = localStorage.getItem('fuelflux_user');
    const activeRole = localStorage.getItem('fuelflux_activeRole') as Role | null;

    if (accessToken && storedUser && authService.isAuthenticated()) {
      try {
        const user = JSON.parse(storedUser) as UserData;
        
        // Determine active role from user's roles
        let role: Role = activeRole && user.roles.includes(activeRole) 
          ? (activeRole as Role)
          : (user.roles[0] as Role) || 'employee';

        set({
          user,
          activeRole: role,
          isAuthenticated: true,
          permissions: getPermissionsForRole(role),
          error: null,
        });
      } catch (e) {
        get().logout();
      }
    }
  },

  login: async (emailOrPhone, password, rememberMe) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(emailOrPhone, password);
      
      // Save user data
      localStorage.setItem('fuelflux_user', JSON.stringify(data.user));

      // Set cookies for Next.js Middleware
      setCookie('fuelflux_accessToken', data.accessToken, rememberMe ? 7 : 1);
      setCookie('fuelflux_refreshToken', data.refreshToken, rememberMe ? 7 : 1);

      const rolesCount = data.user.roles.length;

      // If user has only 1 role → auto-select it, skip role selection page
      if (rolesCount === 1) {
        const autoRole = data.user.roles[0] as Role;
        localStorage.setItem('fuelflux_activeRole', autoRole);
        setCookie('fuelflux_activeRole', autoRole, rememberMe ? 7 : 1);
        set({
          user: data.user,
          activeRole: autoRole,
          isAuthenticated: true,
          permissions: getPermissionsForRole(autoRole),
          isLoading: false,
          error: null,
        });
      } else {
        // Multi-role user → let them choose on /select-role
        set({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      }

      return { rolesCount };
    } catch (err: any) {
      const errorMsg = err.message || 'Login failed. Please check your credentials.';
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },

  registerUser: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.register(formData);
      
      localStorage.setItem('fuelflux_user', JSON.stringify(data.user));
      setCookie('fuelflux_accessToken', data.accessToken, 1);
      setCookie('fuelflux_refreshToken', data.refreshToken, 1);

      const initialRole = (data.user.roles[0] as Role) || 'employee';

      set({
        user: data.user,
        activeRole: initialRole,
        isAuthenticated: true,
        permissions: getPermissionsForRole(initialRole),
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      const errorMsg = err.message || 'Registration failed. Please try again.';
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },

  verifyOTP: async (emailOrPhone, code) => {
    set({ isLoading: true, error: null });
    try {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);
      const res = await authService.verifyOTP({
        ...(isEmail ? { email: emailOrPhone } : { phone: emailOrPhone }),
        otp: code,
      });
      set({ isLoading: false });
      return res;
    } catch (err: any) {
      const errorMsg = err.message || 'OTP verification failed';
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },

  sendOTP: async (emailOrPhone) => {
    set({ isLoading: true, error: null });
    try {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);
      await authService.sendOTP(
        isEmail ? { email: emailOrPhone } : { phone: emailOrPhone }
      );
      set({ isLoading: false });
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to send OTP';
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },

  forgotPasswordRequest: async (emailOrPhone) => {
    set({ isLoading: true, error: null });
    try {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);
      await authService.sendOTP({
        ...(isEmail ? { email: emailOrPhone } : { phone: emailOrPhone }),
        purpose: 'reset',
      });
      set({ isLoading: false });
    } catch (err: any) {
      const errorMsg = err.message || 'Password reset request failed';
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },

  resetPassword: async (emailOrPhone, newPassword, token) => {
    set({ isLoading: true, error: null });
    try {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);
      await authService.resetPassword({
        ...(isEmail ? { email: emailOrPhone } : { phone: emailOrPhone }),
        password: newPassword,
        token: token,
      });
      set({ isLoading: false });
    } catch (err: any) {
      const errorMsg = err.message || 'Password reset failed';
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },

  switchRole: async (role) => {
    set({ isLoading: true, error: null });
    try {
      const user = get().user;
      if (!user || !user.roles.includes(role)) {
        throw new Error('Invalid role');
      }

      localStorage.setItem('fuelflux_activeRole', role);
      setCookie('fuelflux_activeRole', role, 7);

      set({
        activeRole: role,
        permissions: getPermissionsForRole(role),
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to switch role';
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fuelflux_user');
        localStorage.removeItem('fuelflux_activeRole');
        deleteCookie('fuelflux_activeRole');
      }

      set({
        user: null,
        activeRole: null,
        isAuthenticated: false,
        permissions: [],
        error: null,
      });
    }
  },
}));
