import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read cookies for session details
  const token = request.cookies.get('fuelflux_accessToken')?.value;
  const activeRole = request.cookies.get('fuelflux_activeRole')?.value;

  // Let API requests and Next.js assets bypass middleware protection
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // 1. User is not logged in
  if (!token) {
    // If trying to access protected route (e.g., /select-role or /dashboard), redirect to /login
    if (!isPublicRoute) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. User is logged in
  if (token) {
    // A. If accessing login/register/forgot-password, redirect to dashboard or select-role
    if (isPublicRoute && pathname !== '/') {
      if (!activeRole) {
        const selectRoleUrl = new URL('/select-role', request.url);
        return NextResponse.redirect(selectRoleUrl);
      } else {
        const dashboardUrl = new URL('/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
      }
    }

    // B. If logged in but has no active role selected, enforce redirect to /select-role
    if (!activeRole && pathname !== '/select-role') {
      const selectRoleUrl = new URL('/select-role', request.url);
      return NextResponse.redirect(selectRoleUrl);
    }

    // C. If active role exists, prevent going back to /select-role unless manually routing (or let it go if they have multiple roles)
    // To support multi-role, we allow accessing /select-role even with activeRole so they can switch roles!
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
