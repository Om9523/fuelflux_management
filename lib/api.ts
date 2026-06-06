import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  getUserByEmailOrPhone,
  registerUserInMockDB,
  generateAndStoreOTP,
  verifyOTPInMockDB,
  updatePasswordInMockDB,
  User,
  Role,
} from './mock-db';

// Base API configuration
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock database token helpers
const getStoredToken = (key: 'accessToken' | 'refreshToken'): string | null => {
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
  const authHeader = config.headers?.Authorization as string;

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
    // A. LOGIN ENDPOINT
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

      // Generate access token (exp: 15 mins) and refresh token (exp: 7 days)
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

    // B. REGISTER ENDPOINT
    if (url === '/auth/register' && method?.toUpperCase() === 'POST') {
      const { name, email, phone, password, roles } = parsedData;
      
      // Check duplicate
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

      // First, trigger a mock OTP code in LocalStorage for this signup phone & email
      generateAndStoreOTP(email, 'email');
      generateAndStoreOTP(phone, 'sms');

      // Temporarily store register payload in session or mock database
      // In this system, we register the user, but require verification to activate or just standard flow.
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

    // C. OTP VERIFY ENDPOINT
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

    // D. OTP RESEND ENDPOINT
    if (url === '/auth/resend-otp' && method?.toUpperCase() === 'POST') {
      const { identifier, type } = parsedData;
      const code = generateAndStoreOTP(identifier, type || 'email');

      return {
        data: { success: true, message: `OTP code sent to ${identifier}` },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    // E. FORGOT PASSWORD REQUEST
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

      // Generate verification code
      generateAndStoreOTP(emailOrPhone, emailOrPhone.includes('@') ? 'email' : 'sms');

      return {
        data: { success: true, message: 'Password reset code sent' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: config as any,
      };
    }

    // F. RESET PASSWORD ENDPOINT
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

    // G. ROLE SELECT ENDPOINT
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

      // Automatically append role for high-fidelity demo versatility
      if (!user.roles.includes(role as Role)) {
        user.roles.push(role as Role);
      }

      // Create a specialized role-based JWT containing active role
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

    // H. TOKEN REFRESH ENDPOINT
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
    const token = getStoredToken('accessToken');
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
    const originalRequest = error.config;
    
    // Check if error is 401 and not a retry already
    if (error.response?.status === 401 && !originalRequest._retry) {
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

      try {
        const rToken = getStoredToken('refreshToken');
        if (!rToken) {
          throw new Error('No refresh token available');
        }

        // Post refresh request to our mock endpoint
        const response = await api.post('/auth/refresh', { refreshToken: rToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        setStoredTokens(accessToken, newRefreshToken);
        processQueue(null, accessToken);
        
        originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearStoredTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login?expired=true';
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
