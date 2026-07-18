import { useInvestorStore, ComparativePump } from '@/stores/investor.store';

export const portfolioService = {
  /**
   * Get all comparative pump statistics for the active portfolio
   */
  async getPumpsPerformance(): Promise<ComparativePump[]> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const { pumps, activePortfolioId } = useInvestorStore.getState();
    return pumps[activePortfolioId] || [];
  }
};
