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
    id: number;
    pump_id: number;
    customer_type: CustomerType;
    name: string;
    contact_name: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    party_account_id: number | null;
    kyc_status: KYCStatus;
    is_active: boolean;
    created_at: string;
}

export interface CustomerListItem {
    id: number;
    name: string;
    customer_type: CustomerType;
    contact_phone: string | null;
    kyc_status: KYCStatus;
    vehicle_count: number;
    has_active_contract: boolean;
    created_at: string;
}

export interface KYCDocument {
    id: number;
    document_type: string;
    image_url: string | null;
    status: KYCStatus;
    rejection_reason: string | null;
    reviewed_at: string | null;
    created_at: string;
}

export interface UdhaarVehicle {
    id: number;
    customer_id: number;
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
    id: number;
    booklet_number: string;
    start_number: number;
    end_number: number;
    total_slips: number;
}

export interface ItemLimit {
    id: number;
    item_name: string;
    qty_per_fill: number | null;
    qty_per_day: number | null;
    qty_per_cycle: number | null;
}

export interface CustomCondition {
    id: number;
    vehicle_type: string | null;
    item_name: string | null;
    station_id: number | null;
    max_slips: number | null;
    money_per_fill: number | null;
    money_per_day: number | null;
    money_per_cycle: number | null;
    qty_per_fill: number | null;
    qty_per_day: number | null;
    qty_per_cycle: number | null;
}

export interface UdhaarContract {
    id: number;
    customer_id: number;
    pump_id: number;
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
    amended_from: number | null;
    created_at: string;
    slip_booklets: SlipBooklet[];
    item_limits: ItemLimit[];
    custom_conditions: CustomCondition[];
}

export interface ContractUsage {
    contract_id: number;
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
    id: number;
    contract_id: number;
    customer_id: number;
    vehicle_id: number | null;
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
    id: number;
    contract_id: number;
    customer_id: number;
    customer_name?: string;
    vehicle_id: number | null;
    pump_id: number;
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

export const fetchCustomers = async (pumpId: number): Promise<CustomerListItem[]> => {
    const r = await api().get(`/udhaar/customers?pump_id=${pumpId}`);
    return r.data;
};

export const fetchCustomerDetail = async (pumpId: number, customerId: number): Promise<SingleCustomerView> => {
    const r = await api().get(`/udhaar/customers/${customerId}?pump_id=${pumpId}`);
    return r.data;
};

export const createCustomer = async (pumpId: number, payload: {
    customer_type: CustomerType;
    name: string;
    contact_name?: string;
    contact_phone?: string;
    contact_email?: string;
}) => {
    const r = await api().post(`/udhaar/customers?pump_id=${pumpId}`, payload);
    return r.data;
};

export const updateCustomer = async (pumpId: number, customerId: number, payload: Partial<{
    name: string; contact_name: string; contact_phone: string; contact_email: string;
}>) => {
    const r = await api().put(`/udhaar/customers/${customerId}?pump_id=${pumpId}`, payload);
    return r.data;
};

export const deleteCustomer = async (pumpId: number, customerId: number) => {
    const r = await api().delete(`/udhaar/customers/${customerId}?pump_id=${pumpId}`);
    return r.data;
};

// ─── KYC APIs ─────────────────────────────────────────────────────────────────

export const uploadKYC = async (pumpId: number, customerId: number, payload: {
    document_type: string; image_url?: string;
}) => {
    const r = await api().post(`/udhaar/customers/${customerId}/kyc?pump_id=${pumpId}`, payload);
    return r.data;
};

export const verifyKYC = async (pumpId: number, customerId: number, docId: number, payload: {
    status: 'accepted' | 'rejected'; rejection_reason?: string;
}) => {
    const r = await api().patch(`/udhaar/customers/${customerId}/kyc/${docId}/verify?pump_id=${pumpId}`, payload);
    return r.data;
};

// ─── Vehicle APIs ─────────────────────────────────────────────────────────────

export const fetchVehicles = async (pumpId: number, customerId?: number): Promise<UdhaarVehicle[]> => {
    const q = customerId ? `&customer_id=${customerId}` : '';
    const r = await api().get(`/udhaar/vehicles?pump_id=${pumpId}${q}`);
    return r.data;
};

export const createVehicle = async (pumpId: number, payload: {
    customer_id: number;
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

export const deleteVehicle = async (pumpId: number, vehicleId: number) => {
    const r = await api().delete(`/udhaar/vehicles/${vehicleId}?pump_id=${pumpId}`);
    return r.data;
};

// ─── Contract APIs ────────────────────────────────────────────────────────────

export const issueContract = async (pumpId: number, payload: any) => {
    const r = await api().post(`/udhaar/contracts?pump_id=${pumpId}`, payload);
    return r.data;
};

export const amendContract = async (pumpId: number, contractId: number, payload: any) => {
    const r = await api().post(`/udhaar/contracts/${contractId}/amend?pump_id=${pumpId}`, payload);
    return r.data;
};

export const fetchContractUsage = async (pumpId: number, contractId: number): Promise<ContractUsage> => {
    const r = await api().get(`/udhaar/contracts/${contractId}/usage?pump_id=${pumpId}`);
    return r.data;
};

export const fetchAllContracts = async (pumpId: number, status?: string) => {
    const q = status ? `&status=${status}` : '';
    const r = await api().get(`/udhaar/contracts?pump_id=${pumpId}${q}`);
    return r.data;
};

// ─── Invoice APIs ─────────────────────────────────────────────────────────────

export const generateInvoice = async (pumpId: number, contractId: number) => {
    const r = await api().post(`/udhaar/invoices/generate?pump_id=${pumpId}&contract_id=${contractId}`);
    return r.data;
};

export const fetchInvoices = async (pumpId: number, customerId?: number, status?: string) => {
    let q = '';
    if (customerId) q += `&customer_id=${customerId}`;
    if (status) q += `&status=${status}`;
    const r = await api().get(`/udhaar/invoices?pump_id=${pumpId}${q}`);
    return r.data;
};

export const markInvoicePaid = async (pumpId: number, invoiceId: number) => {
    const r = await api().patch(`/udhaar/invoices/${invoiceId}/mark-paid?pump_id=${pumpId}`);
    return r.data;
};

// ─── Transactions APIs ────────────────────────────────────────────────────────

export const fetchTransactions = async (pumpId: number, customerId?: number, contractId?: number) => {
    let q = '';
    if (customerId) q += `&customer_id=${customerId}`;
    if (contractId) q += `&contract_id=${contractId}`;
    const r = await api().get(`/udhaar/transactions?pump_id=${pumpId}${q}&limit=50`);
    return r.data;
};