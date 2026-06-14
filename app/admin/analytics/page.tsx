'use client';

import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { useAnalyticsStore } from '@/stores/analytics.store';
import { useAdminStore } from '@/stores/admin.store';
import { LineChart, Users, DollarSign, Activity } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const { revenueGrowthHistory, regionalData, fetchAnalytics } = useAnalyticsStore();
  const { pumps, fetchPumps } = useAdminStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchAnalytics();
    fetchPumps();
  }, []);

  const userDistribution = [
    { name: 'Station Owners', value: 18, color: '#f97316' },
    { name: 'Logistics Managers', value: 12, color: '#3b82f6' },
    { name: 'Investors', value: 8, color: '#10b981' },
    { name: 'Attendants / Employees', value: 45, color: '#6366f1' },
  ];

  if (!mounted) {
    return (
      <div className="min-h-[400px] w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Platform-Wide Growth Analytics
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Auditing registration rate metrics, transaction trends, and client profile splits.
        </p>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Acquisition Trend */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Acquisition Channels</span>
            <h3 className="text-sm font-extrabold text-slate-800">Monthly Registration Analytics</h3>
          </div>
          <div className="h-64 w-full font-semibold text-slate-400">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueGrowthHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAcq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }} />
                <Area type="monotone" dataKey="registrations" name="New registrations" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorAcq)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Account Splits */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Client Base Matrix</span>
            <h3 className="text-sm font-extrabold text-slate-800">Active Roles Distribution</h3>
          </div>
          <div className="h-64 w-full font-semibold text-slate-400">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '11px' }} />
                <Bar dataKey="value" name="Accounts count" fill="#f97316" radius={[6, 6, 0, 0]}>
                  {userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Distribution Pie */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Geographic Grid</span>
            <h3 className="text-sm font-extrabold text-slate-800">Region-Wise Fuel Pump Shares</h3>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center py-4">
            <div className="h-44 w-44 font-semibold text-slate-500 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={regionalData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    <Cell fill="#f97316" />
                    <Cell fill="#2563eb" />
                    <Cell fill="#10b981" />
                    <Cell fill="#a855f7" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 font-semibold text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-orange-500 shrink-0" />
                <span>Maharashtra ({regionalData[0]?.value || 0}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-600 shrink-0" />
                <span>Uttar Pradesh ({regionalData[1]?.value || 0}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500 shrink-0" />
                <span>Karnataka ({regionalData[2]?.value || 0}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-purple-500 shrink-0" />
                <span>Gujarat ({regionalData[3]?.value || 0}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
