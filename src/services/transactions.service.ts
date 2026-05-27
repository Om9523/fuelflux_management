import { useFleetStore, FuelTransaction } from '@/stores/fleet.store';

export const transactionsService = {
  /**
   * Get all fuel ledger transactions for the active fleet
   */
  async getTransactions(): Promise<FuelTransaction[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const { transactions, activeFleetId } = useFleetStore.getState();
    return transactions[activeFleetId] || [];
  }
};
