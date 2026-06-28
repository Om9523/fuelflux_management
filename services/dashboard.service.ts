/**
 * Dashboard Service
 * Handles all API calls to the backend /dashboard endpoints.
 * Connects frontend dashboard page and pump store to real backend data.
 */

import { authService } from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BackendPump {
  id: string;
  name: string;
  address: string;
  contact_number: string;
  opening_time: string;
  closing_time: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'suspended';
  city: string | null;
  state: string | null;
  pincode: string | null;
  gst: string | null;
  license: string | null;
  fuel_types: string | null;
  tanks_count: number | null;
  nozzles_count: number | null;
  daily_capacity: number | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string | null;
}

export interface DashboardStats {
  total_sales_count: number;
  today_sales_count: number;
  today_revenue: number;
  active_attendants: number;
}

export interface WeeklyTrendPoint {
  day: string;       // "Mon" … "Sun"
  revenue: number;
  count: number;
}

export interface TopAttendant {
  id: string;
  name: string;
  sold_liters: number;
  total_amount: number;
}

export interface ForecourtActivity {
  id: string;
  nozzle_id: string;
  vehicle_plate: string | null;
  volume: number;
  amount: number;
  timestamp: string;
}

export interface DashboardOverview {
  status: 'ok' | 'no_pump';
  message: string;
  pump: BackendPump | null;
  stats: DashboardStats | null;
  pumps_count: number;
  weekly_trend: WeeklyTrendPoint[];
  top_attendants: TopAttendant[];
  forecourt_activities: ForecourtActivity[];
}

export interface PumpsListResponse {
  status: string;
  pumps: BackendPump[];
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

/**
 * Fetch dashboard KPI overview (pump info + stats) for the logged-in user.
 */
export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  const res = await fetch(`${API_URL}/dashboard/overview`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `Failed to fetch dashboard: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Fetch all pumps belonging to the logged-in user.
 * Used by TopNavbar pump switcher.
 */
export async function fetchMyPumps(): Promise<BackendPump[]> {
  const res = await fetch(`${API_URL}/dashboard/pumps`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `Failed to fetch pumps: ${res.statusText}`);
  }

  const data: PumpsListResponse = await res.json();
  return data.pumps || [];
}

/**
 * Create a new pump on the backend.
 */
export async function createBackendPump(pumpData: {
  name: string;
  address: string;
  contact_number: string;
  opening_time: string;
  closing_time: string;
  city?: string;
  state?: string;
  pincode?: string;
  gst?: string;
  license?: string;
  fuel_types?: string;
  tanks_count?: number;
  nozzles_count?: number;
  daily_capacity?: number;
  latitude?: number | null;
  longitude?: number | null;
}): Promise<BackendPump> {
  const res = await fetch(`${API_URL}/pumps/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(pumpData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `Failed to create pump: ${res.statusText}`);
  }

  return res.json();
}

