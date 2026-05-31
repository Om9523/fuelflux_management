import { useInvestorStore, FleetBI } from '@/stores/investor.store';

export const analyticsService = {
  /**
   * Get B2B fleet statistics for the active portfolio
   */
  async getFleetsBI(): Promise<FleetBI[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const { fleets, activePortfolioId } = useInvestorStore.getState();
    return fleets[activePortfolioId] || [];
  }
};
