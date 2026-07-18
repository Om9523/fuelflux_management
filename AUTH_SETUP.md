# Authentication Setup Guide

## Overview
This FuelFlux project is now configured with production-ready authentication that connects to your backend at `http://127.0.0.1:8000/api/v1`.

## Configuration

### Environment Variables
The auth is configured via `.env.local`:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_TOKEN_EXPIRY=900
NEXT_PUBLIC_REFRESH_TOKEN_EXPIRY=604800
```

Update `NEXT_PUBLIC_API_URL` based on your deployment:
- Development: `http://127.0.0.1:8000/api/v1`
- Production: `https://api.fuelflux.com/api/v1`

## Backend Endpoints Required

### 1. Login Endpoint
**POST** `/api/v1/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",  // or use "phone" instead
  "password": "securePassword"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refreshTokenValue...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "phone": "9876543210",
      "name": "John Doe",
      "roles": ["pump_owner"],
      "is_active": true,
      "created_at": "2024-01-01T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  }
}
```

### 2. Register Endpoint
**POST** `/api/v1/auth/register`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "phone": "9876543210",
  "name": "John Doe",
  "password": "securePassword123"
}
```

**Response:** Same as login endpoint (200)

### 3. Refresh Token Endpoint
**POST** `/api/v1/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "refreshTokenValue..."
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "newAccessToken...",
    "refreshToken": "newRefreshToken..." // optional
  }
}
```

### 4. Send OTP Endpoint
**POST** `/api/v1/auth/send-otp`

**Request Body:**
```json
{
  "email": "user@example.com"  // or use "phone" instead
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to email"
}
```

### 5. Verify OTP Endpoint
**POST** `/api/v1/auth/verify-otp`

**Request Body:**
```json
{
  "email": "user@example.com",  // or use "phone"
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully"
}
```

### 6. Reset Password Endpoint
**POST** `/api/v1/auth/reset-password`

**Request Body:**
```json
{
  "email": "user@example.com",  // or use "phone"
  "password": "newPassword123",
  "token": "123456"  // OTP or reset token from verify-otp
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### 7. Logout Endpoint
**POST** `/api/v1/auth/logout`

**Request Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Architecture

### Key Components

#### 1. **Auth Service** (`services/auth.service.ts`)
- Handles all authentication API calls
- Manages token storage and refresh
- Intercepts 401 responses and auto-refreshes tokens
- Singleton pattern for global access

#### 2. **Auth Store** (`stores/auth.store.ts`)
- Zustand state management
- Manages user state, roles, and permissions
- Provides login/logout/register methods
- Role-based permission mapping

#### 3. **API Utils** (`lib/api-utils.ts`)
- Type-safe API call wrapper
- Automatic token injection
- Structured error handling

#### 4. **Middleware** (`middleware.ts`)
- Route protection
- Token presence validation
- Automatic redirect to login for protected routes

### Auth Flow

```
┌─────────────────────────────────────────────────────────┐
│                    USER LOGIN                           │
│         app/(auth)/login/page.tsx                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              useAuthStore.login()                       │
│         stores/auth.store.ts                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│            authService.login()                          │
│         services/auth.service.ts                        │
│    • Sends POST /auth/login                             │
│    • Stores tokens (localStorage + cookies)             │
│    • Sets up axios interceptors                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Backend Response                           │
│    • accessToken (15 min expiry)                        │
│    • refreshToken (7 day expiry)                        │
│    • user data (id, name, email, roles)                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│          Store user + tokens locally                    │
│     Redirect to /select-role                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│          User Selects Active Role                       │
│       /select-role → /dashboard                         │
└─────────────────────────────────────────────────────────┘
```

### Token Management

**Access Token:**
- Short-lived (15 minutes default)
- Sent with every API request
- Stored in localStorage and cookie

**Refresh Token:**
- Long-lived (7 days default)
- Stored in localStorage and cookie
- Used to get new access token when expired
- Automatically handled by axios interceptor

### Auto-Refresh Flow

When access token expires:
```
1. API returns 401 Unauthorized
2. Axios interceptor catches 401
3. Calls POST /auth/refresh with refreshToken
4. Backend returns new accessToken
5. Original request retried with new token
5. If refresh fails → Clear tokens + Redirect to /login
```

## Usage

### In Components

```typescript
import { useAuthStore } from '@/stores/auth.store';

export function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  // Login
  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password', true);
      // Redirect handled automatically
    } catch (error) {
      console.error(error);
    }
  };

  // Access user data
  {isAuthenticated && <p>Welcome {user?.name}</p>}

  // Logout
  const handleLogout = async () => {
    await logout();
  };
}
```

### For API Calls

```typescript
import { api } from '@/lib/api-utils';
import type { ApiResponse, UserData } from '@/types/api.types';

// GET request
const response = await api.get<{ users: UserData[] }>('/users');

// POST request
const result = await api.post('/stations', {
  name: 'New Station',
  location: 'Mumbai'
});

// Tokens are automatically injected
// Errors are automatically handled
```

## Deployment Checklist

- [ ] Update `NEXT_PUBLIC_API_URL` in production environment
- [ ] Ensure backend is running and accessible
- [ ] Test login flow
- [ ] Test token refresh (wait 15 mins or mock)
- [ ] Test logout
- [ ] Test protected route access
- [ ] Verify CORS headers from backend
- [ ] Test on mobile devices
- [ ] Check cookie security settings

## Troubleshooting

### "Login failed" error
- Check if backend is running at configured URL
- Verify credentials are correct
- Check backend logs for errors
- Ensure CORS is configured on backend

### Infinite redirect loop
- Clear localStorage and cookies
- Check middleware configuration
- Verify token is properly stored

### Token not persisting across page reloads
- Check if localStorage is enabled
- Verify cookies are not being blocked
- Check if auth.store initialization runs on mount

### 401 on every request
- Backend may not recognize token format
- Verify Authorization header: `Bearer <token>`
- Check token expiry time on backend

## Security Notes

✅ **What's Implemented:**
- Bearer token authentication
- Token refresh mechanism
- HTTP-only cookie support (cookies set by auth store)
- CORS with credentials
- Automatic token expiry handling
- Role-based access control (RBAC)

⚠️ **For Production:**
- Use HTTPS only (not HTTP)
- Ensure backend sets `Secure` flag on cookies
- Implement rate limiting on auth endpoints
- Add request signing/HMAC for sensitive ops
- Implement logout on all devices
- Add session timeout warnings
- Use SameSite=Strict for cookies when possible

## Files Modified/Created

```
Created:
├── services/auth.service.ts          (New auth service)
├── lib/api-utils.ts                  (New API utilities)
├── types/api.types.ts                (New type definitions)
├── .env.local                        (Environment config)
└── AUTH_SETUP.md                     (This file)

Modified:
├── stores/auth.store.ts              (Connected to real backend)
├── middleware.ts                     (Improved middleware)
└── next.config.mjs                   (Added optimizations)
```

## Next Steps

1. **Test the setup:**
   ```bash
   npm run dev
   ```
   Go to `http://localhost:3000/login`

2. **Create test user on backend:**
   ```json
   POST /api/v1/auth/register
   {
     "email": "test@fuelflux.com",
     "phone": "9876543210",
     "name": "Test User",
     "password": "TestPass123"
   }
   ```

3. **Test login flow:**
   - Enter test credentials
   - Should redirect to `/select-role`
   - Select a role
   - Should access dashboard

4. **Customize roles and permissions:**
   - Modify `getPermissionsForRole()` in `stores/auth.store.ts`
   - Update role list based on backend

## Support

If you encounter issues:
1. Check browser console for errors
2. Check network tab in DevTools
3. Verify backend is responding correctly
4. Check backend logs
5. Ensure tokens are being stored properly
