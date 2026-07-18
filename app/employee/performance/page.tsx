'use client';

import React from 'react';
import { Award, ShieldAlert, Star } from 'lucide-react';
import { PerformanceCard } from '@/components/employee/PerformanceCard';
import { useEmployeeStore } from '@/stores/employee.store';

export default function PerformanceMetricsPage() {
  const { profile } = useEmployeeStore();

  return (
    <div className="flex flex-col gap-6 text-left font-sans">
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <Star className="h-5.5 w-5.5 text-orange-500" />
          My Performance Scorecard
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">Review operational scores, transaction counts, and audit compliance metrics.</p>
      </div>

      <PerformanceCard profile={profile} />

      {/* Roster tips */}
      <div className="grid md:grid-cols-2 gap-4 mt-2">
        <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm text-left">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-2 mb-3">
            <Award className="h-4.5 w-4.5 text-orange-500" />
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Evaluation Metrics</h4>
          </div>
          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
            Performance ratings are calculated at the end of each billing cycle by aggregating:
          </p>
          <ul className="text-[10px] text-slate-500 font-semibold space-y-2 mt-3 list-disc pl-4">
            <li><span className="font-bold text-slate-700">Attendance punctuality (30% weight):</span> On-time check-ins and grace period limits.</li>
            <li><span className="font-bold text-slate-700">Terminal Accuracy (40% weight):</span> Tally logs, udhaar logs, and cash box precision.</li>
            <li><span className="font-bold text-slate-700">Operational checklist safety (30% weight):</span> Decanting and cleaning safety compliance.</li>
          </ul>
        </div>

        <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm text-left">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-2 mb-3">
            <Star className="h-4.5 w-4.5 text-orange-500" />
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Rating Rewards & Tiers</h4>
          </div>
          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
            Outstanding scores qualify employees for shift bonuses and fuel vouchers:
          </p>
          <ul className="text-[10px] text-slate-500 font-semibold space-y-2 mt-3 list-disc pl-4">
            <li><span className="font-bold text-slate-755 text-emerald-600">Excellent (Score &gt;= 90):</span> Payout multiplier and select-day roster priority.</li>
            <li><span className="font-bold text-slate-755 text-orange-500">Good (Score 80-89):</span> Priority shift swap authorizations.</li>
            <li><span className="font-bold text-slate-755 text-rose-500">Needs Improvement (Score &lt; 70):</span> Refresher shift safety logs checklist assigned.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
