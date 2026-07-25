import { authService } from '@/services/auth.service';

export interface WalletBalance {
  status: string;
  balance: number;
  available_balance: number;
  currency: string;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  balance_after: number;
  category: 'add_money' | 'spend' | 'withdrawal' | 'p2p_sent' | 'p2p_received' | 'refund';
  reference_id: string | null;
  status: 'pending' | 'success' | 'failed' | 'reversed';
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface BankDetails {
  account_holder: string;
  account_number: string;
  ifsc: string;
  bank_name: string;
}

const api = () => authService.getApi();

export const userWalletService = {
  async getBalance(): Promise<WalletBalance> {
    const res = await api().get('/user-wallet/balance');
    return res.data;
  },

  async getTransactions(page = 1, limit = 10, category?: string, txnType?: string): Promise<{
    total: number;
    page: number;
    limit: number;
    transactions: WalletTransaction[];
  }> {
    const params: Record<string, any> = { page, limit };
    if (category) params.category = category;
    if (txnType) params.txn_type = txnType;
    const res = await api().get('/user-wallet/transactions', { params });
    return res.data;
  },

  async getTransactionDetail(id: string): Promise<WalletTransaction> {
    const res = await api().get(`/user-wallet/transactions/${id}`);
    return res.data;
  },

  async createOrder(amount: number): Promise<{
    status: string;
    order: {
      id: string;
      amount: number;
      currency: string;
      receipt: string;
      status: string;
    };
    key_id: string;
  }> {
    const res = await api().post('/user-wallet/add-money/create-order', { amount });
    return res.data;
  },

  async verifyPayment(orderId: string, paymentId: string, signature: string): Promise<{
    status: string;
    message: string;
    balance: number;
  }> {
    const res = await api().post('/user-wallet/add-money/verify', {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature
    });
    return res.data;
  },

  async spendFunds(amount: number, category: string, referenceId: string, metadata?: Record<string, any>): Promise<any> {
    const res = await api().post('/user-wallet/spend', { amount, category, reference_id: referenceId, metadata });
    return res.data;
  },

  async initiateWithdrawal(amount: number, bankDetails: BankDetails): Promise<{
    status: string;
    message: string;
    payout_id: string;
    razorpay_payout_id: string | null;
    status_state: string;
  }> {
    const res = await api().post('/user-wallet/withdraw', { amount, bank_details: bankDetails });
    return res.data;
  },

  async p2pTransfer(receiverEmailOrPhone: string, amount: number, note?: string): Promise<{
    status: string;
    message: string;
    transfer_id: string;
    amount: number;
  }> {
    const res = await api().post('/user-wallet/p2p-transfer', {
      receiver_email_or_phone: receiverEmailOrPhone,
      amount,
      note
    });
    return res.data;
  }
};
