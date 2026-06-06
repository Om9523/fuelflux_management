import { create } from 'zustand';

export interface WalletTransaction {
  id: string;
  amount: number;
  processor: 'stripe' | 'razorpay';
  status: 'success' | 'failed' | 'processing';
  referenceId: string;
  date: string;
  paymentMethod: string;
}

export interface AutoRechargeConfig {
  enabled: boolean;
  threshold: number;
  rechargeAmount: number;
  paymentMethodId: string; // e.g. card_1234
}

export interface FleetWallet {
  fleetId: string;
  balance: number;
  autoRecharge: AutoRechargeConfig;
  transactions: WalletTransaction[];
}

interface WalletState {
  wallets: Record<string, FleetWallet>;
  isLoading: boolean;
  error: string | null;

  initializeWalletStore: () => void;
  rechargeWallet: (amount: number, processor: 'stripe' | 'razorpay', cardNumLast4: string) => Promise<WalletTransaction>;
  updateAutoRecharge: (config: Partial<AutoRechargeConfig>) => void;
  deductWalletBalance: (amount: number) => boolean;
}

const SEED_WALLETS: Record<string, FleetWallet> = {
  fleet_1: {
    fleetId: 'fleet_1',
    balance: 125500,
    autoRecharge: {
      enabled: true,
      threshold: 30000,
      rechargeAmount: 100000,
      paymentMethodId: 'pm_card_visa_4242',
    },
    transactions: [
      { id: 'W-TXN-101', amount: 100000, processor: 'stripe', status: 'success', referenceId: 'ch_3MvY8eLkdIwHu7ix2e8a1', date: '2026-05-20 11:24', paymentMethod: 'Visa Ending in 4242' },
      { id: 'W-TXN-102', amount: 100000, processor: 'stripe', status: 'success', referenceId: 'ch_3MvY8eLkdIwHu7ix2e8a2', date: '2026-05-10 16:45', paymentMethod: 'Visa Ending in 4242' },
    ],
  },
  fleet_2: {
    fleetId: 'fleet_2',
    balance: 18200, // Low balance trigger!
    autoRecharge: {
      enabled: false,
      threshold: 15000,
      rechargeAmount: 50000,
      paymentMethodId: 'pm_card_master_9901',
    },
    transactions: [
      { id: 'W-TXN-201', amount: 50000, processor: 'razorpay', status: 'success', referenceId: 'pay_LkdIwHu7ix2e8', date: '2026-05-18 14:10', paymentMethod: 'Mastercard Ending in 9901' },
    ],
  },
};

const KEYS = {
  WALLETS: 'fuelflux_logistic_wallets',
};

const getStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  return null;
};

export const useWalletStore = create<WalletState>((set, get) => ({
  wallets: {},
  isLoading: false,
  error: null,

  initializeWalletStore: () => {
    const storage = getStorage();
    if (!storage) return;

    let storedWallets: Record<string, FleetWallet> = {};
    const walletsJson = storage.getItem(KEYS.WALLETS);
    
    if (walletsJson) {
      storedWallets = JSON.parse(walletsJson);
    } else {
      storedWallets = SEED_WALLETS;
      storage.setItem(KEYS.WALLETS, JSON.stringify(SEED_WALLETS));
    }

    set({ wallets: storedWallets });
  },

  rechargeWallet: async (amount, processor, cardNumLast4) => {
    set({ isLoading: true, error: null });

    // Mock network latency for Stripe/Razorpay encryption and capture
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const storage = getStorage();
    if (!storage) {
      set({ isLoading: false });
      throw new Error('Local storage not available');
    }

    // Get current active fleet ID from fleet store (or default to fleet_1)
    // To resolve cross-store access cleanly without direct circular imports, we query the DOM/localStorage or assume fleet_1
    let activeFleetId = 'fleet_1';
    if (typeof window !== 'undefined') {
      activeFleetId = localStorage.getItem('fuelflux_logistic_active_fleet_id') || 'fleet_1';
    }

    const currentWallets = get().wallets;
    const fleetWallet = currentWallets[activeFleetId] || {
      fleetId: activeFleetId,
      balance: 0,
      autoRecharge: { enabled: false, threshold: 20000, rechargeAmount: 50000, paymentMethodId: '' },
      transactions: [],
    };

    const newTransaction: WalletTransaction = {
      id: 'W-TXN-' + Math.floor(300 + Math.random() * 700),
      amount,
      processor,
      status: 'success',
      referenceId: (processor === 'stripe' ? 'ch_' : 'pay_') + Math.random().toString(36).substr(2, 18),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      paymentMethod: `${processor === 'stripe' ? 'Visa' : 'Mastercard'} Ending in ${cardNumLast4}`,
    };

    const updatedWallet: FleetWallet = {
      ...fleetWallet,
      balance: fleetWallet.balance + amount,
      transactions: [newTransaction, ...fleetWallet.transactions],
    };

    const updatedWallets = {
      ...currentWallets,
      [activeFleetId]: updatedWallet,
    };

    storage.setItem(KEYS.WALLETS, JSON.stringify(updatedWallets));
    set({
      wallets: updatedWallets,
      isLoading: false,
    });

    return newTransaction;
  },

  updateAutoRecharge: (config) => {
    const storage = getStorage();
    if (!storage) return;

    let activeFleetId = 'fleet_1';
    if (typeof window !== 'undefined') {
      activeFleetId = localStorage.getItem('fuelflux_logistic_active_fleet_id') || 'fleet_1';
    }

    const currentWallets = get().wallets;
    const fleetWallet = currentWallets[activeFleetId];
    if (!fleetWallet) return;

    const updatedWallet: FleetWallet = {
      ...fleetWallet,
      autoRecharge: {
        ...fleetWallet.autoRecharge,
        ...config,
      },
    };

    const updatedWallets = {
      ...currentWallets,
      [activeFleetId]: updatedWallet,
    };

    storage.setItem(KEYS.WALLETS, JSON.stringify(updatedWallets));
    set({ wallets: updatedWallets });
  },

  deductWalletBalance: (amount) => {
    const storage = getStorage();
    if (!storage) return false;

    let activeFleetId = 'fleet_1';
    if (typeof window !== 'undefined') {
      activeFleetId = localStorage.getItem('fuelflux_logistic_active_fleet_id') || 'fleet_1';
    }

    const currentWallets = get().wallets;
    const fleetWallet = currentWallets[activeFleetId];
    if (!fleetWallet || fleetWallet.balance < amount) return false;

    const updatedWallet: FleetWallet = {
      ...fleetWallet,
      balance: fleetWallet.balance - amount,
    };

    const updatedWallets = {
      ...currentWallets,
      [activeFleetId]: updatedWallet,
    };

    storage.setItem(KEYS.WALLETS, JSON.stringify(updatedWallets));
    set({ wallets: updatedWallets });
    return true;
  },
}));
