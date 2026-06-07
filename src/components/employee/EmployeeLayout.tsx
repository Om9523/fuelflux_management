'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EmployeeSidebar } from './EmployeeSidebar';
import { EmployeeTopNavbar } from './EmployeeTopNavbar';
import { useSidebarStore } from '@/stores/sidebar.store';
import { useAuthStore } from '@/stores/auth.store';
import { useEmployeeStore } from '@/stores/employee.store';
import { useAttendanceStore } from '@/stores/attendance.store';

export const EmployeeLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { isCollapsed } = useSidebarStore();
  const { isAuthenticated, initializeSession, isLoading: authLoading } = useAuthStore();
  const { profile, fetchProfile, isLoadingProfile } = useEmployeeStore();
  const { fetchAttendance } = useAttendanceStore();

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // If authenticated, fetch profile and attendance
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchAttendance();
    }
  }, [isAuthenticated, fetchProfile, fetchAttendance]);

  // Backup client-side redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || (isLoadingProfile && !profile) || !isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-9 w-9 border-t-2 border-orange-500" />
          <span className="text-xs font-bold text-slate-400 font-mono tracking-widest uppercase">
            Securing Staff Session...
          </span>
        </div>
      </div>
    );
  }

  const paddingClass = isCollapsed ? 'lg:pl-20' : 'lg:pl-64';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 relative">
      {/* Employee Collapsible Sidebar */}
      <EmployeeSidebar />

      {/* Main Content Layout Shell */}
      <div className={`flex-1 flex flex-col ${paddingClass} min-h-screen transition-all duration-300`}>
        {/* Top Navbar */}
        <EmployeeTopNavbar />

        {/* Dynamic Route Pages */}
        <main className="flex-1 p-4 md:p-6 relative overflow-x-hidden focus:outline-none">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
export default EmployeeLayout;
