import { authService } from '@/services/auth.service';

const api = () => authService.getApi();

// ─── Types ────────────────────────────────────────────────────────────────────

export type CustomerType = 'private' | 'commercial';
export type KYCStatus = 'pending' | 'accepted' | 'rejected';
export type ContractStatus = 'active' | 'expired' | 'suspended' | 'amended';
export type BillingFrequency = 'one_time' | 'recurring';
export type BillingCycle = 'weekly' | 'fortnightly' | 'monthly';
export type BillBy = 'vehicle' | 'customer';

export interface UdhaarCustomer {
    id: string;
    pump_id: string;
    customer_type: CustomerType;
    name: string;
    contact_name: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    party_account_id: string | null;
    kyc_status: KYCStatus;
    is_active: boolean;
    created_at: string;
}

export interface CustomerListItem {
    id: string;
    name: string;
    customer_type: CustomerType;
    contact_phone: string | null;
    kyc_status: KYCStatus;
    vehicle_count: number;
    has_active_contract: boolean;
    created_at: string;
}

export interface KYCDocument {
    id: string;
    document_type: string;
    image_url: string | null;
    status: KYCStatus;
    rejection_reason: string | null;
    reviewed_at: string | null;
    created_at: string;
}

export interface UdhaarVehicle {
    id: string;
    customer_id: string;
    number_plate: string;
    registration_type: 'private' | 'commercial';
    make: string | null;
    model: string | null;
    variant: string | null;
    fuel_types: string[];
    emission_standard: string | null;
    engine_number: string | null;
    chassis_number: string | null;
    registration_date: string | null;
    is_active: boolean;
    created_at: string;
}

export interface SlipBooklet {
    id: string;
    booklet_number: string;
    start_number: number;
    end_number: number;
    total_slips: number;
}

export interface ItemLimit {
    id: string;
    item_name: string;
    qty_per_fill: number | null;
    qty_per_day: number | null;
    qty_per_cycle: number | null;
}

export interface CustomCondition {
    id: string;
    vehicle_type: string | null;
    item_name: string | null;
    station_id: string | null;
    max_slips: number | null;
    money_per_fill: number | null;
    money_per_day: number | null;
    money_per_cycle: number | null;
    qty_per_fill: number | null;
    qty_per_day: number | null;
    qty_per_cycle: number | null;
}

export interface UdhaarContract {
    id: string;
    customer_id: string;
    pump_id: string;
    version: number;
    station_name: string | null;
    org_name: string | null;
    address: string | null;
    gst_number: string | null;
    valid_from: string;
    valid_to: string;
    security_deposit: number;
    total_credit_limit: number;
    max_spending_slips: number | null;
    money_limit_per_fill: number | null;
    money_limit_per_day: number | null;
    money_limit_per_cycle: number | null;
    billing_frequency: BillingFrequency;
    bill_by: BillBy;
    billing_cycle: BillingCycle | null;
    billing_start_date: string | null;
    round_off: boolean;
    require_meter_photo: boolean;
    require_vehicle_photo: boolean;
    require_fueling_video: boolean;
    require_driver_verification: boolean;
    sop_recipients: { type: string; value: string }[];
    late_payment_interest: number | null;
    deposit_utilization_days: number | null;
    suspension_period_days: number | null;
    invoice_dispute_days: number | null;
    custom_terms: string | null;
    status: ContractStatus;
    current_spend: number;
    current_slips_used: number;
    credit_usage_percent: number | null;
    amended_from: string | null;
    created_at: string;
    slip_booklets: SlipBooklet[];
    item_limits: ItemLimit[];
    custom_conditions: CustomCondition[];
}

export interface ContractUsage {
    contract_id: string;
    total_credit_limit: number;
    current_spend: number;
    remaining_credit: number;
    usage_percent: number;
    max_spending_slips: number | null;
    current_slips_used: number;
    status: ContractStatus;
    alert: boolean;
}

export interface UdhaarTransaction {
    id: string;
    contract_id: string;
    customer_id: string;
    vehicle_id: string | null;
    item_name: string | null;
    quantity: number;
    amount: number;
    slip_number: string | null;
    meter_photo_url: string | null;
    vehicle_photo_url: string | null;
    fueling_video_url: string | null;
    driver_verified: boolean;
    created_at: string;
}

export interface UdhaarInvoice {
    id: string;
    contract_id: string;
    customer_id: string;
    customer_name?: string;
    vehicle_id: string | null;
    pump_id: string;
    cycle_start: string;
    cycle_end: string;
    total_amount: number;
    rounded_amount: number;
    status: string;
    transaction_count?: number;
    late_interest_applied: number;
    deposit_utilized: number;
    generated_at: string;
    paid_at: string | null;
}

export interface SingleCustomerView {
    customer: UdhaarCustomer;
    kyc_documents: KYCDocument[];
    vehicles: UdhaarVehicle[];
    active_contract: UdhaarContract | null;
    contract_usage: ContractUsage | null;
    recent_transactions: UdhaarTransaction[];
    recent_invoices: UdhaarInvoice[];
}

// ─── Customer APIs ────────────────────────────────────────────────────────────

