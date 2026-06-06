import { create } from 'zustand';

export interface PortfolioProfile {
  id: string;
  name: string;
  investedAmount: number;
  currentValue: number;
  roi: number; // in percentage, e.g. 14.8
  activePumps: number;
  monthlyGrowth: number; // in percentage, e.g. 4.6
  activeFleets: number;
  outstandingCredit: number;
  netProfitMargin: number; // in percentage, e.g. 18.2
}

export interface HistoricalRevenue {
  month: string;
  revenue: number;
  operatingCost: number;
  profit: number;
  gstPaid: number;
}

export interface ComparativePump {
  id: string;
  name: string;
  location: string;
  revenue: number;
  growth: number;
  fuelSold: number; // in liters
  activeCustomers: number;
  efficiency: number; // score 1-100
  riskScore: 'low' | 'medium' | 'high';
}

export interface FleetBI {
  name: string;
  activeVehicles: number;
  monthlySpend: number;
  voucherUsage: number;
  creditUtilization: number; // in %
  riskRating: 'low' | 'medium' | 'high';
}

export interface DemandForecast {
  month: string;
  actual?: number;
  predicted: number;
  upperBound: number;
  lowerBound: number;
}

export interface ExecutiveReport {
  id: string;
  name: string;
  category: 'financial' | 'portfolio' | 'revenue' | 'growth' | 'fleet' | 'risk';
  createdDate: string;
  fileSize: string;
  status: 'available' | 'generating';
}

interface InvestorState {
  portfolios: PortfolioProfile[];
  activePortfolioId: string;
  revenues: Record<string, HistoricalRevenue[]>;
  pumps: Record<string, ComparativePump[]>;
  fleets: Record<string, FleetBI[]>;
  forecasts: Record<string, DemandForecast[]>;
  reports: ExecutiveReport[];
  isLoading: boolean;
  error: string | null;

  setActivePortfolioId: (id: string) => void;
  initializeInvestorStore: () => void;
  triggerGenerateReport: (category: ExecutiveReport['category'], name: string) => Promise<ExecutiveReport>;
}

const SEED_PORTFOLIOS: PortfolioProfile[] = [
  {
    id: 'portfolio_1',
    name: 'Apex Energy Group Portfolio',
    investedAmount: 24500000,
    currentValue: 28126000,
    roi: 14.8,
    activePumps: 8,
    monthlyGrowth: 4.6,
    activeFleets: 24,
    outstandingCredit: 1450000,
    netProfitMargin: 18.2,
  },
  {
    id: 'portfolio_2',
    name: 'GK Capital Petrol Cluster',
    investedAmount: 18200000,
    currentValue: 20475000,
    roi: 12.5,
    activePumps: 5,
    monthlyGrowth: 3.8,
    activeFleets: 16,
    outstandingCredit: 890000,
    netProfitMargin: 15.8,
  },
];

const SEED_REVENUES: Record<string, HistoricalRevenue[]> = {
  portfolio_1: [
    { month: 'Dec 2025', revenue: 4200000, operatingCost: 3436000, profit: 764000, gstPaid: 756000 },
    { month: 'Jan 2026', revenue: 4500000, operatingCost: 3681000, profit: 819000, gstPaid: 810000 },
    { month: 'Feb 2026', revenue: 4300000, operatingCost: 3517000, profit: 783000, gstPaid: 774000 },
    { month: 'Mar 2026', revenue: 4800000, operatingCost: 3926000, profit: 874000, gstPaid: 864000 },
    { month: 'Apr 2026', revenue: 5200000, operatingCost: 4253000, profit: 947000, gstPaid: 936000 },
    { month: 'May 2026', revenue: 5600000, operatingCost: 4580000, profit: 1020000, gstPaid: 1008000 },
  ],
  portfolio_2: [
    { month: 'Dec 2025', revenue: 3100000, operatingCost: 2610000, profit: 490000, gstPaid: 558000 },
    { month: 'Jan 2026', revenue: 3400000, operatingCost: 2862000, profit: 538000, gstPaid: 612000 },
    { month: 'Feb 2026', revenue: 3200000, operatingCost: 2694000, profit: 506000, gstPaid: 576000 },
    { month: 'Mar 2026', revenue: 3600000, operatingCost: 3031000, profit: 569000, gstPaid: 648000 },
    { month: 'Apr 2026', revenue: 3800000, operatingCost: 3199500, profit: 600500, gstPaid: 684000 },
    { month: 'May 2026', revenue: 4100000, operatingCost: 3452200, profit: 647800, gstPaid: 738000 },
  ],
};

