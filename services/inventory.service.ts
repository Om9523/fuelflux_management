/**
 * FILE LOCATION: src/services/inventory.service.ts
 * Uses authService.getApi() — same pattern as sales.service.ts
 */

import { authService } from '@/services/auth.service';

// ─── Enums ─────────────────────────────────────────────────────────────────

export type ItemClass = 'goods' | 'services';
export type TaxType = 'vat' | 'gst';
export type RateTaxType = 'after_tax' | 'before_tax';
export type ValuationMethod = 'average_purchase_date' | 'fifo';
export type AdjustmentReason = 'damage' | 'loss' | 'theft' | 'expired' | 'other';

// ─── Item Group ─────────────────────────────────────────────────────────────

export interface ItemGroup {
    id: number;
    pump_id: number;
    name: string;
    item_class: ItemClass;
    category: string | null;
    description: string | null;
    hsn_code: string | null;
    tax_type: TaxType;
    rate_tax_type: RateTaxType;
    valuation_method: ValuationMethod;
    vat_rate: number;
    surcharge_rate: number;
    cess_rate: number;
    additional_cess_rate: number;
    sales_account: string | null;
    purchase_account: string | null;
    vat_account: string | null;
    surcharge_account: string | null;
    cess_account: string | null;
    commission_account: string | null;
    license_fee_account: string | null;
    rebate_account: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ItemGroupCreate {
    pump_id: number;
    name: string;
    item_class?: ItemClass;
    category?: string;
    description?: string;
    hsn_code?: string;
    tax_type?: TaxType;
    rate_tax_type?: RateTaxType;
    valuation_method?: ValuationMethod;
    vat_rate?: number;
    surcharge_rate?: number;
    cess_rate?: number;
    additional_cess_rate?: number;
    sales_account?: string;
    purchase_account?: string;
    vat_account?: string;
    surcharge_account?: string;
    cess_account?: string;
    commission_account?: string;
    license_fee_account?: string;
    rebate_account?: string;
}

// ─── Stock Item ─────────────────────────────────────────────────────────────

export interface StockItem {
    id: number;
    pump_id: number;
    group_id: number | null;
    group_name: string | null;
    name: string;
    item_code: string | null;
    hsn_code: string | null;
    category: string | null;
    unit: string;
    is_dispensed_item: boolean;
    package_details: string | null;
    current_quantity: number;
    average_rate: number;
    current_valuation: number;
    selling_rate: number;
    override_tax: boolean;
    vat_rate: number | null;
    surcharge_rate: number | null;
    cess_rate: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface StockItemCreate {
    pump_id: number;
    group_id?: number;
    name: string;
    item_code?: string;
    hsn_code?: string;
    category?: string;
    unit?: string;
    is_dispensed_item?: boolean;
    package_details?: string;
    selling_rate?: number;
    override_tax?: boolean;
    vat_rate?: number;
    surcharge_rate?: number;
    cess_rate?: number;
}

export interface SetRateRequest {
    item_id: number;
    selling_rate: number;
}

// ─── Purchase ───────────────────────────────────────────────────────────────

export interface PurchaseLineCreate {
    item_id: number;
    quantity: number;
    basic_rate: number;
    rebate?: number;
    vat_amount?: number;
    surcharge_amount?: number;
    cess_amount?: number;
    license_fees?: number;
    dealer_commission?: number;
}

export interface PurchaseLineResponse {
    id: number;
    item_id: number;
    item_name: string | null;
    quantity: number;
    basic_rate: number;
    rebate: number;
    vat_amount: number;
    surcharge_amount: number;
    cess_amount: number;
    license_fees: number;
    dealer_commission: number;
    after_tax_amount: number;
}

export interface StockPurchaseCreate {
    pump_id: number;
    supplier_name: string;
    invoice_number?: string;
    invoice_date?: string;
    purchase_timestamp?: string;
    sample_ref_number?: string;
    sample_quantity?: number;
    challan_density_15c?: number;
    observed_density?: number;
    tanker_seal_numbers?: string[];
    vehicle_number?: string;
    transporter_name?: string;
    transporter_phone?: string;
    driver_name?: string;
    driver_license?: string;
    delivery_comments?: string;
    toll_amount?: number;
    toll_receipt_url?: string;
    extra_charges?: number;
    extra_charges_note?: string;
    line_items: PurchaseLineCreate[];
}

export interface StockPurchase {
    id: number;
    pump_id: number;
    supplier_name: string;
    invoice_number: string | null;
    invoice_date: string | null;
    purchase_timestamp: string;
    is_locked: boolean;
    locked_at: string | null;
    sample_ref_number: string | null;
    sample_quantity: number | null;
    challan_density_15c: number | null;
    observed_density: number | null;
    tanker_seal_numbers: string[] | null;
    vehicle_number: string | null;
    transporter_name: string | null;
    transporter_phone: string | null;
    driver_name: string | null;
    driver_license: string | null;
    delivery_comments: string | null;
    toll_amount: number;
    toll_receipt_url: string | null;
    extra_charges: number;
    extra_charges_note: string | null;
    line_items: PurchaseLineResponse[];
    created_at: string;
    updated_at: string;
}

// ─── Adjustment ─────────────────────────────────────────────────────────────

export interface StockAdjustmentCreate {
    pump_id: number;
    item_id: number;
    reason: AdjustmentReason;
    quantity: number;
    notes?: string;
}

export interface StockAdjustment {
    id: number;
    pump_id: number;
    item_id: number;
    item_name: string | null;
    reason: AdjustmentReason;
    quantity: number;
    notes: string | null;
    created_at: string;
}

// ─── Summary ────────────────────────────────────────────────────────────────

export interface StockSummaryRow {
    item_id: number;
    item_name: string;
    item_code: string | null;
    unit: string;
    group_name: string | null;
    category: string | null;
    opening_quantity: number;
    opening_value: number;
    purchase_quantity: number;
    sales_quantity: number;
    adjustment_quantity: number;
    closing_quantity: number;
    closing_value: number;
    average_rate: number;
}

export interface StockSummaryResponse {
    pump_id: number;
    date_from: string | null;
    date_to: string | null;
    group_id: number | null;
    category: string | null;
    items: StockSummaryRow[];
    total_closing_value: number;
}

// ─── API calls ──────────────────────────────────────────────────────────────

const api = () => authService.getApi();

// Groups
export const fetchItemGroups = async (pump_id: number): Promise<ItemGroup[]> => {
    const r = await api().get<ItemGroup[]>(`/inventory/groups?pump_id=${pump_id}`);
    return r.data;
};

export const createItemGroup = async (data: ItemGroupCreate): Promise<ItemGroup> => {
    const r = await api().post<ItemGroup>(`/inventory/groups`, data);
    return r.data;
};

export const updateItemGroup = async (id: number, data: Partial<ItemGroupCreate>): Promise<ItemGroup> => {
    const r = await api().patch<ItemGroup>(`/inventory/groups/${id}`, data);
    return r.data;
};

export const deleteItemGroup = async (id: number): Promise<void> => {
    await api().delete(`/inventory/groups/${id}`);
};

// Items
export const fetchStockItems = async (
    pump_id: number,
    group_id?: number,
    category?: string
): Promise<StockItem[]> => {
    const params = new URLSearchParams({ pump_id: String(pump_id) });
    if (group_id) params.append('group_id', String(group_id));
    if (category) params.append('category', category);
    const r = await api().get<StockItem[]>(`/inventory/items?${params}`);
    return r.data;
};

export const createStockItem = async (data: StockItemCreate): Promise<StockItem> => {
    const r = await api().post<StockItem>(`/inventory/items`, data);
    return r.data;
};

export const updateStockItem = async (id: number, data: Partial<StockItemCreate>): Promise<StockItem> => {
    const r = await api().patch<StockItem>(`/inventory/items/${id}`, data);
    return r.data;
};

export const setItemRates = async (rates: SetRateRequest[]): Promise<StockItem[]> => {
    const r = await api().patch<StockItem[]>(`/inventory/items/set-rates`, rates);
    return r.data;
};

export const fetchItemTaxSettings = async (item_id: number): Promise<any> => {
    const r = await api().get(`/inventory/items/${item_id}/tax-settings`);
    return r.data;
};

// Purchases
export const fetchStockPurchases = async (
    pump_id: number,
    params?: { date_from?: string; date_to?: string; locked_only?: boolean }
): Promise<StockPurchase[]> => {
    const p = new URLSearchParams({ pump_id: String(pump_id) });
    if (params?.date_from) p.append('date_from', params.date_from);
    if (params?.date_to) p.append('date_to', params.date_to);
    if (params?.locked_only) p.append('locked_only', 'true');
    const r = await api().get<StockPurchase[]>(`/inventory/purchases?${p}`);
    return r.data;
};

export const createStockPurchase = async (data: StockPurchaseCreate): Promise<StockPurchase> => {
    const r = await api().post<StockPurchase>(`/inventory/purchases`, data);
    return r.data;
};

export const lockStockPurchase = async (id: number): Promise<StockPurchase> => {
    const r = await api().post<StockPurchase>(`/inventory/purchases/${id}/lock`);
    return r.data;
};

export const deleteStockPurchase = async (id: number): Promise<void> => {
    await api().delete(`/inventory/purchases/${id}`);
};

// Adjustments
export const fetchStockAdjustments = async (
    pump_id: number,
    params?: { item_id?: number; date_from?: string; date_to?: string }
): Promise<StockAdjustment[]> => {
    const p = new URLSearchParams({ pump_id: String(pump_id) });
    if (params?.item_id) p.append('item_id', String(params.item_id));
    if (params?.date_from) p.append('date_from', params.date_from);
    if (params?.date_to) p.append('date_to', params.date_to);
    const r = await api().get<StockAdjustment[]>(`/inventory/adjustments?${p}`);
    return r.data;
};

export const createStockAdjustment = async (data: StockAdjustmentCreate): Promise<StockAdjustment> => {
    const r = await api().post<StockAdjustment>(`/inventory/adjustments`, data);
    return r.data;
};

// Summary
export const fetchStockSummary = async (
    pump_id: number,
    params?: { date_from?: string; date_to?: string; group_id?: number; category?: string }
): Promise<StockSummaryResponse> => {
    const p = new URLSearchParams({ pump_id: String(pump_id) });
    if (params?.date_from) p.append('date_from', params.date_from);
    if (params?.date_to) p.append('date_to', params.date_to);
    if (params?.group_id) p.append('group_id', String(params.group_id));
    if (params?.category) p.append('category', params.category);
    const r = await api().get<StockSummaryResponse>(`/inventory/summary?${p}`);
    return r.data;
};