'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Fuel,
  FileCheck,
  UserCheck,
  Truck,
  LineChart,
  DollarSign,
  CreditCard,
  Wallet,
  Users,
  ShieldAlert,
  ClipboardList,
  Flame,
  MessageSquare,
  Bell,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  Search,
  Activity,
  Heart,
  ChevronDown,
  User as UserIcon,
  Shield
} from 'lucide-react';
import { useAdminStore } from '@/stores/admin.store';
import { useSidebarStore } from '@/stores/sidebar.store';
import { toast } from '../feedback/Toast';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebarStore();
  const { adminUser, adminLogout, initializeAdminSession, isAdminAuthenticated } = useAdminStore();
  
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHealthOpen, setIsHealthOpen] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const healthRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeAdminSession();
  }, [initializeAdminSession]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (healthRef.current && !healthRef.current.contains(e.target as Node)) {
        setIsHealthOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Navigation Items
  const sections = [
    {
      title: 'Overview',
      items: [
        { label: 'Control Center', href: '/admin', icon: <LayoutDashboard className="h-4.5 w-4.5 shrink-0" /> }
      ]
    },
    {
      title: 'Operations',
      items: [
        { label: 'All Pumps', href: '/admin/pumps', icon: <Fuel className="h-4.5 w-4.5 shrink-0" /> },
        { label: 'Pending Approvals', href: '/admin/pending', icon: <FileCheck className="h-4.5 w-4.5 shrink-0" /> },
        { label: 'Pump Owners', href: '/admin/owners', icon: <UserCheck className="h-4.5 w-4.5 shrink-0" /> },
        { label: 'Logistic Partners', href: '/admin/logistics', icon: <Truck className="h-4.5 w-4.5 shrink-0" /> },
        { label: 'Investors', href: '/admin/investors', icon: <LineChart className="h-4.5 w-4.5 shrink-0" /> }
      ]
    },
    {
      title: 'Finance',
      items: [
        { label: 'Payments Monitor', href: '/admin/payments', icon: <DollarSign className="h-4.5 w-4.5 shrink-0" /> },
        { label: 'Subscriptions', href: '/admin/subscriptions', icon: <CreditCard className="h-4.5 w-4.5 shrink-0" /> },
        { label: 'Wallet Monitoring', href: '/admin/wallets', icon: <Wallet className="h-4.5 w-4.5 shrink-0" /> }
      ]
    },
    {
      title: 'Users',
      items: [
        { label: 'User Directory', href: '/admin/users', icon: <Users className="h-4.5 w-4.5 shrink-0" /> },
        { label: 'Roles & Permissions', href: '/admin/roles', icon: <Shield className="h-4.5 w-4.5 shrink-0" /> }
      ]
    },
    {
      title: 'Platform',
      items: [
        { label: 'Support Tickets', href: '/admin/support', icon: <MessageSquare className="h-4.5 w-4.5 shrink-0" /> },
        { label: 'Notification Center', href: '/admin/notifications', icon: <Bell className="h-4.5 w-4.5 shrink-0" /> }
      ]
    },
    {
      title: 'Security',
      items: [
        { label: 'Audit Logs', href: '/admin/audit', icon: <ClipboardList className="h-4.5 w-4.5 shrink-0" /> },
        { label: 'Risk & Fraud', href: '/admin/risk', icon: <ShieldAlert className="h-4.5 w-4.5 shrink-0" /> }
      ]
    },
    {
      title: 'Analytics',
      items: [
        { label: 'Platform Growth', href: '/admin/analytics', icon: <LineChart className="h-4.5 w-4.5 shrink-0" /> },
        { label: 'Revenue Analytics', href: '/admin/revenue', icon: <DollarSign className="h-4.5 w-4.5 shrink-0" /> }
      ]
    },
    {
      title: 'Settings',
      items: [
        { label: 'System Configuration', href: '/admin/settings', icon: <Settings className="h-4.5 w-4.5 shrink-0" /> }
      ]
    }
  ];

  const handleLogout = () => {
    adminLogout();
    toast.success('Logged out successfully');
    router.push('/admin/login');
  };

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';
  const paddingClass = isCollapsed ? 'lg:pl-20' : 'lg:pl-64';

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between bg-white text-slate-650 border-r border-slate-200">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Header Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0">
              <img src="/logo.png" alt="FuelFlux Logo" className="h-8.5 w-8.5 object-contain" />
            </div>
            {!isCollapsed && (
              <span className="text-base font-bold text-slate-800 font-plus-jakarta tracking-tight">
                Flux<span className="text-orange-500">Admin</span>
              </span>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex items-center justify-center p-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 cursor-pointer transition-colors"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-3 mb-1.5 select-none">
                  {section.title}
                </span>
              )}
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all outline-none
                      ${isActive
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/10'
                        : 'hover:bg-slate-50 text-slate-550 hover:text-slate-800'
                      }
                    `}
                  >
                    {item.icon}
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-xs sm:text-sm font-semibold tracking-wide text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer outline-none"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          {!isCollapsed && <span className="truncate">Exit Control Panel</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-plus-jakarta select-none text-slate-800 relative">
      {/* Desktop permanent sidebar */}
      <aside className={`hidden lg:block h-screen fixed top-0 left-0 transition-all duration-300 z-30 ${sidebarWidth}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Drawer sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-64 h-full z-10"
            >
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-[-45px] p-2 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-lg cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
              <div className="h-full w-full">
                <SidebarContent />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main content viewport */}
      <div className={`flex-1 flex flex-col ${paddingClass} min-h-screen transition-all duration-300`}>
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-40 flex items-center justify-between px-6 shadow-xs select-none">
          {/* Left: Mobile trigger & Global logo search */}
          <div className="flex items-center gap-4 relative">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer outline-none"
            >
              <Menu className="h-5.5 w-5.5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-400 border border-slate-200 bg-slate-50 rounded-lg px-2.5 py-1 tracking-wider uppercase">
                EMULATION CENTER
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            {/* System Health */}
            <div className="relative" ref={healthRef}>
              <button
                onClick={() => setIsHealthOpen(!isHealthOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer outline-none"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-600">Health Normal</span>
              </button>

              <AnimatePresence>
                {isHealthOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-4 z-50 space-y-3"
                  >
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Infrastructure Diagnostics
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                        <span>Database Node</span>
                        <span className="text-emerald-500 font-bold">12ms Latency</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                        <span>API Server Gateway</span>
                        <span className="text-emerald-500 font-bold">99.98% uptime</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                        <span>Queue worker load</span>
                        <span className="text-amber-500 font-bold">4.2% usage</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                        <span>Cron Scheduler</span>
                        <span className="text-emerald-500 font-bold">Idle</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer outline-none"
              >
                <div className="h-8.5 w-8.5 rounded-full bg-orange-500 flex items-center justify-center font-extrabold text-white text-xs shadow-inner">
                  {adminUser?.name ? adminUser.name.charAt(0) : 'A'}
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 pr-1 shrink-0" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-1.5 z-50 flex flex-col gap-0.5"
                  >
                    <div className="px-3.5 py-2.5 border-b border-slate-100 flex flex-col gap-0.5 mb-1">
                      <span className="text-xs font-extrabold text-slate-800 leading-none">
                        {adminUser?.name || 'Administrator'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium truncate mt-1">
                        {adminUser?.email || 'admin@fuelflux.com'}
                      </span>
                    </div>

                    <button
                      onClick={() => router.push('/admin/settings')}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-600 hover:text-orange-500 hover:bg-orange-50/50 rounded-xl transition-colors cursor-pointer outline-none text-left"
                    >
                      <UserIcon className="h-4 w-4 shrink-0" />
                      Security Settings
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer outline-none text-left"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      Logout Panel
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dynamic content page */}
        <main className="flex-1 p-6 relative overflow-x-hidden focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
};
