/**
 * logistic.service.ts — REAL BACKEND CONNECTED
 * Endpoints: GET/PUT /api/v1/logistic/profile
 *            GET /api/v1/logistic/vouchers
 *            POST /api/v1/logistic/vouchers
 *            GET /api/v1/logistic/payments
 */

import backendApi from '@/lib/backendApi';
import { useFleetStore, QRVoucher } from '@/stores/fleet.store';

export interface KycDocument {
  doc_type: string;
  file_url: string;
  original_name: string;
  uploaded_at: string;
}

export interface BankAccount {
  account_holder: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  upi_id: string;
  verified: boolean;
}

export interface BackendProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  gstin: string;
  billing_address: string;
  roles: string[];
  created_at: string;
  verification_status: string | null;
  verification_notes: string | null;
  kyc_documents: KycDocument[];
  bank_account: BankAccount;
}

export interface BackendVoucher {
  id: string;
  vehicleId: string;
  vehicleNumber: string;
  amount: number;
  fuelType: string;
  status: string;
  expiryDate: string;
  createdDate: string;
  qrCode: string;
  notes: string;
}

export const logisticService = {
  /**
   * Get the logistic partner's profile from backend
   */
  async getProfile(): Promise<BackendProfile | null> {
    try {
      const { data } = await backendApi.get<BackendProfile>('/logistic/profile');
      return data;
    } catch (err) {
      console.warn('[logisticService] getProfile failed:', err);
      return null;
    }
  },

  /**
   * Update logistic partner's profile (company_name, gstin, billing_address, etc.)
   */
  async updateProfile(updates: {
    company_name?: string;
    gstin?: string;
    billing_address?: string;
    full_name?: string;
    phone?: string;
  }): Promise<BackendProfile> {
    const { data } = await backendApi.put<BackendProfile>('/logistic/profile', updates);
    return data;
  },

  /**
   * Get all digital fuel vouchers for this partner
   */
  async getVouchers(): Promise<QRVoucher[]> {
    try {
      const { data } = await backendApi.get<BackendVoucher[]>('/logistic/vouchers');
      const store = useFleetStore.getState();

      const formatted: QRVoucher[] = data.map((v) => ({
        id: v.id,
        vehicleId: v.vehicleId,
        vehicleNumber: v.vehicleNumber,
        amount: v.amount,
        fuelType: (v.fuelType?.toLowerCase() as any) || 'diesel',
        status: v.status as any,
        expiryDate: v.expiryDate,
        createdDate: v.createdDate,
        qrCode: v.qrCode,
        notes: v.notes || '',
      }));

      store.setVouchers(formatted);
      return formatted;
    } catch (err) {
      console.warn('[logisticService] getVouchers failed:', err);
      const { vouchers, activeFleetId } = useFleetStore.getState();
      return vouchers[activeFleetId] || [];
    }
  },

  /**
   * Request a new digital fuel voucher
   */
  async requestVoucher(voucherData: {
    vehicleId: string;
    vehicleNumber: string;
    amount: number;
    fuelType: string;
    expiryDate: string;
    notes?: string;
    pumpId?: string;
  }): Promise<QRVoucher> {
    try {
      const payload = {
        vehicle_id: voucherData.vehicleId,
        vehicle_plate: voucherData.vehicleNumber,
        amount: voucherData.amount,
        fuel_type: voucherData.fuelType,
        expiry_date: voucherData.expiryDate,
        notes: voucherData.notes || '',
        pump_id: voucherData.pumpId || null,
      };
      const { data } = await backendApi.post<BackendVoucher>('/logistic/vouchers', payload);

      const newVoucher: QRVoucher = {
        id: data.id,
        vehicleId: data.vehicleId,
        vehicleNumber: data.vehicleNumber,
        amount: data.amount,
        fuelType: (data.fuelType?.toLowerCase() as any) || 'diesel',
        status: data.status as any,
        expiryDate: data.expiryDate,
        createdDate: data.createdDate,
        qrCode: data.qrCode,
        notes: data.notes || '',
      };

      // Update store immediately
      const store = useFleetStore.getState();
      const existing = store.vouchers[store.activeFleetId] || [];
      store.setVouchers([newVoucher, ...existing]);

      return newVoucher;
    } catch (err) {
      console.warn('[logisticService] requestVoucher fell back to mock:', err);
      // Fallback to local store
      return useFleetStore.getState().requestVoucher(voucherData as any);
    }
  },

  /**
   * Get all payment requests for this partner
   */
  async getPayments(): Promise<any[]> {
    try {
      const { data } = await backendApi.get('/logistic/payments');
      return data;
    } catch (err) {
      console.warn('[logisticService] getPayments failed:', err);
      return [];
    }
  },

  /**
   * Upload a KYC document (GSTIN, PAN, registration, license, etc.)
   */
  async uploadDocument(docType: string, file: File): Promise<{ success: boolean; document: KycDocument }> {
    const formData = new FormData();
    formData.append('doc_type', docType);
    formData.append('file', file);

    const { data } = await backendApi.post<{ success: boolean; document: KycDocument }>(
      '/logistic/documents',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  /**
   * Delete/remove a previously uploaded KYC document
   */
  async deleteDocument(docType: string): Promise<{ success: boolean; message: string }> {
    const { data } = await backendApi.delete<{ success: boolean; message: string }>(
      `/logistic/documents/${docType}`
    );
    return data;
  },

  /**
   * Get current linked bank account details
   */
  async getBankAccount(): Promise<BankAccount> {
    const { data } = await backendApi.get<BankAccount>('/logistic/bank-account');
    return data;
  },

  /**
   * Link or update bank account details
   */
  async updateBankAccount(bankInfo: {
    account_holder?: string;
    account_number?: string;
    ifsc_code?: string;
    bank_name?: string;
    upi_id?: string;
  }): Promise<BankAccount> {
    const { data } = await backendApi.put<BankAccount>('/logistic/bank-account', bankInfo);
    return data;
  },
};

