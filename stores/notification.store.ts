import { create } from 'zustand';

export interface StationNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'danger' | 'success';
  timestamp: string;
  read: boolean;
}

interface NotificationState {
  notifications: StationNotification[];
  unreadCount: number;

  addNotification: (title: string, message: string, type: StationNotification['type']) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const SEED_NOTIFICATIONS: StationNotification[] = [
  {
    id: 'n_1',
    title: 'Low Fuel Stock Alarm',
    message: 'Diesel Tank 1 capacity has dropped below 15% safety threshold (3,240 L remaining). Auto-replenish order drafted.',
    type: 'danger',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    read: false,
  },
  {
    id: 'n_2',
    title: 'Blacklisted Vehicle Attempt',
    message: 'ANPR camera 3 detected blacklisted fleet truck TS-08-EJ-9921 attempting credit fill. Dispenser locked.',
    type: 'warning',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    read: false,
  },
  {
    id: 'n_3',
    title: 'Shift Reconciliation Signed',
    message: 'Shift B sales registry audited and electronically signed by Attendant Vikram Singh.',
    type: 'success',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
    read: true,
  },
];

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: SEED_NOTIFICATIONS,
  unreadCount: SEED_NOTIFICATIONS.filter((n) => !n.read).length,

  addNotification: (title, message, type) => set((state) => {
    const newNotif: StationNotification = {
      id: 'n_' + Math.random().toString(36).substr(2, 9),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
    };
    const updated = [newNotif, ...state.notifications];
    return {
      notifications: updated,
      unreadCount: updated.filter((n) => !n.read).length,
    };
  }),

  markAsRead: (id) => set((state) => {
    const updated = state.notifications.map((n) => n.id === id ? { ...n, read: true } : n);
    return {
      notifications: updated,
      unreadCount: updated.filter((n) => !n.read).length,
    };
  }),

  markAllAsRead: () => set((state) => {
    const updated = state.notifications.map((n) => ({ ...n, read: true }));
    return {
      notifications: updated,
      unreadCount: 0,
    };
  }),

  clearAll: () => set({
    notifications: [],
    unreadCount: 0,
  }),
}));
