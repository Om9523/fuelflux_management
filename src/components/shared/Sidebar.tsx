'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Fuel,
  Video,
  Users,
  Receipt,
  Car,
  ShieldCheck,
  Notebook,
  Layers,
  Landmark,
  Wallet,
  FileText,
  Cpu,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
} from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebar.store';
import { useAuthStore } from '@/stores/auth.store';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggleSidebar, setMobileOpen } = useSidebarStore();
  const { logout } = useAuthStore();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5 shrink-0" /> },
    { label: 'My Pumps', href: '/dashboard/pumps', icon: <Fuel className="h-5 w-5 shrink-0" /> },
    { label: 'Live Monitor', href: '/dashboard/live', icon: <Video className="h-5 w-5 shrink-0" /> },
    { label: 'Employees & Shift', href: '/dashboard/employees', icon: <Users className="h-5 w-5 shrink-0" /> },
    { label: 'Sales Register', href: '/dashboard/sales', icon: <Receipt className="h-5 w-5 shrink-0" /> },
    { label: 'Vehicle Logs', href: '/dashboard/vehicles', icon: <Car className="h-5 w-5 shrink-0" /> },
    { label: 'Hydrotesting', href: '/dashboard/hydrotesting', icon: <ShieldCheck className="h-5 w-5 shrink-0" /> },
    { label: 'CRM & Udhaar', href: '/dashboard/crm', icon: <Notebook className="h-5 w-5 shrink-0" /> },
    { label: 'Inventory', href: '/dashboard/inventory', icon: <Layers className="h-5 w-5 shrink-0" /> },
    { label: 'Accounting', href: '/dashboard/accounting', icon: <Landmark className="h-5 w-5 shrink-0" /> },
    { label: 'Wallet & Terminal', href: '/dashboard/wallet', icon: <Wallet className="h-5 w-5 shrink-0" /> },
    { label: 'Reports Hub', href: '/dashboard/reports', icon: <FileText className="h-5 w-5 shrink-0" /> },
    { label: 'AI Assistant', href: '/dashboard/ai', icon: <Cpu className="h-5 w-5 shrink-0" /> },
    { label: 'Settings', href: '/dashboard/settings', icon: <Settings className="h-5 w-5 shrink-0" /> },
  ];

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';

  const RenderContent = () => (
    <div className="h-full flex flex-col justify-between bg-white border-r border-slate-200 text-slate-650">
      {/* Upper Logo & Toggle Panel */}
      <div className="flex flex-col">
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-transparent shrink-0">
              <img src="/logo.png" alt="FuelFlux Logo" className="h-8.5 w-8.5 object-contain" />
            </div>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-base font-bold tracking-tight text-slate-800 font-plus-jakarta shrink-0"
              >
                Fuel<span className="text-primary">Flux</span>
              </motion.span>
            )}
          </div>
          {/* Collapse toggle (Desktop only) */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex items-center justify-center p-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer outline-none transition-colors border border-slate-200"
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
                  flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 outline-none
                  ${
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/10'
                      : 'hover:bg-slate-50 text-slate-500 hover:text-slate-800'
                  }
                `}
              >
                {item.icon}
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
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={logout}
          className="flex items-center gap-3.5 px-3 py-2.5 w-full rounded-xl text-sm font-semibold tracking-wide text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-300 cursor-pointer outline-none"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="text-xs sm:text-sm font-medium">Log Out Session</span>}
        </button>
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
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
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
                className="absolute top-4 right-[-45px] p-2 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-lg cursor-pointer"
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
