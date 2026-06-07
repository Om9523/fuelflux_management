import { api } from '@/lib/api';
import { EmployeeProfile, User, Announcement } from '@/lib/mock-db';

export const employeeService = {
  async getProfile(): Promise<{ profile: EmployeeProfile; user: Omit<User, 'passwordHash'> }> {
    const res = await api.get('/employee/profile');
    return res.data;
  },

  async updateProfile(data: {
    name?: string;
    email?: string;
    phone?: string;
    photoUrl?: string;
  }): Promise<EmployeeProfile> {
    const res = await api.patch('/employee/profile', data);
    return res.data.profile;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/employee/change-password', { currentPassword, newPassword });
  },

  async getAnnouncements(): Promise<Announcement[]> {
    const res = await api.get('/employee/announcements');
    return res.data.records;
  },
};
