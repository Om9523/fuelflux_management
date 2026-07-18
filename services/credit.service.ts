/**
 * credit.service.ts — Credit Agreement Flow
 * All API calls for credit requests, deposit, signing
 */

import backendApi from '@/lib/backendApi';

export interface CreditRequest {
  id: string;
  vehicle_id?: string;
  vehicle_plate?: string;
  vehicle_ids?: string[];
  vehicle_plates?: string[];
  pump_id: string;
  pump_name: string;
  requested_limit: number;
  approved_limit: number | null;
  credit_limit: number | null;
  status: CreditStatus;
  remarks: string | null;
  requested_at: string | null;
  // Deposit
  deposit_amount: number | null;
  deposit_confirmed: boolean;
  deposit_proof_url: string | null;
  // Signing
  logistic_signed: boolean;
  pump_owner_signed: boolean;
  logistic_signed_at: string | null;
  pump_owner_signed_at: string | null;
  // Dates
  valid_from: string | null;
  valid_to: string | null;
  activated_at: string | null;
}

export interface CreditRequestDetail extends CreditRequest {
  contract_terms: Record<string, any> | null;
  vehicles?: {
    id: string;
    plate: string;
    type: string;
    make_model: string;
    driver: string;
  }[];
  vehicle: {
    id: string;
    plate: string;
    type: string;
    make_model: string;
    driver: string;
  } | null;
  pump: {
    id: string;
    name: string;
    address: string;
    city: string;
  };
  partner: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
}

export type CreditStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'deposit_pending'
  | 'deposit_confirmed'
  | 'contract_generated'
  | 'logistic_signed'
  | 'pump_signed'
  | 'active';

export const creditService = {

  // ── List all requests (logistic) ────────────────────────────────
  async getLogisticRequests(pumpId?: string | number): Promise<CreditRequest[]> {
    const params = pumpId ? `?pump_id=${pumpId}` : '';
    const { data } = await backendApi.get(`/credit/request${params}`);
    return data;
  },

  // ── Single request detail ────────────────────────────────────────
  async getRequestDetail(id: string | number): Promise<CreditRequestDetail> {
    const { data } = await backendApi.get(`/credit/request/${id}`);
    return data;
  },

  // ── Create new request ───────────────────────────────────────────
  async createRequest(payload: {
    vehicle_ids: string[];
    pump_id: string;
    requested_limit: number;
    remarks?: string;
  }) {
    const { data } = await backendApi.post('/credit/request', payload);
    return data;
  },

  async uploadDepositProof(requestId: string | number, file: File, proofDocType: string, contractData?: {
    total_credit_limit?: number;
    valid_to?: string; // ISO date string
    billing_frequency?: string;
    bill_by?: string;
    billing_cycle?: string;
    billing_start_date?: string;
    round_off?: boolean;
    late_payment_interest?: number;
    deposit_utilization_days?: number;
    suspension_period_days?: number;
    invoice_dispute_days?: number;
    custom_terms?: string;
  }) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('proof_doc_type', proofDocType);
    if (contractData) {
      formData.append('contract_wizard_json', JSON.stringify(contractData));
    }
    const { data } = await backendApi.post(
      `/credit/upload-deposit/${requestId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  },

  // ── Request Signing OTP ──────────────────────────────────────────
  async requestSigningOTP(requestId: string | number, signingAs: 'logistic' | 'pump_owner' = 'logistic') {
    const { data } = await backendApi.post(`/credit/send-otp/${requestId}?signing_as=${signingAs}`);
    return data;
  },

  // ── Sign with OTP ────────────────────────────────────────────────
  async signContract(requestId: string | number, otp: string, signingAs: 'logistic' | 'pump_owner' = 'logistic') {
    const { data } = await backendApi.post(`/credit/sign/${requestId}?signing_as=${signingAs}`, { otp });
    return data;
  },
};

// ── Status helpers ───────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<CreditStatus, string> = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  deposit_pending: 'Deposit Required',
  deposit_confirmed: 'Deposit Confirmed',
  contract_generated: 'Contract Ready',
  logistic_signed: 'Awaiting Pump Signature',
  pump_signed: 'Awaiting Your Signature',
  active: 'Active',
};

export const STATUS_COLORS: Record<CreditStatus, string> = {
  pending: 'bg-amber-50 border-amber-100 text-amber-700',
  approved: 'bg-blue-50 border-blue-100 text-blue-700',
  rejected: 'bg-red-50 border-red-100 text-red-700',
  deposit_pending: 'bg-orange-50 border-orange-100 text-orange-700',
  deposit_confirmed: 'bg-blue-50 border-blue-100 text-blue-700',
  contract_generated: 'bg-violet-50 border-violet-100 text-violet-700',
  logistic_signed: 'bg-indigo-50 border-indigo-100 text-indigo-700',
  pump_signed: 'bg-indigo-50 border-indigo-100 text-indigo-700',
  active: 'bg-emerald-50 border-emerald-100 text-emerald-700',
};

// What logistic partner needs to do next
export const NEXT_ACTION: Partial<Record<CreditStatus, string>> = {
  deposit_pending: 'Upload deposit proof',
  contract_generated: 'Sign the contract',
  pump_signed: 'Sign the contract',
  active: null as any,
};