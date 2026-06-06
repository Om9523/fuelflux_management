import axios, { AxiosInstance, AxiosError } from 'axios';
import { z } from 'zod';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

// Validation schemas for security
const UserDataSchema = z.object({
  id: z.number().positive('Invalid user ID'),
  email: z.string().email('Invalid email'),
  phone: z.string(),
  name: z.string(),
  roles: z.array(z.string()).min(1, 'User must have at least one role'),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

const AuthDataSchema = z.object({
  accessToken: z.string().min(10, 'Invalid access token'),
  refreshToken: z.string().min(10, 'Invalid refresh token'),
  user: UserDataSchema,
});

const TokenResponseSchema = z.object({
  accessToken: z.string().min(10, 'Invalid access token'),
  refreshToken: z.string().min(10, 'Invalid refresh token').optional(),
});

export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: UserData;
  };
  message?: string;
}

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

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken?: string;
  };
  message?: string;
}

export interface RegisterRequest {
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
  token: string; // OTP or reset token
}

/**
 * Helper function to safely extract and validate auth data from response
 * Supports flexible response structures with strict validation
 */
function validateAndExtractAuthData(responseData: any): {
  accessToken: string;
  refreshToken: string;
  user: UserData;
} {
  try {
    let data: any;

    // Try nested structure first: { success, data: { accessToken, ... } }
    if (responseData.data?.accessToken) {
      data = responseData.data;
    }
    // Try flat structure: { accessToken, ... }
    else if (responseData.accessToken) {
      data = responseData;
    } else {
      throw new Error('Response does not contain accessToken at expected location');
    }

    // Validate with Zod schema
    const validatedData = AuthDataSchema.parse(data);
    return validatedData;
  } catch (error: any) {
    console.error('Auth data validation failed:', error);
    throw new Error(`Invalid auth response from backend: ${error.message}`);
  }
}

/**
 * Helper function to validate and extract token data (for refresh endpoint)
 */
function validateAndExtractTokenData(
  responseData: any
): { accessToken: string; refreshToken: string } {
  try {
    let data: any;

    // Try nested structure
    if (responseData.data?.accessToken) {
      data = responseData.data;
    }
    // Try flat structure
    else if (responseData.accessToken) {
      data = responseData;
    } else {
      throw new Error('Response does not contain accessToken at expected location');
    }

    // Validate with Zod schema
    const validatedData = TokenResponseSchema.parse(data);
    return {
      accessToken: validatedData.accessToken,
      refreshToken: validatedData.refreshToken || '',
    };
  } catch (error: any) {
    console.error('Token data validation failed:', error);
    throw new Error(`Invalid token response from backend: ${error.message}`);
  }
}

class AuthService {
  private api: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Request interceptor - add token to headers
    this.api.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // If 401 and token refresh hasn't been attempted yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh token
            const newTokens = await this.refreshAccessToken();
            this.setTokens(newTokens.accessToken, newTokens.refreshToken);

            // Retry original request with new token
            if (this.accessToken) {
              originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
            }
            return this.api(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            this.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // Load tokens from storage on initialization
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage(): void {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('fuelflux_accessToken');
      this.refreshToken = localStorage.getItem('fuelflux_refreshToken');
    }
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    if (typeof window !== 'undefined') {
      localStorage.setItem('fuelflux_accessToken', accessToken);
      localStorage.setItem('fuelflux_refreshToken', refreshToken);
    }
  }

  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;

    if (typeof window !== 'undefined') {
      localStorage.removeItem('fuelflux_accessToken');
      localStorage.removeItem('fuelflux_refreshToken');
      localStorage.removeItem('fuelflux_user');
      localStorage.removeItem('fuelflux_activeRole');
    }
  }

  private async refreshAccessToken(): Promise<{ accessToken: string; refreshToken: string }> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post<any>(
        `${API_URL}/auth/refresh`,
        { refreshToken: this.refreshToken },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }
      );

      // Log response for debugging
      console.log('Refresh Response:', response.data);

      // Validate and extract with Zod schema
      const { accessToken, refreshToken } = validateAndExtractTokenData(response.data);

      return {
        accessToken,
        refreshToken: refreshToken || this.refreshToken,
      };
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  async login(emailOrPhone: string, password: string): Promise<AuthResponse['data']> {
    try {
      // Determine if input is email or phone
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);
      const payload: LoginRequest = {
        password,
        ...(isEmail ? { email: emailOrPhone } : { phone: emailOrPhone }),
      };

      const response = await this.api.post<any>('/auth/login', payload);

      // Log response for debugging
      console.log('Login Response:', response.data);

      // Validate and extract with Zod schema
      const { accessToken, refreshToken, user } = validateAndExtractAuthData(response.data);

      this.setTokens(accessToken, refreshToken);

      if (typeof window !== 'undefined') {
        localStorage.setItem('fuelflux_user', JSON.stringify(user));
      }

      return { accessToken, refreshToken, user };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Login failed. Please try again.'
      );
    }
  }

  async register(data: RegisterRequest): Promise<AuthResponse['data']> {
    try {
      const response = await this.api.post<any>('/auth/register', data);

      // Log response for debugging
      console.log('Register Response:', response.data);

      const responseData = response.data;
      let accessToken: string;
      let refreshToken: string;
      let user: UserData;

      // Try to extract from different possible structures
      if (responseData.data?.accessToken) {
        accessToken = responseData.data.accessToken;
        refreshToken = responseData.data.refreshToken;
        user = responseData.data.user;
      } else if (responseData.accessToken) {
        accessToken = responseData.accessToken;
        refreshToken = responseData.refreshToken;
        user = responseData.user;
      } else {
        throw new Error('Invalid response structure from backend');
      }

      if (!accessToken || !refreshToken || !user) {
        throw new Error('Missing required fields in response');
      }

      this.setTokens(accessToken, refreshToken);

      if (typeof window !== 'undefined') {
        localStorage.setItem('fuelflux_user', JSON.stringify(user));
      }

      return { accessToken, refreshToken, user };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Registration failed. Please try again.'
      );
    }
  }

  async sendOTP(data: OTPRequest): Promise<{ message: string }> {
    try {
      const response = await this.api.post('/auth/send-otp', data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to send OTP');
      }

      return { message: response.data.message || 'OTP sent successfully' };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to send OTP. Please try again.'
      );
    }
  }

  async verifyOTP(data: VerifyOTPRequest): Promise<{ message: string }> {
    try {
      const response = await this.api.post('/auth/verify-otp', data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Invalid OTP');
      }

      return { message: response.data.message || 'OTP verified successfully' };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'OTP verification failed. Please try again.'
      );
    }
  }

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    try {
      const response = await this.api.post('/auth/reset-password', data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Password reset failed');
      }

      return { message: response.data.message || 'Password reset successfully' };
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Password reset failed. Please try again.'
      );
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      // Even if logout fails, clear local tokens
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getApi(): AxiosInstance {
    return this.api;
  }
}

// Export singleton instance
export const authService = new AuthService();
