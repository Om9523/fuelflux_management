'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Clock,
  Calendar,
  Award,
  FileSpreadsheet,
  DollarSign,
  Megaphone,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
} from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebar.store';
import { useAuthStore } from '@/stores/auth.store';
import { useEmployeeStore } from '@/stores/employee.store';

export const EmployeeSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, isMobileOpen, toggleSidebar, setMobileOpen } = useSidebarStore();
  const { logout } = useAuthStore();
  const { profile, user } = useEmployeeStore();

  const navItems = [
    { label: 'Dashboard', href: '/employee', icon: <LayoutDashboard className="h-5 w-5 shrink-0" /> },
    { label: 'My Attendance', href: '/employee/attendance', icon: <Clock className="h-5 w-5 shrink-0" /> },
    { label: 'My Shifts', href: '/employee/shifts', icon: <Calendar className="h-5 w-5 shrink-0" /> },
    { label: 'My Performance', href: '/employee/performance', icon: <Award className="h-5 w-5 shrink-0" /> },
    { label: 'Leave Requests', href: '/employee/leave', icon: <FileSpreadsheet className="h-5 w-5 shrink-0" /> },
    { label: 'Salary Summary', href: '/employee/salary', icon: <DollarSign className="h-5 w-5 shrink-0" /> },
    { label: 'Announcements', href: '/employee/announcements', icon: <Megaphone className="h-5 w-5 shrink-0" /> },
    { label: 'My Profile', href: '/employee/profile', icon: <User className="h-5 w-5 shrink-0" /> },
  ];

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';

  const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'EE';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const RenderContent = () => (
    <div className="h-full flex flex-col justify-between bg-white border-r border-orange-100 text-slate-650 font-sans">
      {/* Upper Logo & Toggle Panel */}
      <div className="flex flex-col">
        <div className="h-16 flex items-center justify-between px-6 border-b border-orange-50 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 shrink-0">
              <img src="/logo.png" alt="FuelFlux Logo" className="h-7.5 w-7.5 object-contain" />
            </div>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-base font-extrabold tracking-tight text-slate-800 shrink-0"
              >
                Fuel<span className="text-orange-500">Flux</span>
                <span className="ml-1 text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Staff</span>
              </motion.span>
            )}
          </div>
          {/* Collapse toggle (Desktop only) */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex items-center justify-center p-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-500 hover:text-orange-700 cursor-pointer outline-none transition-colors border border-orange-200"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 outline-none border
                  ${
                    isActive
                      ? 'bg-orange-500 border-orange-600 text-white shadow-md shadow-orange-500/15'
                      : 'border-transparent hover:bg-orange-50/50 text-slate-500 hover:text-slate-800'
                  }
                `}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="truncate font-medium text-xs sm:text-sm"
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Footer Panel */}
      <div className="p-3 border-t border-orange-50 shrink-0">
        {!isCollapsed ? (
          <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-3.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white font-bold flex items-center justify-center shadow-md shadow-orange-500/10 shrink-0 text-sm">
                {initials}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm font-bold text-slate-800 truncate leading-none mb-1">{user?.name || 'Staff User'}</h4>
                <p className="text-[10px] text-slate-400 font-bold truncate leading-none uppercase tracking-wider">{profile?.designation || 'Employee'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer outline-none"
              title="Sign Out"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-12 h-12 mx-auto rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer outline-none"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* A. DESKTOP PERMANENT SIDEBAR */}
      <aside className={`hidden lg:block h-screen fixed top-0 left-0 transition-all duration-300 z-30 ${sidebarWidth}`}>
        <RenderContent />
      </aside>

      {/* B. MOBILE DRAWER SIDEBAR OVERLAY */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
            />
            {/* Sidebar drawer content */}
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-64 h-full z-10"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-[-45px] p-2 bg-white border border-orange-100 text-slate-700 rounded-xl shadow-lg cursor-pointer outline-none"
              >
                <X className="h-4.5 w-4.5" />
              </button>
              <div className="h-full w-full">
                {/* Always expanded on mobile */}
                <RenderContent />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
