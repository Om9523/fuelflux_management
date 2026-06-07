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
      const selectRoleUrl = new URL('/select-role', request.url);
      return NextResponse.redirect(selectRoleUrl);
    }

    if (!activeRole && pathname !== '/select-role') {
      const selectRoleUrl = new URL('/select-role', request.url);
      return NextResponse.redirect(selectRoleUrl);
    }

    // Role-based route authorization guards
    if (activeRole && !isPublicRoute && pathname !== '/select-role') {
      if (activeRole === 'employee' && !pathname.startsWith('/employee')) {
        return NextResponse.redirect(new URL('/employee', request.url));
      }
      if (activeRole === 'logistic' && !pathname.startsWith('/logistic')) {
        return NextResponse.redirect(new URL('/logistic/dashboard', request.url));
      }
      if (activeRole === 'investor' && !pathname.startsWith('/investor')) {
        return NextResponse.redirect(new URL('/investor', request.url));
      }
      if (activeRole === 'admin' && !pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      if (activeRole === 'pump_owner' && (pathname.startsWith('/employee') || pathname.startsWith('/logistic') || pathname.startsWith('/investor') || pathname.startsWith('/admin'))) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
