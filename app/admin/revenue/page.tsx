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
  Cell
} from 'recharts';
import { useAnalyticsStore } from '@/stores/analytics.store';
import { IndianRupee, TrendingUp, Sparkles } from 'lucide-react';

export default function AdminRevenueAnalyticsPage() {
  const { mrr, arr, revenueGrowthHistory, tierDistribution, fetchAnalytics } = useAnalyticsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchAnalytics();
  }, []);

  const tierColors = ['#64748b', '#f97316', '#2563eb'];

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
          System Revenue Analytics
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Auditing licensing subscriptions pricing tiers, MRR timelines, and monthly top-ups collections.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Current MRR</span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono">Γé╣{mrr.toLocaleString('en-IN')}</span>
          </div>
          <div className="p-3 bg-orange-50 text-orange-500 rounded-xl border border-orange-100 shrink-0">
            <IndianRupee className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Annualized Runrate (ARR)</span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono">Γé╣{arr.toLocaleString('en-IN')}</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-500 rounded-xl border border-blue-100 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Active Subscriptions</span>
            <span className="text-2xl font-extrabold text-slate-900">2 Pumps Approved</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl border border-emerald-100 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MRR growth trend chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Financial timelines</span>
            <h3 className="text-sm font-extrabold text-slate-800">Monthly Revenue Collection Growth</h3>
          </div>
          <div className="h-64 w-full font-semibold text-slate-400">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueGrowthHistory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip formatter={(val: any) => [typeof val === 'number' ? `Γé╣${val.toLocaleString('en-IN')}` : val, 'Revenue']} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }} />
                <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pricing Plan Split */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Pricing tiers splits</span>
            <h3 className="text-sm font-extrabold text-slate-800">Active Stations Plan Distribution</h3>
          </div>
          <div className="h-64 w-full font-semibold text-slate-400">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tierDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '11px' }} />
                <Bar dataKey="count" name="Stations count" radius={[6, 6, 0, 0]}>
                  {tierDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={tierColors[index % tierColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
