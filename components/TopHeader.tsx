"use client";
import { useState } from "react";
import { Bell, ChevronDown, X, CheckCircle2, AlertCircle, Info, LogOut } from "lucide-react";
import Link from "next/link";

interface TopHeaderProps {
  userName: string;
  userRole: string;
  avatarInitials: string;
  avatarColor?: string;
  notificationCount?: number;
  notifications?: { id: number; type: "success" | "warning" | "info"; message: string; time: string }[];
}

const DEFAULT_NOTIFS = [
  { id: 1, type: "success" as const, message: "Payment of ₹25,000 verified by Admin", time: "2m ago" },
  { id: 2, type: "warning" as const, message: "Subscription expires in 3 days", time: "1h ago" },
  { id: 3, type: "info" as const, message: "New pump partner onboarded", time: "4h ago" },
];

export default function TopHeader({
  userName,
  userRole,
  avatarInitials,
  avatarColor = "from-orange-500 to-orange-600",
  notificationCount = 0,
  notifications = DEFAULT_NOTIFS,
}: TopHeaderProps) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [dismissed, setDismissed] = useState<number[]>([]);

  const visibleNotifs = notifications.filter(n => !dismissed.includes(n.id));
  const activeCount = Math.max(0, notificationCount - dismissed.length);

  const iconMap = {
    success: <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />,
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 fixed top-0 left-64 right-0 z-30 shadow-sm">
      {/* Left — Date */}
      <div className="text-xs text-gray-400 font-medium">
        {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifs(s => !s); setShowProfile(false); }}
            className="relative w-9 h-9 rounded-xl bg-gray-50 hover:bg-orange-50 flex items-center justify-center transition-colors border border-gray-100 hover:border-orange-200"
          >
            <Bell className="w-4 h-4 text-gray-500" />
            {activeCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold leading-none">
                {activeCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifs && (
            <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-soft border border-gray-100 z-50 animate-fade-in overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-700 text-gray-900" style={{ fontWeight: 700 }}>Notifications</p>
                <button onClick={() => setShowNotifs(false)}>
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              {visibleNotifs.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  All caught up!
                </div>
              ) : (
                <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                  {visibleNotifs.map(n => (
                    <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 group transition-colors">
                      {iconMap[n.type]}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                      </div>
                      <button onClick={() => setDismissed(d => [...d, n.id])} className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                        <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="px-4 py-2 border-t border-gray-100">
                <button onClick={() => setDismissed(notifications.map(n => n.id))} className="text-xs text-orange-500 hover:text-orange-600 font-semibold">
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(s => !s); setShowNotifs(false); }}
            className="flex items-center gap-3 cursor-pointer group p-1.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
              {avatarInitials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-gray-900 leading-tight">{userName}</p>
              <p className="text-[10px] text-gray-400 leading-tight">{userRole}</p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showProfile ? "rotate-180" : ""}`} />
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-soft border border-gray-100 z-50 animate-fade-in overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-orange-50">
                <p className="text-sm font-semibold text-gray-900">{userName}</p>
                <p className="text-xs text-orange-600">{userRole}</p>
              </div>
              <div className="p-2">
                <Link href="/" onClick={() => setShowProfile(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 cursor-pointer transition-colors font-medium">
                    <LogOut className="w-4 h-4" />
                    Logout
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      {(showNotifs || showProfile) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowNotifs(false); setShowProfile(false); }} />
      )}
    </header>
  );
}
