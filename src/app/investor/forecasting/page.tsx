'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Sparkles,
  AlertTriangle,
  Info,
  Calendar,
  Compass,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  ChevronRight,
  Activity,
  Flame,
  Scale
} from 'lucide-react';
import { useInvestorStore } from '@/stores/investor.store';

export default function ForecastingPage() {
  const { activePortfolioId, forecasts } = useInvestorStore();

  const portfolioForecasts = forecasts[activePortfolioId] || [];

  return (
    <div className="space-y-6 text-slate-800">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            AI Forecasting <Sparkles className="h-6 w-6 text-orange-500 animate-pulse" />
          </h1>
          <p className="text-xs font-semibold text-slate-505 mt-1">
            Predictive demand curves, seasonal consumption indexing, and ATG level anomaly monitors
          </p>
        </div>
      </div>

      {/* Forecast Spline Area Chart */}
      <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Demand Projections (Actual vs AI predicted)</h3>
            <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Dotted Projections show 3-month predictive bounds based on seasonal algorithms</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold">
            <span className="flex items-center gap-1.5 text-orange-500">
              <span className="w-2.5 h-2.5 bg-orange-500 rounded-full" /> Actual Sales
            </span>
            <span className="flex items-center gap-1.5 text-orange-500/70">
              <span className="w-2.5 h-2.5 border border-dashed border-orange-500 rounded-full" /> AI Predicted
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 bg-slate-200 rounded-full" /> Confidence bounds
            </span>
          </div>
        </div>

        {/* Advanced Dotted Spline SVG Chart */}
        <div className="w-full h-64 mt-4">
          <svg viewBox="0 0 600 220" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="0" y1="20" x2="600" y2="20" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="70" x2="600" y2="70" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="120" x2="600" y2="120" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="170" x2="600" y2="170" stroke="#CBD5E1" strokeWidth="1.5" />

            {/* Upper and Lower Confidence Bounds shaded path */}
            <path
              d="M 20 170 C 95 155, 170 142, 245 125 C 320 115, 395 95, 470 65 C 510 50, 550 40, 580 30
                 L 580 80 C 550 90, 510 100, 470 115 C 395 135, 320 155, 245 162 Z"
              fill="url(#confidenceGrad)"
            />

            {/* Actual line (up to May - index 4) */}
            <path
              d="M 20 170 C 95 158, 170 145, 245 128 C 320 118, 395 98, 470 70"
              fill="none"
              stroke="#f97316"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Dotted AI Projections (beyond May) */}
            <path
              d="M 470 70 C 510 55, 550 45, 580 35"
              fill="none"
              stroke="#f97316"
              strokeWidth="3.5"
              strokeDasharray="6 6"
              strokeLinecap="round"
            />

            {/* Confidence Boundary Lines */}
            <path
              d="M 20 170 C 95 155, 170 142, 245 125 C 320 115, 395 95, 470 65 C 510 50, 550 40, 580 30"
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <path
              d="M 20 170 C 95 165, 170 155, 245 142 C 320 135, 395 115, 470 95 C 510 80, 550 70, 580 55"
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />

            {/* Nodes */}
            <circle cx="470" cy="70" r="4.5" fill="#ffffff" stroke="#f97316" strokeWidth="2.5" />
            <circle cx="580" cy="35" r="4.5" fill="#ffffff" stroke="#f97316" strokeWidth="2.5" />

            {/* X-axis labels */}
            {portfolioForecasts.map((f, index) => (
              <text key={index} x={20 + index * 80} y="190" fill="#94A3B8" fontSize="8" fontWeight="bold" textAnchor="middle">
                {f.month.substring(0, 3)}
              </text>
            ))}
          </svg>
        </div>
      </div>

      {/* AI Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200/60 rounded-2xl p-4.5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-orange-500">
            <span className="text-[10px] font-black uppercase tracking-wider">Demand Projections</span>
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Expected June sales uptick</h4>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">
              AI algorithms predict a seasonal demand surge of <span className="text-orange-600 font-bold">14.6%</span> for highway diesel centers.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-2xl p-4.5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-rose-500">
            <span className="text-[10px] font-black uppercase tracking-wider">Credit Risk alert</span>
            <AlertTriangle className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Overdue debt exposure risk</h4>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">
              B2B Fleet GK Transport has surpassed 92% credit limit. Triggering auto-repay reminder protocols.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-2xl p-4.5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-amber-500">
            <span className="text-[10px] font-black uppercase tracking-wider">seasonal Spike alerts</span>
            <Flame className="h-4.5 w-4.5 animate-bounce" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">CNG demand seasonal spike</h4>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">
              Predictive filters indicate a 22% spike in public transit CNG refueling over the monsoon quarter.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-2xl p-4.5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 text-blue-500">
            <span className="text-[10px] font-black uppercase tracking-wider">Underperformance Warnings</span>
            <Scale className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Calibration warnings</h4>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">
              Vizag Port Terminal displays a 1.2% sales decline relative to quarterly goals. Re-calibration check suggested.
            </p>
          </div>
        </div>
      </div>

      {/* Anomaly Detection Table */}
      <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Forecourt Anomaly logs</h3>
            <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Suspicious fuel drops and ANPR dispenser variance alerts</p>
          </div>
          <span className="px-2.5 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-md text-[10px] font-black uppercase">
            1 Active Threat
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/60 bg-slate-50 text-[9px] font-black text-slate-450 uppercase tracking-wider">
                <th className="p-4 pl-6">Anomaly Type</th>
                <th className="p-4">Impacted Asset</th>
                <th className="p-4">Description</th>
                <th className="p-4 text-center">Variance Index</th>
                <th className="p-4 text-center">Audited Severity</th>
                <th className="p-4 pr-6">Incident Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-4 pl-6 font-black text-rose-500 flex items-center gap-1.5 whitespace-nowrap">
                  <ShieldAlert className="h-4 w-4 shrink-0" /> Siphoning Trigger
                </td>
                <td className="p-4 font-bold text-slate-800">Vijayawada Highway Fuel Center</td>
                <td className="p-4 text-slate-550">12L level drop reported while truck TS-08-EJ-9921 was idling inside bypass zones.</td>
                <td className="p-4 text-center text-rose-500 font-bold font-mono">-12.0 L</td>
                <td className="p-4 text-center">
                  <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded text-[9px] font-black uppercase">Critical</span>
                </td>
                <td className="p-4 pr-6 text-slate-450 whitespace-nowrap">2026-05-26 18:45</td>
              </tr>
              
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-4 pl-6 font-black text-amber-500 flex items-center gap-1.5 whitespace-nowrap">
                  <Activity className="h-4 w-4 shrink-0" /> Dispenser Offset
                </td>
                <td className="p-4 font-bold text-slate-800">Guntur Bypass Plaza</td>
                <td className="p-4 text-slate-550">Nozzle calibration audit showed 0.12% flow offset during morning shifts.</td>
                <td className="p-4 text-center text-amber-500 font-bold font-mono">+0.12%</td>
                <td className="p-4 text-center">
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-[9px] font-black uppercase">Warning</span>
                </td>
                <td className="p-4 pr-6 text-slate-450 whitespace-nowrap">2026-05-24 10:15</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
