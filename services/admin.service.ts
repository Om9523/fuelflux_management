import { api } from '@/lib/api';

export const adminService = {
  async login(emailOrPhone: string, password: string) {
    const res = await api.post('/admin/auth/login', { emailOrPhone, password });
    return res.data;
  },

  async verify2FA(email: string, code: string) {
    const res = await api.post('/admin/auth/verify-2fa', { email, code });
    return res.data;
  },
};
