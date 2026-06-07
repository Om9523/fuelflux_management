import { create } from 'zustand';
import { AttendanceRecord } from '@/lib/mock-db';
import { attendanceService } from '@/services/attendance.service';

interface AttendanceState {
  records: AttendanceRecord[];
  todayRecord: AttendanceRecord | null;
  isLoading: boolean;
  error: string | null;

  fetchAttendance: () => Promise<void>;
  checkIn: () => Promise<void>;
  checkOut: () => Promise<void>;
  clearStore: () => void;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  records: [],
  todayRecord: null,
  isLoading: false,
  error: null,

  fetchAttendance: async () => {
    set({ isLoading: true, error: null });
    try {
      const records = await attendanceService.getAttendanceLogs();
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = records.find((r) => r.date === today) || null;
      set({ records, todayRecord, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch attendance logs', isLoading: false });
    }
  },

  checkIn: async () => {
    set({ isLoading: true, error: null });
    try {
      const record = await attendanceService.checkIn();
      set((state) => {
        const updatedRecords = [record, ...state.records];
        return {
          records: updatedRecords,
          todayRecord: record,
          isLoading: false,
        };
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to check in', isLoading: false });
      throw err;
    }
  },

  checkOut: async () => {
    set({ isLoading: true, error: null });
    try {
      const record = await attendanceService.checkOut();
      set((state) => {
        const updatedRecords = state.records.map((r) => r.id === record.id ? record : r);
        return {
          records: updatedRecords,
          todayRecord: record,
          isLoading: false,
        };
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to check out', isLoading: false });
      throw err;
    }
  },

  clearStore: () => set({ records: [], todayRecord: null, error: null, isLoading: false }),
}));
