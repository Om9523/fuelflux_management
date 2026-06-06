'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Truck,
  History,
  QrCode,
  Wallet,
  Activity,
  User,
  Menu,
  ChevronLeft,
  ChevronDown,
  Bell,
  Search,
  Building,
  LogOut,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebar.store';
import { useFleetStore } from '@/stores/fleet.store';
import { useWalletStore } from '@/stores/wallet.store';
import { useNotificationStore } from '@/stores/notification.store';

export default function LogisticLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, toggleSidebar, toggleMobile, setMobileOpen } = useSidebarStore();
  const { fleets, activeFleetId, setActiveFleetId, initializeFleetStore } = useFleetStore();
  const { initializeWalletStore } = useWalletStore();
  const { unreadCount } = useNotificationStore();

  const [fleetDropdownOpen, setFleetDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const fleetDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Initialize stores on mount
  useEffect(() => {
    initializeFleetStore();
    initializeWalletStore();
  }, [initializeFleetStore, initializeWalletStore]);

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fleetDropdownRef.current && !fleetDropdownRef.current.contains(event.target as Node)) {
        setFleetDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeFleet = fleets.find((f) => f.id === activeFleetId) || fleets[0];

  const sidebarLinks = [
    { name: 'Dashboard', href: '/logistic/dashboard', icon: LayoutDashboard },
    { name: 'My Vehicles', href: '/logistic/vehicles', icon: Truck },
    { name: 'Transactions', href: '/logistic/transactions', icon: History },
    { name: 'Digital Vouchers', href: '/logistic/vouchers', icon: QrCode },
    { name: 'Prepaid Wallet', href: '/logistic/wallet', icon: Wallet },
    { name: 'Fuel Telemetry', href: '/logistic/fuel-history', icon: Activity },
    { name: 'Company Settings', href: '/logistic/profile', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-800">
      {/* Sidebar: Desktop */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-30 hidden md:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 shrink-0">
          <Link href="/logistic/dashboard" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="FuelFlux Logo" className="h-8 w-8 object-contain shrink-0" />
            {!isCollapsed && (
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Fuel<span className="text-orange-500">Flux</span>
              </span>
            )}
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-50 to-amber-50/50 text-orange-600 shadow-sm border border-orange-100/50'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-colors duration-200 ${
                    isActive ? 'text-orange-500' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                {!isCollapsed && <span className="text-sm">{link.name}</span>}

                {/* Desktop Mini Tooltip when Collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity shadow-lg z-50 whitespace-nowrap">
                    {link.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 shrink-0">
          {!isCollapsed ? (
            <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 font-bold flex items-center justify-center shadow-sm">
                  VS
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-semibold text-slate-800 truncate">Vikram Singh</h4>
                  <p className="text-xs text-slate-400 font-medium truncate">Logistics Head</p>
                </div>
              </div>
              <button 
                onClick={() => router.push('/login')}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="w-12 h-12 mx-auto rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-white border-r border-slate-200 z-50 md:hidden flex flex-col"
            >
              <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 shrink-0">
                <Link href="/logistic/dashboard" className="flex items-center gap-2.5">
                  <img src="/logo.png" alt="FuelFlux Logo" className="h-8 w-8 object-contain shrink-0" />
                  <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Fuel<span className="text-orange-500">Flux</span>
                  </span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-50 to-amber-50/50 text-orange-600 shadow-sm border border-orange-100/50'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <Icon
                        className={`h-5.5 w-5.5 shrink-0 transition-colors duration-200 ${
                          isActive ? 'text-orange-500' : 'text-slate-400'
                        }`}
                      />
                      <span className="text-sm">{link.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-100 shrink-0">
                <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 font-bold flex items-center justify-center shadow-sm">
                      VS
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-semibold text-slate-800 truncate">Vikram Singh</h4>
                      <p className="text-xs text-slate-400 font-medium truncate">Logistics Head</p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/login')}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        {/* Top Navbar */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 px-4 md:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMobile}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors md:hidden shrink-0"
            >
              <Menu className="h-5.5 w-5.5" />
            </button>

            {/* Global Dynamic Fleet Context Switcher */}
            <div className="relative shrink-0" ref={fleetDropdownRef}>
              <button
                onClick={() => setFleetDropdownOpen(!fleetDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-sm text-left max-w-xs md:max-w-md shrink-0"
              >
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                  <Building className="h-4.5 w-4.5" />
                </div>
                <div className="hidden sm:block overflow-hidden">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5">Active Fleet</p>
                  <p className="text-xs font-bold text-slate-800 truncate leading-none">
                    {activeFleet?.name || 'Loading Fleet...'}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
              </button>

              <AnimatePresence>
                {fleetDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 overflow-hidden"
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Switch Operational Fleet</p>
                    </div>
                    <div className="mt-1 space-y-1">
                      {fleets.map((f) => {
                        const isSelected = f.id === activeFleetId;
                        return (
                          <button
                            key={f.id}
                            onClick={() => {
                              setActiveFleetId(f.id);
                              setFleetDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                              isSelected
                                ? 'bg-orange-50 text-orange-700 border border-orange-100/50 font-semibold'
                                : 'hover:bg-slate-50 text-slate-600 hover:text-slate-800'
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-orange-500/20 text-orange-600' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              <Building className="h-4.5 w-4.5" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold truncate">{f.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium">GSTIN: {f.gstin}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Topbar Actions */}
          <div className="flex items-center gap-2.5 md:gap-4 shrink-0">
            {/* Search Bar - Desktop */}
            <div className="relative hidden lg:block max-w-xs w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search transactions, vehicles..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all"
              />
            </div>

            {/* Bell Notifications */}
            <Link
              href="/logistic/notifications"
              className="relative p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer border border-slate-100 shadow-sm shrink-0"
              title="Notifications Portal"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              )}
            </Link>

            {/* User Profile Menu */}
            <div className="relative shrink-0" ref={profileDropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1 rounded-full md:pr-4 md:pl-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-all cursor-pointer shrink-0"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-bold flex items-center justify-center shadow-md shadow-orange-500/10 shrink-0">
                  VS
                </div>
                <div className="hidden md:block text-left overflow-hidden max-w-[100px]">
                  <p className="text-xs font-bold text-slate-800 leading-none truncate">Vikram Singh</p>
                  <p className="text-[9px] font-bold text-slate-400 leading-none mt-1 uppercase tracking-wider">Logistics</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden md:block shrink-0" />
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 overflow-hidden"
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">Vikram Singh</p>
                      <p className="text-[10px] text-slate-400">Head of Operations</p>
                    </div>
                    <div className="mt-1.5 space-y-1">
                      <Link
                        href="/logistic/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all"
                      >
                        <User className="h-4 w-4 text-slate-400" />
                        Company Settings
                      </Link>
                      <Link
                        href="/logistic/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all"
                      >
                        <ShieldCheck className="h-4 w-4 text-slate-400" />
                        Compliance & Audit
                      </Link>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          router.push('/login');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        Log Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
