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
}

export interface OTPRecord {
  identifier: string; // email or phone
  code: string;
  type: 'sms' | 'email';
  expiresAt: number;
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
  },
  {
    id: 'user_2',
    name: 'Vikram Singh',
    email: 'logistic@fuelflux.com',
    phone: '9876543211',
    passwordHash: 'password123',
    roles: ['logistic', 'investor'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_3',
    name: 'Anjali Sharma',
    email: 'multi@fuelflux.com',
    phone: '9876543212',
    passwordHash: 'password123',
    roles: ['pump_owner', 'logistic', 'employee', 'investor'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_4',
    name: 'Suresh Patel',
    email: 'admin@fuelflux.com',
    phone: '9876543213',
    passwordHash: 'password123',
    roles: ['admin'],
    createdAt: new Date().toISOString(),
  },
];

const KEYS = {
  USERS: 'fuelflux_users',
  OTPS: 'fuelflux_otps',
};

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
};

export const getUsers = (): User[] => {
  const storage = getStorage();
  if (!storage) return [];
  initializeDB();
  const usersJson = storage.getItem(KEYS.USERS);
  return usersJson ? JSON.parse(usersJson) : [];
};

export const saveUsers = (users: User[]) => {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(KEYS.USERS, JSON.stringify(users));
};

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
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

export const getOTPs = (): OTPRecord[] => {
  const storage = getStorage();
  if (!storage) return [];
  const otpsJson = storage.getItem(KEYS.OTPS);
  return otpsJson ? JSON.parse(otpsJson) : [];
};

export const saveOTPs = (records: OTPRecord[]) => {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(KEYS.OTPS, JSON.stringify(records));
};

export const generateAndStoreOTP = (
  identifier: string,
  type: 'sms' | 'email'
): string => {
  // Generate random 6 digit OTP code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const otps = getOTPs();
  
  // Expiry time set to 5 minutes
  const expiresAt = Date.now() + 5 * 60 * 1000;

  // Filter out any existing OTPs for this identifier
  const filtered = otps.filter((o) => o.identifier !== identifier);
  filtered.push({ identifier, code, type, expiresAt });
  
  saveOTPs(filtered);
  
  console.log(`[Mock DB OTP] Generated ${type} OTP for ${identifier}: ${code}`);
  return code;
};

export const verifyOTPInMockDB = (identifier: string, code: string): boolean => {
  // Developer master bypass passcode '123456' for immediate manual testing checking
  if (code === '123456') {
    console.log(`[Mock DB OTP] Dev Master Bypass triggered for ${identifier}`);
    return true;
  }

  const otps = getOTPs();
  const record = otps.find((o) => o.identifier === identifier && o.code === code);
  
  if (!record) return false;
  if (record.expiresAt < Date.now()) {
    // OTP expired
    return false;
  }
  
  // Success, clean up OTP record
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
