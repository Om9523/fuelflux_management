import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../data/users';

interface AuthState {
  user: User | null;
  activeRole: string | null;
  isAuthenticated: boolean;
  isPremium: boolean;
  login: (user: User, role?: string) => void;
  logout: () => void;
  setActiveRole: (role: string) => void;
  upgradeToPremium: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      activeRole: null,
      isAuthenticated: false,
      isPremium: false,
      login: (user, role) => set({ 
        user, 
        isAuthenticated: true, 
        isPremium: false, // Default to false on login for demo, or read from user
        activeRole: role || (user.roles.length === 1 ? user.roles[0] : null) 
      }),
      logout: () => set({ user: null, isAuthenticated: false, activeRole: null, isPremium: false }),
      setActiveRole: (role) => set({ activeRole: role }),
      upgradeToPremium: () => set({ isPremium: true }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
