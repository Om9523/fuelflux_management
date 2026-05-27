'use client';

import React, { useState } from 'react';
import {
  Car,
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
  X,
  CreditCard,
} from 'lucide-react';
import { toast } from '@/components/feedback/Toast';

export default function VehiclesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Seed ANPR detected vehicle logs
  const [vehicles, setVehicles] = useState([
    { plate: 'AP-09-CD-1234', type: 'Private Car', owner: 'Rajesh Kumar', visits: 18, avgFill: '35 L', creditOutstanding: '₹0.00', compliance: 'valid', lastVisit: '10 mins ago' },
    { plate: 'TS-08-EJ-9921', type: 'Commercial Fleet', owner: 'Apex Transport Co.', visits: 42, avgFill: '180 L', creditOutstanding: '₹42,850.00', compliance: 'expiring', lastVisit: '45 mins ago' },
    { plate: 'KA-51-MM-8921', type: 'Individual Auto', owner: 'Vikram Singh', visits: 5, avgFill: '10 L', creditOutstanding: '₹150.00', compliance: 'valid', lastVisit: '2 hours ago' },
    { plate: 'MH-12-PQ-3049', type: 'Corporate Cab', owner: 'GK Gas Logistics', visits: 24, avgFill: '40 L', creditOutstanding: '₹8,290.00', compliance: 'expired', lastVisit: '1 day ago' },
  ]);

  const [activeVehicle, setActiveVehicle] = useState<typeof vehicles[0] | null>(null);

  const getComplianceBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-[9px] rounded-lg">VALID</span>;
      case 'expiring':
        return <span className="px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-600 font-bold text-[9px] rounded-lg">EXPIRING</span>;
      default:
        return <span className="px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-600 font-bold text-[9px] rounded-lg">EXPIRED</span>;
    }
  };

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800">
      {/* 1. MODULE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 rounded-2xl p-6 shadow-xs gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 border border-orange-200 text-primary">
            <Car className="h-5.5 w-5.5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold text-text-primary tracking-tight">Station Vehicles Logs (ANPR)</h1>
            <p className="text-xs text-text-secondary">Track real-time automatic license plate recognition, customer matching, and cylinder compliance</p>
          </div>
        </div>
      </div>

      {/* 2. SEARCH GRID & DIRECTORY */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col gap-6">
        <div className="flex items-center relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search plates, vehicle owners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </div>

        {/* Roster table */}
        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 font-extrabold text-text-secondary">
                <th className="p-4 uppercase tracking-wider">Plate Image</th>
                <th className="p-4 uppercase tracking-wider">ANPR License Plate</th>
                <th className="p-4 uppercase tracking-wider">Classification</th>
                <th className="p-4 uppercase tracking-wider">Linked Owner</th>
                <th className="p-4 uppercase tracking-wider">Visit Count</th>
                <th className="p-4 uppercase tracking-wider">Average Fill</th>
                <th className="p-4 uppercase tracking-wider">Outstanding credit</th>
                <th className="p-4 uppercase tracking-wider">Cylinder testing</th>
                <th className="p-4 uppercase tracking-wider">Last visited</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-text-primary">
              {filteredVehicles.map((v) => (
                <tr
                  key={v.plate}
                  onClick={() => {
                    setActiveVehicle(v);
                    toast.info(`Opened details drawer for plate: ${v.plate}`);
                  }}
                  className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                >
                  <td className="p-4">
                    {/* Simulated Plate Snapshot thumbnail */}
                    <div className="h-8 w-20 rounded-md bg-slate-950 border border-slate-800 flex items-center justify-center font-mono text-[9px] font-bold text-white px-2 tracking-wide">
                      {v.plate}
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-900">{v.plate}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-slate-50 border border-slate-200/50 rounded-lg font-bold text-[10px] text-slate-600">
                      {v.type}
                    </span>
                  </td>
                  <td className="p-4 font-bold">{v.owner}</td>
                  <td className="p-4 font-bold">{v.visits} visits</td>
                  <td className="p-4 font-bold text-text-secondary">{v.avgFill}</td>
                  <td className={`p-4 font-bold ${v.creditOutstanding !== '₹0.00' ? 'text-rose-500' : 'text-slate-600'}`}>
                    {v.creditOutstanding}
                  </td>
                  <td className="p-4">{getComplianceBadge(v.compliance)}</td>
                  <td className="p-4 text-text-secondary">{v.lastVisit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. SLIDE-OUT DRAWER OVERLAY FOR DETAILED SPECIFICATIONS */}
      {activeVehicle && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setActiveVehicle(null)} />
          
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto border-l border-slate-200 text-left">
            <div className="flex flex-col gap-6">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-extrabold text-text-primary">Vehicle Specifications</h3>
                </div>
                <button
                  onClick={() => setActiveVehicle(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-50 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Snapshot Plate Preview */}
              <div className="bg-slate-950 rounded-2xl p-8 flex items-center justify-center border border-slate-800 shadow-inner">
                <span className="font-mono text-2xl font-extrabold text-white tracking-widest px-6 py-2 border-2 border-dashed border-slate-700 rounded-lg">
                  {activeVehicle.plate}
                </span>
              </div>

              {/* Data Specifications Lists */}
              <div className="flex flex-col gap-4 text-xs">
                <div className="grid grid-cols-2 gap-4 border-b border-slate-50 pb-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-text-secondary uppercase">OWNER / COMPANY</span>
                    <span className="font-bold text-text-primary">{activeVehicle.owner}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-text-secondary uppercase">CLASSIFICATION</span>
                    <span className="font-bold text-slate-600">{activeVehicle.type}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-slate-50 pb-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-text-secondary uppercase">TOTAL VISITS</span>
                    <span className="font-bold text-text-primary">{activeVehicle.visits} Visited</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-text-secondary uppercase">AVERAGE FUEL LOAD</span>
                    <span className="font-bold text-text-primary">{activeVehicle.avgFill} Liters</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-slate-50 pb-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-text-secondary uppercase">OUTSTANDING UDHAAR BALANCE</span>
                    <span className={`font-bold ${activeVehicle.creditOutstanding !== '₹0.00' ? 'text-rose-500' : 'text-slate-600'}`}>
                      {activeVehicle.creditOutstanding}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-text-secondary uppercase">HYDROTEST COMPLIANCE</span>
                    <span className="w-fit mt-1">{getComplianceBadge(activeVehicle.compliance)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-6 border-t border-slate-100">
              <button
                onClick={() => {
                  toast.success(`Generated Credit Voucher for ${activeVehicle.plate}`);
                  setActiveVehicle(null);
                }}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md shadow-primary/20 transition-all outline-none cursor-pointer text-center"
              >
                Issue Credit Voucher
              </button>
              <button
                onClick={() => setActiveVehicle(null)}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-text-primary rounded-xl transition-all outline-none cursor-pointer text-center"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
