"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle2, Info, AlertTriangle, XCircle, Check } from "lucide-react";
import { useNotificationStore } from "@/stores/useNotificationStore";

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const displayNotifications = filter === "unread" 
    ? notifications.filter(n => !n.isRead) 
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success': return "bg-green-50";
      case 'warning': return "bg-amber-50";
      case 'error': return "bg-red-50";
      default: return "bg-blue-50";
    }
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-orange-500" /> Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Stay updated with your bookings and rewards.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
            <button 
              onClick={() => setFilter("all")}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filter === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter("unread")}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filter === "unread" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Unread
            </button>
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-orange-500 hover:text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        <AnimatePresence>
          {displayNotifications.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {displayNotifications.map((notification) => (
                <motion.div 
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                  className={`p-5 transition-colors cursor-pointer flex gap-4 ${notification.isRead ? "bg-white hover:bg-gray-50" : "bg-orange-50/30 hover:bg-orange-50/50"}`}
                >
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${getBgColor(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className={`text-sm ${notification.isRead ? "font-semibold text-gray-800" : "font-bold text-gray-900"}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">
                        {timeAgo(notification.timestamp)}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 leading-relaxed ${notification.isRead ? "text-gray-500" : "text-gray-700"}`}>
                      {notification.message}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="flex-shrink-0 flex items-center justify-center w-8">
                      <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full py-20 text-gray-500"
            >
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <p className="font-semibold">No notifications found.</p>
              <p className="text-sm mt-1">You're all caught up!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
