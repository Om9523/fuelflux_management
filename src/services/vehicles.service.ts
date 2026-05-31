import { useFleetStore, LogisticVehicle, VehicleStatus } from '@/stores/fleet.store';

export const vehiclesService = {
  /**
   * Get all vehicles for the active fleet
   */
  async getVehicles(): Promise<LogisticVehicle[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const { vehicles, activeFleetId } = useFleetStore.getState();
    return vehicles[activeFleetId] || [];
  },

  /**
   * Register a new vehicle to the active fleet (enters pending approval state)
   */
  async registerVehicle(vehicleData: Omit<LogisticVehicle, 'id' | 'status' | 'usedCredit'>): Promise<LogisticVehicle> {
    return useFleetStore.getState().addVehicle(vehicleData);
  },

  /**
   * Request a credit limit adjustment for a vehicle
   */
  async requestCreditAdjustment(vehicleId: string, newLimit: number): Promise<void> {
    return useFleetStore.getState().requestCreditIncrease(vehicleId, newLimit);
  },

  /**
   * Admin/Owner helper to approve or block a vehicle
   */
  async updateStatus(vehicleId: string, status: VehicleStatus): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    useFleetStore.getState().updateVehicleStatus(vehicleId, status);
  }
};
