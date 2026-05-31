import { useInvestorStore, HistoricalRevenue } from '@/stores/investor.store';

export const revenueService = {
  /**
   * Get historical revenue trends for the active portfolio
   */
  async getRevenueHistory(): Promise<HistoricalRevenue[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const { revenues, activePortfolioId } = useInvestorStore.getState();
    return revenues[activePortfolioId] || [];
  }
};
