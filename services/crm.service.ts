/**
 * CRM Service
 * Handles API calls to backend /crm endpoints for customer profiles and risk alerts.
 */

import { authService } from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BackendCustomer {
  id: number;
  name: string;
  phone: string | null;
  vehicle_plate: string;
  vehicle_type: string | null;
  credit_limit: number;
  outstanding_amount: number;
  is_fleet: boolean;
  pump_id: number;
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
  pump_id: number;
}

export interface RiskAlert {
  customer_id: number;
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
  customer_id: number;
  amount: number;
  description?: string | null;
  due_date?: string | null;
}

export interface UdhaarResponseData {
  id: number;
  customer_id: number;
  amount: number;
  description: string | null;
  due_date: string | null;
  status: string;
  created_at: string;
}

export interface OutstandingResponse {
  customer_id: number;
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
  async getCustomers(pumpId: number): Promise<BackendCustomer[]> {
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
  async getRiskAlerts(pumpId: number): Promise<RiskAlertsResponse> {
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
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || `Failed to add udhaar: ${res.statusText}`);
    }

    return res.json();
  },

  /**
   * Get outstanding details for a customer
   */
  async getOutstanding(customerId: number): Promise<OutstandingResponse> {
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
