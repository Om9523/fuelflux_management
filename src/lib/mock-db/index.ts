// FuelFlux Mock LocalStorage Database System
// This file acts as our local backend database.

export type Role = 'pump_owner' | 'logistic' | 'admin' | 'investor' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string; // Stored in plain text for mock purposes
  roles: Role[];
  createdAt: string;
  status?: 'active' | 'suspended';
}

export interface EmployeeProfile {
  id: string;
  employeeId: string;
  designation: 'Supervisor' | 'Cashier' | 'Fuel Attendant';
  assignedPump: string;
  joiningDate: string;
  photoUrl?: string;
  metrics: {
    fuelDispensed?: number;
    transactionsHandled: number;
    attendanceScore: number;
    cashAccuracy?: number;
    teamAttendance?: number;
    operationalCompliance?: number;
    performanceScore: number;
  };
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workingHours: number;
  status: 'Present' | 'Absent' | 'Leave' | 'Late';
}

export interface LeaveRecord {
  id: string;
  userId: string;
  leaveType: 'Casual Leave' | 'Sick Leave' | 'Emergency Leave';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
  managerRemarks?: string;
}

export interface SalaryRecord {
  id: string;
  userId: string;
  month: string;
  monthlySalary: number;
  attendanceRate: number;
  overtimePay: number;
  bonus: number;
  deductions: number;
  netPay: number;
  payslipUrl: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'General' | 'Urgent' | 'Holiday' | 'Safety';
  date: string;
  author: string;
}

export interface ShiftDetails {
  id: string;
  userId: string;
  currentShift: {
    name: string;
    startTime: string;
    endTime: string;
  };
  weeklySchedule: Record<string, {
    shiftType: 'Morning' | 'Afternoon' | 'Night' | 'Off';
    time: string;
  }>;
}

export interface OTPRecord {
  identifier: string; // email or phone
  code: string;
  type: 'sms' | 'email';
  expiresAt: number;
}

export interface Pump {
  id: string;
  name: string;
  ownerName: string;
  ownerId: string;
  gstNumber: string;
  licenseNumber: string;
  address: string;
  city: string;
  state: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'suspended';
  documents: {
    gstCertificate: string;
    fuelLicense: string;
    aadhaar: string;
    pan: string;
    pumpImages: string[];
  };
  revenue: number;
  subscriptionPlan: string;
  subscriptionStatus: 'active' | 'expiring' | 'none';
  createdAt: string;
}

export interface LogisticsPartner {
  id: string;
  companyName: string;
  managerName: string;
  email: string;
  phone: string;
  vehicleCount: number;
  creditLimit: number;
  creditUsed: number;
  voucherCount: number;
  fuelConsumption: number; // in Liters
  createdAt: string;
}

export interface Investor {
  id: string;
  name: string;
  email: string;
  phone: string;
  portfolioValue: number;
  investmentDate: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  pumpId?: string;
  pumpName?: string;
  ownerName: string;
  amount: number;
  type: 'subscription' | 'wallet_topup';
  status: 'success' | 'failed' | 'refunded' | 'disputed';
  timestamp: string;
  paymentMethod: string;
}

export interface SubscriptionRecord {
  id: string;
  pumpId: string;
  pumpName: string;
  ownerName: string;
  planName: 'Basic' | 'Premium' | 'Enterprise';
  amount: number;
  status: 'active' | 'expiring' | 'churned';
  startDate: string;
  endDate: string;
}

export interface AuditLog {
  id: string;
  adminName: string;
  action: string;
  entity: string;
  timestamp: string;
  ipAddress: string;
  result: 'Success' | 'Failed';
}

export interface SupportTicket {
  id: string;
  subject: string;
  userEmail: string;
  userName: string;
  userRole: string;
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedAgent?: string;
  createdAt: string;
  messages: {
    sender: 'user' | 'admin';
    senderName: string;
    message: string;
    timestamp: string;
  }[];
}

export interface FraudAlert {
  id: string;
  title: string;
  description: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'dismissed';
  timestamp: string;
}

