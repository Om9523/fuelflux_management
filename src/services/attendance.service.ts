import { api } from '@/lib/api';
import { AttendanceRecord } from '@/lib/mock-db';

export const attendanceService = {
  async getAttendanceLogs(): Promise<AttendanceRecord[]> {
    const res = await api.get('/employee/attendance');
    return res.data.records;
  },

  async checkIn(): Promise<AttendanceRecord> {
    const res = await api.post('/employee/attendance/check-in');
    return res.data.record;
  },

  async checkOut(): Promise<AttendanceRecord> {
    const res = await api.post('/employee/attendance/check-out');
    return res.data.record;
  },
};
