import { api } from '@/lib/api';
import { ShiftDetails } from '@/lib/mock-db';

export const shiftService = {
  async getShiftDetails(): Promise<ShiftDetails> {
    const res = await api.get('/employee/shifts');
    return res.data.shift;
  },
};
