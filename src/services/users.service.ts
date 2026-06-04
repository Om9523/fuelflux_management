import { api } from '@/lib/api';
import { User } from '@/lib/mock-db';

export const usersService = {
  async getUsers(): Promise<User[]> {
    const res = await api.get('/admin/users');
    return res.data.users;
  },

  async updateUserStatus(id: string, status: 'active' | 'suspended', actionBy: string): Promise<User> {
    const res = await api.patch(`/admin/users/${id}`, { status, actionBy });
    return res.data.user;
  },

  async updateUserRoles(id: string, roles: User['roles'], actionBy: string): Promise<User> {
    const res = await api.patch(`/admin/users/${id}`, { roles, actionBy });
    return res.data.user;
  },
};
