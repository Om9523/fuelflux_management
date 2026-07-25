import { create } from 'zustand';
import backendApi from '@/lib/backendApi';

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
  fetchAnnouncementsAsNotifications: () => Promise<void>;
}

const SEED_NOTIFICATIONS: StationNotification[] = [];

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

  fetchAnnouncementsAsNotifications: async () => {
    try {
      const res = await backendApi.get('/announcements/employee');
      const announcements = res.data;
      const mapped: StationNotification[] = announcements.map((a: any) => ({
        id: a.id,
        title: a.title,
        message: a.content,
        type: a.announcement_type === 'Urgent' ? 'danger'
             : a.announcement_type === 'Safety' ? 'warning'
             : a.announcement_type === 'Holiday' ? 'success'
             : 'info',
        timestamp: a.created_at,
        read: false,
      }));
      set({
        notifications: mapped,
        unreadCount: mapped.length,
      });
    } catch {
      // silent fail — bell just shows 0
    }
  },
}));
