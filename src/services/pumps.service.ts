import { api } from '@/lib/api';
import { Pump } from '@/lib/mock-db';

export const pumpsService = {
  async getPumps(): Promise<Pump[]> {
    const res = await api.get('/admin/pumps');
    return res.data.pumps;
  },

  async updateStatus(id: string, status: Pump['status'], actionBy: string): Promise<Pump> {
    const res = await api.patch(`/admin/pumps/${id}`, { status, actionBy });
    return res.data.pump;
  },
};
