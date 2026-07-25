// FILE: src/services/salesShift.service.ts
import { authService } from '@/services/auth.service';

// ─── Types ──────────────────────────────────────────────────────

export type ShiftType = 'morning' | 'evening' | 'night' | 'custom';
export type PaymentMode = 'cash' | 'credit' | 'pos' | 'upi';
export type SaleType = 'single' | 'batch';

export interface ShiftPointIn {
  nozzle_id: string;
  item_name: string;
  start_reading: number;
  testing_value: number;
  is_active: boolean;
}

export interface ShiftPointOut extends ShiftPointIn {
  id: string;
  end_reading: number | null;
  sold_quantity?: number;
}

export interface Shift {
  id: string;
  pump_id: string;
  shift_type: ShiftType;
  status: 'active' | 'closed';
  start_time: string;
  end_time: string | null;
  point_readings: ShiftPointOut[];
}

export interface PointSummary {
  nozzle_id: string;
  item_name: string;
  start_reading: number;
  end_reading: number | null;
  testing_value: number;
  sold_quantity: number;
  total_amount: number;
}

export interface PaymentSummary {
  payment_mode: string;
  total_amount: number;
  transaction_count: number;
}

export interface ItemSummary {
  item_name: string;
  total_quantity: number;
  total_amount: number;
}

export interface ShiftSummary {
  shift_id: string;
  pump_id: string;
  shift_type: string;
  status: string;
  start_time: string;
  end_time: string | null;
  net_amount: number;
  total_quantity: number;
  credit_ratio: number;
  point_summaries: PointSummary[];
  payment_summaries: PaymentSummary[];
  item_summaries: ItemSummary[];
  total_sales_count: number;
}

export interface SaleLog {
  id: string;
  pump_id: string;
  shift_id: string | null;
  sale_type: SaleType;
  timestamp: string;
  nozzle_id: string | null;
  item_name: string;
  rate: number;
  quantity: number;
  amount: number;
  payment_mode: PaymentMode;
  pos_machine: string | null;
  billing_ref: string | null;
  customer_name: string | null;
  credit_slip_ref: string | null;
  vehicle_number: string | null;
  vehicle_type: string | null;
  attendant_id: string | null;
  remarks: string | null;
  receipt_url: string | null;
  created_at: string;
}

export interface SaleLogPayload {
  pump_id: string;
  shift_id?: string | null;
  sale_type: SaleType;
  timestamp?: string;
  nozzle_id?: string | null;
  item_name: string;
  rate: number;
  quantity: number;
  payment_mode: PaymentMode;
  pos_machine?: string | null;
  billing_ref?: string | null;
  customer_name?: string | null;
  customer_id?: string | null;
  credit_slip_ref?: string | null;
  vehicle_number?: string | null;
  vehicle_type?: string | null;
  attendant_id?: string | null;
  remarks?: string | null;
  receipt_url?: string | null;
}

export interface StartShiftPayload {
  pump_id: string;
  shift_type: ShiftType;
  start_time: string;
  point_readings: ShiftPointIn[];
  personnel_ids: string[];
}

export interface EndShiftPayload {
  shift_id: string;
  end_readings: { nozzle_id: string; end_reading: number; testing_value?: number }[];
}

export interface Attendant {
  id: string;
  name: string;
  phone: string | null;
  role: string;
}

export interface OverviewData {
  pump_id: string;
  period_days: number;
  net_amount: number;
  credit_ratio: number;
  cash_amount: number;
  credit_amount: number;
  pos_amount: number;
  monthly_item_sales: Record<string, Record<string, number>>;
  weekly_item_sales: Record<string, Record<string, number>>;
  monthly_payment_breakdown: Record<string, Record<string, number>>;
  recent_shifts: {
    shift_id: string;
    shift_type: string;
    start_time: string;
    end_time: string | null;
    net_amount: number;
    sales_count: number;
  }[];
}

export interface SaleLogFilters {
  pump_id: string;
  shift_id?: string;
  customer_name?: string;
  vehicle_type?: string;
  vehicle_number?: string;
  item_name?: string;
  payment_mode?: PaymentMode;
  from_date?: string;
  to_date?: string;
  page?: number;
  page_size?: number;
}

// ─── Shift APIs ─────────────────────────────────────────────────

export async function startShift(payload: StartShiftPayload): Promise<Shift> {
  const res = await authService.getApi().post('/sales/shifts/start', payload);
  return res.data;
}

export async function endShift(payload: EndShiftPayload): Promise<ShiftSummary> {
  const res = await authService.getApi().post('/sales/shifts/end', payload);
  return res.data;
}

