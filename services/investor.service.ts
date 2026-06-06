import { useInvestorStore, PortfolioProfile } from '@/stores/investor.store';

export const investorService = {
  /**
   * Get all portfolios owned by the active investor
   */
  async getPortfolios(): Promise<PortfolioProfile[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return useInvestorStore.getState().portfolios;
  },

  /**
   * Get the currently active portfolio details
   */
  async getActivePortfolio(): Promise<PortfolioProfile | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const { portfolios, activePortfolioId } = useInvestorStore.getState();
    return portfolios.find(p => p.id === activePortfolioId) || null;
  }
};
