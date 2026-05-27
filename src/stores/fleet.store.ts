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
  quantity: number; // in liters
  amount: number; // in INR
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
  initializeFleetStore: () => void;
}

const SEED_FLEETS: FleetProfile[] = [
  {
    id: 'fleet_1',
    name: 'Apex Logistics Carriers Ltd.',
    gstin: '37AAPCA2031B1ZN',
    billingAddress: 'NH-65 Gateway, Near Toll Plaza, Benz Circle, Vijayawada',
    creditApproved: 425740,
    creditLimit: 1050000,
  },
  {
    id: 'fleet_2',
    name: 'GK Transport Cluster',
    gstin: '36BBBCB1092D2ZM',
    billingAddress: 'IT Corridor Junction, Gachibowli, Hyderabad, Telangana',
    creditApproved: 892300,
    creditLimit: 1200000,
  },
];

const SEED_VEHICLES: Record<string, LogisticVehicle[]> = {
  fleet_1: [
    { id: 'VEH-101', vehicleNumber: 'TS-08-EJ-9921', vehicleType: 'truck', make: 'Tata', model: 'Prima 4025.S', fuelType: 'diesel', driverName: 'Karthik Raju', driverPhone: '9876543220', creditLimit: 500000, usedCredit: 342850, status: 'active' },
    { id: 'VEH-102', vehicleNumber: 'TS-08-EJ-9922', vehicleType: 'truck', make: 'BharatBenz', model: '2823R', fuelType: 'diesel', driverName: 'Madan Lal', driverPhone: '9876543222', creditLimit: 200000, usedCredit: 82890, status: 'active' },
    { id: 'VEH-103', vehicleNumber: 'AP-09-CD-1234', vehicleType: 'car', make: 'Maruti Suzuki', model: 'Ertiga Tour', fuelType: 'cng', driverName: 'Rajesh Kumar', driverPhone: '9876543210', creditLimit: 50000, usedCredit: 0, status: 'active' },
    { id: 'VEH-104', vehicleNumber: 'MH-12-PQ-3049', vehicleType: 'lcv', make: 'Mahindra', model: 'Bolero Pik-up', fuelType: 'diesel', driverName: 'Suresh Patel', driverPhone: '9876543213', creditLimit: 300000, usedCredit: 0, status: 'pending_approval' },
  ],
  fleet_2: [
    { id: 'VEH-201', vehicleNumber: 'MH-14-GH-8902', vehicleType: 'truck', make: 'Ashok Leyland', model: 'Ecomet 1215', fuelType: 'diesel', driverName: 'Vikram Singh', driverPhone: '9876543211', creditLimit: 400000, usedCredit: 112300, status: 'active' },
    { id: 'VEH-202', vehicleNumber: 'KA-51-MM-8921', vehicleType: 'bus', make: 'Volvo', model: '9600 Multi-Axle', fuelType: 'diesel', driverName: 'Ananya Roy', driverPhone: '9876543230', creditLimit: 800000, usedCredit: 780000, status: 'active' },
  ],
};

const SEED_TRANSACTIONS: Record<string, FuelTransaction[]> = {
  fleet_1: [
    { id: 'TXN-501', vehicleId: 'VEH-101', vehicleNumber: 'TS-08-EJ-9921', pumpName: 'Vijayawada Highway Fuel Center', fuelType: 'diesel', quantity: 150, amount: 13500, driverName: 'Karthik Raju', paymentType: 'credit', date: '2026-05-26 14:30', balanceRemaining: 157150 },
    { id: 'TXN-502', vehicleId: 'VEH-102', vehicleNumber: 'TS-08-EJ-9922', pumpName: 'Vijayawada Highway Fuel Center', fuelType: 'diesel', quantity: 90, amount: 8100, driverName: 'Madan Lal', paymentType: 'credit', date: '2026-05-25 10:15', balanceRemaining: 117110 },
    { id: 'TXN-503', vehicleId: 'VEH-101', vehicleNumber: 'TS-08-EJ-9921', pumpName: 'Vijayawada Highway Fuel Center', fuelType: 'diesel', quantity: 180, amount: 16200, driverName: 'Karthik Raju', paymentType: 'credit', date: '2026-05-24 18:40', balanceRemaining: 170650 },
  ],
  fleet_2: [
    { id: 'TXN-601', vehicleId: 'VEH-202', vehicleNumber: 'KA-51-MM-8921', pumpName: 'Hyderabad Gachibowli Station', fuelType: 'diesel', quantity: 240, amount: 21600, driverName: 'Ananya Roy', paymentType: 'credit', date: '2026-05-27 09:20', balanceRemaining: 20000 },
    { id: 'TXN-602', vehicleId: 'VEH-201', vehicleNumber: 'MH-14-GH-8902', pumpName: 'Hyderabad Gachibowli Station', fuelType: 'diesel', quantity: 110, amount: 9900, driverName: 'Vikram Singh', paymentType: 'credit', date: '2026-05-26 11:45', balanceRemaining: 287700 },
  ],
};

