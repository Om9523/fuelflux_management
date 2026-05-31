'use client';

import React, { useState } from 'react';
import {
  Layers,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  FileText,
  Building,
  UserCheck,
  Calendar,
  Waves,
} from 'lucide-react';
import { toast } from '@/components/feedback/Toast';

export default function InventoryPage() {
  const [tanks, setTanks] = useState([
    { id: 'TNK-01', name: 'Petrol (Premium)', current: 15000, capacity: 20000, color: 'from-orange-500 to-amber-500' },
    { id: 'TNK-02', name: 'Diesel (High-Speed)', current: 5200, capacity: 20000, color: 'from-blue-500 to-sky-500' },
    { id: 'TNK-03', name: 'CNG Compressed Gas', current: 8800, capacity: 10000, color: 'from-emerald-500 to-teal-500' },
  ]);

  // Seed delivery logs
  const [deliveries, setDeliveries] = useState([
    { id: 'DEL-501', tank: 'Tank 2 (Diesel)', volume: '12,000 L', driver: 'Arun Singh', plate: 'TS-08-EJ-9922', date: '2026-05-26', status: 'unloaded' },
    { id: 'DEL-502', tank: 'Tank 1 (Petrol)', volume: '10,000 L', driver: 'Sanjay Dutt', plate: 'AP-09-CD-1234', date: '2026-05-24', status: 'unloaded' },
  ]);

  const handleReconcile = () => {
    toast.success('Initiated wet-stock reconciliation audit. Sensor calibration active.');
  };

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 rounded-2xl p-6 shadow-xs gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 border border-orange-200 text-primary">
            <Layers className="h-5.5 w-5.5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold text-text-primary tracking-tight">Active Storage Tanks</h1>
            <p className="text-xs text-text-secondary">Track real-time digital fuel levels, wet-stock adjustments, sensor audits, and tanker carrier schedules</p>
          </div>
        </div>

        <button
          onClick={handleReconcile}
          className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-4.5 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 transition-all outline-none cursor-pointer"
        >
          Reconcile Wet-Stock
        </button>
      </div>

      {/* 2. CORE FEATURE: GORGEOUS ANIMATED VERTICAL LIQUID GAUGES */}
      <div className="grid md:grid-cols-3 gap-6 text-left">
        {tanks.map((t) => {
          const percentage = (t.current / t.capacity) * 100;
          const isLow = percentage < 30;

          return (
            <div
              key={t.id}
              className={`
                bg-white border rounded-3xl p-6 shadow-sm flex flex-col gap-6 relative transition-all duration-300
                ${isLow ? 'border-red-200 bg-red-50/5' : 'border-slate-100'}
              `}
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tight">{t.id}</span>
                  <h3 className="text-xs font-extrabold text-text-primary mt-0.5">{t.name}</h3>
                </div>
                {isLow && (
                  <span className="px-2 py-0.5 bg-red-50 border border-red-100 text-red-600 font-bold text-[8px] rounded-md animate-pulse">
                    LOW STOCK WARNING
                  </span>
                )}
              </div>

              {/* Centerpiece: HTML/CSS Animated Cylindrical Fluid Tank Gauge */}
              <div className="flex items-center justify-center py-4 relative">
                {/* Outer Glass Cylinder */}
                <div className="h-48 w-24 rounded-3xl bg-slate-150 border-2 border-slate-300 shadow-inner relative overflow-hidden flex flex-col justify-end">
                  {/* Internal Shifting Liquid Level */}
                  <div
                    className={`w-full bg-gradient-to-t ${t.color} opacity-80 rounded-b-2xl relative transition-all duration-1000 ease-out`}
                    style={{ height: `${percentage}%` }}
                  >
                    {/* Simulated Floating Water Wave Line using Tailwind animations */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-white/20 animate-pulse" />
                  </div>
                  
                  {/* Percentage absolute overlay label */}
                  <div className="absolute inset-0 flex items-center justify-center font-mono text-base font-extrabold text-text-primary z-10 select-none">
                    {percentage.toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Footer tank indicators */}
              <div className="flex justify-between items-center text-xs border-t border-slate-50 pt-4">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-text-secondary uppercase">Fuel Volume</span>
                  <span className="font-bold text-text-primary font-mono">{t.current.toLocaleString()} L</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[9px] font-bold text-text-secondary uppercase">Capacity Roster</span>
                  <span className="font-bold text-text-primary font-mono">{t.capacity.toLocaleString()} L</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. DELIVERIES LEDGER */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col gap-4 text-left">
        <h3 className="text-xs font-extrabold text-text-primary uppercase tracking-wider border-b border-slate-50 pb-3">
          Tanker Unloading Deliveries Log
        </h3>
        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 font-extrabold text-text-secondary">
                <th className="p-4 uppercase tracking-wider">Delivery ID</th>
                <th className="p-4 uppercase tracking-wider">Target Storage Tank</th>
                <th className="p-4 uppercase tracking-wider">Liters Unloaded</th>
                <th className="p-4 uppercase tracking-wider">Unload Date</th>
                <th className="p-4 uppercase tracking-wider">Licensed Driver</th>
                <th className="p-4 uppercase tracking-wider">Carrier Plate</th>
                <th className="p-4 uppercase tracking-wider">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-text-primary">
              {deliveries.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-primary">{d.id}</td>
                  <td className="p-4 font-bold">{d.tank}</td>
                  <td className="p-4 font-bold text-slate-900 font-mono">{d.volume}</td>
                  <td className="p-4 flex items-center gap-1.5 py-4">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {d.date}
                  </td>
                  <td className="p-4 font-bold">{d.driver}</td>
                  <td className="p-4 font-mono text-text-secondary">{d.plate}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-[9px] rounded-lg">
                      COMPLETED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
