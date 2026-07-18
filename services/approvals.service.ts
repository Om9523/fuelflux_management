import { api } from '@/lib/api';
import { Pump } from '@/lib/mock-db';

export const approvalsService = {
  async getPendingApprovals(): Promise<Pump[]> {
    const res = await api.get('/admin/pumps');
    return res.data.pumps.filter((p: Pump) => p.status === 'pending' || p.status === 'under_review');
  },

  async approvePump(id: string, actionBy: string): Promise<Pump> {
    const res = await api.patch(`/admin/pumps/${id}`, { status: 'approved', actionBy });
    return res.data.pump;
  },

  async rejectPump(id: string, actionBy: string): Promise<Pump> {
    const res = await api.patch(`/admin/pumps/${id}`, { status: 'rejected', actionBy });
    return res.data.pump;
  },

  async requestReupload(id: string, actionBy: string): Promise<Pump> {
    const res = await api.patch(`/admin/pumps/${id}`, { status: 'under_review', actionBy });
    return res.data.pump;
  },
};
