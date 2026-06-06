import { authService } from '../services/auth.service';
import { ApiResponse, ApiError } from '../types/api.types';

/**
 * Wrapper for making authenticated API calls with proper error handling
 * This ensures all API calls are properly authenticated and typed
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export async function apiCall<T = any>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
    signal?: AbortSignal;
  } = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    body,
    headers = {},
    signal,
  } = options;

  const url = `${API_URL}${endpoint}`;
  const accessToken = authService.getAccessToken();

  const finalHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (accessToken) {
    finalHeaders.Authorization = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });

    const data: ApiResponse<T> | ApiError = await response.json();

    if (!response.ok) {
      // If 401, auth service interceptor will handle token refresh
      if (response.status === 401) {
        // Let axios interceptor handle it
        throw new Error(
          (data as ApiError).message || 'Authentication failed. Please login again.'
        );
      }

      throw new Error(
        (data as ApiError).message || `API Error: ${response.statusText}`
      );
    }

    return data as ApiResponse<T>;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request cancelled');
    }

    throw error;
  }
}

/**
 * Helper functions for common API operations
 */

export const api = {
  /**
   * GET request
   */
  get: <T = any>(endpoint: string, signal?: AbortSignal) =>
    apiCall<T>(endpoint, { method: 'GET', signal }),

  /**
   * POST request
   */
  post: <T = any>(endpoint: string, body?: any, signal?: AbortSignal) =>
    apiCall<T>(endpoint, { method: 'POST', body, signal }),

  /**
   * PUT request (replace entire resource)
   */
  put: <T = any>(endpoint: string, body?: any, signal?: AbortSignal) =>
    apiCall<T>(endpoint, { method: 'PUT', body, signal }),

  /**
   * PATCH request (partial update)
   */
  patch: <T = any>(endpoint: string, body?: any, signal?: AbortSignal) =>
    apiCall<T>(endpoint, { method: 'PATCH', body, signal }),

  /**
   * DELETE request
   */
  delete: <T = any>(endpoint: string, signal?: AbortSignal) =>
    apiCall<T>(endpoint, { method: 'DELETE', signal }),
};

/**
 * Higher-order function to wrap async API calls with error handling
 */
export function withApiError<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T) => {
    try {
      return await fn(...args);
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  };
}
