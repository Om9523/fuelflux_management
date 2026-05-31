'use client';

import React, { useState } from 'react';
import {
  Receipt,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  ShieldCheck,
  TrendingUp,
  FileText,
  Building,
  UserCheck,
  Layers,
  Calendar,
} from 'lucide-react';
import { toast } from '@/components/feedback/Toast';

export default function SalesRegisterPage() {
  const [activeTab, setActiveTab] = useState<'shift' | 'nozzle' | 'attendant' | 'receipts'>('shift');
  const [searchQuery, setSearchQuery] = useState('');

  // Seed sales statistics
  const [shiftSales, setShiftSales] = useState([
    { id: 'SFT-B', name: 'Shift B (2PM - 10PM)', date: '2026-05-27', totalLiters: '8,420 L', totalAmount: '₹8,58,840.00', status: 'reconciled' },
    { id: 'SFT-A', name: 'Shift A (6AM - 2PM)', date: '2026-05-27', totalLiters: '9,210 L', totalAmount: '₹9,39,420.00', status: 'reconciled' },
    { id: 'SFT-C', name: 'Shift C (10PM - 6AM)', date: '2026-05-26', totalLiters: '4,100 L', totalAmount: '₹4,18,200.00', status: 'under_audit' },
  ]);

  const [nozzleSales, setNozzleSales] = useState([
    { nozzle: 'N-01', fuel: 'Petrol', tank: 'Tank 1', totalSold: '1,420 L', amount: '₹1,44,840.00', activeState: 'dispensing' },
    { nozzle: 'N-02', fuel: 'Petrol', tank: 'Tank 1', totalSold: '1,890 L', amount: '₹1,92,780.00', activeState: 'idle' },
    { nozzle: 'N-03', fuel: 'Diesel', tank: 'Tank 2', totalSold: '3,210 L', amount: '₹3,27,420.00', activeState: 'dispensing' },
    { nozzle: 'N-04', fuel: 'CNG', tank: 'Tank 3', totalSold: '900 Kg', amount: '₹85,500.00', activeState: 'complete' },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reconciled':
        return <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-150 text-emerald-600 font-extrabold text-[10px] rounded-lg">RECONCILED</span>;
      case 'under_audit':
        return <span className="px-2.5 py-1 bg-amber-50 border border-amber-150 text-amber-600 font-extrabold text-[10px] rounded-lg">UNDER AUDIT</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-500 font-extrabold text-[10px] rounded-lg">PENDING</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800">
      {/* 1. MODULE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 rounded-2xl p-6 shadow-xs gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 border border-orange-200 text-primary">
            <Receipt className="h-5.5 w-5.5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold text-text-primary tracking-tight">Sales Register & Receipts</h1>
            <p className="text-xs text-text-secondary">Track nozzle-wise performance parameters, audited shift receipts, and attendant collections</p>
          </div>
        </div>
      </div>

      {/* 2. TABBED CONTROLS */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200/60 shadow-xs max-w-lg select-none">
        {[
          { id: 'shift', label: 'Shift Roster Wise', icon: <Clock className="h-3.5 w-3.5" /> },
          { id: 'nozzle', label: 'Nozzle Statistics', icon: <Layers className="h-3.5 w-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex-1 flex justify-center items-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer outline-none
              ${activeTab === tab.id ? 'bg-primary text-white shadow-md shadow-primary/10' : 'text-slate-500 hover:text-slate-800'}
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. TABS DATA VIEWS */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        {activeTab === 'shift' && (
          <div className="flex flex-col gap-6 text-left">
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 font-extrabold text-text-secondary">
                    <th className="p-4 uppercase tracking-wider">Shift ID</th>
                    <th className="p-4 uppercase tracking-wider">Roster Shift</th>
                    <th className="p-4 uppercase tracking-wider">Audited Date</th>
                    <th className="p-4 uppercase tracking-wider">Liters Sold</th>
                    <th className="p-4 uppercase tracking-wider">Gross Collections</th>
                    <th className="p-4 uppercase tracking-wider">Reconciliation Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-text-primary">
                  {shiftSales.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-primary">{s.id}</td>
                      <td className="p-4 font-bold">{s.name}</td>
                      <td className="p-4 flex items-center gap-1.5 py-4">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {s.date}
                      </td>
                      <td className="p-4 font-bold">{s.totalLiters}</td>
                      <td className="p-4 font-extrabold text-slate-900 font-mono">{s.totalAmount}</td>
                      <td className="p-4">{getStatusBadge(s.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'nozzle' && (
          <div className="flex flex-col gap-6 text-left">
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 font-extrabold text-text-secondary">
                    <th className="p-4 uppercase tracking-wider">Nozzle Number</th>
                    <th className="p-4 uppercase tracking-wider">Fuel Type</th>
                    <th className="p-4 uppercase tracking-wider">Linked Tank</th>
                    <th className="p-4 uppercase tracking-wider">Volume Sold</th>
                    <th className="p-4 uppercase tracking-wider">Total Revenue</th>
                    <th className="p-4 uppercase tracking-wider">Telemetry Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-text-primary">
                  {nozzleSales.map((n) => (
                    <tr key={n.nozzle} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-primary">{n.nozzle}</td>
                      <td className="p-4 font-bold">{n.fuel}</td>
                      <td className="p-4 flex items-center gap-1.5 py-4">
                        <Layers className="h-3.5 w-3.5 text-slate-400" />
                        {n.tank}
                      </td>
                      <td className="p-4 font-bold">{n.totalSold}</td>
                      <td className="p-4 font-extrabold text-slate-900 font-mono">{n.amount}</td>
                      <td className="p-4">
                        {n.activeState === 'dispensing' ? (
                          <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-[9px] rounded-lg flex items-center gap-1 w-fit animate-pulse">
                            DISPENSING
                          </span>
                        ) : n.activeState === 'complete' ? (
                          <span className="px-2.5 py-1 bg-blue-50 border border-blue-100 text-blue-600 font-bold text-[9px] rounded-lg flex items-center gap-1 w-fit">
                            COMPLETED
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-400 font-bold text-[9px] rounded-lg flex items-center gap-1 w-fit">
                            IDLE
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