const SEED_USERS: User[] = [
  {
    id: 'user_1',
    name: 'Rajesh Kumar',
    email: 'owner@fuelflux.com',
    phone: '9876543210',
    passwordHash: 'password123',
    roles: ['pump_owner'],
    createdAt: new Date().toISOString(),
    status: 'active',
  },
  {
    id: 'user_2',
    name: 'Vikram Singh',
    email: 'logistic@fuelflux.com',
    phone: '9876543211',
    passwordHash: 'password123',
    roles: ['logistic', 'investor'],
    createdAt: new Date().toISOString(),
    status: 'active',
  },
  {
    id: 'user_3',
    name: 'Anjali Sharma',
    email: 'multi@fuelflux.com',
    phone: '9876543212',
    passwordHash: 'password123',
    roles: ['pump_owner', 'logistic', 'employee', 'investor'],
    createdAt: new Date().toISOString(),
    status: 'active',
  },
  {
    id: 'user_4',
    name: 'Suresh Patel',
    email: 'admin@fuelflux.com',
    phone: '9876543213',
    passwordHash: 'password123',
    roles: ['admin'],
    createdAt: new Date().toISOString(),
    status: 'active',
  },
];

const SEED_PUMPS: Pump[] = [
  {
    id: 'pump_1',
    name: 'Bharat Petroleum Sector 62',
    ownerName: 'Rajesh Kumar',
    ownerId: 'user_1',
    gstNumber: '09AAACB1234D1Z5',
    licenseNumber: 'L-NOC-UP-99281',
    address: 'Plot No. A-14, Sector 62',
    city: 'Noida',
    state: 'Uttar Pradesh',
    status: 'approved',
    documents: {
      gstCertificate: 'gst_cert_sec62.pdf',
      fuelLicense: 'fuel_license_sec62.pdf',
      aadhaar: 'aadhaar_rajesh.pdf',
      pan: 'pan_rajesh.pdf',
      pumpImages: ['pump_front.jpg', 'dispenser_closeup.jpg'],
    },
    revenue: 420500,
    subscriptionPlan: 'Premium Plan',
    subscriptionStatus: 'active',
    createdAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'pump_2',
    name: 'Indian Oil Highway Express',
    ownerName: 'Rajesh Kumar',
    ownerId: 'user_1',
    gstNumber: '27AAACB5678E2Z4',
    licenseNumber: 'L-NOC-MH-88123',
    address: 'NH-4, Khed Toll Plaza',
    city: 'Pune',
    state: 'Maharashtra',
    status: 'approved',
    documents: {
      gstCertificate: 'gst_cert_pune.pdf',
      fuelLicense: 'fuel_license_pune.pdf',
      aadhaar: 'aadhaar_rajesh.pdf',
      pan: 'pan_rajesh.pdf',
      pumpImages: ['pune_station.jpg'],
    },
    revenue: 890300,
    subscriptionPlan: 'Enterprise Plan',
    subscriptionStatus: 'active',
    createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'pump_3',
    name: 'Shell Select Ring Road',
    ownerName: 'Anjali Sharma',
    ownerId: 'user_3',
    gstNumber: '29AAACB4321F1Z1',
    licenseNumber: 'L-NOC-KA-77312',
    address: 'Outer Ring Road, Hebbal',
    city: 'Bengaluru',
    state: 'Karnataka',
    status: 'pending',
    documents: {
      gstCertificate: 'gst_shell_hebbal.pdf',
      fuelLicense: 'fuel_lic_shell_hebbal.pdf',
      aadhaar: 'aadhaar_anjali.pdf',
      pan: 'pan_anjali.pdf',
      pumpImages: ['shell_layout.jpg'],
    },
    revenue: 0,
    subscriptionPlan: 'Basic Plan',
    subscriptionStatus: 'none',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'pump_4',
    name: 'HP Fuel Junction',
    ownerName: 'Devendra Joshi',
    ownerId: 'user_5',
    gstNumber: '24AAACB9876G1Z2',
    licenseNumber: 'L-NOC-GJ-55492',
    address: 'S.G. Highway, Thaltej',
    city: 'Ahmedabad',
    state: 'Gujarat',
    status: 'suspended',
    documents: {
      gstCertificate: 'gst_hp_ahmedabad.pdf',
      fuelLicense: 'fuel_hp_ahmedabad.pdf',
      aadhaar: 'aadhaar_joshi.pdf',
      pan: 'pan_joshi.pdf',
      pumpImages: ['hp_station.jpg'],
    },
    revenue: 120500,
    subscriptionPlan: 'Basic Plan',
    subscriptionStatus: 'none',
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
];

const SEED_LOGISTICS: LogisticsPartner[] = [
  {
    id: 'log_1',
    companyName: 'TransExpress Logistics',
    managerName: 'Vikram Singh',
    email: 'logistic@fuelflux.com',
    phone: '9876543211',
    vehicleCount: 24,
    creditLimit: 500000,
    creditUsed: 185000,
    voucherCount: 142,
    fuelConsumption: 12450,
    createdAt: new Date(Date.now() - 80 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'log_2',
    companyName: 'VRL Fleet Management',
    managerName: 'Anand Shinde',
    email: 'vrl@logistic.com',
    phone: '9812345670',
    vehicleCount: 48,
    creditLimit: 1200000,
    creditUsed: 620000,
    voucherCount: 389,
    fuelConsumption: 28900,
    createdAt: new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString(),
  },
];

const SEED_INVESTORS: Investor[] = [
  {
    id: 'inv_1',
    name: 'Anjali Sharma',
    email: 'multi@fuelflux.com',
    phone: '9876543212',
    portfolioValue: 2500000,
    investmentDate: new Date(Date.now() - 100 * 24 * 3600 * 1000).toISOString(),
    status: 'active',
    createdAt: new Date(Date.now() - 100 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'inv_2',
    name: 'Aditya Birla Ventures',
    email: 'ventures@adityabirla.com',
    phone: '9900112233',
    portfolioValue: 7500000,
    investmentDate: new Date(Date.now() - 150 * 24 * 3600 * 1000).toISOString(),
    status: 'active',
    createdAt: new Date(Date.now() - 150 * 24 * 3600 * 1000).toISOString(),
  },
];

const SEED_PAYMENTS: PaymentRecord[] = [
  {
    id: 'tx_101',
    pumpId: 'pump_1',
    pumpName: 'Bharat Petroleum Sector 62',
    ownerName: 'Rajesh Kumar',
    amount: 14999,
    type: 'subscription',
    status: 'success',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    paymentMethod: 'UPI (GPay)',
  },
  {
    id: 'tx_102',
    pumpId: 'pump_2',
    pumpName: 'Indian Oil Highway Express',
    ownerName: 'Rajesh Kumar',
    amount: 29999,
    type: 'subscription',
    status: 'success',
    timestamp: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    paymentMethod: 'Netbanking (HDFC)',
  },
  {
    id: 'tx_103',
    ownerName: 'Vikram Singh',
    amount: 100000,
    type: 'wallet_topup',
    status: 'success',
    timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    paymentMethod: 'Corporate Card',
  },
  {
    id: 'tx_104',
    pumpId: 'pump_4',
    pumpName: 'HP Fuel Junction',
    ownerName: 'Devendra Joshi',
    amount: 14999,
    type: 'subscription',
    status: 'failed',
    timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    paymentMethod: 'UPI',
  },
  {
    id: 'tx_105',
    pumpId: 'pump_1',
    pumpName: 'Bharat Petroleum Sector 62',
    ownerName: 'Rajesh Kumar',
    amount: 5000,
    type: 'wallet_topup',
    status: 'disputed',
    timestamp: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
    paymentMethod: 'Credit Card',
  },
];

const SEED_SUBSCRIPTIONS: SubscriptionRecord[] = [
  {
    id: 'sub_1',
    pumpId: 'pump_1',
    pumpName: 'Bharat Petroleum Sector 62',
    ownerName: 'Rajesh Kumar',
    planName: 'Premium',
    amount: 14999,
    status: 'active',
    startDate: new Date(Date.now() - 28 * 24 * 3600 * 1000).toISOString(),
    endDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'sub_2',
    pumpId: 'pump_2',
    pumpName: 'Indian Oil Highway Express',
    ownerName: 'Rajesh Kumar',
    planName: 'Enterprise',
    amount: 29999,
    status: 'active',
    startDate: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    endDate: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString(),
  },
];

const SEED_AUDIT: AuditLog[] = [
  {
    id: 'audit_1',
    adminName: 'Suresh Patel',
    action: 'Approved Pump #pump_1',
    entity: 'Pump Registration',
    timestamp: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
    ipAddress: '192.168.1.100',
    result: 'Success',
  },
  {
    id: 'audit_2',
    adminName: 'Suresh Patel',
    action: 'Suspended Pump #pump_4',
    entity: 'Pump Control',
    timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    ipAddress: '192.168.1.100',
    result: 'Success',
  },
];

const SEED_TICKETS: SupportTicket[] = [
  {
    id: 'ticket_1',
    subject: 'Delayed settlement for Shift Reconciliation B',
    userEmail: 'owner@fuelflux.com',
    userName: 'Rajesh Kumar',
    userRole: 'pump_owner',
    status: 'open',
    priority: 'high',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    messages: [
      {
        sender: 'user',
        senderName: 'Rajesh Kumar',
        message: 'Hello, we reconciled shift B four hours ago but the wallet balance is not updated. Please check.',
        timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'ticket_2',
    subject: 'Fleet credit limit increase request',
    userEmail: 'logistic@fuelflux.com',
    userName: 'Vikram Singh',
    userRole: 'logistic',
    status: 'in_progress',
    priority: 'medium',
    assignedAgent: 'Suresh Patel',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    messages: [
      {
        sender: 'user',
        senderName: 'Vikram Singh',
        message: 'We are expanding our fleet on the Ahmedabad corridor and need to increase our credit limit to 8,00,000 INR.',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      },
      {
        sender: 'admin',
        senderName: 'Suresh Patel',
        message: 'Under review. Please upload your last quarter business tax statements to the verification tab.',
        timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
      },
    ],
  },
];

const SEED_ALERTS: FraudAlert[] = [
  {
    id: 'alert_1',
    title: 'Abnormal Credit Fill Pattern',
    description: 'VRL Fleet truck logged 3 fill transactions within 15 minutes at Pune Highway station.',
    level: 'high',
    status: 'active',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'alert_2',
    title: 'Multiple Login Failures',
    description: 'Pump manager account for Shell Hebbal failed login 5 times in 2 minutes.',
    level: 'medium',
    status: 'active',
    timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  },
];

const KEYS = {
  USERS: 'fuelflux_users',
  OTPS: 'fuelflux_otps',
  PUMPS: 'fuelflux_pumps',
  LOGISTICS: 'fuelflux_logistics',
  INVESTORS: 'fuelflux_investors',
  PAYMENTS: 'fuelflux_payments',
  SUBSCRIPTIONS: 'fuelflux_subscriptions',
  AUDIT: 'fuelflux_audit_logs',
  TICKETS: 'fuelflux_support_tickets',
  ALERTS: 'fuelflux_fraud_alerts',
  EMPLOYEES: 'fuelflux_employee_profiles',
  ATTENDANCE: 'fuelflux_attendance',
  LEAVES: 'fuelflux_leaves',
  SALARIES: 'fuelflux_salaries',
  ANNOUNCEMENTS: 'fuelflux_announcements',
  SHIFTS: 'fuelflux_shifts',
};

const SEED_EMPLOYEES: EmployeeProfile[] = [
  {
    id: 'user_3',
    employeeId: 'EMP-2026-9082',
    designation: 'Supervisor',
    assignedPump: 'Bharat Petroleum Sector 62',
    joiningDate: '2024-04-12',
    photoUrl: '',
    metrics: {
      transactionsHandled: 1240,
      attendanceScore: 96,
      teamAttendance: 94,
      operationalCompliance: 98,
      performanceScore: 95,
    },
  },
];

const SEED_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att_1', userId: 'user_3', date: '2026-05-01', checkIn: '08:00', checkOut: '16:30', workingHours: 8.5, status: 'Present' },
  { id: 'att_2', userId: 'user_3', date: '2026-05-02', checkIn: '08:15', checkOut: '16:00', workingHours: 7.75, status: 'Present' },
  { id: 'att_3', userId: 'user_3', date: '2026-05-03', checkIn: null, checkOut: null, workingHours: 0, status: 'Absent' },
  { id: 'att_4', userId: 'user_3', date: '2026-05-04', checkIn: '08:00', checkOut: '17:00', workingHours: 9.0, status: 'Present' },
  { id: 'att_5', userId: 'user_3', date: '2026-05-05', checkIn: '08:45', checkOut: '16:15', workingHours: 7.5, status: 'Late' },
  { id: 'att_6', userId: 'user_3', date: '2026-05-06', checkIn: '07:55', checkOut: '16:05', workingHours: 8.16, status: 'Present' },
  { id: 'att_7', userId: 'user_3', date: '2026-05-07', checkIn: null, checkOut: null, workingHours: 0, status: 'Leave' },
  { id: 'att_8', userId: 'user_3', date: '2026-06-01', checkIn: '08:00', checkOut: '16:30', workingHours: 8.5, status: 'Present' },
  { id: 'att_9', userId: 'user_3', date: '2026-06-02', checkIn: '08:05', checkOut: '16:00', workingHours: 7.9, status: 'Present' },
  { id: 'att_10', userId: 'user_3', date: '2026-06-03', checkIn: '08:35', checkOut: '16:35', workingHours: 8.0, status: 'Late' },
  { id: 'att_11', userId: 'user_3', date: '2026-06-04', checkIn: '07:50', checkOut: '16:50', workingHours: 9.0, status: 'Present' },
];

const SEED_LEAVES: LeaveRecord[] = [
  {
    id: 'leave_1',
    userId: 'user_3',
    leaveType: 'Casual Leave',
    startDate: '2026-05-07',
    endDate: '2026-05-07',
    reason: 'Family function at home town',
    status: 'Approved',
    appliedDate: '2026-05-01',
    managerRemarks: 'Approved. Shift covered by Rajesh.',
  },
  {
    id: 'leave_2',
    userId: 'user_3',
    leaveType: 'Sick Leave',
    startDate: '2026-05-20',
    endDate: '2026-05-21',
    reason: 'Severe food poisoning',
    status: 'Approved',
    appliedDate: '2026-05-20',
    managerRemarks: 'Get well soon.',
  },
  {
    id: 'leave_3',
    userId: 'user_3',
    leaveType: 'Emergency Leave',
    startDate: '2026-06-12',
    endDate: '2026-06-13',
    reason: 'Urgent medical checkup for parents',
    status: 'Pending',
    appliedDate: '2026-06-04',
    managerRemarks: '',
  },
];

const SEED_SALARIES: SalaryRecord[] = [
  {
    id: 'sal_1',
    userId: 'user_3',
    month: 'May 2026',
    monthlySalary: 28000,
    attendanceRate: 94,
    overtimePay: 1800,
    bonus: 2000,
    deductions: 500,
    netPay: 31300,
    payslipUrl: '/payslips/may_2026.pdf',
  },
  {
    id: 'sal_2',
    userId: 'user_3',
    month: 'April 2026',
    monthlySalary: 28000,
    attendanceRate: 96,
    overtimePay: 1200,
    bonus: 1000,
    deductions: 0,
    netPay: 30200,
    payslipUrl: '/payslips/april_2026.pdf',
  },
  {
    id: 'sal_3',
    userId: 'user_3',
    month: 'March 2026',
    monthlySalary: 28000,
    attendanceRate: 100,
    overtimePay: 2400,
    bonus: 1500,
    deductions: 0,
    netPay: 31900,
    payslipUrl: '/payslips/march_2026.pdf',
  },
];

const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_1',
    title: 'New Safety Helmet Mandate',
    content: 'All pump attendants and supervisor staff must wear high-visibility vests and safety helmets during tanker decanting operations. Failure to comply will result in immediate shift suspension.',
    type: 'Safety',
    date: '2026-06-04',
    author: 'Rajesh Kumar (Owner)',
  },
  {
    id: 'ann_2',
    title: 'Holiday Roster Adjustments',
    content: 'Due to the upcoming national holiday on June 15, we will run on a Sunday shift roster. Please check your assigned shifts below. Double pay applies to all hours worked.',
    type: 'Holiday',
    date: '2026-06-02',
    author: 'Operations Desk',
  },
  {
    id: 'ann_3',
    title: 'Digital Reconciliation Training',
    content: 'A refresher training for the new FuelFlux digital shift reconciliation interface will be conducted on June 8 at 17:00. Attendance is mandatory for all cashiers and supervisors.',
    type: 'General',
    date: '2026-06-01',
    author: 'Suresh Patel (Admin)',
  },
  {
    id: 'ann_4',
    title: 'Tank 2 Maintenance Notice',
    content: 'Tank 2 (Speed Petrol) will undergo hydrotesting and cleaning starting June 6 00:00 to June 7 06:00. Only Tank 1 will be operational for petrol sales. Plan dispenser queues accordingly.',
    type: 'Urgent',
    date: '2026-06-05',
    author: 'Maintenance Supervisor',
  },
];

const SEED_SHIFTS: ShiftDetails[] = [
  {
    id: 'shift_1',
    userId: 'user_3',
    currentShift: {
      name: 'Afternoon Shift',
      startTime: '16:00',
      endTime: '00:00',
    },
    weeklySchedule: {
      Monday: { shiftType: 'Morning', time: '08:00 - 16:00' },
      Tuesday: { shiftType: 'Morning', time: '08:00 - 16:00' },
      Wednesday: { shiftType: 'Morning', time: '08:00 - 16:00' },
      Thursday: { shiftType: 'Afternoon', time: '16:00 - 00:00' },
      Friday: { shiftType: 'Afternoon', time: '16:00 - 00:00' },
      Saturday: { shiftType: 'Off', time: 'Rest Day' },
      Sunday: { shiftType: 'Off', time: 'Rest Day' },
    },
  },
];

// Safe window-check helper for Next.js SSR
const getStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  return null;
};

export const initializeDB = () => {
  const storage = getStorage();
  if (!storage) return;

  if (!storage.getItem(KEYS.USERS)) {
    storage.setItem(KEYS.USERS, JSON.stringify(SEED_USERS));
  }
  if (!storage.getItem(KEYS.OTPS)) {
    storage.setItem(KEYS.OTPS, JSON.stringify([]));
  }
  if (!storage.getItem(KEYS.PUMPS)) {
    storage.setItem(KEYS.PUMPS, JSON.stringify(SEED_PUMPS));
  }
  if (!storage.getItem(KEYS.LOGISTICS)) {
    storage.setItem(KEYS.LOGISTICS, JSON.stringify(SEED_LOGISTICS));
  }
  if (!storage.getItem(KEYS.INVESTORS)) {
    storage.setItem(KEYS.INVESTORS, JSON.stringify(SEED_INVESTORS));
  }
  if (!storage.getItem(KEYS.PAYMENTS)) {
    storage.setItem(KEYS.PAYMENTS, JSON.stringify(SEED_PAYMENTS));
  }
  if (!storage.getItem(KEYS.SUBSCRIPTIONS)) {
    storage.setItem(KEYS.SUBSCRIPTIONS, JSON.stringify(SEED_SUBSCRIPTIONS));
  }
  if (!storage.getItem(KEYS.AUDIT)) {
    storage.setItem(KEYS.AUDIT, JSON.stringify(SEED_AUDIT));
  }
  if (!storage.getItem(KEYS.TICKETS)) {
    storage.setItem(KEYS.TICKETS, JSON.stringify(SEED_TICKETS));
  }
  if (!storage.getItem(KEYS.ALERTS)) {
    storage.setItem(KEYS.ALERTS, JSON.stringify(SEED_ALERTS));
  }
  if (!storage.getItem(KEYS.EMPLOYEES)) {
    storage.setItem(KEYS.EMPLOYEES, JSON.stringify(SEED_EMPLOYEES));
  }
  if (!storage.getItem(KEYS.ATTENDANCE)) {
    storage.setItem(KEYS.ATTENDANCE, JSON.stringify(SEED_ATTENDANCE));
  }
  if (!storage.getItem(KEYS.LEAVES)) {
    storage.setItem(KEYS.LEAVES, JSON.stringify(SEED_LEAVES));
  }
  if (!storage.getItem(KEYS.SALARIES)) {
    storage.setItem(KEYS.SALARIES, JSON.stringify(SEED_SALARIES));
  }
  if (!storage.getItem(KEYS.ANNOUNCEMENTS)) {
    storage.setItem(KEYS.ANNOUNCEMENTS, JSON.stringify(SEED_ANNOUNCEMENTS));
  }
  if (!storage.getItem(KEYS.SHIFTS)) {
    storage.setItem(KEYS.SHIFTS, JSON.stringify(SEED_SHIFTS));
  }
};

// Helper methods to read/write custom collections

const getCollection = <T>(key: string): T[] => {
  const storage = getStorage();
  if (!storage) return [];
  initializeDB();
  const json = storage.getItem(key);
  return json ? JSON.parse(json) : [];
};

const saveCollection = <T>(key: string, data: T[]) => {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(key, JSON.stringify(data));
};

export const getUsers = (): User[] => getCollection<User>(KEYS.USERS);
export const saveUsers = (users: User[]) => saveCollection(KEYS.USERS, users);

export const getUserByEmailOrPhone = (identifier: string): User | null => {
  const users = getUsers();
  const lowerId = identifier.trim().toLowerCase();
  return (
    users.find(
      (u) =>
        u.id.toLowerCase() === lowerId ||
        u.email.toLowerCase() === lowerId ||
        u.phone === identifier.trim()
    ) || null
  );
};

export const registerUserInMockDB = (user: Omit<User, 'createdAt' | 'id'>): User => {
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    status: 'active',
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

export const getOTPs = (): OTPRecord[] => getCollection<OTPRecord>(KEYS.OTPS);
export const saveOTPs = (records: OTPRecord[]) => saveCollection(KEYS.OTPS, records);

export const generateAndStoreOTP = (
  identifier: string,
  type: 'sms' | 'email'
): string => {
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
  if (code === '123456') {
    console.log(`[Mock DB OTP] Dev Master Bypass triggered for ${identifier}`);
    return true;
  }
  const otps = getOTPs();
  const record = otps.find((o) => o.identifier === identifier && o.code === code);
  if (!record) return false;
  if (record.expiresAt < Date.now()) return false;
  const filtered = otps.filter((o) => !(o.identifier === identifier && o.code === code));
  saveOTPs(filtered);
  return true;
};

export const updatePasswordInMockDB = (identifier: string, newPasswordHash: string): boolean => {
  const users = getUsers();
  const lowerId = identifier.trim().toLowerCase();
  const userIndex = users.findIndex(
    (u) =>
      u.email.toLowerCase() === lowerId || u.phone === identifier.trim()
  );
  if (userIndex === -1) return false;
  users[userIndex].passwordHash = newPasswordHash;
  saveUsers(users);
  return true;
};

// Generic Pumps API getters/setters
export const getPumps = (): Pump[] => getCollection<Pump>(KEYS.PUMPS);
export const savePumps = (pumps: Pump[]) => saveCollection(KEYS.PUMPS, pumps);

// Generic Logistics Partners
export const getLogistics = (): LogisticsPartner[] => getCollection<LogisticsPartner>(KEYS.LOGISTICS);
export const saveLogistics = (logistics: LogisticsPartner[]) => saveCollection(KEYS.LOGISTICS, logistics);

// Generic Investors
export const getInvestors = (): Investor[] => getCollection<Investor>(KEYS.INVESTORS);
export const saveInvestors = (investors: Investor[]) => saveCollection(KEYS.INVESTORS, investors);

// Payments
export const getPayments = (): PaymentRecord[] => getCollection<PaymentRecord>(KEYS.PAYMENTS);
export const savePayments = (payments: PaymentRecord[]) => saveCollection(KEYS.PAYMENTS, payments);

// Subscriptions
export const getSubscriptions = (): SubscriptionRecord[] => getCollection<SubscriptionRecord>(KEYS.SUBSCRIPTIONS);
export const saveSubscriptions = (subs: SubscriptionRecord[]) => saveCollection(KEYS.SUBSCRIPTIONS, subs);

// Audit logs
export const getAuditLogs = (): AuditLog[] => getCollection<AuditLog>(KEYS.AUDIT);
export const saveAuditLogs = (logs: AuditLog[]) => saveCollection(KEYS.AUDIT, logs);

// Support tickets
export const getSupportTickets = (): SupportTicket[] => getCollection<SupportTicket>(KEYS.TICKETS);
export const saveSupportTickets = (tickets: SupportTicket[]) => saveCollection(KEYS.TICKETS, tickets);

// Fraud alerts
export const getFraudAlerts = (): FraudAlert[] => getCollection<FraudAlert>(KEYS.ALERTS);
export const saveFraudAlerts = (alerts: FraudAlert[]) => saveCollection(KEYS.ALERTS, alerts);

// Employee collections
export const getEmployees = (): EmployeeProfile[] => getCollection<EmployeeProfile>(KEYS.EMPLOYEES);
export const saveEmployees = (employees: EmployeeProfile[]) => saveCollection(KEYS.EMPLOYEES, employees);
export const getEmployeeProfile = (userId: string): EmployeeProfile | null => {
  const employees = getEmployees();
  return employees.find((e) => e.id === userId) || null;
};
export const updateEmployeeProfile = (userId: string, data: Partial<EmployeeProfile>): EmployeeProfile | null => {
  const employees = getEmployees();
  const idx = employees.findIndex((e) => e.id === userId);
  if (idx === -1) return null;
  employees[idx] = { ...employees[idx], ...data };
  saveEmployees(employees);
  return employees[idx];
};

export const getAttendance = (): AttendanceRecord[] => getCollection<AttendanceRecord>(KEYS.ATTENDANCE);
export const saveAttendance = (records: AttendanceRecord[]) => saveCollection(KEYS.ATTENDANCE, records);
export const getEmployeeAttendance = (userId: string): AttendanceRecord[] => {
  return getAttendance().filter((r) => r.userId === userId);
};

export const getLeaves = (): LeaveRecord[] => getCollection<LeaveRecord>(KEYS.LEAVES);
export const saveLeaves = (records: LeaveRecord[]) => saveCollection(KEYS.LEAVES, records);
export const getEmployeeLeaves = (userId: string): LeaveRecord[] => {
  return getLeaves().filter((r) => r.userId === userId);
};
export const applyLeaveInMockDB = (userId: string, record: Omit<LeaveRecord, 'id' | 'userId' | 'appliedDate' | 'status'>): LeaveRecord => {
  const leaves = getLeaves();
  const newLeave: LeaveRecord = {
    ...record,
    id: 'leave_' + Math.random().toString(36).substr(2, 9),
    userId,
    status: 'Pending',
    appliedDate: new Date().toISOString().split('T')[0],
    managerRemarks: '',
  };
  leaves.push(newLeave);
  saveLeaves(leaves);
  return newLeave;
};

export const getSalaries = (): SalaryRecord[] => getCollection<SalaryRecord>(KEYS.SALARIES);
export const saveSalaries = (salaries: SalaryRecord[]) => saveCollection(KEYS.SALARIES, salaries);
export const getEmployeeSalaries = (userId: string): SalaryRecord[] => {
  return getSalaries().filter((s) => s.userId === userId);
};

export const getAnnouncements = (): Announcement[] => getCollection<Announcement>(KEYS.ANNOUNCEMENTS);
export const saveAnnouncements = (announcements: Announcement[]) => saveCollection(KEYS.ANNOUNCEMENTS, announcements);

export const getShifts = (): ShiftDetails[] => getCollection<ShiftDetails>(KEYS.SHIFTS);
export const saveShifts = (shifts: ShiftDetails[]) => saveCollection(KEYS.SHIFTS, shifts);
export const getEmployeeShift = (userId: string): ShiftDetails | null => {
  const shifts = getShifts();
  return shifts.find((s) => s.userId === userId) || null;
};