const SEED_VOUCHERS: Record<string, QRVoucher[]> = {
  fleet_1: [
    { id: 'VCH-101', vehicleId: 'VEH-101', vehicleNumber: 'TS-08-EJ-9921', amount: 8000, fuelType: 'diesel', status: 'approved', expiryDate: '2026-05-30', createdDate: '2026-05-26', qrCode: 'QR_APX_VCH_101_8000_DSL', notes: 'Consignment shipment to Vizag Port.' },
    { id: 'VCH-102', vehicleId: 'VEH-102', vehicleNumber: 'TS-08-EJ-9922', amount: 5000, fuelType: 'diesel', status: 'used', expiryDate: '2026-05-25', createdDate: '2026-05-23', qrCode: 'QR_APX_VCH_102_5000_DSL', notes: 'Refueling backup before toll transit.' },
    { id: 'VCH-103', vehicleId: 'VEH-103', vehicleNumber: 'AP-09-CD-1234', amount: 1500, fuelType: 'cng', status: 'pending', expiryDate: '2026-05-29', createdDate: '2026-05-27', qrCode: 'QR_APX_VCH_103_1500_CNG', notes: 'Local executive inspection transit.' },
  ],
  fleet_2: [
    { id: 'VCH-201', vehicleId: 'VEH-201', vehicleNumber: 'MH-14-GH-8902', amount: 12000, fuelType: 'diesel', status: 'approved', expiryDate: '2026-05-31', createdDate: '2026-05-27', qrCode: 'QR_GK_VCH_201_12000_DSL', notes: 'Fleet cargo haul Hyderabad-Bangalore.' },
  ],
};

const KEYS = {
  FLEETS: 'fuelflux_logistic_fleets',
  ACTIVE_FLEET_ID: 'fuelflux_logistic_active_fleet_id',
  VEHICLES: 'fuelflux_logistic_vehicles',
  TRANSACTIONS: 'fuelflux_logistic_transactions',
  VOUCHERS: 'fuelflux_logistic_vouchers',
};

// Safe storage window check
const getStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  return null;
};

