/**
 * Pumps Store (Zustand)
 * 
 * Previously used mock/seed data. Now connects to the real FastAPI backend
 * via dashboard.service.ts for the logged-in user's pump list.
 * 
 * Falls back to empty state gracefully if user has no pumps or is logged out.
 */

import { create } from 'zustand';
import { fetchMyPumps, createBackendPump, BackendPump } from '../services/dashboard.service';

export type PumpStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'suspended';

/**
 * Frontend Pump shape — maps from backend BackendPump fields.
 * Keeps backward-compat with existing dashboard/TopNavbar usage.
 */
export interface Pump {
  id: string;          // backend sends int, we stringify it for consistency
  name: string;
  address: string;
  city: string;        
  state: string;       
  pincode: string;
  gst: string;
  license: string;
  contact_number: string;
  opening_time: string;
  closing_time: string;
  status: PumpStatus;
  fuelTypes: string[];
  tanksCount: number;
  nozzlesCount: number;
  dailyCapacity: number;
  latitude: number | null;
  longitude: number | null;
  created_at: string | null;
}

interface PumpState {
  pumps: Pump[];
  selectedPump: Pump | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  initializePumps: () => Promise<void>;
  setSelectedPump: (pump: Pump) => void;
  clearPumps: () => void;
  addPump: (wizardData: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    gst: string;
    license: string;
    fuelTypes: string[];
    tanksCount: number;
    nozzlesCount: number;
    dailyCapacity: number;
    operatingHours?: string;
  }) => Promise<Pump>;
}


const SELECTED_PUMP_KEY = 'fuelflux_selected_pump_id';

function getStorage() {
  if (typeof window !== 'undefined') return window.localStorage;
  return null;
}

/** Map backend pump → frontend Pump shape */
function mapBackendPump(bp: BackendPump): Pump {
  const mappedStatus = (bp.status as string) === 'active' ? 'approved' : bp.status;
  return {
    id: String(bp.id),
    name: bp.name,
    address: bp.address,
    city: bp.city || '',
    state: bp.state || '',
    pincode: bp.pincode || '',
    gst: bp.gst || '',
    license: bp.license || '',
    contact_number: bp.contact_number || '',
    opening_time: bp.opening_time || '',
    closing_time: bp.closing_time || '',
    status: mappedStatus as PumpStatus,
    fuelTypes: bp.fuel_types ? bp.fuel_types.split(',').map(f => f.trim()).filter(Boolean) : [],
    tanksCount: bp.tanks_count || 0,
    nozzlesCount: bp.nozzles_count || 0,
    dailyCapacity: bp.daily_capacity || 0,
    latitude: bp.latitude,
    longitude: bp.longitude,
    created_at: bp.created_at,
  };
}

export const usePumpStore = create<PumpState>((set, get) => ({
  pumps: [],
  selectedPump: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  initializePumps: async () => {
    set({ isLoading: true, error: null });
    try {
      const backendPumps = await fetchMyPumps();
      const pumps = backendPumps.map(mapBackendPump);

      // Restore the previously selected pump id
      const storage = getStorage();
      const savedId = storage?.getItem(SELECTED_PUMP_KEY);

      let selected: Pump | null = null;
      if (savedId) {
        selected = pumps.find((p) => p.id === savedId) || null;
      }
      // Default to first approved pump
      if (!selected) {
        selected = pumps.find((p) => p.status === 'approved') || pumps[0] || null;
        if (selected && storage) {
          storage.setItem(SELECTED_PUMP_KEY, selected.id);
        }
      }

      set({ pumps, selectedPump: selected, isLoading: false, isInitialized: true });
    } catch (err: any) {
      console.error('[PumpStore] Failed to fetch pumps:', err.message);
      set({ isLoading: false, isInitialized: true, error: err.message, pumps: [], selectedPump: null });
    }
  },

  setSelectedPump: (pump) => {
    const storage = getStorage();
    if (storage) storage.setItem(SELECTED_PUMP_KEY, pump.id);
    set({ selectedPump: pump });
  },

  clearPumps: () => {
    const storage = getStorage();
    storage?.removeItem(SELECTED_PUMP_KEY);
    set({ pumps: [], selectedPump: null, isInitialized: false });
  },

  addPump: async (wizardData) => {
    set({ isLoading: true, error: null });
    try {
      // Map operating hours to opening/closing times
      let opening_time = '00:00';
      let closing_time = '23:59';
      if (wizardData.operatingHours === '6:00 AM - 11:00 PM') {
        opening_time = '06:00';
        closing_time = '23:00';
      } else if (wizardData.operatingHours === '5:00 AM - 12:00 AM') {
        opening_time = '05:00';
        closing_time = '00:00';
      }

      const newBp = await createBackendPump({
        name: wizardData.name,
        address: wizardData.address,
        city: wizardData.city,
        state: wizardData.state,
        pincode: wizardData.pincode,
        gst: wizardData.gst,
        license: wizardData.license,
        fuel_types: wizardData.fuelTypes.join(','),
        tanks_count: wizardData.tanksCount,
        nozzles_count: wizardData.nozzlesCount,
        daily_capacity: wizardData.dailyCapacity,
        contact_number: '', // Contact number not collected in the wizard
        opening_time,
        closing_time,
      });

      const newPump = mapBackendPump(newBp);
      const updatedPumps = [...get().pumps, newPump];

      // If we don't have a selected pump, make this the selected pump
      let selected = get().selectedPump;
      if (!selected) {
        selected = newPump;
        const storage = getStorage();
        if (storage) {
          storage.setItem(SELECTED_PUMP_KEY, selected.id);
        }
      }

      set({ pumps: updatedPumps, selectedPump: selected, isLoading: false });
      return newPump;
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },
}));