export async function getActiveShift(pumpId: string): Promise<{ active: boolean; shift: ShiftSummary | null }> {
  const res = await authService.getApi().get('/sales/shifts/active', { params: { pump_id: pumpId } });
  return res.data;
}

export async function getLastShift(pumpId: string): Promise<ShiftSummary> {
  const res = await authService.getApi().get('/sales/shifts/last', { params: { pump_id: pumpId } });
  return res.data;
}

export async function getShiftSummary(shiftId: string): Promise<ShiftSummary> {
  const res = await authService.getApi().get(`/sales/shifts/${shiftId}/summary`);
  return res.data;
}

export async function getShiftPoints(shiftId: string): Promise<ShiftPointOut[]> {
  const res = await authService.getApi().get(`/sales/shifts/${shiftId}/point-readings`);
  return res.data;
}

// ─── Sale Log APIs ──────────────────────────────────────────────

export async function addSaleLog(payload: SaleLogPayload): Promise<SaleLog> {
  const res = await authService.getApi().post('/sales/logs', payload);
  return res.data;
}

export async function addSaleLogsBulk(logs: SaleLogPayload[]): Promise<{ status: string; count: number }> {
  const res = await authService.getApi().post('/sales/logs/bulk', logs);
  return res.data;
}

export async function getSaleLogs(filters: SaleLogFilters): Promise<SaleLog[]> {
  const res = await authService.getApi().get('/sales/logs', { params: filters });
  return res.data;
}

export async function deleteSaleLog(logId: string): Promise<{ status: string; log_id: string }> {
  const res = await authService.getApi().delete(`/sales/logs/${logId}`);
  return res.data;
}

// ─── Rates ──────────────────────────────────────────────────────

export async function updateItemRate(pumpId: string, itemName: string, newRate: number) {
  const res = await authService.getApi().patch('/sales/rates', { pump_id: pumpId, item_name: itemName, new_rate: newRate });
  return res.data;
}

// ─── Overview ───────────────────────────────────────────────────

export async function getSalesOverview(pumpId: string, days: number = 30): Promise<OverviewData> {
  const res = await authService.getApi().get('/sales/overview', { params: { pump_id: pumpId, days } });
  return res.data;
}

// ─── Attendants ─────────────────────────────────────────────────

export async function getPumpAttendants(pumpId: string): Promise<Attendant[]> {
  const res = await authService.getApi().get('/sales/attendants', { params: { pump_id: pumpId } });
  return res.data;
}

// ─── OCR Receipt Scanner ─────────────────────────────────────────

export interface OcrScanResult {
  /** Extracted rupee amount from the slip (null if not detected) */
  total_amount: number | null;
  /** Indian vehicle plate number in normalized format e.g. "MH12AB1234" */
  vehicle_no: string | null;
  /** Heuristic customer/party name extracted from slip (null if not detected) */
  customer_name_suggested: string | null;
  /** Server-relative URL to the saved receipt image e.g. "/uploads/receipts/abc.jpg" */
  receipt_url: string | null;
  /** All raw text lines extracted by OCR (useful for debugging) */
  raw_text_lines: string[];
  /** Error code if OCR failed: "ocr_failed" | "no_text_detected" | "ocr_not_installed" | null */
  error?: string | null;
}

/**
 * Upload a credit slip image to the backend for OCR processing.
 * Uses EasyOCR (free, runs on server). Returns extracted fields.
 * Timeout is 30s to handle OCR cold-start on first request.
 */
export async function scanReceipt(file: File): Promise<OcrScanResult> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await authService.getApi().post<OcrScanResult>(
    '/sales/scan-receipt',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    }
  );
  return res.data;
}

export interface VehiclePaymentCheckResult {
  status: 'none' | 'credit' | 'voucher' | 'udhaar_credit' | 'udhaar_no_contract';
  // Logistic fields
  voucher_id?: string;
  amount?: number;
  notes?: string;
  vehicle_id?: string;
  partner_name?: string;
  available_credit?: number;
  vehicle_plate_normalized?: string;
  // Udhaar customer fields
  customer_id?: string;
  customer_name?: string;
  credit_limit?: number;
  current_spend?: number;
  contact_phone?: string;
}

export async function checkVehiclePaymentInfo(vehiclePlate: string, pumpId: string): Promise<VehiclePaymentCheckResult> {
  const res = await authService.getApi().get('/sales/check-vehicle', {
    params: { vehicle_plate: vehiclePlate, pump_id: pumpId },
  });
  return res.data;
}