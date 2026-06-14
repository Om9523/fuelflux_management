import { create } from 'zustand';
import { EmployeeProfile, User, Announcement } from '@/lib/mock-db';
import { employeeService } from '@/services/employee.service';

interface EmployeeState {
  profile: EmployeeProfile | null;
  user: Omit<User, 'passwordHash'> | null;
  announcements: Announcement[];
  isLoading: boolean; // Keep for compatibility if used elsewhere
  isLoadingProfile: boolean;
  isLoadingAnnouncements: boolean;
  isLoadingUpdate: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  updateProfile: (data: { name?: string; email?: string; phone?: string; photoUrl?: string }) => Promise<void>;
  fetchAnnouncements: () => Promise<void>;
  changePassword: (current: string, newPass: string) => Promise<void>;
  clearStore: () => void;
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
  profile: null,
  user: null,
  announcements: [],
  isLoading: false,
  isLoadingProfile: false,
  isLoadingAnnouncements: false,
  isLoadingUpdate: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoadingProfile: true, error: null });
    try {
      const { profile, user } = await employeeService.getProfile();
      set({ profile, user, isLoadingProfile: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch employee profile', isLoadingProfile: false });
    }
  },

  updateProfile: async (data) => {
    set({ isLoadingUpdate: true, error: null });
    try {
      const updatedProfile = await employeeService.updateProfile(data);
      set((state) => ({
        profile: updatedProfile,
        user: state.user ? {
          ...state.user,
          name: data.name ?? state.user.name,
          email: data.email ?? state.user.email,
          phone: data.phone ?? state.user.phone,
        } : null,
        isLoadingUpdate: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to update employee profile', isLoadingUpdate: false });
      throw err;
    }
  },

  fetchAnnouncements: async () => {
    set({ isLoadingAnnouncements: true, error: null });
    try {
      const announcements = await employeeService.getAnnouncements();
      set({ announcements, isLoadingAnnouncements: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch announcements', isLoadingAnnouncements: false });
    }
  },

  changePassword: async (current, newPass) => {
    set({ isLoadingUpdate: true, error: null });
    try {
      await employeeService.changePassword(current, newPass);
      set({ isLoadingUpdate: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to change password', isLoadingUpdate: false });
      throw err;
    }
  },

  clearStore: () =>
    set({
      profile: null,
      user: null,
      announcements: [],
      error: null,
      isLoading: false,
      isLoadingProfile: false,
      isLoadingAnnouncements: false,
      isLoadingUpdate: false,
    }),
}));
