// FuelFlux Mock LocalStorage Database System
// This file acts as our local backend database.

export type Role = 'pump_owner' | 'logistic' | 'admin' | 'investor' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  roles: Role[];
  status?: 'active' | 'inactive' | 'suspended';
  createdAt: string;
}

export interface OTPRecord {
  identifier: string;
  code: string;
  type: 'sms' | 'email';
  expiresAt: number;
}

// ── Shared Domain Types ──────────────────────────────────────────────────────

export interface Pump {
  id: string;
  name: string;
  location: string;
  status: 'approved' | 'pending' | 'under_review' | 'rejected' | 'suspended';
  owner: string;
  revenue: number;
  createdAt: string;
  [key: string]: any;
}

export interface LogisticsPartner {
  id: string;
  name: string;
  contact: string;
  status: string;
  [key: string]: any;
}

export interface Investor {
  id: string;
  name: string;
  email: string;
  investment: number;
  [key: string]: any;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  status: string;
  date: string;
  [key: string]: any;
}

export interface SubscriptionRecord {
  id: string;
  plan: string;
  status: string;
  expiresAt: string;
  [key: string]: any;
}

export interface AuditLog {
  id: string;
  action: string;
  userId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  [key: string]: any;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: string;
  userId: string;
  messages: any[];
  createdAt: string;
  [key: string]: any;
}

export interface FraudAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  resolved: boolean;
  [key: string]: any;
}

// ── Employee Domain Types ────────────────────────────────────────────────────

export interface ShiftDetails {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'missed' | 'in_progress';
  pumpId?: string;
  [key: string]: any;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  [key: string]: any;
}

export interface EmployeeProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  joinedAt: string;
  performanceScore?: number;
  [key: string]: any;
}

export interface SalaryRecord {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'paid' | 'pending' | 'processing';
  [key: string]: any;
}

export interface LeaveRecord {
  id: string;
  employeeId: string;
  type: 'sick' | 'casual' | 'earned' | 'unpaid';
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  [key: string]: any;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'half_day' | 'leave' | 'Present' | 'Late' | 'Absent' | 'Leave';
  hoursWorked?: number;
  [key: string]: any;
}

// ── Mock DB Helpers ──────────────────────────────────────────────────────────

const SEED_USERS: User[] = [
  {
    id: 'user_1',
    name: 'Rajesh Kumar',
    email: 'owner@fuelflux.com',
    phone: '9876543210',
    passwordHash: 'password123',
    roles: ['pump_owner'],
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_2',
    name: 'Vikram Singh',
    email: 'logistic@fuelflux.com',
    phone: '9876543211',
    passwordHash: 'password123',
    roles: ['logistic', 'investor'],
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_3',
    name: 'Anjali Sharma',
    email: 'multi@fuelflux.com',
    phone: '9876543212',
    passwordHash: 'password123',
    roles: ['pump_owner', 'logistic', 'employee', 'investor'],
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_4',
    name: 'Suresh Patel',
    email: 'admin@fuelflux.com',
    phone: '9876543213',
    passwordHash: 'password123',
    roles: ['admin'],
    status: 'active',
    createdAt: new Date().toISOString(),
  },
];

const KEYS = {
  USERS: 'fuelflux_users',
  OTPS: 'fuelflux_otps',
};

const getStorage = () => {
  if (typeof window !== 'undefined') return window.localStorage;
  return null;
};

export const initializeDB = () => {
  const storage = getStorage();
  if (!storage) return;
  if (!storage.getItem(KEYS.USERS)) storage.setItem(KEYS.USERS, JSON.stringify(SEED_USERS));
  if (!storage.getItem(KEYS.OTPS)) storage.setItem(KEYS.OTPS, JSON.stringify([]));
};

export const getUsers = (): User[] => {
  const storage = getStorage();
  if (!storage) return [];
  initializeDB();
  return JSON.parse(storage.getItem(KEYS.USERS) || '[]');
};

export const saveUsers = (users: User[]) => {
  const storage = getStorage();
  if (storage) storage.setItem(KEYS.USERS, JSON.stringify(users));
};

