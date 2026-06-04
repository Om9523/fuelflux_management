'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/shared/Sidebar';
import { TopNavbar } from '@/components/shared/TopNavbar';
import { useSidebarStore } from '@/stores/sidebar.store';
import { useAuthStore } from '@/stores/auth.store';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { isCollapsed } = useSidebarStore();
  const { isAuthenticated, initializeSession, isLoading } = useAuthStore();

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Client-side protection backup redirect
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-9 w-9 border-t-2 border-primary" />
          <span className="text-xs font-bold text-slate-450 font-mono tracking-widest uppercase">
            Securing Session Context...
          </span>
        </div>
      </div>
    );
  }

  const paddingClass = isCollapsed ? 'lg:pl-20' : 'lg:pl-64';

  return (
    <div className="min-h-screen bg-slate-50 font-plus-jakarta select-none text-slate-800 relative">
      {/*Collapsible Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Layout shell */}
      <div className={`flex-1 flex flex-col ${paddingClass} min-h-screen transition-all duration-300`}>
        {/* Top Navbar */}
        <TopNavbar />

        {/* Dynamic Route Pages */}
        <main className="flex-1 p-6 relative overflow-x-hidden focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
