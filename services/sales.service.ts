import { authService } from '@/services/auth.service';

export interface ShiftSale {
  shift_label: string;
  date: string;
  total_liters: number;
  total_amount: number;
  transaction_count: number;
  status: 'reconciled' | 'under_audit' | 'pending';
}

export interface NozzleSale {
  nozzle_id: number;
  nozzle_label: string;
  fuel_type: string;
  total_liters: number;
  total_amount: number;
  transaction_count: number;
  last_sale: string | null;
}

export interface SalesRegisterData {
  pump_id: number;
  pump_name: string;
  period_days: number;
  total_sales: number;
  total_volume: number;
  shifts: ShiftSale[];
  nozzles: NozzleSale[];
  recent_transactions: RecentTransaction[];
}

export interface RecentTransaction {
  id: number;
  nozzle_id: number | null;
  vehicle_plate: string | null;
  volume: number;
  amount: number;
  event_type: string;
  timestamp: string;
}

export interface SalePayload {
  pump_id: number;
  nozzle_id?: number | null;
  attendant_id?: number | null;
  vehicle_plate?: string | null;
  volume: number;
  amount: number;
  event_type?: string;
}

export const fetchSalesRegister = async (
  pumpId: number | string,
  days = 30
): Promise<SalesRegisterData> => {
  const numericId = Number(pumpId);
  const response = await authService.getApi().get<SalesRegisterData>(
    `/sales/register?pump_id=${numericId}&days=${days}`
  );
  return response.data;
};

export const recordSale = async (payload: SalePayload): Promise<any> => {
  const response = await authService.getApi().post(`/sales/record`, {
    ...payload,
    event_type: payload.event_type || 'nozzle_sale',
  });
  return response.data;
};

export const recordSalesBulk = async (payloads: SalePayload[]): Promise<any> => {
  const response = await authService.getApi().post(`/sales/bulk`, payloads.map(p => ({
    ...p,
    event_type: p.event_type || 'nozzle_sale',
  })));
  return response.data;
};
