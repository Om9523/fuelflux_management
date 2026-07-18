'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Search,
  ChevronDown,
  User,
  LogOut,
  Sliders,
  Menu,
  CheckCircle,
  AlertTriangle,
  Info,
  Check,
  Building,
} from 'lucide-react';
import { usePumpStore, Pump } from '@/stores/pumps.store';
import { useNotificationStore, StationNotification } from '@/stores/notification.store';
import { useSidebarStore } from '@/stores/sidebar.store';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from '@/components/feedback/Toast';

export const TopNavbar: React.FC = () => {
  const router = useRouter();
  
  // Stores
  const { pumps, selectedPump, setSelectedPump, initializePumps } = usePumpStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const { toggleMobile } = useSidebarStore();
  const { user, logout } = useAuthStore();

  // Component UI toggles
  const [isStationOpen, setIsStationOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Refs for click outside to close panels
  const stationRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializePumps();
  }, [initializePumps]);

  // Click outside listener
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (stationRef.current && !stationRef.current.contains(e.target as Node)) {
        setIsStationOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleStationChange = (pump: Pump) => {
    if (pump.status !== 'approved') {
      toast.error(`"${pump.name}" is pending admin approval and cannot be selected.`);
      return;
    }
    setSelectedPump(pump);
    setIsStationOpen(false);
    toast.success(`Switched active pump to: ${pump.name}`);
  };

  const getNotifIcon = (type: StationNotification['type']) => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />;
      default:
        return <Info className="h-4 w-4 text-blue-500 shrink-0" />;
    }
  };

  const formatNotifTime = (isoString: string) => {
    const minutes = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(isoString).toLocaleDateString();
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-40 flex items-center justify-between px-6 shadow-sm select-none">
      {/* LEFT: Mobile sidebar trigger & Station Selector */}
      <div className="flex items-center gap-4 relative">
        <button
          onClick={toggleMobile}
          className="lg:hidden p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer outline-none"
        >
          <Menu className="h-5.5 w-5.5" />
        </button>

        {/* Station switcher dropdown */}
        <div className="relative" ref={stationRef}>
          <button
            onClick={() => setIsStationOpen(!isStationOpen)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none transition-colors select-none cursor-pointer"
          >
            <Building className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="max-w-[140px] sm:max-w-[200px] truncate">
              {selectedPump ? selectedPump.name : 'Loading station...'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          </button>

          <AnimatePresence>
            {isStationOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 z-50 flex flex-col gap-1"
              >
                <div className="text-[10px] font-bold text-slate-400 uppercase px-3 py-1.5 tracking-wider">
                  Active Stations List
                </div>
                {pumps.map((pump) => (
                  <button
                    key={pump.id}
                    onClick={() => handleStationChange(pump)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer outline-none
                      ${
                        selectedPump?.id === pump.id
                          ? 'bg-orange-50/60 text-primary font-bold'
                          : 'hover:bg-slate-50 text-slate-600'
                      }
                      ${pump.status !== 'approved' ? 'opacity-50 hover:bg-transparent cursor-not-allowed' : ''}
                    `}
                  >
                    <div className="flex flex-col gap-0.5 truncate">
                      <span className="text-xs font-semibold truncate">{pump.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium truncate">
                        {pump.city}, {pump.state}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {pump.status !== 'approved' && (
                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 border border-amber-100 rounded-full">
                          UNDER REVIEW
                        </span>
                      )}
                      {selectedPump?.id === pump.id && <Check className="h-3.5 w-3.5 text-primary" />}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT: Search, Notifications & User Dropdown */}
      <div className="flex items-center gap-4 relative">
        {/* Global Search portal Mockup */}
        <div className="hidden sm:flex items-center relative w-48 lg:w-64">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search records, plates..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400/80 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </div>

        {/* Notifications dropdown bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => router.push('/dashboard/notifications')}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer outline-none relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center border border-white">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 z-50 flex flex-col"
              >
                <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100">
                  <span className="text-xs font-extrabold text-slate-800 tracking-tight">Active Alerts ({unreadCount})</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] font-bold text-primary hover:text-primary-hover hover:underline cursor-pointer outline-none"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="flex flex-col max-h-[300px] overflow-y-auto p-1.5 gap-1">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-xs font-medium text-slate-400">
                      No operational notifications.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`
                          flex gap-3 p-3 rounded-xl text-left cursor-pointer transition-colors outline-none
                          ${n.read ? 'bg-transparent hover:bg-slate-50' : 'bg-orange-50/30 hover:bg-orange-50/50'}
                        `}
                      >
                        {getNotifIcon(n.type)}
                        <div className="flex flex-col gap-0.5 flex-1">
                          <div className="flex justify-between items-center">
                            <span className={`text-xs font-bold leading-tight ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>
                              {n.title}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 shrink-0 font-mono">
                              {formatNotifTime(n.timestamp)}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-0.5">
                            {n.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User profile dropdown avatar */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-1.5 p-1 rounded-full border border-slate-200/60 hover:bg-slate-50 cursor-pointer outline-none transition-colors"
          >
            <div className="h-8.5 w-8.5 rounded-full bg-orange-100 flex items-center justify-center font-extrabold text-primary text-sm shadow-inner">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0 pr-0.5" />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-1.5 z-50 flex flex-col gap-1"
              >
                <div className="px-3.5 py-2.5 border-b border-slate-100 flex flex-col gap-0.5 mb-1">
                  <span className="text-xs font-extrabold text-slate-800 leading-none">{user?.name || 'Administrator'}</span>
                  <span className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{user?.email || 'admin@fuelflux.com'}</span>
                </div>

                {user?.roles && user.roles.length > 1 && (
                  <button
                    onClick={() => router.push('/select-role')}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-600 hover:text-primary hover:bg-orange-50/50 rounded-xl transition-colors cursor-pointer outline-none text-left"
                  >
                    <Sliders className="h-4 w-4 shrink-0" />
                    Switch User Role
                  </button>
                )}

                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer outline-none text-left"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Sign Out Session
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
