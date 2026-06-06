'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Coins,
  Building2,
  Truck,
  TrendingUp,
  FileText,
  Briefcase,
  Settings,
  Menu,
  ChevronLeft,
  ChevronDown,
  Bell,
  Search,
  User,
  Shield,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebar.store';
import { useInvestorStore } from '@/stores/investor.store';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationStore } from '@/stores/notification.store';

export default function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  
  const { isCollapsed, isMobileOpen, toggleSidebar, toggleMobile, setMobileOpen } = useSidebarStore();
  const { portfolios, activePortfolioId, setActivePortfolioId, initializeInvestorStore } = useInvestorStore();
  const { user, initializeSession, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  const [portfolioDropdownOpen, setPortfolioDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const portfolioDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Initialize session and stores on mount
  useEffect(() => {
    initializeSession();
    initializeInvestorStore();
  }, [initializeSession, initializeInvestorStore]);

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (portfolioDropdownRef.current && !portfolioDropdownRef.current.contains(event.target as Node)) {
        setPortfolioDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activePortfolio = portfolios.find(p => p.id === activePortfolioId) || portfolios[0];

  const sidebarLinks = [
    { name: 'Overview', href: '/investor', icon: LayoutDashboard, exact: true },
    { name: 'Revenue Analytics', href: '/investor/revenue', icon: Coins, exact: false },
    { name: 'Pump Performance', href: '/investor/pumps', icon: Building2, exact: false },
    { name: 'Fleet Analytics', href: '/investor/fleet', icon: Truck, exact: false },
    { name: 'AI Forecasting', href: '/investor/forecasting', icon: TrendingUp, exact: false },
    { name: 'Reports Center', href: '/investor/reports', icon: FileText, exact: false },
    { name: 'Portfolio Assets', href: '/investor/portfolio', icon: Briefcase, exact: false },
    { name: 'Settings', href: '/investor/settings', icon: Settings, exact: false },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans antialiased text-slate-800">
      {/* Sidebar: Desktop */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-30 hidden md:flex flex-col bg-white border-r border-slate-200/60 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/60 shrink-0">
          <Link href="/investor" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="FuelFlux Logo" className="h-8 w-8 object-contain shrink-0" />
            {!isCollapsed && (
              <span className="font-extrabold text-xl tracking-tight text-slate-800">
                Fuel<span className="text-orange-500">Flux</span>
              </span>
            )}
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            // Check active based on exact or starting path
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-sm shadow-orange-500/5'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-colors duration-200 ${
                    isActive ? 'text-orange-500' : 'text-slate-400 group-hover:text-slate-800'
                  }`}
                />
                {!isCollapsed && <span className="text-sm">{link.name}</span>}

                {/* Desktop Collapsed Tooltip */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity shadow-lg z-50 whitespace-nowrap">
                    {link.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200/60 shrink-0">
          {!isCollapsed ? (
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 font-bold flex items-center justify-center shadow-sm shrink-0">
                  <User className="h-4.5 w-4.5" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-slate-800 truncate">{user?.name || 'Investor'}</h4>
                  <p className="text-[10px] text-slate-500 font-semibold truncate">Venture Partner</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/select-role')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                title="Switch Role"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push('/select-role')}
              className="w-12 h-12 mx-auto rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Switch Role"
            >
              <RefreshCw className="h-5 w-5" />
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-white border-r border-slate-200/60 z-50 md:hidden flex flex-col"
            >
              <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200/60 shrink-0">
                <Link href="/investor" className="flex items-center gap-2.5">
                  <img src="/logo.png" alt="FuelFlux Logo" className="h-8 w-8 object-contain shrink-0" />
                  <span className="font-extrabold text-xl tracking-tight text-slate-800">
                    Fuel<span className="text-orange-500">Flux</span>
                  </span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = link.exact
                    ? pathname === link.href
                    : pathname.startsWith(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="h-5.5 w-5.5 shrink-0" />
                      <span className="text-sm">{link.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-200/60 shrink-0">
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 font-bold flex items-center justify-center shadow-sm">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-semibold text-slate-800 truncate">{user?.name || 'Investor'}</h4>
                      <p className="text-xs text-slate-500 font-medium truncate">Venture Partner</p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/select-role')}
                    className="p-2 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="h-5 w-5" />
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
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-20 px-4 md:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMobile}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors md:hidden shrink-0"
            >
              <Menu className="h-5.5 w-5.5" />
            </button>

            {/* Global Dynamic Portfolio Selector Context Switcher */}
            <div className="relative shrink-0" ref={portfolioDropdownRef}>
              <button
                onClick={() => setPortfolioDropdownOpen(!portfolioDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl transition-all cursor-pointer shadow-sm text-left max-w-xs md:max-w-md shrink-0"
              >
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                  <Briefcase className="h-4.5 w-4.5" />
                </div>
                <div className="hidden sm:block overflow-hidden">
                  <p className="text-[9px] text-slate-450 font-bold uppercase tracking-wider leading-none mb-0.5">Active Portfolio</p>
                  <p className="text-xs font-bold text-slate-800 truncate leading-none">
                    {activePortfolio?.name || 'Loading Portfolio...'}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
              </button>

              <AnimatePresence>
                {portfolioDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-2 w-72 bg-white border border-slate-200/60 rounded-2xl shadow-xl z-50 p-2 overflow-hidden"
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Switch Venture Cluster</p>
                    </div>
                    <div className="mt-1 space-y-1">
                      {portfolios.map((p) => {
                        const isSelected = p.id === activePortfolioId;
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              setActivePortfolioId(p.id);
                              setPortfolioDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                              isSelected
                                ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 font-semibold'
                                : 'hover:bg-slate-50 text-slate-650 hover:text-slate-800'
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-orange-500/20 text-orange-650' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              <Briefcase className="h-4.5 w-4.5" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                              <p className="text-[9px] text-slate-400 font-medium">ROI: {p.roi}% | Growth: {p.monthlyGrowth}%</p>
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
                placeholder="Search metrics, reports, pumps..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all text-slate-850"
              />
            </div>

            {/* Notification Bell */}
            <div
              className="relative p-2 rounded-xl text-slate-400 hover:text-slate-750 bg-slate-50 border border-slate-200/60 shadow-sm shrink-0 cursor-pointer hover:bg-slate-100"
              title="Global Alerts log"
              onClick={() => router.push('/investor/settings')}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              )}
            </div>

            {/* User Profile dropdown */}
            <div className="relative shrink-0" ref={profileDropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1 rounded-full md:pr-4 md:pl-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition-all cursor-pointer shrink-0"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-bold flex items-center justify-center shadow-md shadow-orange-500/10 shrink-0">
                  IV
                </div>
                <div className="hidden md:block text-left overflow-hidden max-w-[100px]">
                  <p className="text-xs font-bold text-slate-800 leading-none truncate">{user?.name || 'Investor'}</p>
                  <p className="text-[9px] font-bold text-slate-450 leading-none mt-1 uppercase tracking-wider">Venture</p>
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
                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-200/60 rounded-2xl shadow-xl z-50 p-2 overflow-hidden"
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">{user?.name || 'Investor'}</p>
                      <p className="text-[10px] text-slate-500">Venture Capital Partner</p>
                    </div>
                    <div className="mt-1.5 space-y-1">
                      <Link
                        href="/investor/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-650 hover:text-slate-800 hover:bg-slate-50 transition-all"
                      >
                        <User className="h-4 w-4 text-slate-450" />
                        Account Settings
                      </Link>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          router.push('/select-role');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-650 hover:text-slate-800 hover:bg-slate-50 transition-all cursor-pointer"
                      >
                        <RefreshCw className="h-4 w-4 text-slate-450" />
                        Switch Role
                      </button>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                          router.push('/login');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
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
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl w-full mx-auto bg-[#F8FAFC]">
          {children}
        </main>
      </div>
    </div>
  );
}