export const useFleetStore = create<FleetState>((set, get) => ({
  fleets: [],
  activeFleetId: '',
  vehicles: {},
  transactions: {},
  vouchers: {},
  isLoading: false,
  error: null,

  initializeFleetStore: () => {
    const storage = getStorage();
    if (!storage) return;

    // Load active fleets list
    let storedFleets: FleetProfile[] = [];
    const fleetsJson = storage.getItem(KEYS.FLEETS);
    if (fleetsJson) {
      storedFleets = JSON.parse(fleetsJson);
    } else {
      storedFleets = SEED_FLEETS;
      storage.setItem(KEYS.FLEETS, JSON.stringify(SEED_FLEETS));
    }

    // Load active selected fleet
    let activeId = storage.getItem(KEYS.ACTIVE_FLEET_ID);
    if (!activeId || !storedFleets.find(f => f.id === activeId)) {
      activeId = storedFleets[0]?.id || 'fleet_1';
      storage.setItem(KEYS.ACTIVE_FLEET_ID, activeId);
    }

    // Load vehicles
    let storedVehicles: Record<string, LogisticVehicle[]> = {};
    const vehiclesJson = storage.getItem(KEYS.VEHICLES);
    if (vehiclesJson) {
      storedVehicles = JSON.parse(vehiclesJson);
    } else {
      storedVehicles = SEED_VEHICLES;
      storage.setItem(KEYS.VEHICLES, JSON.stringify(SEED_VEHICLES));
    }

    // Load transactions
    let storedTxns: Record<string, FuelTransaction[]> = {};
    const txnsJson = storage.getItem(KEYS.TRANSACTIONS);
    if (txnsJson) {
      storedTxns = JSON.parse(txnsJson);
    } else {
      storedTxns = SEED_TRANSACTIONS;
      storage.setItem(KEYS.TRANSACTIONS, JSON.stringify(SEED_TRANSACTIONS));
    }

    // Load vouchers
    let storedVouchers: Record<string, QRVoucher[]> = {};
    const vouchersJson = storage.getItem(KEYS.VOUCHERS);
    if (vouchersJson) {
      storedVouchers = JSON.parse(vouchersJson);
    } else {
      storedVouchers = SEED_VOUCHERS;
      storage.setItem(KEYS.VOUCHERS, JSON.stringify(SEED_VOUCHERS));
    }

    set({
      fleets: storedFleets,
      activeFleetId: activeId,
      vehicles: storedVehicles,
      transactions: storedTxns,
      vouchers: storedVouchers,
    });
  },

  setActiveFleetId: (id) => {
    const storage = getStorage();
    if (storage) {
      storage.setItem(KEYS.ACTIVE_FLEET_ID, id);
    }
    set({ activeFleetId: id });
  },

  addVehicle: async (vehicleData) => {
    set({ isLoading: true, error: null });
    
    // Short latency for dynamic loading animation
    await new Promise((resolve) => setTimeout(resolve, 800));

    const storage = getStorage();
    if (!storage) {
      throw new Error('Local storage not available');
    }

    const currentVehicles = get().vehicles;
    const activeId = get().activeFleetId;
    const fleetVehicles = currentVehicles[activeId] || [];

    const newVehicle: LogisticVehicle = {
      ...vehicleData,
      id: 'VEH-' + Math.floor(300 + Math.random() * 900),
      status: 'pending_approval', // Enters workflow pending owner credit approval
      usedCredit: 0,
    };

    const updated = {
      ...currentVehicles,
      [activeId]: [...fleetVehicles, newVehicle],
    };

    storage.setItem(KEYS.VEHICLES, JSON.stringify(updated));
    set({
      vehicles: updated,
      isLoading: false,
    });

    return newVehicle;
  },

  updateVehicleStatus: (vehicleId, status) => {
    const storage = getStorage();
    if (!storage) return;

    const currentVehicles = get().vehicles;
    const activeId = get().activeFleetId;
    const fleetVehicles = currentVehicles[activeId] || [];

    const updatedFleet = fleetVehicles.map((v) =>
      v.id === vehicleId ? { ...v, status } : v
    );

    const updated = {
      ...currentVehicles,
      [activeId]: updatedFleet,
    };

    storage.setItem(KEYS.VEHICLES, JSON.stringify(updated));
    set({ vehicles: updated });
  },

  requestCreditIncrease: async (vehicleId, limit) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 600));

    const storage = getStorage();
    if (!storage) return;

    const currentVehicles = get().vehicles;
    const activeId = get().activeFleetId;
    const fleetVehicles = currentVehicles[activeId] || [];

    // Requests are sent to mock DB, immediately toggled for demo convenience to pending/approved
    const updatedFleet = fleetVehicles.map((v) =>
      v.id === vehicleId ? { ...v, creditLimit: limit } : v
    );

    const updated = {
      ...currentVehicles,
      [activeId]: updatedFleet,
    };

    storage.setItem(KEYS.VEHICLES, JSON.stringify(updated));
    set({
      vehicles: updated,
      isLoading: false,
    });
  },

  requestVoucher: async (voucherData) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 800));

    const storage = getStorage();
    if (!storage) {
      throw new Error('Local storage not available');
    }

    const currentVouchers = get().vouchers;
    const activeId = get().activeFleetId;
    const fleetVouchers = currentVouchers[activeId] || [];

    const newVoucher: QRVoucher = {
      ...voucherData,
      id: 'VCH-' + Math.floor(400 + Math.random() * 900),
      status: 'pending', // Starts pending owner verification approval
      createdDate: new Date().toISOString().split('T')[0],
      qrCode: `QR_DSL_VCH_${Math.floor(1000 + Math.random() * 9000)}_${voucherData.amount}`,
    };

    const updated = {
      ...currentVouchers,
      [activeId]: [...fleetVouchers, newVoucher],
    };

    storage.setItem(KEYS.VOUCHERS, JSON.stringify(updated));
    set({
      vouchers: updated,
      isLoading: false,
    });

    return newVoucher;
  },

  useVoucher: (voucherId) => {
    const storage = getStorage();
    if (!storage) return;

    const currentVouchers = get().vouchers;
    const activeId = get().activeFleetId;
    const fleetVouchers = currentVouchers[activeId] || [];

    const updatedFleet = fleetVouchers.map((v) =>
      v.id === voucherId ? { ...v, status: 'used' as const } : v
    );

    const updated = {
      ...currentVouchers,
      [activeId]: updatedFleet,
    };

    storage.setItem(KEYS.VOUCHERS, JSON.stringify(updated));
    set({ vouchers: updated });
  },
}));
