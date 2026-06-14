/**
 * Accounting Service
 * API calls for: Account Groups, Accounts, Parties, Vouchers, Balance Sheet
 */

import { authService } from '@/services/auth.service';

const api = {
  get: <T = any>(url: string, config?: any) => authService.getApi().get<T>(url, config),
  post: <T = any>(url: string, data?: any, config?: any) => authService.getApi().post<T>(url, data, config),
  patch: <T = any>(url: string, data?: any, config?: any) => authService.getApi().patch<T>(url, data, config),
  delete: <T = any>(url: string, config?: any) => authService.getApi().delete<T>(url, config),
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type AccountNature = 'income' | 'expenditure' | 'asset' | 'liability';
export type PartyCategory = 'customer' | 'supplier' | 'other';
export type VoucherType = 'payment' | 'receipt' | 'contra' | 'journal';

export interface AccountGroup {
  id: number;
  pump_id: number;
  name: string;
  category: string | null;
  nature: AccountNature;
  affects_gross_profit: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Account {
  id: number;
  pump_id: number;
  group_id: number;
  party_id: number | null;
  name: string;
  alias: string | null;
  is_bank_account: boolean;
  bank_details: BankDetails | null;
  tcs_apply: boolean;
  current_balance: number;
  is_active: boolean;
  created_at: string;
  group_name: string | null;
  party_name: string | null;
}

export interface BankDetails {
  bank_name: string;
  account_no: string;
  ifsc: string;
  branch: string;
}

export interface Party {
  id: number;
  pump_id: number;
  alias: string | null;
  category: PartyCategory;
  address: string | null;
  legal_name: string | null;
  registration_type: string;
  pan: string | null;
  gst_number: string | null;
  primary_contact: string | null;
  linked_account_id: number | null;
  is_active: boolean;
  created_at: string;
}

export interface VoucherEntry {
  id: number;
  account_id: number;
  account_name: string | null;
  debit_amount: number;
  credit_amount: number;
  entry_order: number;
}

export interface Voucher {
  id: number;
  pump_id: number;
  voucher_type: VoucherType;
  origin: string;
  narration: string | null;
  voucher_date: string;
  is_posted: boolean;
  entries: VoucherEntry[];
  created_at: string;
}

export interface BalanceSheetAccount {
  account_id: number;
  account_name: string;
  alias: string | null;
  current_balance: number;
}

export interface BalanceSheetGroup {
  group_id: number;
  group_name: string;
  nature: AccountNature;
  affects_gross_profit: boolean;
  total: number;
  accounts: BalanceSheetAccount[];
}

export interface BalanceSheet {
  pump_id: number;
  generated_at: string;
  income: BalanceSheetGroup[];
  expenditure: BalanceSheetGroup[];
  assets: BalanceSheetGroup[];
  liabilities: BalanceSheetGroup[];
  gross_profit: number;
  total_equity: number;
}

// ─── Create Payloads ──────────────────────────────────────────────────────────

export interface CreateGroupPayload {
  pump_id: number;
  name: string;
  category?: string;
  nature: AccountNature;
  affects_gross_profit: boolean;
}

export interface CreateAccountPayload {
  pump_id: number;
  group_id: number;
  party_id?: number;
  name: string;
  alias?: string;
  is_bank_account: boolean;
  bank_details?: BankDetails;
  tcs_apply: boolean;
}

export interface CreatePartyPayload {
  pump_id: number;
  alias?: string;
  category: PartyCategory;
  address?: string;
  legal_name?: string;
  registration_type: string;
  pan?: string;
  gst_number?: string;
  primary_contact?: string;
}

export interface QuickVoucherPayload {
  pump_id: number;
  voucher_type: VoucherType;
  from_account_id: number;
  to_account_id: number;
  amount: number;
  narration?: string;
  voucher_date?: string;
}

export interface JournalEntryLine {
  account_id: number;
  debit_amount: number;
  credit_amount: number;
  entry_order: number;
}

export interface JournalVoucherPayload {
  pump_id: number;
  narration?: string;
  voucher_date?: string;
  entries: JournalEntryLine[];
}

// ─── API Functions ────────────────────────────────────────────────────────────

// Account Groups
export const getGroups = (pump_id: number): Promise<AccountGroup[]> =>
  api.get('/accounting/groups', { params: { pump_id } }).then(r => r.data);

export const createGroup = (payload: CreateGroupPayload): Promise<AccountGroup> =>
  api.post('/accounting/groups', payload).then(r => r.data);

export const deleteGroup = (group_id: number, pump_id: number): Promise<void> =>
  api.delete(`/accounting/groups/${group_id}`, { params: { pump_id } }).then(r => r.data);

// Accounts
export const getAccounts = (pump_id: number, group_id?: number): Promise<Account[]> =>
  api.get('/accounting/accounts', { params: { pump_id, group_id } }).then(r => r.data);

export const createAccount = (payload: CreateAccountPayload): Promise<Account> =>
  api.post('/accounting/accounts', payload).then(r => r.data);

export const deleteAccount = (account_id: number, pump_id: number): Promise<void> =>
  api.delete(`/accounting/accounts/${account_id}`, { params: { pump_id } }).then(r => r.data);

// Parties
export const getParties = (pump_id: number, category?: string): Promise<Party[]> =>
  api.get('/accounting/parties', { params: { pump_id, category } }).then(r => r.data);

export const createParty = (payload: CreatePartyPayload): Promise<Party> =>
  api.post('/accounting/parties', payload).then(r => r.data);

export const deleteParty = (party_id: number, pump_id: number): Promise<void> =>
  api.delete(`/accounting/parties/${party_id}`, { params: { pump_id } }).then(r => r.data);

// Vouchers
export const getVouchers = (
  pump_id: number,
  voucher_type?: string,
  limit = 50,
  offset = 0
): Promise<Voucher[]> =>
  api.get('/accounting/vouchers', { params: { pump_id, voucher_type, limit, offset } }).then(r => r.data);

export const getVoucherEntries = (voucher_id: number, pump_id: number): Promise<Voucher> =>
  api.get(`/accounting/vouchers/${voucher_id}/entries`, { params: { pump_id } }).then(r => r.data);

export const createQuickVoucher = (payload: QuickVoucherPayload): Promise<Voucher> =>
  api.post('/accounting/vouchers/quick', payload).then(r => r.data);

export const createJournalVoucher = (payload: JournalVoucherPayload): Promise<Voucher> =>
  api.post('/accounting/vouchers/journal', payload).then(r => r.data);

// Balance Sheet
export const getBalanceSheet = (pump_id: number): Promise<BalanceSheet> =>
  api.get('/accounting/balance-sheet', { params: { pump_id } }).then(r => r.data);