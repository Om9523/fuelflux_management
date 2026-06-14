// FILE: src/services/salesShift.service.ts
import { authService } from '@/services/auth.service';

// ─── Types ──────────────────────────────────────────────────────

export type ShiftType = 'morning' | 'evening' | 'night' | 'custom';
export type PaymentMode = 'cash' | 'credit' | 'pos' | 'upi';
export type SaleType = 'single' | 'batch';

export interface ShiftPointIn {
  nozzle_id: number;
  item_name: string;
  start_reading: number;
  testing_value: number;
  is_active: boolean;
}

export interface ShiftPointOut extends ShiftPointIn {
  id: number;
  end_reading: number | null;
  sold_quantity?: number;
}

export interface Shift {
  id: number;
  pump_id: number;
  shift_type: ShiftType;
  status: 'active' | 'closed';
  start_time: string;
  end_time: string | null;
  point_readings: ShiftPointOut[];
}

export interface PointSummary {
  nozzle_id: number;
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
  shift_id: number;
  pump_id: number;
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
  id: number;
  pump_id: number;
  shift_id: number | null;
  sale_type: SaleType;
  timestamp: string;
  nozzle_id: number | null;
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
  attendant_id: number | null;
  remarks: string | null;
  receipt_url: string | null;
  created_at: string;
}

export interface SaleLogPayload {
  pump_id: number;
  shift_id?: number | null;
  sale_type: SaleType;
  timestamp?: string;
  nozzle_id?: number | null;
  item_name: string;
  rate: number;
  quantity: number;
  payment_mode: PaymentMode;
  pos_machine?: string | null;
  billing_ref?: string | null;
  customer_name?: string | null;
  customer_id?: number | null;
  credit_slip_ref?: string | null;
  vehicle_number?: string | null;
  vehicle_type?: string | null;
  attendant_id?: number | null;
  remarks?: string | null;
  receipt_url?: string | null;
}

export interface StartShiftPayload {
  pump_id: number;
  shift_type: ShiftType;
  start_time: string;
  point_readings: ShiftPointIn[];
  personnel_ids: number[];
}

export interface EndShiftPayload {
  shift_id: number;
  end_readings: { nozzle_id: number; end_reading: number; testing_value?: number }[];
}

export interface Attendant {
  id: number;
  name: string;
  phone: string | null;
  role: string;
}

export interface OverviewData {
  pump_id: number;
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
    shift_id: number;
    shift_type: string;
    start_time: string;
    end_time: string | null;
    net_amount: number;
    sales_count: number;
  }[];
}

export interface SaleLogFilters {
  pump_id: number;
  shift_id?: number;
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

export async function getActiveShift(pumpId: number): Promise<{ active: boolean; shift: ShiftSummary | null }> {
  const res = await authService.getApi().get('/sales/shifts/active', { params: { pump_id: pumpId } });
  return res.data;
}

export async function getLastShift(pumpId: number): Promise<ShiftSummary> {
  const res = await authService.getApi().get('/sales/shifts/last', { params: { pump_id: pumpId } });
  return res.data;
}

export async function getShiftSummary(shiftId: number): Promise<ShiftSummary> {
  const res = await authService.getApi().get(`/sales/shifts/${shiftId}/summary`);
  return res.data;
}

export async function getShiftPoints(shiftId: number): Promise<ShiftPointOut[]> {
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

export async function deleteSaleLog(logId: number): Promise<{ status: string; log_id: number }> {
  const res = await authService.getApi().delete(`/sales/logs/${logId}`);
  return res.data;
}

// ─── Rates ──────────────────────────────────────────────────────

export async function updateItemRate(pumpId: number, itemName: string, newRate: number) {
  const res = await authService.getApi().patch('/sales/rates', { pump_id: pumpId, item_name: itemName, new_rate: newRate });
  return res.data;
}

// ─── Overview ───────────────────────────────────────────────────

export async function getSalesOverview(pumpId: number, days: number = 30): Promise<OverviewData> {
  const res = await authService.getApi().get('/sales/overview', { params: { pump_id: pumpId, days } });
  return res.data;
}

// ─── Attendants ─────────────────────────────────────────────────

export async function getPumpAttendants(pumpId: number): Promise<Attendant[]> {
  const res = await authService.getApi().get('/sales/attendants', { params: { pump_id: pumpId } });
  return res.data;
}