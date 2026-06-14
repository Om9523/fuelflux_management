import { create } from 'zustand';
import { api } from '../lib/api';
import { AuditLog, FraudAlert } from '../lib/mock-db';

interface AuditState {
  auditLogs: AuditLog[];
  fraudAlerts: FraudAlert[];
  isLoading: boolean;
  error: string | null;

  fetchAuditLogs: () => Promise<void>;
  fetchFraudAlerts: () => Promise<void>;
  resolveFraudAlert: (id: string, status: FraudAlert['status']) => Promise<void>;
}

export const useAuditStore = create<AuditState>((set, get) => ({
  auditLogs: [],
  fraudAlerts: [],
  isLoading: false,
  error: null,

  fetchAuditLogs: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/admin/audit-logs');
      // Sort logs descending by timestamp
      const logs = res.data.auditLogs.sort(
        (a: AuditLog, b: AuditLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      set({ auditLogs: logs, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  fetchFraudAlerts: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/admin/fraud-alerts');
      set({ fraudAlerts: res.data.fraudAlerts, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  resolveFraudAlert: async (id, status) => {
    try {
      const res = await api.patch(`/admin/fraud-alerts/${id}`, { status });
      const updatedAlerts = get().fraudAlerts.map((a) => (a.id === id ? res.data.alert : a));
      set({ fraudAlerts: updatedAlerts });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },
}));
