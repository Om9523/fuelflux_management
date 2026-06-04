import { api } from '@/lib/api';
import { SubscriptionRecord } from '@/lib/mock-db';

export const subscriptionsService = {
  async getSubscriptions(): Promise<SubscriptionRecord[]> {
    const res = await api.get('/admin/subscriptions');
    return res.data.subscriptions;
  },
};
