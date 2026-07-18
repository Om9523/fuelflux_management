'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminStore } from '@/stores/admin.store';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function AdminRouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdminAuthenticated, initializeAdminSession, isLoading } = useAdminStore();

  const isLoginPage = pathname === '/admin/login';

  // All hooks MUST be called before any early return (React rules of hooks)
  useEffect(() => {
    initializeAdminSession();
  }, [initializeAdminSession]);

  // Client-side authentication guard — only for non-login pages
  useEffect(() => {
    if (!isLoading && !isLoginPage) {
      const token = localStorage.getItem('fuelflux_admin_accessToken');
      if (!token) {
        router.push('/admin/login');
      }
    }
  }, [isLoading, isLoginPage, router]);

  // Redirect authenticated admin away from login page
  useEffect(() => {
    if (isAdminAuthenticated && isLoginPage) {
      router.push('/admin');
    }
  }, [isAdminAuthenticated, isLoginPage, router]);

  // ─── Login page: render directly, no guards, no loading overlay ───
  // Login page manages its own loading state via useAdminStore().isLoading
  if (isLoginPage) {
    return <>{children}</>;
  }

  // ─── All other admin pages below ─────────────────────────────────

  if (isLoading && !isAdminAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500" />
          <span className="text-[10px] font-extrabold text-slate-450 font-mono tracking-widest uppercase">
            Securing Cryptographic Context...
          </span>
        </div>
      </div>
    );
  }

  // Prevent flash before redirect is finalized
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-[10px] font-extrabold text-slate-450 font-mono tracking-widest uppercase">
          Verifying Authority...
        </div>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}