const SEED_PUMPS: Record<string, ComparativePump[]> = {
  portfolio_1: [
    { id: 'PMP-101', name: 'Vijayawada Highway Fuel Center', location: 'Benz Circle, Vijayawada', revenue: 1850000, growth: 5.2, fuelSold: 48000, activeCustomers: 1240, efficiency: 94, riskScore: 'low' },
    { id: 'PMP-102', name: 'Hyderabad Gachibowli Station', location: 'Gachibowli, Hyderabad', revenue: 1420000, growth: 4.8, fuelSold: 39000, activeCustomers: 980, efficiency: 91, riskScore: 'low' },
    { id: 'PMP-103', name: 'Vizag Port Terminal Junction', location: 'Port Area, Vizag', revenue: 1120000, growth: 3.5, fuelSold: 32000, activeCustomers: 650, efficiency: 86, riskScore: 'medium' },
    { id: 'PMP-104', name: 'Guntur Bypass Plaza', location: 'NH-16, Guntur', revenue: 1210000, growth: -1.2, fuelSold: 35000, activeCustomers: 720, efficiency: 79, riskScore: 'medium' },
  ],
  portfolio_2: [
    { id: 'PMP-201', name: 'Secunderabad Cantt Pump', location: 'Diamond Point, Secunderabad', revenue: 1540000, growth: 4.1, fuelSold: 41000, activeCustomers: 1050, efficiency: 89, riskScore: 'low' },
    { id: 'PMP-202', name: 'Begumpet Airport Terminal', location: 'Begumpet, Hyderabad', revenue: 1290000, growth: 3.2, fuelSold: 36000, activeCustomers: 890, efficiency: 83, riskScore: 'low' },
    { id: 'PMP-203', name: 'Khammam Tollways Station', location: 'Wyra Road, Khammam', revenue: 980000, growth: -2.4, fuelSold: 28000, activeCustomers: 510, efficiency: 72, riskScore: 'high' },
  ],
};

const SEED_FLEETS: Record<string, FleetBI[]> = {
  portfolio_1: [
    { name: 'Apex Logistics Carriers Ltd.', activeVehicles: 18, monthlySpend: 420000, voucherUsage: 88, creditUtilization: 68.5, riskRating: 'low' },
    { name: 'GK Transport Cluster', activeVehicles: 12, monthlySpend: 310000, voucherUsage: 72, creditUtilization: 92.4, riskRating: 'medium' },
    { name: 'Vijayawada Cargo Haulers', activeVehicles: 9, monthlySpend: 185000, voucherUsage: 45, creditUtilization: 42.1, riskRating: 'low' },
    { name: 'Deccan Cargo Movers', activeVehicles: 6, monthlySpend: 120000, voucherUsage: 30, creditUtilization: 78.0, riskRating: 'high' },
  ],
  portfolio_2: [
    { name: 'Secunderabad Logistics Corp', activeVehicles: 14, monthlySpend: 360000, voucherUsage: 80, creditUtilization: 72.8, riskRating: 'low' },
    { name: 'Telangana Express Fleet', activeVehicles: 8, monthlySpend: 195000, voucherUsage: 48, creditUtilization: 84.6, riskRating: 'medium' },
  ],
};

const SEED_FORECASTS: Record<string, DemandForecast[]> = {
  portfolio_1: [
    { month: 'Jan 2026', actual: 4500000, predicted: 4400000, upperBound: 4650000, lowerBound: 4150000 },
    { month: 'Feb 2026', actual: 4300000, predicted: 4350000, upperBound: 4580000, lowerBound: 4120000 },
    { month: 'Mar 2026', actual: 4800000, predicted: 4700000, upperBound: 4950000, lowerBound: 4450000 },
    { month: 'Apr 2026', actual: 5200000, predicted: 5100000, upperBound: 5380000, lowerBound: 4820000 },
    { month: 'May 2026', actual: 5600000, predicted: 5500000, upperBound: 5780000, lowerBound: 5220000 },
    { month: 'Jun 2026', predicted: 5950000, upperBound: 6280000, lowerBound: 5620000 },
    { month: 'Jul 2026', predicted: 6200000, upperBound: 6560000, lowerBound: 5840000 },
    { month: 'Aug 2026', predicted: 6450000, upperBound: 6840000, lowerBound: 6060000 },
  ],
  portfolio_2: [
    { month: 'Jan 2026', actual: 3400000, predicted: 3300000, upperBound: 3500000, lowerBound: 3100000 },
    { month: 'Feb 2026', actual: 3200000, predicted: 3250000, upperBound: 3420000, lowerBound: 3080000 },
    { month: 'Mar 2026', actual: 3600000, predicted: 3550000, upperBound: 3750000, lowerBound: 3350000 },
    { month: 'Apr 2026', actual: 3800000, predicted: 3850000, upperBound: 4050000, lowerBound: 3650000 },
    { month: 'May 2026', actual: 4100000, predicted: 4050000, upperBound: 4280000, lowerBound: 3820000 },
    { month: 'Jun 2026', predicted: 4350000, upperBound: 4620000, lowerBound: 4080000 },
    { month: 'Jul 2026', predicted: 4500000, upperBound: 4780000, lowerBound: 4220000 },
    { month: 'Aug 2026', predicted: 4750000, upperBound: 5060000, lowerBound: 4440000 },
  ],
};