export const fetchCustomers = async (pumpId: string): Promise<CustomerListItem[]> => {
    const r = await api().get(`/udhaar/customers?pump_id=${pumpId}`);
    return r.data;
};

export const fetchCustomerDetail = async (pumpId: string, customerId: string): Promise<SingleCustomerView> => {
    const r = await api().get(`/udhaar/customers/${customerId}?pump_id=${pumpId}`);
    return r.data;
};

export const createCustomer = async (pumpId: string, payload: {
    customer_type: CustomerType;
    name: string;
    contact_name?: string;
    contact_phone?: string;
    contact_email?: string;
}) => {
    const r = await api().post(`/udhaar/customers?pump_id=${pumpId}`, payload);
    return r.data;
};

export const updateCustomer = async (pumpId: string, customerId: string, payload: Partial<{
    name: string; contact_name: string; contact_phone: string; contact_email: string;
}>) => {
    const r = await api().put(`/udhaar/customers/${customerId}?pump_id=${pumpId}`, payload);
    return r.data;
};

export const deleteCustomer = async (pumpId: string, customerId: string) => {
    const r = await api().delete(`/udhaar/customers/${customerId}?pump_id=${pumpId}`);
    return r.data;
};

// ─── KYC APIs ─────────────────────────────────────────────────────────────────

export const uploadKYC = async (pumpId: string, customerId: string, payload: {
    document_type: string; image_url?: string;
}) => {
    const r = await api().post(`/udhaar/customers/${customerId}/kyc?pump_id=${pumpId}`, payload);
    return r.data;
};

export const verifyKYC = async (pumpId: string, customerId: string, docId: string, payload: {
    status: 'accepted' | 'rejected'; rejection_reason?: string;
}) => {
    const r = await api().patch(`/udhaar/customers/${customerId}/kyc/${docId}/verify?pump_id=${pumpId}`, payload);
    return r.data;
};

// ─── Vehicle APIs ─────────────────────────────────────────────────────────────

export const fetchVehicles = async (pumpId: string, customerId?: string): Promise<UdhaarVehicle[]> => {
    const q = customerId ? `&customer_id=${customerId}` : '';
    const r = await api().get(`/udhaar/vehicles?pump_id=${pumpId}${q}`);
    return r.data;
};

export const createVehicle = async (pumpId: string, payload: {
    customer_id: string;
    number_plate: string;
    registration_type: 'private' | 'commercial';
    make?: string; model?: string; variant?: string;
    fuel_types?: string[];
    emission_standard?: string;
    engine_number?: string;
    chassis_number?: string;
    registration_date?: string;
}) => {
    const r = await api().post(`/udhaar/vehicles?pump_id=${pumpId}`, payload);
    return r.data;
};

export const deleteVehicle = async (pumpId: string, vehicleId: string) => {
    const r = await api().delete(`/udhaar/vehicles/${vehicleId}?pump_id=${pumpId}`);
    return r.data;
};

// ─── Contract APIs ────────────────────────────────────────────────────────────

export const issueContract = async (pumpId: string, payload: any) => {
    const r = await api().post(`/udhaar/contracts?pump_id=${pumpId}`, payload);
    return r.data;
};

export const amendContract = async (pumpId: string, contractId: string, payload: any) => {
    const r = await api().post(`/udhaar/contracts/${contractId}/amend?pump_id=${pumpId}`, payload);
    return r.data;
};

export const fetchContractUsage = async (pumpId: string, contractId: string): Promise<ContractUsage> => {
    const r = await api().get(`/udhaar/contracts/${contractId}/usage?pump_id=${pumpId}`);
    return r.data;
};

export const fetchAllContracts = async (pumpId: string, status?: string) => {
    const q = status ? `&status=${status}` : '';
    const r = await api().get(`/udhaar/contracts?pump_id=${pumpId}${q}`);
    return r.data;
};

// ─── Invoice APIs ─────────────────────────────────────────────────────────────

export const generateInvoice = async (pumpId: string, contractId: string) => {
    const r = await api().post(`/udhaar/invoices/generate?pump_id=${pumpId}&contract_id=${contractId}`);
    return r.data;
};

export const fetchInvoices = async (pumpId: string, customerId?: string, status?: string) => {
    let q = '';
    if (customerId) q += `&customer_id=${customerId}`;
    if (status) q += `&status=${status}`;
    const r = await api().get(`/udhaar/invoices?pump_id=${pumpId}${q}`);
    return r.data;
};

export const markInvoicePaid = async (pumpId: string, invoiceId: string) => {
    const r = await api().patch(`/udhaar/invoices/${invoiceId}/mark-paid?pump_id=${pumpId}`);
    return r.data;
};

// ─── Transactions APIs ────────────────────────────────────────────────────────

export const fetchTransactions = async (pumpId: string, customerId?: string, contractId?: string) => {
    let q = '';
    if (customerId) q += `&customer_id=${customerId}`;
    if (contractId) q += `&contract_id=${contractId}`;
    const r = await api().get(`/udhaar/transactions?pump_id=${pumpId}${q}&limit=50`);
    return r.data;
};