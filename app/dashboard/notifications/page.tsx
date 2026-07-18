'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Trash2,
  Check,
  Clock,
  Sparkles,
  Database,
  Sliders,
  Settings,
  Filter,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useNotificationStore, StationNotification } from '@/stores/notification.store';
import { toast } from '@/components/feedback/Toast';
import { Button } from '@/components/ui/Button';

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, addNotification } = useNotificationStore();
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'critical'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const getNotifStyles = (type: StationNotification['type']) => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />,
          cardBg: 'bg-red-50/50 border-red-100 hover:bg-red-50 hover:border-red-200',
          badge: 'bg-red-100 text-red-700',
          indicator: 'bg-red-500',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />,
          cardBg: 'bg-amber-50/50 border-amber-100 hover:bg-amber-50 hover:border-amber-200',
          badge: 'bg-amber-100 text-amber-700',
          indicator: 'bg-amber-500',
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />,
          cardBg: 'bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50 hover:border-emerald-200',
          badge: 'bg-emerald-100 text-emerald-700',
          indicator: 'bg-emerald-500',
        };
      default:
        return {
          icon: <Info className="h-5 w-5 text-blue-600 shrink-0" />,
          cardBg: 'bg-blue-50/50 border-blue-100 hover:bg-blue-50 hover:border-blue-200',
          badge: 'bg-blue-100 text-blue-700',
          indicator: 'bg-blue-500',
        };
    }
  };

  const formatNotifTime = (isoString: string) => {
    const minutes = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(isoString).toLocaleDateString() + ' ' + new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleMarkRead = (id: string) => {
    markAsRead(id);
    toast.success('Alert marked as resolved.');
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    toast.success('All operational alerts resolved.');
  };

  const handleClearAll = () => {
    clearAll();
    toast.success('Cloud alerts archive successfully cleared.');
  };

  const handleTriggerSimAlert = () => {
    // Generate a mock telemetry alert
    const sims = [
      {
        title: 'PESO Hydrotesting Warning',
        msg: 'CNG Dispenser Nozzle 3 calibration certificate is expiring in 4 days. Schedule compliance audit immediately.',
        type: 'warning' as const
      },
      {
        title: 'Dispenser Pressure Valve Block',
        msg: 'High-pressure backflow logged on Petrol Pump Nozzle 2A. Autolock engaged.',
        type: 'danger' as const
      },
      {
        title: 'Tanker Delivery Synced',
        msg: 'Lorry consignment IOC-8012 (Petrol 12,000 L) successfully decanted to Tank 1.',
        type: 'success' as const
      }
    ];

    const pick = sims[Math.floor(Math.random() * sims.length)];
    addNotification(pick.title, pick.msg, pick.type);
    toast.success(`Mock telemetry alert triggered: "${pick.title}"`);
  };

  // Filtered notifications list
  const filteredNotifs = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'critical') return n.type === 'danger' || n.type === 'warning';
    return true;
  });

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800 text-left">
      
      {/* 1. MODULE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 rounded-2xl p-6 shadow-xs gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 border border-orange-200 text-primary">
            <Bell className="h-5.5 w-5.5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold text-text-primary tracking-tight">Alert & Compliance Center</h1>
            <p className="text-xs text-text-secondary">Monitor ATG inventory tank depletion levels, CCTV ANPR license mismatch events, and compliance rules.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              toast.success(`Alarms audio sound ${!soundEnabled ? 'ENABLED' : 'MUTED'}`);
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-700 transition-all cursor-pointer outline-none"
          >
            {soundEnabled ? <Volume2 className="h-4.5 w-4.5 text-primary" /> : <VolumeX className="h-4.5 w-4.5 text-slate-400" />}
          </button>

          {/* Trigger Alert Simulator */}
          <button
            onClick={handleTriggerSimAlert}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition-all outline-none cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-slate-500" />
            Trigger Alert Sim
          </button>
        </div>
      </div>

      {/* 2. TABBED CONTROLLERS & BULK ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-xs">
        {/* Tab Selection */}
        <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-250/20 select-none max-w-sm shrink-0">
          {[
            { id: 'all', label: `All Logs (${notifications.length})` },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'critical', label: 'Critical' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex-grow flex items-center justify-center py-2 px-4.5 text-xs font-bold rounded-xl transition-all cursor-pointer outline-none
                ${activeTab === tab.id ? 'bg-white text-primary shadow-2xs border border-slate-200/45' : 'text-slate-500 hover:text-slate-800'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition-all outline-none cursor-pointer"
            >
              <Check className="h-4 w-4 text-emerald-500" />
              Mark all read
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2.5 text-xs font-bold text-red-700 transition-all outline-none cursor-pointer"
            >
              <Trash2 className="h-4 w-4 shrink-0" />
              Clear Archive
            </button>
          )}
        </div>
      </div>

      {/* 3. ALERTS STACK CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <AnimatePresence mode="popLayout">
          {filteredNotifs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center py-20 gap-3 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50"
            >
              <CheckCircle className="h-9 w-9 text-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-400">All Systems Nomimal</span>
              <span className="text-[10px] text-slate-400 max-w-xs leading-relaxed">There are no operational warnings or hardware alarms registered for this fuel station. All dispensers and ATG probes are functioning within limits.</span>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredNotifs.map((n) => {
                const styles = getNotifStyles(n.type);
                return (
                  <motion.div
                    key={n.id}
                    layoutId={n.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`flex items-start justify-between p-4.5 rounded-2xl border transition-all ${styles.cardBg} gap-4 text-xs`}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Left icon wrapper */}
                      <div className="h-10 w-10 rounded-xl bg-white border border-slate-150 flex items-center justify-center shrink-0 shadow-2xs relative">
                        {styles.icon}
                        {!n.read && <span className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ${styles.indicator}`} />}
                      </div>

                      {/* Notification message details */}
                      <div className="flex flex-col gap-0.5 text-left">
                        <span className={`text-xs font-black tracking-tight ${n.read ? 'text-slate-600' : 'text-slate-800'}`}>
                          {n.title}
                        </span>
                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-0.5 max-w-2xl">
                          {n.message}
                        </p>
                        <span className="text-[9px] font-bold text-slate-400 font-mono flex items-center gap-1 mt-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatNotifTime(n.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Actions button */}
                    {!n.read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="text-[9px] font-bold text-primary hover:underline cursor-pointer outline-none shrink-0"
                      >
                        Resolve Alert
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
