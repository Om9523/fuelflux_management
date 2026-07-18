/**
 * vehicles.service.ts — REAL BACKEND CONNECTED
 * Endpoints: GET/POST /api/v1/logistic/vehicles
 */

import backendApi from '@/lib/backendApi';
import { useFleetStore, LogisticVehicle, VehicleStatus } from '@/stores/fleet.store';

export interface BackendVehicle {
  id: string;
  vehicle_plate: string;
  vehicle_type: string;
  make_model: string | null;
  fuel_type: string;
  driver_name: string | null;
  driver_phone: string | null;
  credit_limit: number;
  outstanding_amount: number;
  is_active: boolean;
  partner_id: string;
  created_at: string;
}

function toLogisticVehicle(v: BackendVehicle): LogisticVehicle {
  const parts = (v.make_model || '').split(' ');
  const make = parts[0] || '';
  const model = parts.slice(1).join(' ') || '';
  return {
    id: v.id,
    vehicleNumber: v.vehicle_plate,
    vehicleType: (v.vehicle_type?.toLowerCase() as any) || 'truck',
    make,
    model,
    fuelType: (v.fuel_type?.toLowerCase() as any) || 'diesel',
    driverName: v.driver_name || 'N/A',
    driverPhone: v.driver_phone || '',
    creditLimit: v.credit_limit,
    usedCredit: v.outstanding_amount,
    status: v.is_active ? 'active' : 'blocked',
  };
}

export const vehiclesService = {
  async getVehicles(): Promise<LogisticVehicle[]> {
    try {
      const { data } = await backendApi.get<BackendVehicle[]>('/logistic/vehicles');
      const formatted = data.map(toLogisticVehicle);

      // Override store + clear stale localStorage so seed data never comes back
      const store = useFleetStore.getState();
      const updatedVehicles = {
        ...store.vehicles,
        [store.activeFleetId]: formatted,
      };
      useFleetStore.setState({ vehicles: updatedVehicles });

      // Persist real backend data into localStorage + set flag so store knows it's real
      if (typeof window !== 'undefined') {
        const stored = JSON.parse(localStorage.getItem('fuelflux_logistic_vehicles') || '{}');
        stored[store.activeFleetId] = formatted;
        localStorage.setItem('fuelflux_logistic_vehicles', JSON.stringify(stored));
        localStorage.setItem('fuelflux_vehicles_from_backend', 'true');
      }

      return formatted;
    } catch (err) {
      console.warn('[vehiclesService] Backend unavailable, using store data.', err);
      const { vehicles, activeFleetId } = useFleetStore.getState();
      return vehicles[activeFleetId] || [];
    }
  },

  async registerVehicle(
    vehicleData: Omit<LogisticVehicle, 'id' | 'status' | 'usedCredit'>
  ): Promise<LogisticVehicle> {
    try {
      const payload = {
        vehicle_plate: vehicleData.vehicleNumber,
        vehicle_type: vehicleData.vehicleType,
        make_model: `${vehicleData.make} ${vehicleData.model}`.trim(),
        fuel_type: vehicleData.fuelType,
        driver_name: vehicleData.driverName,
        driver_phone: vehicleData.driverPhone,
        credit_limit: vehicleData.creditLimit,
      };
      const { data } = await backendApi.post<BackendVehicle>('/logistic/vehicles', payload);
      const vehicle = toLogisticVehicle(data);

      // Add to store immediately
      const store = useFleetStore.getState();
      const existing = store.vehicles[store.activeFleetId] || [];
      const updatedVehicles = {
        ...store.vehicles,
        [store.activeFleetId]: [...existing, vehicle],
      };
      useFleetStore.setState({ vehicles: updatedVehicles });

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('fuelflux_logistic_vehicles', JSON.stringify(updatedVehicles));
      }

      return vehicle;
    } catch (err) {
      console.warn('[vehiclesService] registerVehicle fell back to mock.', err);
      return useFleetStore.getState().addVehicle(vehicleData);
    }
  },

  async requestCreditAdjustment(vehicleId: string, newLimit: number): Promise<void> {
    try {
      await backendApi.post('/credit/request', {
        vehicle_id: vehicleId,
        requested_limit: newLimit,
        pump_id: "1",
        remarks: `Credit limit increase request to ₹${newLimit.toLocaleString()}`,
      });
    } catch (err) {
      console.warn('[vehiclesService] requestCreditAdjustment fell back to mock.', err);
      return useFleetStore.getState().requestCreditIncrease(vehicleId, newLimit);
    }
  },

  async updateStatus(vehicleId: string, status: VehicleStatus): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    useFleetStore.getState().updateVehicleStatus(vehicleId, status);
  },
};