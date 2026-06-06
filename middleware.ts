import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password', '/select-role'];

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/investor', '/logistic'];

/**
 * Next.js Middleware for authentication flow
 * Handles:
 * - Token validation (basic check, full validation happens at API level)
 * - Route protection
 * - Token presence in cookies (synced by auth store)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow API routes and Next.js internal routes to pass through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('/favicon.ico') ||
    pathname.includes('/.well-known/')
  ) {
    return NextResponse.next();
  }

  // Get authentication token from cookies
  const accessToken = request.cookies.get('fuelflux_accessToken')?.value;
  const refreshToken = request.cookies.get('fuelflux_refreshToken')?.value;

  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  // Case 1: User has no tokens
  if (!accessToken || !refreshToken) {
    // If accessing protected route, redirect to login
    if (isProtectedRoute) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If accessing public auth routes while logged in, let them through
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Default: redirect to login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Case 2: User has tokens (logged in)
  // Allow all routes when authenticated
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
