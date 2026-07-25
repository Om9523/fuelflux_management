// ─────────────────────────────────────────────────────────────────────────────
// Employee (Attendant) Types — Real Backend Response Shapes
// No mock-db dependency
// ─────────────────────────────────────────────────────────────────────────────

export interface EmployeeUser {
    id: string;
    name: string;
    employee_id: string;
    designation: string;
    shift: string | null;
    pump_id: string;
    role: 'attendant';
}

export interface EmployeeProfile {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    employee_id: string;
    designation: string;
    shift: string | null;
    pump_id: string;
    face_photo_url: string | null;
    address: string | null;
    date_of_joining: string | null;
    date_of_birth: string | null;
    emergency_contact: string | null;
    is_active: boolean;
    // computed on frontend for display
    assignedPump?: string;
}

// ── Announcement ──────────────────────────────────────────────────────────────

export type AnnouncementType = 'General' | 'Urgent' | 'Safety' | 'Holiday';

export interface Announcement {
    id: string;
    title: string;
    content: string;
    type: AnnouncementType;       // mapped from backend's announcement_type
    date: string;                 // mapped from backend's created_at (formatted)
    author: string;               // static "Pump Management" — backend doesn't send this yet
}

// ── Attendance ────────────────────────────────────────────────────────────────

export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'Leave' | 'Holiday' | 'Not Checked In';

export interface AttendanceRecord {
    id: string;
    date: string;
    status: AttendanceStatus;
    checkIn: string | null;       // formatted "09:15 AM"
    checkOut: string | null;
    workingHours: number;
}

export interface AttendanceSummary {
    month: number;
    year: number;
    total_days: number;
    present_days: number;
    late_days: number;
    leave_days: number;
    attendance_percentage: number;
}

export interface TodayAttendance {
    today_status: AttendanceStatus;
    check_in: string | null;
    check_out: string | null;
    working_hours: number;
}

// ── Leave ─────────────────────────────────────────────────────────────────────

export type LeaveStatus = 'pending' | 'approved' | 'rejected';
export type LeaveType = 'Casual' | 'Sick' | 'Earned' | 'Emergency';

export interface LeaveRecord {
    id: string;
    leave_type: LeaveType;
    from_date: string;
    to_date: string;
    reason: string;
    status: LeaveStatus;
    applied_on: string;
    reviewed_note: string | null;
}

export interface LeaveApplyPayload {
    leave_type: LeaveType;
    from_date: string;            // ISO date string "2025-06-01"
    to_date: string;
    reason: string;
}

// ── Salary ────────────────────────────────────────────────────────────────────

export type PaymentStatus = 'paid' | 'pending';

export interface SalarySlip {
    id: string;
    month: number;
    year: number;
    basic_salary: number;
    deductions: number;
    bonuses: number;
    net_salary: number;
    payment_status: PaymentStatus;
    paid_on: string | null;
}

// ── Shift ─────────────────────────────────────────────────────────────────────

export interface ShiftDetails {
    current_shift: string;
    designation: string;
    employee_id: string;
    // computed on frontend:
    currentShift: {
        name: string;
        startTime: string;
        endTime: string;
    };
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface EmployeeLoginPayload {
    employee_id: string;
    password: string;
}

export interface EmployeeLoginResponse {
    success: boolean;
    accessToken: string;
    refreshToken: string;
    user: EmployeeUser;
}