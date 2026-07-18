import backendApi from '@/lib/backendApi';
import { useFleetStore } from '@/stores/fleet.store';
import {
  useWalletStore,
  FleetWallet,
  WalletTransaction,
  AutoRechargeConfig
} from '@/stores/wallet.store';

export const walletService = {
  /**
   * Get active fleet wallet information.
   */
  async getWallet(): Promise<FleetWallet> {
    let activeFleetId = 'fleet_1';

    if (typeof window !== 'undefined') {
      activeFleetId =
        localStorage.getItem(
          'fuelflux_logistic_active_fleet_id'
        ) || 'fleet_1';
    }

    const fleetActiveId =
      useFleetStore.getState().activeFleetId;

    if (fleetActiveId) {
      activeFleetId = fleetActiveId;
    }

    try {
      const { data } =
        await backendApi.get<FleetWallet>(
          '/logistic/wallet'
        );

      const normalised: FleetWallet = {
        ...data,
        fleetId: activeFleetId
      };

      const store = useWalletStore.getState();

      useWalletStore.setState({
        wallets: {
          ...store.wallets,
          [activeFleetId]: normalised
        }
      });

      return normalised;
    } catch (err) {
      console.warn(
        '[walletService] Backend unavailable, using mock.',
        err
      );

      const { wallets } =
        useWalletStore.getState();

      return (
        wallets[activeFleetId] || {
          fleetId: activeFleetId,
          balance: 0,
          autoRecharge: {
            enabled: false,
            threshold: 20000,
            rechargeAmount: 50000,
            paymentMethodId: ''
          },
          transactions: []
        }
      );
    }
  },

  /**
   * Helper → get active pump id
   */
  getPumpId(): number {
    const activePumpId =
      localStorage.getItem(
        'fuelflux_active_pump_id'
      ) || 'pump_1';

    return Number(
      activePumpId.replace('pump_', '')
    );
  },

  /**
   * Wallet Recharge Request (Instant Card / Online)
   * pump_id = null for wallet top-ups (no pump needed)
   * transaction_reference must contain "stripe" or "razorpay" for auto-approval
   */
  async recharge(
    amount: number,
    processor: 'stripe' | 'razorpay',
    cardNumLast4: string
  ): Promise<WalletTransaction> {
    const refId = `${processor.toUpperCase()}-REF-${Math.floor(10000 + Math.random() * 90000)}`;

    const payload = {
      pump_id: null,                    // wallet topup — no pump required
      amount,
      payment_type: 'wallet_topup',
      transaction_reference: refId,    // contains "stripe" or "razorpay" → auto-approved
      remarks: `Simulated ${processor === 'stripe' ? 'Stripe' : 'Razorpay'} card recharge ending in ${cardNumLast4}`,
    };

    console.log('[Recharge Payload]', payload);

    await backendApi.post('/payment/request', payload);

    const wallet = await this.getWallet();

    return (
      wallet.transactions[0] ?? {
        id: `W-TXN-${Math.floor(100 + Math.random() * 900)}`,
        amount,
        processor,
        status: 'approved',
        referenceId: refId,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        paymentMethod: `${processor === 'stripe' ? 'Visa' : 'Mastercard'} Ending in ${cardNumLast4}`,
      }
    );
  },


  /**
   * Manual Payment Proof Request
   */
  async requestPaymentProof(
    amount: number,
    reference: string,
    remarks: string,
    screenshotUrl: string = ''
  ): Promise<any> {
    const pumpId = this.getPumpId();

    const payload = {
      pump_id: pumpId,
      amount,
      payment_type:
        'manual_bank_transfer',
      transaction_reference:
        reference,
      remarks,
      screenshot_url:
        screenshotUrl
    };

    console.log(
      '[Payment Proof Payload]',
      payload
    );

    const { data } =
      await backendApi.post(
        '/payment/request',
        payload
      );

    return data;
  },

  /**
   * Update Auto Recharge
   */
  async updateAutoRechargeSettings(
    config: Partial<AutoRechargeConfig>
  ): Promise<void> {
    await new Promise(
      (resolve) =>
        setTimeout(resolve, 300)
    );

    useWalletStore
      .getState()
      .updateAutoRecharge(config);
  }
};