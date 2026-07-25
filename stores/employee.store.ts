/**
 * employee.store.ts
 * Zustand store for employee portal.
 * No mock-db dependency — all data from real API via employeeService.
 */

import { create } from 'zustand';
import { employeeService } from '@/services/employee.service';
import { getEmployeeUser, TOKEN_KEYS } from '@/lib/backendApi';
import {
  EmployeeProfile,
  EmployeeUser,
  TodayAttendance,
  AttendanceRecord,
  AttendanceSummary,
  LeaveRecord,
  SalarySlip,
  ShiftDetails,
  EmployeeLoginPayload,
} from '@/types/employee';

interface EmployeeState {
  // ── Auth ──────────────────────────────────────────────────────────────────
  user: EmployeeUser | null;
  isLoggedIn: boolean;

  // ── Profile ───────────────────────────────────────────────────────────────
  profile: EmployeeProfile | null;
  isLoadingProfile: boolean;



  // ── Attendance ─────────────────────────────────────────────────────────────
  todayRecord: TodayAttendance | null;
  records: AttendanceRecord[];
  attendanceSummary: AttendanceSummary | null;
  isLoadingAttendance: boolean;

  // ── Leave ──────────────────────────────────────────────────────────────────
  leaves: LeaveRecord[];
  isLoadingLeaves: boolean;

  // ── Salary ─────────────────────────────────────────────────────────────────
  salarySlips: SalarySlip[];
  isLoadingSalary: boolean;

  // ── Shift ──────────────────────────────────────────────────────────────────
  shift: ShiftDetails | null;
  isLoadingShift: boolean;

  // ── Shared ────────────────────────────────────────────────────────────────
  isLoading: boolean;   // generic (kept for backward compat)
  isLoadingUpdate: boolean;
  error: string | null;

  // ── Actions ───────────────────────────────────────────────────────────────
  initUser: () => void;
  login: (payload: EmployeeLoginPayload) => Promise<void>;
  logout: () => Promise<void>;

  fetchProfile: () => Promise<void>;

  fetchAttendance: (month?: number, year?: number) => Promise<void>;
  fetchTodayAttendance: () => Promise<void>;
  checkIn: () => Promise<void>;
  checkOut: () => Promise<void>;
  fetchLeaves: () => Promise<void>;
  applyLeave: (payload: { leave_type: string; from_date: string; to_date: string; reason: string }) => Promise<void>;
  fetchSalary: () => Promise<void>;
  fetchShift: () => Promise<void>;
  changePassword: (current: string, newPass: string) => Promise<void>;

  clearStore: () => void;
}

export const useEmployeeStore = create<EmployeeState>((set, get) => ({
  user: null,
  isLoggedIn: false,
  profile: null,
  isLoadingProfile: false,

  todayRecord: null,
  records: [],
  attendanceSummary: null,
  isLoadingAttendance: false,
  leaves: [],
  isLoadingLeaves: false,
  salarySlips: [],
  isLoadingSalary: false,
  shift: null,
  isLoadingShift: false,
  isLoading: false,
  isLoadingUpdate: false,
  error: null,

  // ── Load user from localStorage on app init ─────────────────────────────
  initUser: () => {
    const user = getEmployeeUser();
    const token = typeof window !== 'undefined'
      ? localStorage.getItem(TOKEN_KEYS.EMPLOYEE)
      : null;
    // Only restore session if BOTH user object AND token exist
    if (user && token) {
      set({ user, isLoggedIn: true });
    } else {
      // Stale user object without a token — clear it
      set({ user: null, isLoggedIn: false });
    }
  },

  // ── Auth ──────────────────────────────────────────────────────────────────
  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await employeeService.login(payload);
      set({ user: res.user, isLoggedIn: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Login failed', isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    await employeeService.logout();
    get().clearStore();
  },

  // ── Profile ───────────────────────────────────────────────────────────────
  fetchProfile: async () => {
    set({ isLoadingProfile: true, error: null });
    try {
      const profile = await employeeService.getProfile();
      set({ profile, isLoadingProfile: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch profile', isLoadingProfile: false });
    }
  },



  // ── Attendance ─────────────────────────────────────────────────────────────
  fetchTodayAttendance: async () => {
    try {
      const todayRecord = await employeeService.getTodayAttendance();
      set({ todayRecord });
    } catch {
      // Silent fail — today record just stays null
    }
  },

  fetchAttendance: async (month, year) => {
    set({ isLoadingAttendance: true, error: null });
    try {
      const { summary, records } = await employeeService.getAttendance(month, year);
      set({ attendanceSummary: summary, records, isLoadingAttendance: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch attendance', isLoadingAttendance: false });
    }
  },

  checkIn: async () => {
    set({ isLoading: true, error: null });
    try {
      await employeeService.checkIn();
      // Refresh today's record
      const todayRecord = await employeeService.getTodayAttendance();
      set({ todayRecord, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Check-in failed', isLoading: false });
      throw err;
    }
  },

  checkOut: async () => {
    set({ isLoading: true, error: null });
    try {
      await employeeService.checkOut();
      const todayRecord = await employeeService.getTodayAttendance();
      set({ todayRecord, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Check-out failed', isLoading: false });
      throw err;
    }
  },

  // ── Leave ──────────────────────────────────────────────────────────────────
  fetchLeaves: async () => {
    set({ isLoadingLeaves: true, error: null });
    try {
      const leaves = await employeeService.getLeaves();
      set({ leaves, isLoadingLeaves: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch leaves', isLoadingLeaves: false });
    }
  },

  applyLeave: async (payload) => {
    set({ isLoadingUpdate: true, error: null });
    try {
      await employeeService.applyLeave(payload as any);
      // Refresh leave list
      const leaves = await employeeService.getLeaves();
      set({ leaves, isLoadingUpdate: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to apply leave', isLoadingUpdate: false });
      throw err;
    }
  },

  // ── Salary ─────────────────────────────────────────────────────────────────
  fetchSalary: async () => {
    set({ isLoadingSalary: true, error: null });
    try {
      const salarySlips = await employeeService.getSalary();
      set({ salarySlips, isLoadingSalary: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch salary', isLoadingSalary: false });
    }
  },

  // ── Shift ──────────────────────────────────────────────────────────────────
  fetchShift: async () => {
    set({ isLoadingShift: true, error: null });
    try {
      const shift = await employeeService.getShift();
      set({ shift, isLoadingShift: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch shift', isLoadingShift: false });
    }
  },

  // ── Password ───────────────────────────────────────────────────────────────
  changePassword: async (current, newPass) => {
    set({ isLoadingUpdate: true, error: null });
    try {
      await employeeService.changePassword(current, newPass);
      set({ isLoadingUpdate: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to change password', isLoadingUpdate: false });
      throw err;
    }
  },

  // ── Clear ──────────────────────────────────────────────────────────────────
  clearStore: () =>
    set({
      user: null,
      isLoggedIn: false,
      profile: null,

      todayRecord: null,
      records: [],
      attendanceSummary: null,
      leaves: [],
      salarySlips: [],
      shift: null,
      error: null,
      isLoading: false,
      isLoadingProfile: false,

      isLoadingAttendance: false,
      isLoadingLeaves: false,
      isLoadingSalary: false,
      isLoadingShift: false,
      isLoadingUpdate: false,
    }),
}));