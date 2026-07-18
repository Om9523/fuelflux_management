import backendApi from '@/lib/backendApi';
import { useFleetStore, FuelTransaction } from '@/stores/fleet.store';

export const transactionsService = {
  /**
   * Get all fuel ledger transactions for the active fleet
   */
  async getTransactions(): Promise<FuelTransaction[]> {
    try {
      const { data } = await backendApi.get<FuelTransaction[]>('/logistic/transactions');
      
      const store = useFleetStore.getState();
      useFleetStore.setState({
        transactions: {
          ...store.transactions,
          [store.activeFleetId]: data
        }
      });
      return data;
    } catch (err) {
      console.warn('[transactionsService] Backend unavailable, using mock.', err);
      const { transactions, activeFleetId } = useFleetStore.getState();
      return transactions[activeFleetId] || [];
    }
  }
};
