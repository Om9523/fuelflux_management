import { useInvestorStore, FleetBI } from '@/stores/investor.store';
import { api } from '@/lib/api';

export const analyticsService = {
  /**
   * Get B2B fleet statistics for the active portfolio
   */
  async getFleetsBI(): Promise<FleetBI[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const { fleets, activePortfolioId } = useInvestorStore.getState();
    return fleets[activePortfolioId] || [];
  },

  async getPlatformRevenueStats() {
    const res = await api.get('/admin/payments');
    return res.data.payments;
  },

  async getPlatformSubscriptions() {
    const res = await api.get('/admin/subscriptions');
    return res.data.subscriptions;
  },
};
