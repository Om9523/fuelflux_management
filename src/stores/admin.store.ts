import { create } from 'zustand';
import { api, decodeFakeJWT } from '../lib/api';
import { User, Pump, LogisticsPartner, Investor, SupportTicket } from '../lib/mock-db';

interface AdminState {
  adminUser: Omit<User, 'passwordHash'> | null;
  isAdminAuthenticated: boolean;
  adminAccessToken: string | null;
  isLoading: boolean;
  error: string | null;

  // Operations Data
  pumps: Pump[];
  owners: any[];
  logistics: LogisticsPartner[];
  investors: Investor[];
  supportTickets: SupportTicket[];

  // Auth Operations
  adminLogin: (emailOrPhone: string, password: string) => Promise<{ success: boolean; email: string }>;
  verifyAdmin2FA: (email: string, code: string) => Promise<void>;
  adminLogout: () => void;
  initializeAdminSession: () => void;

  // Management Operations
  fetchPumps: () => Promise<void>;
  updatePumpStatus: (id: string, status: Pump['status']) => Promise<void>;
  fetchOwners: () => Promise<void>;
  fetchLogistics: () => Promise<void>;
  fetchInvestors: () => Promise<void>;
  fetchSupportTickets: () => Promise<void>;
  replySupportTicket: (ticketId: string, message: string, status?: SupportTicket['status']) => Promise<void>;
}

// Cookie setting helper
const setAdminCookie = (name: string, value: string, maxAgeSeconds = 1800) => {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=${value};max-age=${maxAgeSeconds};path=/;SameSite=Lax`;
};

// Cookie deletion helper
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

  initializeAdminSession: () => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('fuelflux_admin_accessToken');
    const storedUser = localStorage.getItem('fuelflux_admin_user');

    if (token && storedUser) {
      try {
        const decoded = decodeFakeJWT(token);
        if (decoded && decoded.exp > Date.now() / 1000) {
          set({
            adminUser: JSON.parse(storedUser),
            adminAccessToken: token,
            isAdminAuthenticated: true,
          });
          return;
        }
      } catch (e) {}
    }
    get().adminLogout();
  },

  adminLogin: async (emailOrPhone, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/admin/auth/login', { emailOrPhone, password });
      const { user, accessToken, refreshToken } = response.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('fuelflux_admin_accessToken', accessToken);
        localStorage.setItem('fuelflux_admin_refreshToken', refreshToken);
        localStorage.setItem('fuelflux_admin_user', JSON.stringify(user));
      }

      // Separate Admin session max-age: 30 minutes (1800 seconds)
      setAdminCookie('fuelflux_admin_accessToken', accessToken, 1800);

      set({
        adminUser: user,
        adminAccessToken: accessToken,
        isAdminAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, email: user.email };
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Login failed' });
      throw err;
    }
  },

  verifyAdmin2FA: async (email, code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/admin/auth/verify-2fa', { email, code });
      const { user, accessToken, refreshToken } = response.data;

      localStorage.setItem('fuelflux_admin_accessToken', accessToken);
      localStorage.setItem('fuelflux_admin_refreshToken', refreshToken);
      localStorage.setItem('fuelflux_admin_user', JSON.stringify(user));

      // Separate Admin session max-age: 30 minutes (1800 seconds)
      setAdminCookie('fuelflux_admin_accessToken', accessToken, 1800);

      set({
        adminUser: user,
        adminAccessToken: accessToken,
        isAdminAuthenticated: true,
        isLoading: false,
        error: null,
      });
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

    set({
      adminUser: null,
      adminAccessToken: null,
      isAdminAuthenticated: false,
      error: null,
    });
  },

  fetchPumps: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/admin/pumps');
      set({ pumps: res.data.pumps, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  updatePumpStatus: async (id, status) => {
    try {
      const adminName = get().adminUser?.name || 'Administrator';
      const res = await api.patch(`/admin/pumps/${id}`, { status, actionBy: adminName });
      
      // Update local store state
      const updatedPumps = get().pumps.map((p) => (p.id === id ? res.data.pump : p));
      set({ pumps: updatedPumps });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  fetchOwners: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/admin/owners');
      set({ owners: res.data.owners, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  fetchLogistics: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/admin/logistics');
      set({ logistics: res.data.logistics, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  fetchInvestors: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/admin/investors');
      set({ investors: res.data.investors, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  fetchSupportTickets: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/admin/support/tickets');
      set({ supportTickets: res.data.tickets, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  replySupportTicket: async (ticketId, message, status) => {
    try {
      const senderName = get().adminUser?.name || 'Admin Agent';
      const res = await api.post(`/admin/support/tickets/${ticketId}`, {
        message,
        status,
        senderName,
      });

      const updatedTickets = get().supportTickets.map((t) =>
        t.id === ticketId ? res.data.ticket : t
      );
      set({ supportTickets: updatedTickets });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },
}));
