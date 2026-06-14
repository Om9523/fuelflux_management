'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Truck,
  FileText,
  AlertTriangle,
  Coins,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Percent,
  Search,
  Filter,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useInvestorStore } from '@/stores/investor.store';

export default function FleetAnalyticsPage() {
  const { activePortfolioId, fleets, portfolios } = useInvestorStore();
  const [searchTerm, setSearchTerm] = useState('');

  const portfolioFleets = fleets[activePortfolioId] || [];
  const activePortfolio = portfolios.find(p => p.id === activePortfolioId) || portfolios[0];

  const filteredFleets = portfolioFleets.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Aggregates
  const totalFleetSpend = portfolioFleets.reduce((acc, curr) => acc + curr.monthlySpend, 0);
  const avgCreditUtil = portfolioFleets.reduce((acc, curr) => acc + curr.creditUtilization, 0) / (portfolioFleets.length || 1);
  const activeVehicles = portfolioFleets.reduce((acc, curr) => acc + curr.activeVehicles, 0);

  const riskBadgeStyle = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      default: return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Fleet Analytics
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            B2B transport carrier logs, credit ceiling allocations, and voucher telemetry
          </p>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200/60 rounded-2xl p-4.5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active B2B Fleets</p>
          <h3 className="text-xl font-black text-slate-800 mt-1.5">{portfolioFleets.length} Accounts</h3>
          <span className="text-[10px] text-slate-500 mt-2 block">Refueling active commercial vehicles</span>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-2xl p-4.5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active fleet Vehicles</p>
          <h3 className="text-xl font-black text-slate-800 mt-1.5">{activeVehicles} Trucks</h3>
          <span className="text-[10px] text-slate-500 mt-2 block">ANPR registered credentials</span>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-2xl p-4.5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">MTD B2B Consumption</p>
          <h3 className="text-xl font-black text-slate-800 mt-1.5">Γé╣{totalFleetSpend.toLocaleString()}</h3>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-2">
            Γû▓ +6.8% MoM
          </span>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-2xl p-4.5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Credit Utilization Rate</p>
          <h3 className="text-xl font-black text-slate-800 mt-1.5">{avgCreditUtil.toFixed(1)}%</h3>
          <span className="text-[10px] text-slate-500 mt-2 block">Average against approved limit caps</span>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Custom SVG Credit Utilization Chart (2/3 width) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
            B2B Credit Ceiling Exposures
          </h3>

          <div className="space-y-4">
            {portfolioFleets.map((f, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>{f.name}</span>
                  <span className={f.creditUtilization > 90 ? 'text-rose-600 font-extrabold' : 'text-slate-500'}>
                    Γé╣{f.monthlySpend.toLocaleString()} ({f.creditUtilization}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      f.creditUtilization > 90 ? 'bg-rose-500' : f.creditUtilization > 75 ? 'bg-amber-500' : 'bg-gradient-to-r from-orange-500 to-amber-500'
                    }`}
                    style={{ width: `${f.creditUtilization}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Voucher Refill Status Pie */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Digital QR Voucher Index</h3>
            <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Ratio of issued vs redeemed B2B tokens</p>
          </div>

          <div className="flex items-center justify-center my-6 relative">
            <svg width="150" height="150" viewBox="0 0 36 36" className="transform -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F1F5F9" strokeWidth="5" />
              {/* Used segment (Redeemed) - approx 84% */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="#f97316"
                strokeWidth="5"
                strokeDasharray="84 16"
                strokeDashoffset="0"
              />
              {/* Pending segment - approx 12% */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="#2563EB"
                strokeWidth="5"
                strokeDasharray="12 88"
                strokeDashoffset="-84"
              />
              {/* Expired segment - approx 4% */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="#ef4444"
                strokeWidth="5"
                strokeDasharray="4 96"
                strokeDashoffset="-96"
              />
            </svg>
            <div className="absolute text-center flex flex-col justify-center items-center">
              <FileText className="h-5 w-5 text-slate-400" />
              <span className="text-[8px] font-black text-slate-400 mt-1 uppercase">Redemption</span>
              <span className="text-xs font-black text-slate-850">84.2%</span>
            </div>
          </div>

          <div className="space-y-2 text-xs font-bold text-slate-650">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#f97316] rounded-full" />
                <span>Redeemed Vouchers</span>
              </div>
              <span className="text-slate-800">84%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#2563EB] rounded-full" />
                <span>Pending refuels</span>
              </div>
              <span className="text-slate-800">12%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#ef4444] rounded-full" />
                <span>Expired / Void</span>
              </div>
              <span className="text-slate-800">4%</span>
            </div>
          </div>
        </div>
      </div>

      {/* B2B accounts details table */}
      <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Venture Fleet Registry</h3>
          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">B2B client outstanding debt levels and credit limits</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/60 bg-slate-50 text-[9px] font-black text-slate-450 uppercase tracking-wider">
                <th className="p-4 pl-6">Client Carrier Account</th>
                <th className="p-4 text-right">Active Vehicles</th>
                <th className="p-4 text-right">MTD Sales Volume</th>
                <th className="p-4 text-right">Credit limit ceiling</th>
                <th className="p-4 text-right">Outstanding balances</th>
                <th className="p-4 text-center">Credit utilization</th>
                <th className="p-4 text-center pr-6">Audited Risk score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
              {filteredFleets.map((f, idx) => {
                const limitAmount = f.monthlySpend / (f.creditUtilization / 100);
                const outstanding = f.monthlySpend * 0.45; // simulated outstanding debt
                
                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 font-black text-slate-800">{f.name}</td>
                    <td className="p-4 text-right text-slate-550">{f.activeVehicles}</td>
                    <td className="p-4 text-right font-bold text-slate-800">Γé╣{f.monthlySpend.toLocaleString()}</td>
                    <td className="p-4 text-right text-slate-500">Γé╣{limitAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="p-4 text-right text-rose-600 font-bold">Γé╣{outstanding.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="p-4 text-center font-mono text-orange-600 font-extrabold">{f.creditUtilization}%</td>
                    <td className="p-4 text-center pr-6">{riskBadgeStyle(f.riskRating) ? <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${riskBadgeStyle(f.riskRating)}`}>{f.riskRating}</span> : null}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
