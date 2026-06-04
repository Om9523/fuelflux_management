import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let API requests and Next.js assets bypass middleware protection
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // ==========================================
  // 1. ADMIN ROUTES ROUTING & PROTECTION
  // ==========================================
  if (pathname.startsWith('/admin')) {
    const adminToken = request.cookies.get('fuelflux_admin_accessToken')?.value;

    if (pathname === '/admin/login') {
      // If already authenticated, bypass login
      if (adminToken) {
        const adminDashboardUrl = new URL('/admin', request.url);
        return NextResponse.redirect(adminDashboardUrl);
      }
      return NextResponse.next();
    }

    // Require admin token for all other admin routes
    if (!adminToken) {
      const adminLoginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(adminLoginUrl);
    }

    return NextResponse.next();
  }

  // ==========================================
  // 2. STANDARD USER ROUTES ROUTING & PROTECTION
  // ==========================================
  const token = request.cookies.get('fuelflux_accessToken')?.value;
  const activeRole = request.cookies.get('fuelflux_activeRole')?.value;

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // User is not logged in
  if (!token) {
    if (!isPublicRoute) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // User is logged in
  if (token) {
    if (isPublicRoute && pathname !== '/') {
      if (!activeRole) {
        const selectRoleUrl = new URL('/select-role', request.url);
        return NextResponse.redirect(selectRoleUrl);
      } else {
        const dashboardUrl = new URL('/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
      }
    }

    if (!activeRole && pathname !== '/select-role') {
      const selectRoleUrl = new URL('/select-role', request.url);
      return NextResponse.redirect(selectRoleUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
