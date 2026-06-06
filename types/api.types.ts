// User and Authentication Types
export interface UserData {
  id: number;
  email: string;
  phone: string;
  name: string;
  roles: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'pump_owner' | 'logistic' | 'investor' | 'employee';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: UserData;
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Request/Response Interfaces for auth endpoints
export interface LoginCredentials {
  email?: string;
  phone?: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  phone: string;
  name: string;
  password: string;
}

export interface OTPRequest {
  email?: string;
  phone?: string;
}

export interface VerifyOTPRequest {
  email?: string;
  phone?: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email?: string;
  phone?: string;
  password: string;
  token: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken?: string;
  };
}

// Dashboard & Business Models
export interface Station {
  id: number;
  name: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  owner_id: number;
  status: 'active' | 'inactive' | 'maintenance';
  fuel_in_stock: number;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: number;
  registration_number: string;
  vehicle_type: string;
  owner_id: number;
  capacity: number;
  fuel_type: string;
  last_service_date: string;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  transaction_type: 'sale' | 'purchase' | 'transfer';
  user_id: number;
  station_id?: number;
  amount: number;
  fuel_quantity: number;
  transaction_date: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: number;
  user_id: number;
  station_id: number;
  designation: string;
  hire_date: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: number;
  user_id: number;
  balance: number;
  currency: string;
  last_updated: string;
  created_at: string;
}
