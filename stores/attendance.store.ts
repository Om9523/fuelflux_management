/**
 * attendance.store.ts
 * Separate store for attendance — used by AttendanceCard and attendance page.
 * Real API via employeeService.
 */

import { create } from 'zustand';
import { employeeService } from '@/services/employee.service';
import { AttendanceRecord, AttendanceSummary, TodayAttendance } from '@/types/employee';

interface AttendanceState {
  records: AttendanceRecord[];
  todayRecord: TodayAttendance | null;
  summary: AttendanceSummary | null;
  isLoading: boolean;
  isChecking: boolean;   // check-in/out in progress
  error: string | null;

  fetchAttendance: (month?: number, year?: number) => Promise<void>;
  fetchTodayAttendance: () => Promise<void>;
  checkIn: () => Promise<void>;
  checkOut: () => Promise<void>;
  clearStore: () => void;
}

export const useAttendanceStore = create<AttendanceState>((set) => ({
  records: [],
  todayRecord: null,
  summary: null,
  isLoading: false,
  isChecking: false,
  error: null,

  fetchAttendance: async (month, year) => {
    set({ isLoading: true, error: null });
    try {
      const { summary, records } = await employeeService.getAttendance(month, year);
      set({ summary, records, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch attendance', isLoading: false });
    }
  },

  fetchTodayAttendance: async () => {
    try {
      const todayRecord = await employeeService.getTodayAttendance();
      set({ todayRecord });
    } catch {
      // silent — today record stays null (not checked in yet)
    }
  },

  checkIn: async () => {
    set({ isChecking: true, error: null });
    try {
      await employeeService.checkIn();
      const todayRecord = await employeeService.getTodayAttendance();
      set({ todayRecord, isChecking: false });
    } catch (err: any) {
      set({ error: err.message || 'Check-in failed', isChecking: false });
      throw err;
    }
  },

  checkOut: async () => {
    set({ isChecking: true, error: null });
    try {
      await employeeService.checkOut();
      const todayRecord = await employeeService.getTodayAttendance();
      set({ todayRecord, isChecking: false });
    } catch (err: any) {
      set({ error: err.message || 'Check-out failed', isChecking: false });
      throw err;
    }
  },

  clearStore: () =>
    set({
      records: [],
      todayRecord: null,
      summary: null,
      isLoading: false,
      isChecking: false,
      error: null,
    }),
}));