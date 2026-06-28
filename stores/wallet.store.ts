import { create } from 'zustand';

export interface WalletTransaction {
  id: string;
  amount: number;
  processor: 'stripe' | 'razorpay' | 'manual';
  status: 'success' | 'failed' | 'processing';
  referenceId: string;
  date: string;
  paymentMethod: string;
}

export interface AutoRechargeConfig {
  enabled: boolean;
  threshold: number;
  rechargeAmount: number;
  paymentMethodId: string;
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
  rechargeWallet: (amount: number, processor: 'stripe' | 'razorpay' | 'manual', cardNumLast4: string) => Promise<WalletTransaction>;
  updateAutoRecharge: (config: Partial<AutoRechargeConfig>) => void;
  deductWalletBalance: (amount: number) => boolean;
}

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
      try {
        storedWallets = JSON.parse(walletsJson);
      } catch (e) {
        storedWallets = {};
      }
    }

    set({ wallets: storedWallets });
  },

  rechargeWallet: async (amount, processor, cardNumLast4) => {
    set({ isLoading: true, error: null });

    // Mock network latency for Stripe/Razorpay encryption and capture
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const storage = getStorage();
    if (!storage) {
      set({ isLoading: false });
      throw new Error('Local storage not available');
    }

    let activeFleetId = 'fleet_current';
    if (typeof window !== 'undefined') {
      activeFleetId = localStorage.getItem('fuelflux_logistic_active_fleet_id') || 'fleet_current';
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
      referenceId: processor === 'manual' ? 'UTR-' + Math.random().toString(36).substring(2, 10).toUpperCase() : (processor === 'stripe' ? 'ch_' : 'pay_') + Math.random().toString(36).substring(2, 12),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      paymentMethod: processor === 'manual' ? 'Bank Transfer' : `${processor === 'stripe' ? 'Visa' : 'Mastercard'} Ending in ${cardNumLast4}`,
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

    let activeFleetId = 'fleet_current';
    if (typeof window !== 'undefined') {
      activeFleetId = localStorage.getItem('fuelflux_logistic_active_fleet_id') || 'fleet_current';
    }

    const currentWallets = get().wallets;
    const fleetWallet = currentWallets[activeFleetId] || {
      fleetId: activeFleetId,
      balance: 0,
      autoRecharge: { enabled: false, threshold: 20000, rechargeAmount: 50000, paymentMethodId: '' },
      transactions: [],
    };

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

    let activeFleetId = 'fleet_current';
    if (typeof window !== 'undefined') {
      activeFleetId = localStorage.getItem('fuelflux_logistic_active_fleet_id') || 'fleet_current';
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
