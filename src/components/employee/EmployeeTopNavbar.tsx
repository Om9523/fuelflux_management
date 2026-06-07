'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  ChevronDown,
  User,
  LogOut,
  Sliders,
  Menu,
  CheckCircle,
  AlertTriangle,
  Info,
  Key,
} from 'lucide-react';
import { useNotificationStore, StationNotification } from '@/stores/notification.store';
import { useSidebarStore } from '@/stores/sidebar.store';
import { useAuthStore } from '@/stores/auth.store';
import { useEmployeeStore } from '@/stores/employee.store';

export const EmployeeTopNavbar: React.FC = () => {
  const router = useRouter();

  // Stores
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const { toggleMobile } = useSidebarStore();
  const { logout } = useAuthStore();
  const { user, profile } = useEmployeeStore();

  // Component UI toggles
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Refs for click outside to close panels
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Click outside listener
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
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

  const handleLogout = () => {
    logout();
    router.push('/login');
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

  const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'EE';

  return (
    <header className="h-16 border-b border-orange-100 bg-white sticky top-0 z-40 flex items-center justify-between px-6 shadow-sm select-none font-sans">
      {/* LEFT: Mobile sidebar trigger & Station context display */}
      <div className="flex items-center gap-4 relative">
        <button
          onClick={toggleMobile}
          className="lg:hidden p-1.5 rounded-xl hover:bg-orange-50/50 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer outline-none border border-transparent hover:border-orange-100"
        >
          <Menu className="h-5.5 w-5.5" />
        </button>

        <div className="hidden md:flex flex-col">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">Station Hub</p>
          <p className="text-xs font-bold text-slate-700 leading-none">
            {profile?.assignedPump || 'Bharat Petroleum Sector 62'}
          </p>
        </div>
      </div>

      {/* RIGHT: Notifications & User Dropdown */}
      <div className="flex items-center gap-4 relative">
        {/* Notifications dropdown bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2.5 rounded-xl hover:bg-orange-50/50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer outline-none relative border border-transparent hover:border-orange-100"
          >
            <Bell className="h-5 w-5 text-slate-600" />
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
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-orange-100 p-2 z-50 flex flex-col"
              >
                <div className="flex justify-between items-center px-4 py-3 border-b border-orange-50">
                  <span className="text-xs font-extrabold text-slate-850 tracking-tight">Recent Alerts ({unreadCount})</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] font-bold text-orange-500 hover:text-orange-600 hover:underline cursor-pointer outline-none"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="flex flex-col max-h-[300px] overflow-y-auto p-1.5 gap-1">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-xs font-medium text-slate-400">
                      No new announcements.
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
                          <div className="flex justify-between items-center gap-2">
                            <span className={`text-xs font-bold leading-tight ${n.read ? 'text-slate-700' : 'text-slate-900'} truncate`}>
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
            className="flex items-center gap-1.5 p-1 rounded-full border border-orange-100 hover:bg-orange-50/20 cursor-pointer outline-none transition-colors"
          >
            <div className="h-8.5 w-8.5 rounded-full bg-orange-100 flex items-center justify-center font-extrabold text-orange-600 text-sm shadow-inner shrink-0">
              {profile?.photoUrl ? (
                <img src={profile.photoUrl} alt={user?.name} className="h-full w-full rounded-full object-cover" />
              ) : initials}
            </div>
            <div className="hidden sm:flex flex-col text-left pr-1 pl-0.5">
              <span className="text-xs font-bold text-slate-800 leading-none truncate max-w-[100px]">{user?.name || 'Staff User'}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 leading-none">{profile?.employeeId || 'EMP-XXXX'}</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0 pr-0.5" />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-orange-100 p-1.5 z-50 flex flex-col gap-1"
              >
                <div className="px-3.5 py-2.5 border-b border-orange-50 flex flex-col gap-0.5 mb-1">
                  <span className="text-xs font-extrabold text-slate-800 leading-none">{user?.name || 'Staff'}</span>
                  <span className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{user?.email || 'staff@fuelflux.com'}</span>
                </div>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    router.push('/employee/profile');
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-650 hover:text-orange-500 hover:bg-orange-50/50 rounded-xl transition-colors cursor-pointer outline-none text-left"
                >
                  <User className="h-4 w-4 text-slate-400 shrink-0" />
                  My Profile
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    router.push('/employee/profile#change-password');
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-650 hover:text-orange-500 hover:bg-orange-50/50 rounded-xl transition-colors cursor-pointer outline-none text-left"
                >
                  <Key className="h-4 w-4 text-slate-400 shrink-0" />
                  Change Password
                </button>

                {user?.roles && user.roles.length > 1 && (
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      router.push('/select-role');
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-650 hover:text-orange-500 hover:bg-orange-50/50 rounded-xl transition-colors cursor-pointer outline-none text-left"
                  >
                    <Sliders className="h-4 w-4 text-slate-400 shrink-0" />
                    Switch active role
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer outline-none text-left border-t border-slate-50 mt-1 pt-2"
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
