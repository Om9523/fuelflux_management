import { authService } from '@/services/auth.service';

export interface AccountingSummary {
  pump_id: number;
  pump_name: string;
  period_days: number;
  total_sales: number;
  total_volume: number;
  gst_collected: number;
  net_profit_estimate: number;
  message: string;
}

export const fetchAccountingSummary = async (pumpId: number, days = 30): Promise<AccountingSummary> => {
  console.log('Fetching accounting summary with token:', authService.getAccessToken());
  try {
    const response = await authService.getApi().get<AccountingSummary>(
      `/accounting/summary?pump_id=${pumpId}&days=${days}`
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error('Failed to fetch accounting summary, status:', error.response.status, error.response.data);
    } else {
      console.error('Failed to fetch accounting summary:', error.message);
    }
    throw error; // propagate to caller for toast handling
  }
};

export interface PLItem {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  percentage: number;
}

export interface GSTLog {
  period: string;
  cgst: number;
  sgst: number;
  status: 'filed' | 'due' | 'overdue';
}

export interface ExpenseItem {
  id: number;
  desc: string;
  category: string;
  amount: number;
  paymentMode: string;
  date: string;
  status: string;
}

export interface DashboardData {
  summary: AccountingSummary;
  pl_items: PLItem[];
  gst_log: GSTLog[];
  expenses: ExpenseItem[];
}

export const fetchDashboardData = async (pumpId: number | string, days = 30): Promise<DashboardData> => {
  const numericId = Number(pumpId);
  console.log('Fetching dashboard data for pump:', numericId);
  try {
    const response = await authService.getApi().get<DashboardData>(
      `/accounting/dashboard-data?pump_id=${numericId}&days=${days}`
    );
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error('Failed to fetch dashboard data, status:', error.response.status, error.response.data);
    } else {
      console.error('Failed to fetch dashboard data:', error.message);
    }
    throw error;
  }
};
export const createExpense = async (payload: {
  pump_id: number;
  desc: string;
  category: string;
  amount: number;
  paymentMode: string;
  date: string; // ISO date string
}) => {
  // Use authService.getApi() so the Authorization header is included automatically
  const response = await authService.getApi().post(
    `/accounting/expense`,
    null, // no request body (params sent as query string below)
    {
      params: {
        pump_id: payload.pump_id,
        desc: payload.desc,
        category: payload.category,
        amount: payload.amount,
        paymentMode: payload.paymentMode,
        date: payload.date,
      },
    }
  );
  return response.data;
};