export const getUserByEmailOrPhone = (identifier: string): User | null => {
  const users = getUsers();
  const lowerId = identifier.trim().toLowerCase();
  return users.find(
    (u) =>
      u.id.toLowerCase() === lowerId ||
      u.email.toLowerCase() === lowerId ||
      u.phone === identifier.trim()
  ) || null;
};

export const registerUserInMockDB = (user: Omit<User, 'createdAt' | 'id'>): User => {
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

export const getOTPs = (): OTPRecord[] => {
  const storage = getStorage();
  if (!storage) return [];
  return JSON.parse(storage.getItem(KEYS.OTPS) || '[]');
};

export const saveOTPs = (records: OTPRecord[]) => {
  const storage = getStorage();
  if (storage) storage.setItem(KEYS.OTPS, JSON.stringify(records));
};

export const generateAndStoreOTP = (identifier: string, type: 'sms' | 'email'): string => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const otps = getOTPs();
  const expiresAt = Date.now() + 5 * 60 * 1000;
  const filtered = otps.filter((o) => o.identifier !== identifier);
  filtered.push({ identifier, code, type, expiresAt });
  saveOTPs(filtered);
  console.log(`[Mock DB OTP] Generated ${type} OTP for ${identifier}: ${code}`);
  return code;
};

export const verifyOTPInMockDB = (identifier: string, code: string): boolean => {
  if (code === '123456') return true;
  const otps = getOTPs();
  const record = otps.find((o) => o.identifier === identifier && o.code === code);
  if (!record || record.expiresAt < Date.now()) return false;
  saveOTPs(otps.filter((o) => !(o.identifier === identifier && o.code === code)));
  return true;
};

export const updatePasswordInMockDB = (identifier: string, newPasswordHash: string): boolean => {
  const users = getUsers();
  const lowerId = identifier.trim().toLowerCase();
  const idx = users.findIndex((u) => u.email.toLowerCase() === lowerId || u.phone === identifier.trim());
  if (idx === -1) return false;
  users[idx].passwordHash = newPasswordHash;
  saveUsers(users);
  return true;
};

// ── Stub getters/setters for lib/api.ts compatibility ───────────────────────

const ls = (key: string, fallback: any[] = []) => {
  const s = getStorage();
  if (!s) return fallback;
  return JSON.parse(s.getItem(key) || JSON.stringify(fallback));
};
const lsSet = (key: string, data: any) => {
  const s = getStorage();
  if (s) s.setItem(key, JSON.stringify(data));
};

export const getPumps = (): Pump[] => ls('fuelflux_pumps');
export const savePumps = (d: Pump[]) => lsSet('fuelflux_pumps', d);
export const getLogistics = (): LogisticsPartner[] => ls('fuelflux_logistics');
export const saveLogistics = (d: LogisticsPartner[]) => lsSet('fuelflux_logistics', d);
export const getInvestors = (): Investor[] => ls('fuelflux_investors');
export const saveInvestors = (d: Investor[]) => lsSet('fuelflux_investors', d);
export const getPayments = (): PaymentRecord[] => ls('fuelflux_payments');
export const savePayments = (d: PaymentRecord[]) => lsSet('fuelflux_payments', d);
export const getSubscriptions = (): SubscriptionRecord[] => ls('fuelflux_subscriptions');
export const saveSubscriptions = (d: SubscriptionRecord[]) => lsSet('fuelflux_subscriptions', d);
export const getAuditLogs = (): AuditLog[] => ls('fuelflux_auditlogs');
export const saveAuditLogs = (d: AuditLog[]) => lsSet('fuelflux_auditlogs', d);
export const getSupportTickets = (): SupportTicket[] => ls('fuelflux_support');
export const saveSupportTickets = (d: SupportTicket[]) => lsSet('fuelflux_support', d);
export const getFraudAlerts = (): FraudAlert[] => ls('fuelflux_fraud');
export const saveFraudAlerts = (d: FraudAlert[]) => lsSet('fuelflux_fraud', d);
