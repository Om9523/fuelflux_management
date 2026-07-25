import { authService } from '@/services/auth.service';

export interface ReportsSummary {
  status: string;
  total_sales: number;
  total_volume: number;
  payment_modes: {
    payment_mode: string;
    total_amount: number;
    transaction_count: number;
  }[];
  inventory_status: {
    tank_number: string;
    fuel_type: string;
    capacity_liters: number;
    current_level_liters: number;
    percentage: number;
  }[];
  sales_trend: {
    date: string;
    revenue: number;
    volume: number;
  }[];
  top_attendants: {
    name: string;
    sold_liters: number;
    total_amount: number;
  }[];
  udhaar_summary: {
    customer_name: string;
    volume_liters: number;
    amount: number;
  }[];
}

export async function getReportsSummary(
  pumpId: string,
  dateRange: string = '7days',
  fromDate?: string,
  toDate?: string
): Promise<ReportsSummary> {
  const res = await authService.getApi().get('/reports/summary', {
    params: {
      pump_id: pumpId,
      date_range: dateRange,
      from_date: fromDate,
      to_date: toDate,
    },
  });
  return res.data;
}

export async function exportReport(params: {
  pump_id: string;
  report_type: string;
  date_range: string;
  from_date?: string;
  to_date?: string;
  format: string;
}): Promise<Blob> {
  const res = await authService.getApi().get('/reports/export', {
    params,
    responseType: 'blob',
  });
  return res.data;
}
