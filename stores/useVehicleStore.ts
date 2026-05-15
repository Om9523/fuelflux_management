import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Vehicle {
  id: string;
  number: string;
  type: '2-Wheeler' | '4-Wheeler' | 'Heavy Vehicle';
  brand: string;
  model: string;
  fuelType: 'Petrol' | 'Diesel' | 'CNG';
  isDefault: boolean;
}

interface VehicleState {
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  setDefaultVehicle: (id: string) => void;
}

export const useVehicleStore = create<VehicleState>()(
  persist(
    (set) => ({
      vehicles: [
        {
          id: 'veh-001',
          number: 'KA 01 AB 1234',
          type: '4-Wheeler',
          brand: 'Hyundai',
          model: 'Creta',
          fuelType: 'Petrol',
          isDefault: true,
        }
      ],
      addVehicle: (vehicle) => set((state) => {
        const newVehicle = { ...vehicle, id: `veh-${Date.now()}` };
        if (newVehicle.isDefault || state.vehicles.length === 0) {
          state.vehicles.forEach(v => v.isDefault = false);
          newVehicle.isDefault = true;
        }
        return { vehicles: [...state.vehicles, newVehicle] };
      }),
      updateVehicle: (id, updatedFields) => set((state) => ({
        vehicles: state.vehicles.map(v => v.id === id ? { ...v, ...updatedFields } : v)
      })),
      deleteVehicle: (id) => set((state) => ({
        vehicles: state.vehicles.filter(v => v.id !== id)
      })),
      setDefaultVehicle: (id) => set((state) => ({
        vehicles: state.vehicles.map(v => ({ ...v, isDefault: v.id === id }))
      })),
    }),
    {
      name: 'vehicle-storage',
    }
  )
);
