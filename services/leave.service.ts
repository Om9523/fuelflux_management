import { api } from '@/lib/api';
import { LeaveRecord } from '@/lib/mock-db';

export const leaveService = {
  async getLeaveHistory(): Promise<LeaveRecord[]> {
    const res = await api.get('/employee/leave');
    return res.data.records;
  },

  async applyForLeave(data: {
    leaveType: LeaveRecord['leaveType'];
    startDate: string;
    endDate: string;
    reason: string;
  }): Promise<LeaveRecord> {
    const res = await api.post('/employee/leave/apply', data);
    return res.data.record;
  },
};
