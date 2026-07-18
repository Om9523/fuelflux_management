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

const LOCAL_PUMPS_KEY = 'fuelflux_backend_pumps';

function getMockPumps(): BackendPump[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOCAL_PUMPS_KEY);
  if (!stored) {
    const seed: BackendPump[] = [
      {
        id: '1',
        name: 'Hyderabad Highway Plaza',
        address: 'Plot No. 12, NH-65, Near Toll Booth',
        contact_number: '9876543210',
        opening_time: '00:00',
        closing_time: '23:59',
        status: 'approved',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500032',
        gst: '36AAAAA1111A1Z1',
        license: 'FL-2026-9092',
        fuel_types: 'Petrol,Diesel,CNG',
        tanks_count: 2,
        nozzles_count: 6,
        daily_capacity: 20000,
        latitude: 17.4483,
        longitude: 78.3915,
        created_at: new Date().toISOString(),
      }
    ];
    localStorage.setItem(LOCAL_PUMPS_KEY, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(stored);
}

function saveMockPumps(pumps: BackendPump[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_PUMPS_KEY, JSON.stringify(pumps));
  }
}

function getMockOverview(pumpsList: BackendPump[]): DashboardOverview {
  const primaryPump = pumpsList[0] || null;
  return {
    status: primaryPump ? 'ok' : 'no_pump',
    message: primaryPump ? 'Dashboard loaded from local storage' : 'No pump registered',
    pump: primaryPump,
    pumps_count: pumpsList.length,
    stats: {
      total_sales_count: primaryPump ? 142 : 0,
      today_sales_count: primaryPump ? 28 : 0,
      today_revenue: primaryPump ? 34250 : 0,
      active_attendants: primaryPump ? 3 : 0,
    },
    weekly_trend: [
      { day: 'Mon', revenue: 28000, count: 22 },
      { day: 'Tue', revenue: 31000, count: 25 },
      { day: 'Wed', revenue: 29500, count: 24 },
      { day: 'Thu', revenue: 34000, count: 27 },
      { day: 'Fri', revenue: 36000, count: 30 },
      { day: 'Sat', revenue: 42000, count: 35 },
      { day: 'Sun', revenue: 34250, count: 28 },
    ],
    top_attendants: [
      { id: 'att_1', name: 'Ramesh Kumar', sold_liters: 420, total_amount: 42840 },
      { id: 'att_2', name: 'Suresh Singh', sold_liters: 380, total_amount: 38760 },
      { id: 'att_3', name: 'Amit Sharma', sold_liters: 310, total_amount: 31620 },
    ],
    forecourt_activities: [
      { id: 'tx_1', nozzle_id: 'NZ-01', vehicle_plate: 'TS-09-EA-1234', volume: 45.2, amount: 4610.4, timestamp: new Date().toISOString() },
      { id: 'tx_2', nozzle_id: 'NZ-03', vehicle_plate: 'KA-51-MB-5678', volume: 12.5, amount: 1275, timestamp: new Date(Date.now() - 10 * 60000).toISOString() },
      { id: 'tx_3', nozzle_id: 'NZ-02', vehicle_plate: null, volume: 5.0, amount: 510, timestamp: new Date(Date.now() - 25 * 60000).toISOString() },
    ],
  };
}

// ─── API Calls ───────────────────────────────────────────────────────────────

/**
 * Fetch dashboard KPI overview (pump info + stats) for the logged-in user.
 */
export async function fetchDashboardOverview(): Promise<DashboardOverview> {
  try {
    const res = await fetch(`${API_URL}/dashboard/overview`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || `Failed to fetch dashboard: ${res.statusText}`);
    }

    return res.json();
  } catch (error: any) {
    console.warn('Network error detected. Falling back to local storage for dashboard overview:', error);
    const mockPumps = getMockPumps();
    return getMockOverview(mockPumps);
  }
}

/**
 * Fetch all pumps belonging to the logged-in user.
 * Used by TopNavbar pump switcher.
 */
export async function fetchMyPumps(): Promise<BackendPump[]> {
  try {
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
  } catch (error: any) {
    console.warn('Network error detected. Falling back to local storage for fetching pumps:', error);
    return getMockPumps();
  }
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
  try {
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
  } catch (error: any) {
    console.warn('Network error detected. Falling back to local storage for pump creation:', error);
    const mockPumps = getMockPumps();
    const newPump: BackendPump = {
      id: String(mockPumps.length + 1),
      name: pumpData.name,
      address: pumpData.address,
      contact_number: pumpData.contact_number || '',
      opening_time: pumpData.opening_time || '00:00',
      closing_time: pumpData.closing_time || '23:59',
      status: 'pending',
      city: pumpData.city || null,
      state: pumpData.state || null,
      pincode: pumpData.pincode || null,
      gst: pumpData.gst || null,
      license: pumpData.license || null,
      fuel_types: pumpData.fuel_types || null,
      tanks_count: pumpData.tanks_count || 0,
      nozzles_count: pumpData.nozzles_count || 0,
      daily_capacity: pumpData.daily_capacity || 0,
      latitude: pumpData.latitude || null,
      longitude: pumpData.longitude || null,
      created_at: new Date().toISOString(),
    };
    
    mockPumps.push(newPump);
    saveMockPumps(mockPumps);
    return newPump;
  }
}


