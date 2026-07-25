/**
 * employee.service.ts
 * All API calls for the employee (attendant) portal.
 * Uses backendApi — employee token auto-attached via interceptor.
 */

import backendApi, { saveEmployeeSession, clearEmployeeSession } from '@/lib/backendApi';
import {
  EmployeeProfile,
  EmployeeLoginPayload,
  EmployeeLoginResponse,
  AttendanceRecord,
  AttendanceSummary,
  TodayAttendance,
  LeaveRecord,
  LeaveApplyPayload,
  SalarySlip,
  ShiftDetails,
} from '@/types/employee';



// ── Helper — map backend attendance record to frontend shape ──────────────────
const mapAttendanceRecord = (raw: any): AttendanceRecord => ({
  id: raw.id,
  date: raw.date,
  status: raw.status,
  checkIn: raw.check_in ?? null,
  checkOut: raw.check_out ?? null,
  workingHours: raw.working_hours ?? 0,
});

// ─────────────────────────────────────────────────────────────────────────────

export const employeeService = {

  // ── Auth ───────────────────────────────────────────────────────────────────

  async login(payload: EmployeeLoginPayload): Promise<EmployeeLoginResponse> {
    const res = await backendApi.post('/auth/employee-login', payload);
    const data = res.data;

    if (data.success) {
      saveEmployeeSession(data.accessToken, data.refreshToken, data.user);
    }

    return data;
  },

  async logout(): Promise<void> {
    try {
      await backendApi.post('/auth/logout');
    } catch {
      // Even if API call fails, clear local session
    } finally {
      clearEmployeeSession();
    }
  },

  async changePassword(current_password: string, new_password: string): Promise<void> {
    await backendApi.post('/employee/change-password', { current_password, new_password });
  },

  // ── Profile ────────────────────────────────────────────────────────────────

  async getProfile(): Promise<EmployeeProfile> {
    const res = await backendApi.get('/employee/my-profile');
    const raw = res.data.data;
    return {
      ...raw,
      assignedPump: raw.pump_id,    // frontend display field
    };
  },



  // ── Attendance ─────────────────────────────────────────────────────────────

  async getTodayAttendance(): Promise<TodayAttendance> {
    const res = await backendApi.get('/employee/today-attendance');
    return res.data;
  },

  async getAttendance(month?: number, year?: number): Promise<{
    summary: AttendanceSummary;
    records: AttendanceRecord[];
  }> {
    const params: Record<string, number> = {};
    if (month) params.month = month;
    if (year) params.year = year;

    const res = await backendApi.get('/employee/attendance', { params });
    return {
      summary: res.data.summary,
      records: (res.data.records ?? []).map(mapAttendanceRecord),
    };
  },

  async checkIn(): Promise<{ check_in_time: string }> {
    const res = await backendApi.post('/employee/check-in');
    return res.data;
  },

  async checkOut(): Promise<{ check_out_time: string; working_hours: number }> {
    const res = await backendApi.post('/employee/check-out');
    return res.data;
  },

  // ── Leave ──────────────────────────────────────────────────────────────────

  async getLeaves(): Promise<LeaveRecord[]> {
    const res = await backendApi.get('/employee/leaves');
    return res.data.data ?? [];
  },

  async applyLeave(payload: LeaveApplyPayload): Promise<{ id: string }> {
    const res = await backendApi.post('/employee/leaves', payload);
    return res.data;
  },

  // ── Salary ─────────────────────────────────────────────────────────────────

  async getSalary(): Promise<SalarySlip[]> {
    const res = await backendApi.get('/employee/salary');
    return res.data.data ?? [];
  },

  // ── Shift ──────────────────────────────────────────────────────────────────

  async getShift(): Promise<ShiftDetails> {
    const res = await backendApi.get('/employee/my-shift');
    const raw = res.data.data;

    // Map shift name to time range for UI compatibility
    const shiftTimes: Record<string, { start: string; end: string }> = {
      Morning: { start: '06:00 AM', end: '02:00 PM' },
      Evening: { start: '02:00 PM', end: '10:00 PM' },
      Night: { start: '10:00 PM', end: '06:00 AM' },
    };

    const times = shiftTimes[raw.current_shift] ?? { start: '--:--', end: '--:--' };

    return {
      ...raw,
      currentShift: {
        name: raw.current_shift,
        startTime: times.start,
        endTime: times.end,
      },
    };
  },
};