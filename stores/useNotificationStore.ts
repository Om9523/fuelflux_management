import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [
        {
          id: 'notif-001',
          title: 'Welcome to FuelFlux',
          message: 'Your account has been created successfully.',
          type: 'success',
          timestamp: new Date().toISOString(),
          isRead: false
        }
      ],
      addNotification: (notification) => set((state) => ({
        notifications: [
          {
            ...notification,
            id: `notif-${Date.now()}`,
            timestamp: new Date().toISOString(),
            isRead: false,
          },
          ...state.notifications
        ]
      })),
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
      })),
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true }))
      })),
    }),
    {
      name: 'notification-storage',
    }
  )
);
