import { create } from 'zustand';
import backendApi from '../lib/backendApi';         // ✅ Real FastAPI connection

interface AdminState {
  adminUser: any | null;
  isAdminAuthenticated: boolean;
  adminAccessToken: string | null;
  isLoading: boolean;
  error: string | null;

  pumps: any[];
  owners: any[];
  logistics: any[];
  investors: any[];
  supportTickets: any[];

  adminLogin: (emailOrPhone: string, password: string) => Promise<{ success: boolean; email: string }>;
  verifyAdmin2FA: (email: string, code: string) => Promise<void>;
  adminLogout: () => void;
  initializeAdminSession: () => void;

  fetchPumps: () => Promise<void>;
  updatePumpStatus: (id: string, status: string) => Promise<void>;
  fetchOwners: () => Promise<void>;
  fetchLogistics: () => Promise<void>;
  fetchInvestors: () => Promise<void>;
  fetchSupportTickets: () => Promise<void>;
  replySupportTicket: (ticketId: string, message: string, status?: string) => Promise<void>;
}

const setAdminCookie = (name: string, value: string, maxAgeSeconds = 1800) => {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=${value};max-age=${maxAgeSeconds};path=/;SameSite=Lax`;
};

const deleteAdminCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
};

export const useAdminStore = create<AdminState>((set, get) => ({
  adminUser: null,
  isAdminAuthenticated: false,
  adminAccessToken: null,
  isLoading: false,
  error: null,

  pumps: [],
  owners: [],
  logistics: [],
  investors: [],
  supportTickets: [],

  // Session restore on page refresh
  initializeAdminSession: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('fuelflux_admin_accessToken');
    const storedUser = localStorage.getItem('fuelflux_admin_user');
    if (token && storedUser) {
      try {
        const parts = token.split('.');
        const payload = JSON.parse(atob(parts[1]));
        if (payload && payload.exp > Date.now() / 1000) {
          set({ adminUser: JSON.parse(storedUser), adminAccessToken: token, isAdminAuthenticated: true });
          return;
        }
      } catch (e) { }
    }
    get().adminLogout();
  },

  // STEP 1: Credentials → OTP bhejo — NO TOKEN SET
  adminLogin: async (emailOrPhone, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await backendApi.post('/admin/auth/login', { emailOrPhone, password });
      set({ isLoading: false });
      return { success: true, email: response.data.email };
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Login failed' });
      throw err;
    }
  },

  // STEP 2: OTP verify → Token milega → Authenticate
  verifyAdmin2FA: async (email, code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await backendApi.post('/admin/auth/verify-2fa', { email, code });
      const { user, accessToken } = response.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('fuelflux_admin_accessToken', accessToken);
        localStorage.setItem('fuelflux_admin_user', JSON.stringify(user));
      }
      setAdminCookie('fuelflux_admin_accessToken', accessToken, 1800);
      set({ adminUser: user, adminAccessToken: accessToken, isAdminAuthenticated: true, isLoading: false, error: null });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Invalid 2FA code' });
      throw err;
    }
  },

  adminLogout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fuelflux_admin_accessToken');
      localStorage.removeItem('fuelflux_admin_refreshToken');
      localStorage.removeItem('fuelflux_admin_user');
      deleteAdminCookie('fuelflux_admin_accessToken');
    }
    set({ adminUser: null, adminAccessToken: null, isAdminAuthenticated: false, error: null });
  },

  fetchPumps: async () => {
    set({ isLoading: true });
    try {
      const res = await backendApi.get('/admin/pumps');
      set({ pumps: res.data.data?.pumps || [], isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  updatePumpStatus: async (id, status) => {
    try {
      await backendApi.patch(`/admin/pumps/${id}/status`, { status });
      const updatedPumps = get().pumps.map((p) => p.id === id ? { ...p, status } : p);
      set({ pumps: updatedPumps });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  fetchOwners: async () => {
    set({ isLoading: true });
    try {
      const res = await backendApi.get('/admin/owners');
      set({ owners: res.data.data?.owners || [], isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  fetchLogistics: async () => {
    set({ isLoading: true });
    try {
      const res = await backendApi.get('/admin/logistics');
      set({ logistics: res.data.data?.logistics || [], isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  fetchInvestors: async () => {
    set({ isLoading: true });
    try {
      const res = await backendApi.get('/admin/investors');
      set({ investors: res.data.data?.investors || [], isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  fetchSupportTickets: async () => {
    set({ isLoading: true });
    try {
      const res = await backendApi.get('/admin/support/tickets');
      set({ supportTickets: res.data.data?.tickets || [], isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  replySupportTicket: async (ticketId, message, status) => {
    try {
      const res = await backendApi.post(`/admin/support/tickets/${ticketId}`, { message, status });
      const updatedTickets = get().supportTickets.map((t) => t.id === ticketId ? res.data.data?.ticket || t : t);
      set({ supportTickets: updatedTickets });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },
}));