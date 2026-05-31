import { useWalletStore, FleetWallet, WalletTransaction, AutoRechargeConfig } from '@/stores/wallet.store';

export const walletService = {
  /**
   * Get active fleet wallet information
   */
  async getWallet(): Promise<FleetWallet> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    let activeFleetId = 'fleet_1';
    if (typeof window !== 'undefined') {
      activeFleetId = localStorage.getItem('fuelflux_logistic_active_fleet_id') || 'fleet_1';
    }
    const { wallets } = useWalletStore.getState();
    return wallets[activeFleetId] || {
      fleetId: activeFleetId,
      balance: 0,
      autoRecharge: { enabled: false, threshold: 20000, rechargeAmount: 50000, paymentMethodId: '' },
      transactions: []
    };
  },

  /**
   * Simulate a secure checkout recharge via Stripe or Razorpay card gateways
   */
  async recharge(amount: number, processor: 'stripe' | 'razorpay', cardNumLast4: string): Promise<WalletTransaction> {
    return useWalletStore.getState().rechargeWallet(amount, processor, cardNumLast4);
  },

  /**
   * Update auto-recharge settings
   */
  async updateAutoRechargeSettings(config: Partial<AutoRechargeConfig>): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    useWalletStore.getState().updateAutoRecharge(config);
  }
};
