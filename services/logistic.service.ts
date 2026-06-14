import { useFleetStore, FleetProfile } from '@/stores/fleet.store';

export const logisticService = {
  /**
   * Get the active fleet profile (company details)
   */
  async getProfile(): Promise<FleetProfile | null> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const { fleets, activeFleetId } = useFleetStore.getState();
    return fleets.find((f) => f.id === activeFleetId) || null;
  },

  /**
   * Update active fleet configuration parameters
   */
  async updateProfile(updates: Partial<Omit<FleetProfile, 'id' | 'creditApproved' | 'creditLimit'>>): Promise<FleetProfile> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const store = useFleetStore.getState();
    const activeId = store.activeFleetId;
    
    let updatedFleet: FleetProfile | null = null;
    const updatedFleets = store.fleets.map((f) => {
      if (f.id === activeId) {
        updatedFleet = { ...f, ...updates };
        return updatedFleet;
      }
      return f;
    });

    if (!updatedFleet) {
      throw new Error('Active fleet profile not found');
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('fuelflux_logistic_fleets', JSON.stringify(updatedFleets));
    }

    useFleetStore.setState({ fleets: updatedFleets });
    return updatedFleet;
  }
};