const SEED_REPORTS: ExecutiveReport[] = [
  { id: 'REP-701', name: 'Q1 Corporate Settlement Margin Audit', category: 'financial', createdDate: '2026-05-15', fileSize: '2.4 MB', status: 'available' },
  { id: 'REP-702', name: 'APEX Group Monthly Spend Performance Summary', category: 'portfolio', createdDate: '2026-05-20', fileSize: '4.8 MB', status: 'available' },
  { id: 'REP-703', name: 'Dispenser Fuel Discharges Calibration and Leak Audit', category: 'risk', createdDate: '2026-05-24', fileSize: '1.2 MB', status: 'available' },
];

const KEYS = {
  PORTFOLIOS: 'fuelflux_investor_portfolios',
  ACTIVE_PORTFOLIO_ID: 'fuelflux_investor_active_portfolio_id',
  REPORTS: 'fuelflux_investor_reports',
};

const getStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  return null;
};

export const useInvestorStore = create<InvestorState>((set, get) => ({
  portfolios: [],
  activePortfolioId: '',
  revenues: SEED_REVENUES,
  pumps: SEED_PUMPS,
  fleets: SEED_FLEETS,
  forecasts: SEED_FORECASTS,
  reports: [],
  isLoading: false,
  error: null,

  setActivePortfolioId: (id) => {
    const storage = getStorage();
    if (storage) {
      storage.setItem(KEYS.ACTIVE_PORTFOLIO_ID, id);
    }
    set({ activePortfolioId: id });
  },

  initializeInvestorStore: () => {
    const storage = getStorage();
    if (!storage) return;

    // Load portfolios
    let storedPortfolios: PortfolioProfile[] = [];
    const portsJson = storage.getItem(KEYS.PORTFOLIOS);
    if (portsJson) {
      storedPortfolios = JSON.parse(portsJson);
    } else {
      storedPortfolios = SEED_PORTFOLIOS;
      storage.setItem(KEYS.PORTFOLIOS, JSON.stringify(SEED_PORTFOLIOS));
    }

    // Load active portfolio
    let activeId = storage.getItem(KEYS.ACTIVE_PORTFOLIO_ID);
    if (!activeId || !storedPortfolios.find(p => p.id === activeId)) {
      activeId = storedPortfolios[0]?.id || 'portfolio_1';
      storage.setItem(KEYS.ACTIVE_PORTFOLIO_ID, activeId);
    }

    // Load reports
    let storedReports: ExecutiveReport[] = [];
    const repsJson = storage.getItem(KEYS.REPORTS);
    if (repsJson) {
      storedReports = JSON.parse(repsJson);
    } else {
      storedReports = SEED_REPORTS;
      storage.setItem(KEYS.REPORTS, JSON.stringify(SEED_REPORTS));
    }

    set({
      portfolios: storedPortfolios,
      activePortfolioId: activeId,
      reports: storedReports,
    });
  },

  triggerGenerateReport: async (category, name) => {
    set({ isLoading: true });
    
    // Simulate generation latency (reloading nodes, gathering audits)
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const currentReports = get().reports;
    const newReport: ExecutiveReport = {
      id: 'REP-' + Math.floor(800 + Math.random() * 200),
      name,
      category,
      createdDate: new Date().toISOString().split('T')[0],
      fileSize: (1.0 + Math.random() * 5).toFixed(1) + ' MB',
      status: 'available',
    };

    const updated = [newReport, ...currentReports];
    const storage = getStorage();
    if (storage) {
      storage.setItem(KEYS.REPORTS, JSON.stringify(updated));
    }

    set({
      reports: updated,
      isLoading: false,
    });

    return newReport;
  },
}));
