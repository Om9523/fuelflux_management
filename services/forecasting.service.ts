import { useInvestorStore, DemandForecast } from '@/stores/investor.store';

export const forecastingService = {
  /**
   * Get demand forecasts and predictive curves for the active portfolio
   */
  async getForecastData(): Promise<DemandForecast[]> {
    await new Promise((resolve) => setTimeout(resolve, 450));
    const { forecasts, activePortfolioId } = useInvestorStore.getState();
    return forecasts[activePortfolioId] || [];
  }
};
