'use client';

import React, { useState } from 'react';
import { Bell, Send, Megaphone, ShieldAlert, CheckCircle, HelpCircle } from 'lucide-react';
import { toast } from '@/components/feedback/Toast';

interface SystemNotification {
  id: string;
  title: string;
  message: string;
  target: string;
  type: 'announcement' | 'warning' | 'critical';
  timestamp: string;
}

export default function AdminNotificationCenterPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [type, setType] = useState<'announcement' | 'warning' | 'critical'>('announcement');
  
  const [broadcasts, setBroadcasts] = useState<SystemNotification[]>([
    {
      id: 'b_1',
      title: 'Scheduled System Maintenance downtime',
      message: 'FuelFlux APIs and payment gateway channels will undergo routine updates on June 5 from 02:00 AM to 04:00 AM IST.',
      target: 'All Clients',
      type: 'warning',
      timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'b_2',
      title: 'Premium Plan Pricing Adjustment',
      message: 'Licensing rates for Premium Plan stations will update to 16,499 INR starting next billing cycle.',
      target: 'Pump Owners',
      type: 'announcement',
      timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    }
  ]);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required.');
      return;
    }

    const newBroadcast: SystemNotification = {
      id: 'b_' + Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      message: message.trim(),
      target: target === 'all' ? 'All Clients' : target === 'owners' ? 'Pump Owners' : 'Logistics fleets',
      type,
      timestamp: new Date().toISOString(),
    };

    setBroadcasts([newBroadcast, ...broadcasts]);
    setTitle('');
    setMessage('');
    toast.success(`Platform announcement broadcasted to ${newBroadcast.target}.`);
  };

  const getBadgeStyle = (bType: string) => {
    const styles = {
      announcement: 'bg-blue-50 text-blue-600 border-blue-100',
      warning: 'bg-amber-50 text-amber-600 border-amber-100',
      critical: 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse',
    };
    return (styles as any)[bType] || 'bg-slate-50';
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Admin Broadcast & Notifications
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Broadcast official announcements, push warnings alerts, and manage system communications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Broadcast Form (Left 1 Col) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="space-y-1.5 pb-3 border-b border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Announcements</span>
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
              <Megaphone className="h-4.5 w-4.5 text-orange-500 shrink-0" />
              Broadcast Alert
            </h3>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Alert Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Server updates scheduled"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Target Group</label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-orange-500 cursor-pointer"
                >
                  <option value="all">All Clients</option>
                  <option value="owners">Pump Owners</option>
                  <option value="logistics">Logistic Fleets</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Alert Severity</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-orange-500 cursor-pointer"
                >
                  <option value="announcement">Announcement</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Alert Message Body</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Compose announcements here..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-orange-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl cursor-pointer transition-colors shadow-lg shadow-orange-500/10 flex items-center justify-center gap-1.5 outline-none"
            >
              <Send className="h-4 w-4" />
              Broadcast Alert
            </button>
          </form>
        </div>

        {/* Broadcast logs (Right 2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Recent Broadcast Dispatches History
            </h3>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {broadcasts.map((b) => (
              <div key={b.id} className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/20 text-xs space-y-2.5 relative hover:border-slate-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-xs font-extrabold text-slate-800 block">
                      {b.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      Target: <strong className="text-slate-600">{b.target}</strong>
                    </span>
                  </div>
                  <span className={`text-[8.5px] font-extrabold px-2 py-0.5 border rounded-full uppercase ${getBadgeStyle(b.type)}`}>
                    {b.type}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  {b.message}
                </p>
                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-bold">
                  Sent: {new Date(b.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
