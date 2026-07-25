'use client';

import React, { useEffect } from 'react';
import { EmployeeSidebar } from './EmployeeSidebar';
import { EmployeeTopNavbar } from './EmployeeTopNavbar';
import { useSidebarStore } from '@/stores/sidebar.store';
import { useEmployeeStore } from '@/stores/employee.store';
import { useAttendanceStore } from '@/stores/attendance.store';
import { useNotificationStore } from '@/stores/notification.store';

export const EmployeeLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isCollapsed } = useSidebarStore();
  const { fetchProfile } = useEmployeeStore();
  const { fetchAttendance } = useAttendanceStore();
  const { fetchAnnouncementsAsNotifications } = useNotificationStore();

  // Fetch employee-specific data on mount
  // Auth guard is handled by app/employee/layout.tsx — not here
  useEffect(() => {
    fetchProfile();
    fetchAttendance();
    fetchAnnouncementsAsNotifications();
  }, [fetchProfile, fetchAttendance, fetchAnnouncementsAsNotifications]);

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
