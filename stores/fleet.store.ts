import { create } from 'zustand';

export type VehicleType = 'car' | 'truck' | 'bus' | 'bike' | 'lcv';
export type FuelType = 'petrol' | 'diesel' | 'cng';
export type VehicleStatus = 'active' | 'blocked' | 'pending_approval';
export type VoucherStatus = 'pending' | 'approved' | 'used' | 'expired' | 'rejected';

export interface LogisticVehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  make: string;
  model: string;
  fuelType: FuelType;
  driverName: string;
  driverPhone: string;
  creditLimit: number;
  usedCredit: number;
  status: VehicleStatus;
}

export interface FuelTransaction {
  id: string;
  vehicleId: string;
  vehicleNumber: string;
  pumpName: string;
  fuelType: FuelType;
  quantity: number;
  amount: number;
  driverName: string;
  paymentType: 'credit' | 'wallet';
  date: string;
  balanceRemaining: number;
}

export interface QRVoucher {
  id: string;
  vehicleId: string;
  vehicleNumber: string;
  amount: number;
  fuelType: FuelType;
  status: VoucherStatus;
  expiryDate: string;
  createdDate: string;
  qrCode: string;
  notes?: string;
}

export interface FleetProfile {
  id: string;
  name: string;
  gstin: string;
  billingAddress: string;
  creditApproved: number;
  creditLimit: number;
}

interface FleetState {
  fleets: FleetProfile[];
  activeFleetId: string;
  vehicles: Record<string, LogisticVehicle[]>;
  transactions: Record<string, FuelTransaction[]>;
  vouchers: Record<string, QRVoucher[]>;
  isLoading: boolean;
  error: string | null;

  setActiveFleetId: (id: string) => void;
  addVehicle: (vehicle: Omit<LogisticVehicle, 'id' | 'status' | 'usedCredit'>) => Promise<LogisticVehicle>;
  updateVehicleStatus: (vehicleId: string, status: VehicleStatus) => void;
  requestCreditIncrease: (vehicleId: string, limit: number) => Promise<void>;
  requestVoucher: (voucher: Omit<QRVoucher, 'id' | 'status' | 'qrCode' | 'createdDate'>) => Promise<QRVoucher>;
  useVoucher: (voucherId: string) => void;
  setVehicles: (vehicles: LogisticVehicle[]) => void;
  setVouchers: (vouchers: QRVoucher[]) => void;
  initializeFleetStore: () => void;
}

// Stable fleet_id tied to the logged-in user (will be overridden by backend userId)
const DEFAULT_FLEET_ID = 'fleet_current';

const KEYS = {
  ACTIVE_FLEET_ID: 'fuelflux_logistic_active_fleet_id',
};

const getStorage = () => {
  if (typeof window !== 'undefined') return window.localStorage;
  return null;
};

export const useFleetStore = create<FleetState>((set, get) => ({
  fleets: [],
  activeFleetId: DEFAULT_FLEET_ID,
  vehicles: {},
  transactions: {},
  vouchers: {},
  isLoading: false,
  error: null,

  initializeFleetStore: () => {
    const storage = getStorage();
    if (!storage) return;

    // Active fleet id from storage or default
    let activeId = storage.getItem(KEYS.ACTIVE_FLEET_ID);
    if (!activeId) {
      activeId = DEFAULT_FLEET_ID;
      storage.setItem(KEYS.ACTIVE_FLEET_ID, activeId);
    }

    // Start with clean empty state — backend fetches will populate everything
    set({
      activeFleetId: activeId,
      fleets: [],
      vehicles: {},
      transactions: {},
      vouchers: {},
    });
  },

  setActiveFleetId: (id) => {
    const storage = getStorage();
    if (storage) storage.setItem(KEYS.ACTIVE_FLEET_ID, id);
    set({ activeFleetId: id });
  },

  // Set vehicles from backend response
  setVehicles: (vehicles) => {
    const activeId = get().activeFleetId;
    set((state) => ({
      vehicles: { ...state.vehicles, [activeId]: vehicles },
    }));
  },

  // Set vouchers from backend response
  setVouchers: (vouchers) => {
    const activeId = get().activeFleetId;
    set((state) => ({
      vouchers: { ...state.vouchers, [activeId]: vouchers },
    }));
  },

  addVehicle: async (vehicleData) => {
    set({ isLoading: true, error: null });
    await new Promise((resolve) => setTimeout(resolve, 800));

    const currentVehicles = get().vehicles;
    const activeId = get().activeFleetId;
    const fleetVehicles = currentVehicles[activeId] || [];

    const newVehicle: LogisticVehicle = {
      ...vehicleData,
      id: 'VEH-' + Math.floor(300 + Math.random() * 900),
      status: 'pending_approval',
      usedCredit: 0,
    };

    const updated = {
      ...currentVehicles,
      [activeId]: [...fleetVehicles, newVehicle],
    };

    set({ vehicles: updated, isLoading: false });
    return newVehicle;
  },

  updateVehicleStatus: (vehicleId, status) => {
    const currentVehicles = get().vehicles;
    const activeId = get().activeFleetId;
    const fleetVehicles = currentVehicles[activeId] || [];

    const updatedFleet = fleetVehicles.map((v) =>
      v.id === vehicleId ? { ...v, status } : v
    );
    const updated = { ...currentVehicles, [activeId]: updatedFleet };
    set({ vehicles: updated });
  },

  requestCreditIncrease: async (vehicleId, limit) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 600));

    const currentVehicles = get().vehicles;
    const activeId = get().activeFleetId;
    const fleetVehicles = currentVehicles[activeId] || [];

    const updatedFleet = fleetVehicles.map((v) =>
      v.id === vehicleId ? { ...v, creditLimit: limit } : v
    );
    const updated = { ...currentVehicles, [activeId]: updatedFleet };
    set({ vehicles: updated, isLoading: false });
  },

  requestVoucher: async (voucherData) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 800));

    const currentVouchers = get().vouchers;
    const activeId = get().activeFleetId;
    const fleetVouchers = currentVouchers[activeId] || [];

    const newVoucher: QRVoucher = {
      ...voucherData,
      id: 'VCH-' + Math.floor(400 + Math.random() * 900),
      status: 'pending',
      createdDate: new Date().toISOString().split('T')[0],
      qrCode: `QR_DSL_VCH_${Math.floor(1000 + Math.random() * 9000)}_${voucherData.amount}`,
    };

    const updated = {
      ...currentVouchers,
      [activeId]: [...fleetVouchers, newVoucher],
    };

    set({ vouchers: updated, isLoading: false });
    return newVoucher;
  },

  useVoucher: (voucherId) => {
    const currentVouchers = get().vouchers;
    const activeId = get().activeFleetId;
    const fleetVouchers = currentVouchers[activeId] || [];

    const updatedFleet = fleetVouchers.map((v) =>
      v.id === voucherId ? { ...v, status: 'used' as const } : v
    );
    const updated = { ...currentVouchers, [activeId]: updatedFleet };
    set({ vouchers: updated });
  },
}));