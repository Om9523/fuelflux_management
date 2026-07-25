import { authService } from '@/services/auth.service';

export interface BankAccount {
  account_holder: string;
  account_number: string;  // masked on display
  ifsc: string;
  bank_name: string;
  account_type: 'current' | 'savings';
  is_primary: boolean;
  added_at: string;
}

export interface UpiId {
  upi_vpa: string;
  label: string;
  is_primary: boolean;
  added_at: string;
}

export interface GatewayShare {
  source: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface TrendPoint {
  date: string;
  cashless: number;
  upi: number;
  pos: number;
}

export interface WalletSummary {
  balance: number;
  cashless_mtd: number;
  total_mtd: number;
  gateway_settled: number;
  gateway_shares: GatewayShare[];
  trend: TrendPoint[];
  mtd_breakdown: {
    cash: number;
    upi: number;
    pos: number;
    credit: number;
  };
  txn_count: number;
  bank_accounts: BankAccount[];
  upi_ids: UpiId[];
}

export interface POSDevice {
  id: string;
  terminal_id: string;
  model: string;
  serial: string;
  status: 'online' | 'offline';
  battery: number;
  attendant: string;
  mtdVolume: number;
  created_at: string;
}

export interface MerchantPayout {
  id: string;
  payout_id: string;
  date: string;
  amount: number;
  bank: string;
  status: 'settled' | 'processing' | 'failed';
  reconciled: boolean;
  bankAmount?: number;
  discrepancy?: string;
}

const api = () => authService.getApi();

export const ownerWalletService = {
  async getWalletSummary(pumpId: string): Promise<WalletSummary> {
    const res = await api().get('/wallet/summary', { params: { pump_id: pumpId } });
    return res.data;
  },

  async getTerminals(pumpId: string): Promise<POSDevice[]> {
    const res = await api().get('/wallet/terminals', { params: { pump_id: pumpId } });
    return res.data;
  },

  async addTerminal(pumpId: string, data: {
    terminal_id: string;
    model: string;
    serial_number: string;
    assigned_attendant_name?: string;
  }): Promise<any> {
    const res = await api().post(`/wallet/terminals?pump_id=${pumpId}`, data);
    return res.data;
  },

  async getPayouts(pumpId: string): Promise<MerchantPayout[]> {
    const res = await api().get('/wallet/payouts', { params: { pump_id: pumpId } });
    return res.data;
  },

  async rechargeWallet(pumpId: string, amount: number, bankAccount?: string, remarks?: string): Promise<any> {
    const res = await api().post(`/wallet/recharge?pump_id=${pumpId}`, { amount, bank_account: bankAccount, remarks });
    return res.data;
  },

  async initiatePayout(pumpId: string, amount: number, bankAccount?: string): Promise<any> {
    const res = await api().post(`/wallet/payout?pump_id=${pumpId}`, { amount, bank_account: bankAccount });
    return res.data;
  },

  async addBankAccount(pumpId: string, data: {
    account_holder: string;
    account_number: string;
    ifsc: string;
    bank_name: string;
    account_type: 'current' | 'savings';
  }): Promise<any> {
    const res = await api().post(`/wallet/bank-account?pump_id=${pumpId}`, data);
    return res.data;
  },

  async removeBankAccount(pumpId: string, accountNumber: string): Promise<any> {
    const res = await api().delete('/wallet/bank-account', {
      params: { pump_id: pumpId, account_number: accountNumber }
    });
    return res.data;
  },

  async addUpiId(pumpId: string, upi_vpa: string, label: string): Promise<any> {
    const res = await api().post(`/wallet/upi?pump_id=${pumpId}`, { upi_vpa, label });
    return res.data;
  },

  async removeUpiId(pumpId: string, upi_vpa: string): Promise<any> {
    const res = await api().delete('/wallet/upi', {
      params: { pump_id: pumpId, upi_vpa }
    });
    return res.data;
  },

  async markGatewaySettled(pumpId: string, amount: number): Promise<any> {
    const res = await api().post(`/wallet/settle?pump_id=${pumpId}`, { amount });
    return res.data;
  }
};
