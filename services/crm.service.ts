/**
 * CRM Service
 * Handles API calls to backend /crm endpoints for customer profiles and risk alerts.
 */

import { authService } from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BackendCustomer {
  id: string;
  name: string;
  phone: string | null;
  vehicle_plate: string;
  vehicle_type: string | null;
  credit_limit: number;
  outstanding_amount: number;
  is_fleet: boolean;
  pump_id: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerCreatePayload {
  name: string;
  phone?: string | null;
  vehicle_plate: string;
  vehicle_type?: string | null;
  credit_limit?: number;
  is_fleet?: boolean;
  pump_id: string;
}

export interface RiskAlert {
  customer_id: string;
  name: string;
  vehicle_plate: string;
  outstanding: number;
  credit_limit: number;
  risk_level: 'HIGH' | 'MEDIUM';
}

export interface RiskAlertsResponse {
  total_risk_customers: number;
  alerts: RiskAlert[];
}

export interface UdhaarCreatePayload {
  customer_id: string;
  amount: number;
  description?: string | null;
  remarks?: string | null;
  fuel_type?: string | null;
  volume?: number | null;
  udhaar_type?: string;
  pump_id?: string;
  due_date?: string | null;
}

export interface UdhaarResponseData {
  id: string;
  customer_id: string;
  amount: number;
  description: string | null;
  due_date: string | null;
  status: string;
  created_at: string;
}

export interface UdhaarHistoryItem {
  id: string;
  customer_id: string;
  customer_name: string;
  vehicle_plate: string;
  pump_id: string;
  amount: number;
  volume: number | null;
  fuel_type: string | null;
  udhaar_type: string;
  status: string;
  remarks: string | null;
  used_at: string | null;
}

export interface OutstandingResponse {
  customer_id: string;
  name: string;
  vehicle_plate: string;
  outstanding_amount: number;
  credit_limit: number;
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function getAuthHeaders(): HeadersInit {
  const token = authService.getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── API Calls ───────────────────────────────────────────────────────────────

export const crmService = {
  /**
   * Fetch all CRM customers for the specified pump
   */
  async getCustomers(pumpId: string): Promise<BackendCustomer[]> {
    const res = await fetch(`${API_URL}/crm/customers?pump_id=${pumpId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || `Failed to fetch CRM customers: ${res.statusText}`);
    }

    return res.json();
  },

  /**
   * Add a new CRM customer
   */
  async addCustomer(data: CustomerCreatePayload): Promise<BackendCustomer> {
    const res = await fetch(`${API_URL}/crm/customers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || `Failed to create customer: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Get risk alerts for the specified pump
   */
  async getRiskAlerts(pumpId: string): Promise<RiskAlertsResponse> {
    const res = await fetch(`${API_URL}/crm/risk-alerts?pump_id=${pumpId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || `Failed to fetch risk alerts: ${res.statusText}`);
    }

    return res.json();
  },

  /**
   * Add a new Udhaar transaction
   */
  async addUdhaar(data: UdhaarCreatePayload): Promise<UdhaarResponseData> {
    const res = await fetch(`${API_URL}/udhaar/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        customer_id: data.customer_id,
        pump_id: data.pump_id,
        amount: data.amount,
        remarks: data.description || data.remarks || 'Fuel purchase',
        fuel_type: data.fuel_type || null,
        volume: data.volume || null,
        udhaar_type: data.udhaar_type || 'manual',
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || `Failed to add udhaar: ${res.statusText}`);
    }
    return res.json();
  },

  async deleteUdhaar(udhaarId: string): Promise<void> {
    const res = await fetch(`${API_URL}/udhaar/${udhaarId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || `Failed to delete udhaar: ${res.statusText}`);
    }
  },

  async getUdhaarHistory(customerId?: string): Promise<UdhaarHistoryItem[]> {
    const params = customerId ? `?customer_id=${customerId}` : '';
    const res = await fetch(`${API_URL}/udhaar/history${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || `Failed to fetch udhaar history: ${res.statusText}`);
    }
    return res.json();
  },

  async settleOutstanding(customerId: string, amount: number): Promise<any> {
    const res = await fetch(`${API_URL}/udhaar/settle/${customerId}?amount=${amount}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || `Failed to settle outstanding: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Get outstanding details for a customer
   */
  async getOutstanding(customerId: string): Promise<OutstandingResponse> {
    const res = await fetch(`${API_URL}/udhaar/outstanding/${customerId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || `Failed to fetch outstanding: ${res.statusText}`);
    }

    return res.json();
  }
};
