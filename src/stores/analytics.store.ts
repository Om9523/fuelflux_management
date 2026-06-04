import { create } from 'zustand';
import { api } from '../lib/api';
import { SubscriptionRecord, PaymentRecord } from '../lib/mock-db';

interface AnalyticsState {
  subscriptions: SubscriptionRecord[];
  payments: PaymentRecord[];
  isLoading: boolean;
  error: string | null;

  // Key Financial KPIs
  mrr: number;
  arr: number;
  activeSubscriptionsCount: number;
  churnRate: number;

  // Chart data feeds
  revenueGrowthHistory: { month: string; amount: number; registrations: number }[];
  regionalData: { name: string; value: number }[];
  tierDistribution: { name: string; value: number; count: number }[];

  fetchAnalytics: () => Promise<void>;
  refundPayment: (id: string) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  subscriptions: [],
  payments: [],
  isLoading: false,
  error: null,

  mrr: 0,
  arr: 0,
  activeSubscriptionsCount: 0,
  churnRate: 2.4, // standard platform baseline

  revenueGrowthHistory: [
    { month: 'Jan', amount: 120000, registrations: 8 },
    { month: 'Feb', amount: 185000, registrations: 12 },
    { month: 'Mar', amount: 240000, registrations: 19 },
    { month: 'Apr', amount: 310000, registrations: 27 },
    { month: 'May', amount: 450000, registrations: 35 },
    { month: 'Jun', amount: 560000, registrations: 42 },
  ],

  regionalData: [
    { name: 'Maharashtra', value: 45 },
    { name: 'Uttar Pradesh', value: 25 },
    { name: 'Karnataka', value: 20 },
    { name: 'Gujarat', value: 10 },
  ],

  tierDistribution: [
    { name: 'Basic Tier', value: 30, count: 12 },
    { name: 'Premium Tier', value: 50, count: 20 },
    { name: 'Enterprise Tier', value: 20, count: 8 },
  ],

  fetchAnalytics: async () => {
    set({ isLoading: true });
    try {
      const [subRes, payRes] = await Promise.all([
        api.get('/admin/subscriptions'),
        api.get('/admin/payments'),
      ]);

      const subs: SubscriptionRecord[] = subRes.data.subscriptions;
      const payments: PaymentRecord[] = payRes.data.payments;

      // Calculate MRR from active subscriptions
      const activeSubs = subs.filter((s) => s.status === 'active');
      const activeMrr = activeSubs.reduce((sum, s) => sum + s.amount, 0);

      set({
        subscriptions: subs,
        payments,
        mrr: activeMrr,
        arr: activeMrr * 12,
        activeSubscriptionsCount: activeSubs.length,
        isLoading: false,
      });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  refundPayment: async (id: string) => {
    try {
      const res = await api.patch(`/admin/payments/${id}`, { status: 'refunded' });
      const updatedPayments = get().payments.map((p) => (p.id === id ? res.data.payment : p));
      
      // Re-trigger analytics calculations
      set({ payments: updatedPayments });
      get().fetchAnalytics();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },
}));
