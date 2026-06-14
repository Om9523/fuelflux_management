'use client';

import React, { useEffect } from 'react';
import { CreditCard, ArrowUpRight, ShieldCheck, HelpCircle, Activity } from 'lucide-react';
import { useAnalyticsStore } from '@/stores/analytics.store';
import { toast } from '@/components/feedback/Toast';

export default function AdminSubscriptionsPage() {
  const { subscriptions, mrr, arr, activeSubscriptionsCount, churnRate, fetchAnalytics, isLoading } = useAnalyticsStore();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleUpgrade = (pumpName: string) => {
    toast.success(`Upgrading plan requested for: ${pumpName}`);
  };

  const getStatusBadge = (status: string) => {
    const statuses = {
      active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      expiring: 'bg-amber-50 text-amber-600 border-amber-100',
      churned: 'bg-slate-100 text-slate-500 border-slate-200',
    };
    return (
      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 border rounded-full uppercase ${(statuses as any)[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          System Subscriptions Ledger
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Auditing active station licenses, recurring revenue allocations, and plan tiers.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Monthly Recurring (MRR)</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">Γé╣{mrr.toLocaleString('en-IN')}</span>
            <span className="text-[10px] font-bold text-emerald-500">+12% MoM</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Annual Recurring (ARR)</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">Γé╣{arr.toLocaleString('en-IN')}</span>
            <span className="text-[10px] font-bold text-slate-400">Projected Runrate</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Active Subscriptions</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{activeSubscriptionsCount} Pumps</span>
            <span className="text-[10px] font-bold text-slate-400">Licensing Grid</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">System Churn Rate</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{churnRate}%</span>
            <span className="text-[10px] font-bold text-emerald-500">Low baseline</span>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4">Station</th>
                <th className="px-6 py-4">License Holder</th>
                <th className="px-6 py-4">Subscription Plan</th>
                <th className="px-6 py-4 text-right">Licensing Fee</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Next Renewal Date</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 font-bold text-slate-400">
                    Syncing recurring ledger...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 font-bold text-slate-400">
                    No active licenses registered.
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex gap-2.5 items-center">
                        <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-500 border border-orange-100/50 flex items-center justify-center shrink-0">
                          <CreditCard className="h-4 w-4" />
                        </div>
                        <span className="text-slate-800 font-extrabold truncate max-w-[200px]">
                          {sub.pumpName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-bold">
                      {sub.ownerName}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-slate-800 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                        {sub.planName} Plan
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-800">
                      Γé╣{sub.amount.toLocaleString('en-IN')} / mo
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(sub.status)}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(sub.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => handleUpgrade(sub.pumpName)}
                          className="px-3 py-1.5 text-[10px] font-extrabold text-orange-500 hover:text-white bg-white hover:bg-orange-500 border border-orange-200 hover:border-orange-500 rounded-lg cursor-pointer transition-colors outline-none"
                        >
                          Modify Plan
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
