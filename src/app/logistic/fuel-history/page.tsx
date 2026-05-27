'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Fuel,
  ShieldAlert,
  TrendingDown,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  Compass,
  MapPin,
  Clock,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Info
} from 'lucide-react';
import { useFleetStore } from '@/stores/fleet.store';

export default function FuelHistoryPage() {
  const { activeFleetId, transactions } = useFleetStore();
  const fleetTransactions = transactions[activeFleetId] || [];

  // Calculate telemetry stats
  const totalLiters = fleetTransactions.reduce((acc, curr) => acc + curr.quantity, 0);
  const avgEfficiency = activeFleetId === 'fleet_1' ? 4.2 : 3.8; // mock km/L
  const carbonFootprint = (totalLiters * 2.68).toFixed(0); // Co2 kilograms

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Fuel Telemetry
          </h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">
            Suspicious fuel drain alarms, GPS route calibration, and dispenser verification audits
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Liters Fuelled (MTD)</p>
          <h3 className="text-2xl font-black text-slate-900 mt-2 flex items-baseline gap-1">
            {totalLiters.toLocaleString()} <span className="text-xs font-bold text-slate-400">Liters</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">Fueling transactions calibrated within tolerance</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Fleet Efficiency</p>
          <h3 className="text-2xl font-black text-slate-900 mt-2 flex items-baseline gap-1">
            {avgEfficiency} <span className="text-xs font-bold text-slate-400">km / L</span>
          </h3>
          <p className="text-[10px] text-emerald-500 font-bold mt-1">▲ 2.4% above logistics standard</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Co2 Emission Footprint</p>
          <h3 className="text-2xl font-black text-slate-900 mt-2 flex items-baseline gap-1">
            {Number(carbonFootprint).toLocaleString()} <span className="text-xs font-bold text-slate-400">kg Co2</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">Estimated carbon index based on diesel consumption</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Efficiency Curve Chart (2/3 width) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Efficiency vs Transit Velocity</h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Optimum vehicle speed correlation (km/L vs km/h)</p>
            </div>
            <span className="px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-md text-[9px] font-extrabold uppercase">Telemetry Spline</span>
          </div>

          <div className="w-full h-56 mt-4 relative">
            <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="600" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="70" x2="600" y2="70" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="170" x2="600" y2="170" stroke="#cbd5e1" strokeWidth="1" />

              {/* Spline representing optimal efficiency peak at 50-60 km/h */}
              <path
                d="M 20 160 Q 150 120, 300 40 T 580 150"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Peak Efficiency Node */}
              <circle cx="300" cy="40" r="5" fill="#ffffff" stroke="#3b82f6" strokeWidth="3" />
              <text x="300" y="24" fill="#1e293b" fontSize="10" fontWeight="black" textAnchor="middle">Optimum: 55 km/h (4.8 km/L)</text>

              {/* Axes Labels */}
              <text x="20" y="192" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">20 km/h</text>
              <text x="160" y="192" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">40 km/h</text>
              <text x="300" y="192" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">60 km/h</text>
              <text x="440" y="192" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">80 km/h</text>
              <text x="560" y="192" fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="middle">100 km/h</text>
            </svg>
          </div>
        </div>

        {/* Suspicious Siphoning Alarms Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldAlert className="h-5 w-5 text-rose-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Telemetry Alarms</h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Real-time alerts for unverified drops</p>
            </div>
          </div>

          {fleetTransactions.length > 0 ? (
            <div className="space-y-4">
              <div className="border border-rose-100 bg-rose-50/40 rounded-2xl p-4.5 space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-black text-slate-900 uppercase">Suspicious fuel Level Drop</h4>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded text-[9px] font-black uppercase">Critical</span>
                </div>
                <p className="text-xs font-semibold text-slate-600 leading-normal">
                  Truck <span className="font-bold text-slate-800">TS-08-EJ-9921</span> logged an abnormal 12.0 L drop while idling at NH-65 Toll Junction.
                </p>
                <div className="border-t border-rose-200/55 pt-3 space-y-2 text-[10px] font-bold text-slate-500">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>2026-05-26 18:45</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>NH-65 Highway Toll bypass, Vijayawada</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 font-bold">
              <ShieldCheck className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
              <p className="text-xs">No active siphoning alerts triggered.</p>
            </div>
          )}
        </div>
      </div>

      {/* Fuel Calibration logs */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-base font-bold text-slate-900">Dispenser Integrity Logs</h3>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Dispenser calibration audits cross-checked against on-board GPS telematics</p>
        </div>

        <div className="space-y-3">
          <div className="border border-slate-200/60 rounded-2xl p-4 bg-slate-50 flex items-center justify-between flex-wrap gap-4 text-xs font-semibold">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <CheckCircle2 className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Ref: TXN-501 Calibration Check</p>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Vijayawada Highway Fuel Center</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-right">
                <p className="text-[9px] text-slate-400 font-bold uppercase">Variance Index</p>
                <p className="font-black text-emerald-600">0.02% (Pass)</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-slate-400 font-bold uppercase">Flow Rate</p>
                <p className="font-bold text-slate-800">42 L/min</p>
              </div>
            </div>
          </div>

          <div className="border border-slate-200/60 rounded-2xl p-4 bg-slate-50 flex items-center justify-between flex-wrap gap-4 text-xs font-semibold">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <CheckCircle2 className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Ref: TXN-601 Calibration Check</p>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Hyderabad Gachibowli Station</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-right">
                <p className="text-[9px] text-slate-400 font-bold uppercase">Variance Index</p>
                <p className="font-black text-emerald-600">0.05% (Pass)</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-slate-400 font-bold uppercase">Flow Rate</p>
                <p className="font-bold text-slate-800">38 L/min</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
