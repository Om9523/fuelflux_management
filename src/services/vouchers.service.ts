import { useFleetStore, QRVoucher } from '@/stores/fleet.store';

export const vouchersService = {
  /**
   * Get all fuel vouchers issued by the active fleet
   */
  async getVouchers(): Promise<QRVoucher[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const { vouchers, activeFleetId } = useFleetStore.getState();
    return vouchers[activeFleetId] || [];
  },

  /**
   * Request a new digital fuel voucher (starts as pending)
   */
  async requestVoucher(voucherData: Omit<QRVoucher, 'id' | 'status' | 'qrCode' | 'createdDate'>): Promise<QRVoucher> {
    return useFleetStore.getState().requestVoucher(voucherData);
  },

  /**
   * Simulate redemption/usage of a voucher
   */
  async redeemVoucher(voucherId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    useFleetStore.getState().useVoucher(voucherId);
  }
};
