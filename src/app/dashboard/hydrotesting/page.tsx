'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Building,
  UserCheck,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { toast } from '@/components/feedback/Toast';

export default function HydrotestingPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Seed Cylinder compliance data
  const [records, setRecords] = useState([
    { plate: 'AP-09-CD-1234', serial: 'CYL-2023-8902', lastTest: '2023-08-12', dueTest: '2026-08-12', inspector: 'Peso Hydrotest Labs', status: 'compliant' },
    { plate: 'TS-08-EJ-9921', serial: 'CYL-2021-3048', lastTest: '2021-04-10', dueTest: '2026-04-10', inspector: 'Apex Cylinder Inspectors', status: 'expiring' },
    { plate: 'MH-12-PQ-3049', serial: 'CYL-2020-0091', lastTest: '2020-01-15', dueTest: '2025-01-15', inspector: 'GK Gas Techs', status: 'expired' },
    { plate: 'KA-51-MM-8921', serial: 'CYL-2024-4012', lastTest: '2024-05-18', dueTest: '2027-05-18', inspector: 'Southern Cylinder Labs', status: 'compliant' },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
        return <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-150 text-emerald-600 font-extrabold text-[10px] rounded-lg">COMPLIANT</span>;
      case 'expiring':
        return <span className="px-2.5 py-1 bg-amber-50 border border-amber-150 text-amber-600 font-extrabold text-[10px] rounded-lg">WARNING: EXPIRING</span>;
      default:
        return <span className="px-2.5 py-1 bg-rose-50 border border-rose-150 text-rose-600 font-extrabold text-[10px] rounded-lg">NON-COMPLIANT</span>;
    }
  };

  const filteredRecords = records.filter(
    (r) =>
      r.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.serial.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 rounded-2xl p-6 shadow-xs gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 border border-orange-200 text-primary">
            <ShieldCheck className="h-5.5 w-5.5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold text-text-primary tracking-tight">Cylinder Hydrotesting Validity</h1>
            <p className="text-xs text-text-secondary">Track LPG/CNG vehicle safety certifications, dynamic license plates compliance checks, and PESO audit protocols</p>
          </div>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Total Audited Vehicles</span>
          <div className="text-2xl font-extrabold text-text-primary tracking-tight">142 Vehicles</div>
          <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">100% ANPR coverage</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Compliant Active Fills</span>
          <div className="text-2xl font-extrabold text-emerald-600 tracking-tight">97.8% Compliance</div>
          <span className="text-[10px] text-slate-400 font-semibold">Automatic safety locks active</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Expired Certificates Blocked</span>
          <div className="text-2xl font-extrabold text-rose-500 tracking-tight">3 Suspended</div>
          <span className="text-[10px] text-rose-400 font-semibold">1 blocked in last 24 hours</span>
        </div>
      </div>

      {/* 3. COMPLIANCE RECORDS DIRECTORY */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col gap-6">
        <div className="flex items-center relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search plates, cylinder serial numbers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 font-extrabold text-text-secondary">
                <th className="p-4 uppercase tracking-wider">License Plate</th>
                <th className="p-4 uppercase tracking-wider">Cylinder Serial Number</th>
                <th className="p-4 uppercase tracking-wider">Last Hydrotest</th>
                <th className="p-4 uppercase tracking-wider">Next Due Date</th>
                <th className="p-4 uppercase tracking-wider">Licensed Inspector</th>
                <th className="p-4 uppercase tracking-wider">Compliance status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-text-primary">
              {filteredRecords.map((r) => (
                <tr key={r.plate} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-900">{r.plate}</td>
                  <td className="p-4 font-mono font-bold text-slate-600">{r.serial}</td>
                  <td className="p-4 flex items-center gap-1.5 py-4">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {r.lastTest}
                  </td>
                  <td className="p-4 font-bold text-text-primary">{r.dueTest}</td>
                  <td className="p-4 text-text-secondary">{r.inspector}</td>
                  <td className="p-4">{getStatusBadge(r.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
