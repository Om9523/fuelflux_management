import { create } from 'zustand';

export type PumpStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'suspended';

export interface Pump {
  id: string;
  name: string;
  ownerName: string;
  gst: string;
  license: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  fuelTypes: string[];
  tanksCount: number;
  nozzlesCount: number;
  dailyCapacity: number; // in liters
  operatingHours: string;
  status: PumpStatus;
  createdAt: string;
}

interface PumpState {
  pumps: Pump[];
  selectedPump: Pump | null;
  isLoading: boolean;
  error: string | null;

  initializePumps: () => void;
  setSelectedPump: (pump: Pump) => void;
  addPump: (pump: Omit<Pump, 'id' | 'status' | 'createdAt'>) => Promise<Pump>;
  updatePumpStatus: (id: string, status: PumpStatus) => void;
}

const SEED_PUMPS: Pump[] = [
  {
    id: 'pump_1',
    name: 'Vijayawada Highway Fuel Center',
    ownerName: 'Rajesh Kumar',
    gst: '37AAAAA1111A1Z1',
    license: 'FL-2026-89021',
    address: 'NH-65, Near Highway Toll Plaza, Benz Circle',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    pincode: '520008',
    fuelTypes: ['Petrol', 'Diesel', 'CNG'],
    tanksCount: 4,
    nozzlesCount: 12,
    dailyCapacity: 45000,
    operatingHours: '24 Hours',
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pump_2',
    name: 'Hyderabad Gachibowli Station',
    ownerName: 'Rajesh Kumar',
    gst: '36BBBBB2222B2Z2',
    license: 'FL-2026-30948',
    address: 'IT Corridor Junction, Near Outer Ring Road',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500032',
    fuelTypes: ['Petrol', 'Diesel', 'Electric Charging'],
    tanksCount: 3,
    nozzlesCount: 8,
    dailyCapacity: 30000,
    operatingHours: '6:00 AM - 11:00 PM',
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pump_3',
    name: 'Vizag Port Terminal Junction',
    ownerName: 'Rajesh Kumar',
    gst: '37CCCCC3333C3Z3',
    license: 'FL-2026-78401',
    address: 'Industrial Port Road, Near Cargo Gate 4',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    pincode: '530001',
    fuelTypes: ['Diesel', 'High-Speed Diesel'],
    tanksCount: 6,
    nozzlesCount: 16,
    dailyCapacity: 80000,
    operatingHours: '24 Hours',
    status: 'under_review',
    createdAt: new Date().toISOString(),
  },
];

const KEYS = {
  PUMPS: 'fuelflux_pumps',
  SELECTED_PUMP_ID: 'fuelflux_selected_pump_id',
};

// Safe storage window helper
const getStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  return null;
};

export const usePumpStore = create<PumpState>((set, get) => ({
  pumps: [],
  selectedPump: null,
  isLoading: false,
  error: null,

  initializePumps: () => {
    const storage = getStorage();
    if (!storage) return;

    let storedPumps: Pump[] = [];
    const pumpsJson = storage.getItem(KEYS.PUMPS);
    
    if (pumpsJson) {
      storedPumps = JSON.parse(pumpsJson);
    } else {
      storedPumps = SEED_PUMPS;
      storage.setItem(KEYS.PUMPS, JSON.stringify(SEED_PUMPS));
    }

    const selectedId = storage.getItem(KEYS.SELECTED_PUMP_ID);
    let selected: Pump | null = null;
    
    if (selectedId) {
      selected = storedPumps.find((p) => p.id === selectedId) || null;
    }
    
    // Fallback to first approved pump if no active selection
    if (!selected) {
      selected = storedPumps.find((p) => p.status === 'approved') || storedPumps[0] || null;
      if (selected) {
        storage.setItem(KEYS.SELECTED_PUMP_ID, selected.id);
      }
    }

    set({
      pumps: storedPumps,
      selectedPump: selected,
    });
  },

  setSelectedPump: (pump) => {
    const storage = getStorage();
    if (storage) {
      storage.setItem(KEYS.SELECTED_PUMP_ID, pump.id);
    }
    set({ selectedPump: pump });
  },

  addPump: async (pumpData) => {
    set({ isLoading: true, error: null });
    
    // Simulate short network delay for adding a pump
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const storage = getStorage();
    if (!storage) {
      throw new Error('Local storage not available');
    }

    const currentPumps = get().pumps;
    const newPump: Pump = {
      ...pumpData,
      id: 'pump_' + Math.random().toString(36).substr(2, 9),
      status: 'pending', // Starts in pending_verification status
      createdAt: new Date().toISOString(),
    };

    const updatedPumps = [...currentPumps, newPump];
    storage.setItem(KEYS.PUMPS, JSON.stringify(updatedPumps));
    
    set({
      pumps: updatedPumps,
      isLoading: false,
    });

    return newPump;
  },

  updatePumpStatus: (id, status) => {
    const storage = getStorage();
    if (!storage) return;

    const currentPumps = get().pumps;
    const updated = currentPumps.map((p) => (p.id === id ? { ...p, status } : p));
    storage.setItem(KEYS.PUMPS, JSON.stringify(updated));

    const currentSelected = get().selectedPump;
    let newSelected = currentSelected;
    
    if (currentSelected && currentSelected.id === id) {
      newSelected = { ...currentSelected, status };
    }

    set({
      pumps: updated,
      selectedPump: newSelected,
    });
  },
}));
