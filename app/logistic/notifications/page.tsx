'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Trash2,
  Check,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useNotificationStore, StationNotification } from '@/stores/notification.store';
import { toast } from '@/components/feedback/Toast';

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotificationStore();

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    toast.success('Notification marked as read.');
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast.success('All notifications marked as read.');
  };

  const handleClearAll = () => {
    clearAll();
    toast.success('Notification feed cleared.');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Notifications Portal
          </h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">
            Audit logs and real-time operational feeds from FuelFlux network nodes
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleMarkAllAsRead}
            disabled={notifications.filter(n => !n.read).length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:border-orange-500/30 text-slate-700 hover:text-orange-500 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            <Check className="h-4 w-4" />
            Mark All as Read
          </button>
          <button
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            <Trash2 className="h-4 w-4" />
            Clear Feed
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Events Feed</h3>
          <span className="px-2.5 py-0.5 bg-orange-50 text-orange-600 rounded-md text-[10px] font-black uppercase">
            {notifications.filter(n => !n.read).length} Unread
          </span>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {notifications.map((notif) => {
              const icons = {
                success: <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />,
                warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />,
                danger: <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />,
                info: <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />,
              };

              const backgrounds = {
                success: 'bg-emerald-50/20 border-emerald-100/50',
                warning: 'bg-amber-50/20 border-amber-100/50',
                danger: 'bg-rose-50/20 border-rose-100/50',
                info: 'bg-blue-50/20 border-blue-100/50',
              };

              return (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className={`flex items-start justify-between gap-4 p-4 border rounded-2xl transition-all ${
                    backgrounds[notif.type]
                  } ${!notif.read ? 'ring-2 ring-orange-500/5 bg-white' : 'bg-slate-50/50'}`}
                >
                  <div className="flex items-start gap-3.5">
                    {icons[notif.type]}
                    <div>
                      <h4 className={`text-xs font-black text-slate-900 ${!notif.read ? 'text-orange-600' : ''}`}>
                        {notif.title}
                      </h4>
                      <p className="text-xs font-semibold text-slate-500 mt-1 leading-relaxed max-w-xl">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{new Date(notif.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {!notif.read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="p-1.5 border border-slate-200/80 hover:border-orange-500/30 bg-white hover:bg-slate-50 text-slate-400 hover:text-orange-500 rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
                      title="Mark as Read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {notifications.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <Bell className="h-10 w-10 mx-auto mb-3 text-slate-300" />
              <h4 className="text-sm font-bold text-slate-800">Your feed is clean</h4>
              <p className="text-xs font-semibold mt-1">There are no operational events in the audit backlog.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
