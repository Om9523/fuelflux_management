import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  getUserByEmailOrPhone,
  registerUserInMockDB,
  generateAndStoreOTP,
  verifyOTPInMockDB,
  updatePasswordInMockDB,
  User,
  Role,
  getPumps,
  savePumps,
  getLogistics,
  saveLogistics,
  getInvestors,
  saveInvestors,
  getPayments,
  savePayments,
  getSubscriptions,
  saveSubscriptions,
  getAuditLogs,
  saveAuditLogs,
  getSupportTickets,
  saveSupportTickets,
  getFraudAlerts,
  saveFraudAlerts,
  getUsers,
  saveUsers,
  Pump,
  LogisticsPartner,
  Investor,
  PaymentRecord,
  SubscriptionRecord,
  AuditLog,
  SupportTicket,
  FraudAlert,
  EmployeeProfile,
  AttendanceRecord,
  LeaveRecord,
  SalaryRecord,
  Announcement,
  ShiftDetails,
  getEmployeeProfile,
  updateEmployeeProfile,
  getEmployees,
  saveEmployees,
  getEmployeeAttendance,
  saveAttendance,
  getAttendance,
  getEmployeeLeaves,
  applyLeaveInMockDB,
  getEmployeeSalaries,
  getAnnouncements,
  getEmployeeShift,
  getShifts,
  saveShifts
} from './mock-db';

// Base API configuration
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock database token helpers
const getStoredToken = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(`fuelflux_${key}`);
  }
  return null;
};

const setStoredTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('fuelflux_accessToken', accessToken);
    localStorage.setItem('fuelflux_refreshToken', refreshToken);
  }
};

const clearStoredTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('fuelflux_accessToken');
    localStorage.removeItem('fuelflux_refreshToken');
    localStorage.removeItem('fuelflux_activeRole');
  }
};

// 1. Simulating JWT encoder helper (simple base64 representation of claims)
export const createFakeJWT = (payload: object, expiresInMinutes = 15): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(Date.now() / 1000) + expiresInMinutes * 60;
  const body = btoa(JSON.stringify({ ...payload, exp }));
  const signature = 'mock_signature_fuelflux_secret';
  return `${header}.${body}.${signature}`;
};

// Simulated JWT decoder helper to read expiration and claims
export const decodeFakeJWT = (token: string): any => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const bodyDecoded = atob(parts[1]);
    return JSON.parse(bodyDecoded);
  } catch (e) {
    return null;
  }
};

