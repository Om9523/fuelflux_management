import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FuelLog {
  id: string;
  bookingId: string;
  stationName: string;
  vehicleNumber: string;
  fuelType: string;
  quantity: number;
  amount: number;
  date: string;
  status: 'Completed' | 'Failed' | 'Refunded';
}

interface FuelLogState {
  logs: FuelLog[];
  addLog: (log: Omit<FuelLog, 'id'>) => void;
  getLogsByVehicle: (vehicleNumber: string) => FuelLog[];
}

export const useFuelLogStore = create<FuelLogState>()(
  persist(
    (set, get) => ({
      logs: [
        {
          id: 'log-001',
          bookingId: 'B-001',
          stationName: 'Shell, Koramangala',
          vehicleNumber: 'KA 01 AB 1234',
          fuelType: 'Petrol',
          quantity: 10,
          amount: 1050,
          date: new Date(Date.now() - 86400000 * 2).toISOString(),
          status: 'Completed'
        },
        {
          id: 'log-002',
          bookingId: 'B-002',
          stationName: 'HP Petrol Pump, Indiranagar',
          vehicleNumber: 'KA 01 AB 1234',
          fuelType: 'Petrol',
          quantity: 15,
          amount: 1575,
          date: new Date(Date.now() - 86400000 * 5).toISOString(),
          status: 'Completed'
        }
      ],
      addLog: (log) => set((state) => ({
        logs: [{ ...log, id: `log-${Date.now()}` }, ...state.logs]
      })),
      getLogsByVehicle: (vehicleNumber) => get().logs.filter(l => l.vehicleNumber === vehicleNumber),
    }),
    {
      name: 'fuel-log-storage',
    }
  )
);
