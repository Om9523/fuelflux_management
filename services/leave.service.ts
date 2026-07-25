/**
 * leave.service.ts — Real API, replaces mock-based service
 */
import backendApi from '@/lib/backendApi';
import { LeaveRecord, LeaveApplyPayload } from '@/types/employee';

export const leaveService = {
  async getLeaveHistory(): Promise<LeaveRecord[]> {
    const res = await backendApi.get('/employee/leaves');
    return res.data.data ?? [];
  },

  async applyLeave(payload: LeaveApplyPayload): Promise<{ id: string }> {
    const res = await backendApi.post('/employee/leaves', payload);
    return res.data;
  },
};