// 2. Custom Axios Adapter to intercept and mock server actions client-side
api.defaults.adapter = async (config: AxiosRequestConfig): Promise<AxiosResponse<any>> => {
  // Simulate network latency (800ms) for high-end feel & loader visibility
  await new Promise((resolve) => setTimeout(resolve, 800));

  const { url, method, data } = config;
  const parsedData = data ? (typeof data === 'string' ? JSON.parse(data) : data) : {};
  const authHeader = config.headers
    ? (typeof config.headers.get === 'function'
      ? config.headers.get('Authorization') as string
      : (config.headers as any)['Authorization'] || (config.headers as any)['authorization'])
    : undefined;

  // Extract simulated authorization token
  let tokenUser: any = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = decodeFakeJWT(token);
    if (decoded) {
      if (decoded.exp < Date.now() / 1000) {
        // Token has expired
        return Promise.reject({
          response: {
            status: 401,
            data: { error: { code: 'TOKEN_EXPIRED', message: 'JWT Access Token expired' } },
            config,
          },
        });
      }
      tokenUser = decoded;
    }
  }

  // MOCK API ROUTING LOGIC
  try {
    // ==========================================
    // ADMIN AUTHENTICATION ENDPOINTS
    // ==========================================
    if (url === '/admin/auth/login' && method?.toUpperCase() === 'POST') {
      const { emailOrPhone, password } = parsedData;
      let user = getUserByEmailOrPhone(emailOrPhone);

      if (!user) {
        user = registerUserInMockDB({
          name: emailOrPhone.split('@')[0],
          email: emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone}@fuelflux.com`,
          phone: emailOrPhone.includes('@') ? '9876543210' : emailOrPhone,
          passwordHash: password || 'password123',
          roles: ['admin'],
        });
      } else {
        if (!user.roles.includes('admin')) {
          user.roles.push('admin');
          const users = getUsers();
          const idx = users.findIndex((u) => u.id === user!.id);
          if (idx !== -1) {
            users[idx] = user;
            saveUsers(users);
          }
        }
        if (user.passwordHash !== password) {
          user.passwordHash = password;
          const users = getUsers();
          const idx = users.findIndex((u) => u.id === user!.id);
          if (idx !== -1) {
            users[idx] = user;
            saveUsers(users);
          }
        }
      }

      // Generate access token (exp: 30 mins) and refresh token (exp: 7 days)
      const accessToken = createFakeJWT({ id: user.id, roles: user.roles, activeRole: 'admin' }, 30);
      const refreshToken = createFakeJWT({ id: user.id }, 60 * 24 * 7);

      // Write administrative access audit log
      const auditLogs = getAuditLogs();
      auditLogs.push({
        id: 'audit_' + Math.random().toString(36).substr(2, 9),
        adminName: user.name,
        action: 'Authorized session via Credentials',
        entity: 'Admin Auth',
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.1',
        result: 'Success',
      });
      saveAuditLogs(auditLogs);

      return {
        data: {
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            roles: user.roles,
          },
          accessToken,
          refreshToken,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url === '/admin/auth/verify-2fa' && method?.toUpperCase() === 'POST') {
      const { email, code } = parsedData;
      const isValid = verifyOTPInMockDB(email, code);

      if (!isValid) {
        return Promise.reject({
          response: {
            status: 400,
            data: { error: { code: 'INVALID_OTP', message: 'Incorrect or expired 2FA code' } },
            config,
          },
        });
      }

      const user = getUserByEmailOrPhone(email);
      if (!user) {
        return Promise.reject({
          response: {
            status: 404,
            data: { error: { code: 'USER_NOT_FOUND', message: 'User record missing' } },
            config,
          },
        });
      }

      // Generate access token (exp: 30 mins) and refresh token (exp: 7 days)
      const accessToken = createFakeJWT({ id: user.id, roles: user.roles, activeRole: 'admin' }, 30);
      const refreshToken = createFakeJWT({ id: user.id }, 60 * 24 * 7);

      // Write administrative access audit log
      const auditLogs = getAuditLogs();
      auditLogs.push({
        id: 'audit_' + Math.random().toString(36).substr(2, 9),
        adminName: user.name,
        action: 'Authorized session via 2FA',
        entity: 'Admin Auth',
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.1',
        result: 'Success',
      });
      saveAuditLogs(auditLogs);

      return {
        data: {
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            roles: user.roles,
          },
          accessToken,
          refreshToken,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    // ==========================================
    // ADMIN PUMPS ENDPOINTS
    // ==========================================
    if (url === '/admin/pumps' && method?.toUpperCase() === 'GET') {
      const pumps = getPumps();
      return {
        data: { success: true, pumps },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url?.startsWith('/admin/pumps/') && method?.toUpperCase() === 'PATCH') {
      const pumpId = url.split('/').pop();
      const { status, actionBy } = parsedData;
      const pumps = getPumps();
      const pumpIndex = pumps.findIndex((p) => p.id === pumpId);

      if (pumpIndex === -1) {
        return Promise.reject({
          response: { status: 404, data: { error: { message: 'Pump not found' } }, config },
        });
      }

      const prevStatus = pumps[pumpIndex].status;
      pumps[pumpIndex].status = status;
      savePumps(pumps);

      // Audit it
      const auditLogs = getAuditLogs();
      auditLogs.push({
        id: 'audit_' + Math.random().toString(36).substr(2, 9),
        adminName: actionBy || 'Admin',
        action: `Updated pump status from '${prevStatus}' to '${status}' (#${pumpId})`,
        entity: 'Pump Management',
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.1',
        result: 'Success',
      });
      saveAuditLogs(auditLogs);

      return {
        data: { success: true, pump: pumps[pumpIndex] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    // ==========================================
    // ADMIN CUSTOMERS & FLEETS ENDPOINTS
    // ==========================================
    if (url === '/admin/owners' && method?.toUpperCase() === 'GET') {
      const users = getUsers().filter((u) => u.roles.includes('pump_owner'));
      const pumps = getPumps();

      const owners = users.map((u) => {
        const ownerPumps = pumps.filter((p) => p.ownerId === u.id);
        const revenue = ownerPumps.reduce((sum, p) => sum + p.revenue, 0);
        const subActive = ownerPumps.some((p) => p.subscriptionStatus === 'active') ? 'active' : 'none';
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          pumpCount: ownerPumps.length,
          subscriptionStatus: subActive,
          revenueContribution: revenue,
          createdAt: u.createdAt,
        };
      });

      return {
        data: { success: true, owners },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url === '/admin/logistics' && method?.toUpperCase() === 'GET') {
      const logistics = getLogistics();
      return {
        data: { success: true, logistics },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url === '/admin/investors' && method?.toUpperCase() === 'GET') {
      const investors = getInvestors();
      return {
        data: { success: true, investors },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    // ==========================================
    // ADMIN USERS & ROLES ENDPOINTS
    // ==========================================
    if (url === '/admin/users' && method?.toUpperCase() === 'GET') {
      const users = getUsers();
      return {
        data: { success: true, users },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url?.startsWith('/admin/users/') && method?.toUpperCase() === 'PATCH') {
      const userId = url.split('/').pop();
      const { status, roles, actionBy } = parsedData;
      const users = getUsers();
      const userIndex = users.findIndex((u) => u.id === userId);

      if (userIndex === -1) {
        return Promise.reject({
          response: { status: 404, data: { error: { message: 'User not found' } }, config },
        });
      }

      if (status) users[userIndex].status = status;
      if (roles) users[userIndex].roles = roles;
      saveUsers(users);

      const auditLogs = getAuditLogs();
      auditLogs.push({
        id: 'audit_' + Math.random().toString(36).substr(2, 9),
        adminName: actionBy || 'Admin',
        action: `Updated user profile/status (#${userId})`,
        entity: 'User Management',
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.1',
        result: 'Success',
      });
      saveAuditLogs(auditLogs);

      return {
        data: { success: true, user: users[userIndex] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    // ==========================================
    // ADMIN FINANCES ENDPOINTS
    // ==========================================
    if (url === '/admin/subscriptions' && method?.toUpperCase() === 'GET') {
      const subscriptions = getSubscriptions();
      return {
        data: { success: true, subscriptions },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url === '/admin/payments' && method?.toUpperCase() === 'GET') {
      const payments = getPayments();
      return {
        data: { success: true, payments },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url?.startsWith('/admin/payments/') && method?.toUpperCase() === 'PATCH') {
      const txId = url.split('/').pop();
      const { status, actionBy } = parsedData;
      const payments = getPayments();
      const payIndex = payments.findIndex((p) => p.id === txId);

      if (payIndex === -1) {
        return Promise.reject({
          response: { status: 404, data: { error: { message: 'Payment record missing' } }, config },
        });
      }

      payments[payIndex].status = status;
      savePayments(payments);

      const auditLogs = getAuditLogs();
      auditLogs.push({
        id: 'audit_' + Math.random().toString(36).substr(2, 9),
        adminName: actionBy || 'Admin',
        action: `Updated transaction status to '${status}' (#${txId})`,
        entity: 'Payments Monitor',
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.1',
        result: 'Success',
      });
      saveAuditLogs(auditLogs);

      return {
        data: { success: true, payment: payments[payIndex] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    // ==========================================
    // ADMIN AUDIT & FRAUD SECURITY ENDPOINTS
    // ==========================================
    if (url === '/admin/audit-logs' && method?.toUpperCase() === 'GET') {
      const auditLogs = getAuditLogs();
      return {
        data: { success: true, auditLogs },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url === '/admin/fraud-alerts' && method?.toUpperCase() === 'GET') {
      const fraudAlerts = getFraudAlerts();
      return {
        data: { success: true, fraudAlerts },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url?.startsWith('/admin/fraud-alerts/') && method?.toUpperCase() === 'PATCH') {
      const alertId = url.split('/').pop();
      const { status } = parsedData;
      const alerts = getFraudAlerts();
      const alertIndex = alerts.findIndex((a) => a.id === alertId);

      if (alertIndex === -1) {
        return Promise.reject({
          response: { status: 404, data: { error: { message: 'Alert not found' } }, config },
        });
      }

      alerts[alertIndex].status = status;
      saveFraudAlerts(alerts);

      return {
        data: { success: true, alert: alerts[alertIndex] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    // ==========================================
    // ADMIN SUPPORT SYSTEM ENDPOINTS
    // ==========================================
    if (url === '/admin/support/tickets' && method?.toUpperCase() === 'GET') {
      const tickets = getSupportTickets();
      return {
        data: { success: true, tickets },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url?.startsWith('/admin/support/tickets/') && method?.toUpperCase() === 'POST') {
      // POST message (reply) or status update
      const ticketId = url.split('/').pop();
      const { message, status, senderName, assignedAgent } = parsedData;
      const tickets = getSupportTickets();
      const tIndex = tickets.findIndex((t) => t.id === ticketId);

      if (tIndex === -1) {
        return Promise.reject({
          response: { status: 404, data: { error: { message: 'Support ticket not found' } }, config },
        });
      }

      if (message) {
        tickets[tIndex].messages.push({
          sender: 'admin',
          senderName: senderName || 'Admin Agent',
          message,
          timestamp: new Date().toISOString(),
        });
      }

      if (status) tickets[tIndex].status = status;
      if (assignedAgent) tickets[tIndex].assignedAgent = assignedAgent;

      saveSupportTickets(tickets);

      return {
        data: { success: true, ticket: tickets[tIndex] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    // ==========================================
    // STANDARD USER ENDPOINTS
    // ==========================================
    if (url === '/auth/login' && method?.toUpperCase() === 'POST') {
      const { emailOrPhone, password, rememberMe } = parsedData;
      const user = getUserByEmailOrPhone(emailOrPhone);

      if (!user || user.passwordHash !== password) {
        return Promise.reject({
          response: {
            status: 400,
            data: { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email/phone or password' } },
            config,
          },
        });
      }

      const accessToken = createFakeJWT({ id: user.id, roles: user.roles }, 15);
      const refreshToken = createFakeJWT({ id: user.id }, 60 * 24 * 7);

      return {
        data: {
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            roles: user.roles,
          },
          accessToken,
          refreshToken,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url === '/auth/refresh' && method?.toUpperCase() === 'POST') {
      const { refreshToken } = parsedData;
      const decoded = decodeFakeJWT(refreshToken);
      if (!decoded || decoded.exp < Date.now() / 1000) {
        return Promise.reject({
          response: {
            status: 401,
            data: { error: { code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token expired or invalid' } },
            config,
          },
        });
      }
      const user = getUserByEmailOrPhone(decoded.id);
      if (!user) {
        return Promise.reject({
          response: {
            status: 401,
            data: { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
            config,
          },
        });
      }
      const newAccessToken = createFakeJWT({ id: user.id, roles: user.roles }, 15);
      const newRefreshToken = createFakeJWT({ id: user.id }, 60 * 24 * 7);
      return {
        data: {
          success: true,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url === '/auth/register' && method?.toUpperCase() === 'POST') {
      const { name, email, phone, password, roles } = parsedData;
      const existing = getUserByEmailOrPhone(email) || getUserByEmailOrPhone(phone);

      if (existing) {
        return Promise.reject({
          response: {
            status: 400,
            data: { error: { code: 'USER_EXISTS', message: 'User with this email or phone already exists' } },
            config,
          },
        });
      }

      generateAndStoreOTP(email, 'email');
      generateAndStoreOTP(phone, 'sms');

      const user = registerUserInMockDB({
        name,
        email,
        phone,
        passwordHash: password,
        roles: roles || ['pump_owner'],
      });

      return {
        data: {
          success: true,
          message: 'OTP codes sent successfully. Please verify to activate.',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            roles: user.roles,
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url === '/auth/verify-otp' && method?.toUpperCase() === 'POST') {
      const { identifier, code } = parsedData;
      const isValid = verifyOTPInMockDB(identifier, code);

      if (!isValid) {
        return Promise.reject({
          response: {
            status: 400,
            data: { error: { code: 'INVALID_OTP', message: 'Incorrect or expired OTP' } },
            config,
          },
        });
      }

      return {
        data: { success: true, message: 'OTP verified successfully' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url === '/auth/resend-otp' && method?.toUpperCase() === 'POST') {
      const { identifier, type } = parsedData;
      generateAndStoreOTP(identifier, type || 'email');

      return {
        data: { success: true, message: `OTP code sent to ${identifier}` },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url === '/auth/forgot-password-request' && method?.toUpperCase() === 'POST') {
      const { emailOrPhone } = parsedData;
      const user = getUserByEmailOrPhone(emailOrPhone);

      if (!user) {
        return Promise.reject({
          response: {
            status: 404,
            data: { error: { code: 'USER_NOT_FOUND', message: 'No registered account found with that email/phone' } },
            config,
          },
        });
      }

      generateAndStoreOTP(emailOrPhone, emailOrPhone.includes('@') ? 'email' : 'sms');

      return {
        data: { success: true, message: 'Password reset code sent' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url === '/auth/reset-password' && method?.toUpperCase() === 'POST') {
      const { emailOrPhone, password } = parsedData;
      const success = updatePasswordInMockDB(emailOrPhone, password);

      if (!success) {
        return Promise.reject({
          response: {
            status: 400,
            data: { error: { code: 'RESET_FAILED', message: 'Could not reset password. Account not found.' } },
            config,
          },
        });
      }

      return {
        data: { success: true, message: 'Password has been reset successfully' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url === '/auth/select-role' && method?.toUpperCase() === 'POST') {
      if (!tokenUser) {
        return Promise.reject({
          response: {
            status: 401,
            data: { error: { code: 'UNAUTHORIZED', message: 'Login is required' } },
            config,
          },
        });
      }

      const { role } = parsedData;
      const user = getUserByEmailOrPhone(tokenUser.id);
      
      if (!user) {
        return Promise.reject({
          response: {
            status: 403,
            data: { error: { code: 'FORBIDDEN_ROLE', message: 'User does not possess this role' } },
            config,
          },
        });
      }

      if (!user.roles.includes(role as Role)) {
        user.roles.push(role as Role);
      }

      const newAccessToken = createFakeJWT(
        { id: user.id, roles: user.roles, activeRole: role },
        15
      );

      return {
        data: {
          success: true,
          accessToken: newAccessToken,
          activeRole: role,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url === '/auth/refresh' && method?.toUpperCase() === 'POST') {
      const { refreshToken } = parsedData;
      const decoded = decodeFakeJWT(refreshToken);

      if (!decoded || decoded.exp < Date.now() / 1000) {
        return Promise.reject({
          response: {
            status: 401,
            data: { error: { code: 'REFRESH_EXPIRED', message: 'Session expired. Please log in again.' } },
            config,
          },
        });
      }

      const user = getUserByEmailOrPhone(decoded.id);
      if (!user) {
        return Promise.reject({
          response: {
            status: 401,
            data: { error: { code: 'INVALID_SESSION', message: 'User not found in database' } },
            config,
          },
        });
      }

      const newAccessToken = createFakeJWT({ id: user.id, roles: user.roles }, 15);
      const newRefreshToken = createFakeJWT({ id: user.id }, 60 * 24 * 7);

      return {
        data: {
          success: true,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    // ==========================================
    // EMPLOYEE SELF-SERVICE ENDPOINTS
    // ==========================================
    if (url === '/employee/profile' && method?.toUpperCase() === 'GET') {
      if (!tokenUser) {
        return Promise.reject({
          response: { status: 401, data: { error: { message: 'Unauthorized session context' } }, config },
        });
      }
      const userId = tokenUser.id;
      let profile = getEmployeeProfile(userId);
      const user = getUserByEmailOrPhone(userId);
      if (!user) {
        return Promise.reject({
          response: { status: 404, data: { error: { message: 'User not found' } }, config },
        });
      }
      if (!profile) {
        // Create default profile for the user
        const newProfile: EmployeeProfile = {
          id: userId,
          employeeId: 'EMP-' + Math.floor(1000 + Math.random() * 9000),
          designation: 'Fuel Attendant',
          assignedPump: 'Bharat Petroleum Sector 62',
          joiningDate: new Date().toISOString().split('T')[0],
          photoUrl: '',
          metrics: {
            transactionsHandled: 0,
            attendanceScore: 100,
            performanceScore: 80,
          }
        };
        const employees = getEmployees();
        employees.push(newProfile);
        saveEmployees(employees);
        profile = newProfile;
      }
      return {
        data: { success: true, profile, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, roles: user.roles } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url === '/employee/profile' && method?.toUpperCase() === 'PATCH') {
      if (!tokenUser) {
        return Promise.reject({
          response: { status: 401, data: { error: { message: 'Unauthorized session context' } }, config },
        });
      }
      const userId = tokenUser.id;
      const { name, email, phone, designation, photoUrl } = parsedData;

      // Update User table
      const users = getUsers();
      const uIdx = users.findIndex((u) => u.id === userId);
      if (uIdx !== -1) {
        if (name) users[uIdx].name = name;
        if (email) users[uIdx].email = email;
        if (phone) users[uIdx].phone = phone;
        saveUsers(users);
      }

      // Update Employee table
      const profile = updateEmployeeProfile(userId, {
        ...(designation && { designation }),
        ...(photoUrl !== undefined && { photoUrl }),
      });

      return {
        data: { success: true, profile },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url === '/employee/change-password' && method?.toUpperCase() === 'POST') {
      if (!tokenUser) {
        return Promise.reject({
          response: { status: 401, data: { error: { message: 'Unauthorized session context' } }, config },
        });
      }
      const userId = tokenUser.id;
      const { currentPassword, newPassword } = parsedData;
      const user = getUserByEmailOrPhone(userId);
      if (!user || user.passwordHash !== currentPassword) {
        return Promise.reject({
          response: { status: 400, data: { error: { message: 'Current password is incorrect' } }, config },
        });
      }
      updatePasswordInMockDB(user.email, newPassword);
      return {
        data: { success: true, message: 'Password updated successfully' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url === '/employee/attendance' && method?.toUpperCase() === 'GET') {
      if (!tokenUser) {
        return Promise.reject({
          response: { status: 401, data: { error: { message: 'Unauthorized session context' } }, config },
        });
      }
      const records = getEmployeeAttendance(tokenUser.id);
      return {
        data: { success: true, records },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url === '/employee/attendance/check-in' && method?.toUpperCase() === 'POST') {
      if (!tokenUser) {
        return Promise.reject({
          response: { status: 401, data: { error: { message: 'Unauthorized' } }, config },
        });
      }
      const userId = tokenUser.id;
      const today = new Date().toISOString().split('T')[0];
      const records = getAttendance();
      
      // Check if already checked in today
      const already = records.find((r) => r.userId === userId && r.date === today);
      if (already) {
        return Promise.reject({
          response: { status: 400, data: { error: { message: 'Already checked in today' } }, config },
        });
      }

      const now = new Date();
      const checkInTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      
      // Determine if late (shift starts at 08:00, grace period until 08:15)
      const [hours, mins] = checkInTime.split(':').map(Number);
      const isLate = (hours > 8) || (hours === 8 && mins > 15);
      const status = isLate ? 'Late' : 'Present';

      const newRecord: AttendanceRecord = {
        id: 'att_' + Math.random().toString(36).substr(2, 9),
        userId,
        date: today,
        checkIn: checkInTime,
        checkOut: null,
        workingHours: 0,
        status,
      };

      records.push(newRecord);
      saveAttendance(records);

      return {
        data: { success: true, record: newRecord },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url === '/employee/attendance/check-out' && method?.toUpperCase() === 'POST') {
      if (!tokenUser) {
        return Promise.reject({
          response: { status: 401, data: { error: { message: 'Unauthorized' } }, config },
        });
      }
      const userId = tokenUser.id;
      const today = new Date().toISOString().split('T')[0];
      const records = getAttendance();
      const idx = records.findIndex((r) => r.userId === userId && r.date === today);
      
      if (idx === -1 || records[idx].checkIn === null) {
        return Promise.reject({
          response: { status: 400, data: { error: { message: 'You have not checked in today yet' } }, config },
        });
      }

      if (records[idx].checkOut !== null) {
        return Promise.reject({
          response: { status: 400, data: { error: { message: 'Already checked out today' } }, config },
        });
      }

      const now = new Date();
      const checkOutTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      
      // Calculate working hours
      const checkInTimeStr = records[idx].checkIn!;
      const [inH, inM] = checkInTimeStr.split(':').map(Number);
      const [outH, outM] = checkOutTime.split(':').map(Number);
      const checkInTotalMins = inH * 60 + inM;
      const checkOutTotalMins = outH * 60 + outM;
      
      let minsDiff = checkOutTotalMins - checkInTotalMins;
      if (minsDiff < 0) minsDiff += 24 * 60; // crossover midnight shift
      const workingHours = parseFloat((minsDiff / 60).toFixed(2));

      records[idx].checkOut = checkOutTime;
      records[idx].workingHours = workingHours;
      saveAttendance(records);

      return {
        data: { success: true, record: records[idx] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url === '/employee/shifts' && method?.toUpperCase() === 'GET') {
      if (!tokenUser) {
        return Promise.reject({
          response: { status: 401, data: { error: { message: 'Unauthorized' } }, config },
        });
      }
      let shift = getEmployeeShift(tokenUser.id);
      if (!shift) {
        // Create default shift
        const newShift: ShiftDetails = {
          id: 'shift_' + Math.random().toString(36).substr(2, 9),
          userId: tokenUser.id,
          currentShift: { name: 'Morning Shift', startTime: '08:00', endTime: '16:00' },
          weeklySchedule: {
            Monday: { shiftType: 'Morning', time: '08:00 - 16:00' },
            Tuesday: { shiftType: 'Morning', time: '08:00 - 16:00' },
            Wednesday: { shiftType: 'Morning', time: '08:00 - 16:00' },
            Thursday: { shiftType: 'Morning', time: '08:00 - 16:00' },
            Friday: { shiftType: 'Morning', time: '08:00 - 16:00' },
            Saturday: { shiftType: 'Off', time: 'Rest Day' },
            Sunday: { shiftType: 'Off', time: 'Rest Day' },
          }
        };
        const shifts = getShifts();
        shifts.push(newShift);
        saveShifts(shifts);
        shift = newShift;
      }
      return {
        data: { success: true, shift },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url === '/employee/leave' && method?.toUpperCase() === 'GET') {
      if (!tokenUser) {
        return Promise.reject({
          response: { status: 401, data: { error: { message: 'Unauthorized' } }, config },
        });
      }
      const records = getEmployeeLeaves(tokenUser.id);
      return {
        data: { success: true, records },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url === '/employee/leave/apply' && method?.toUpperCase() === 'POST') {
      if (!tokenUser) {
        return Promise.reject({
          response: { status: 401, data: { error: { message: 'Unauthorized' } }, config },
        });
      }
      const { leaveType, startDate, endDate, reason } = parsedData;
      const record = applyLeaveInMockDB(tokenUser.id, { leaveType, startDate, endDate, reason });
      return {
        data: { success: true, record },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url === '/employee/salary' && method?.toUpperCase() === 'GET') {
      if (!tokenUser) {
        return Promise.reject({
          response: { status: 401, data: { error: { message: 'Unauthorized' } }, config },
        });
      }
      const records = getEmployeeSalaries(tokenUser.id);
      return {
        data: { success: true, records },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    if (url === '/employee/announcements' && method?.toUpperCase() === 'GET') {
      if (!tokenUser) {
        return Promise.reject({
          response: { status: 401, data: { error: { message: 'Unauthorized' } }, config },
        });
      }
      const records = getAnnouncements();
      return {
        data: { success: true, records },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    // Default Fallback
    return Promise.reject({
      response: {
        status: 404,
        data: { error: { code: 'NOT_FOUND', message: `Endpoint ${url} not found` } },
        config,
      },
    });
  } catch (error: any) {
    return Promise.reject(error);
  }
};

// 3. Request interceptor: Attach access token from local storage
api.interceptors.request.use(
  (config) => {
    const isAdminUrl = config.url?.startsWith('/admin');
    const token = getStoredToken(isAdminUrl ? 'admin_accessToken' : 'accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 4. Response interceptor: Handle automatic session refreshing on 401 Unauthorized
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || error.response?.config;
    
    // Check if error is 401 and not a retry already
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const errorCode = error.response.data?.error?.code;

      // Don't refresh if the refresh endpoint itself failed
      if (originalRequest.url === '/auth/refresh') {
        clearStoredTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login?expired=true';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const isAdminUrl = originalRequest.url?.startsWith('/admin');

      try {
        const rToken = getStoredToken(isAdminUrl ? 'admin_refreshToken' : 'refreshToken');
        if (!rToken) {
          throw new Error('No refresh token available');
        }

        // Post refresh request to our mock endpoint
        const response = await api.post('/auth/refresh', { refreshToken: rToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        if (isAdminUrl) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('fuelflux_admin_accessToken', accessToken);
            localStorage.setItem('fuelflux_admin_refreshToken', newRefreshToken);
            // Also update the admin cookie for the server-side middleware
            document.cookie = `fuelflux_admin_accessToken=${accessToken};max-age=1800;path=/;SameSite=Lax`;
          }
        } else {
          setStoredTokens(accessToken, newRefreshToken);
        }
        processQueue(null, accessToken);
        
        originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        if (isAdminUrl) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('fuelflux_admin_accessToken');
            localStorage.removeItem('fuelflux_admin_refreshToken');
            localStorage.removeItem('fuelflux_admin_user');
            document.cookie = 'fuelflux_admin_accessToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax';
            window.location.href = '/admin/login?expired=true';
          }
        } else {
          clearStoredTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login?expired=true';
          }
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Centralized error formatter
    const formattedError = {
      message: error.response?.data?.error?.message || error.message || 'An unexpected error occurred',
      code: error.response?.data?.error?.code || 'API_ERROR',
      status: error.response?.status || 500,
    };
    
    return Promise.reject(formattedError);
  }
);
