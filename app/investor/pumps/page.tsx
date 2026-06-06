'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  MapPin,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Users,
  Compass,
  AlertTriangle,
  X,
  FileText,
  Clock,
  Fuel,
  Info,
  DollarSign,
  Layers,
  Thermometer,
  Search,
  Activity
} from 'lucide-react';
import { useInvestorStore, ComparativePump } from '@/stores/investor.store';
import { toast } from '@/components/feedback/Toast';

export default function PumpsPerformancePage() {
  const { activePortfolioId, pumps } = useInvestorStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPump, setSelectedPump] = useState<ComparativePump | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'customers' | 'inventory' | 'sales' | 'analytics'>('overview');

  const portfolioPumps = pumps[activePortfolioId] || [];

  // Filter pumps
  const filteredPumps = portfolioPumps.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const riskBadges = {
    low: <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded text-[9px] font-black uppercase">Low</span>,
    medium: <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-[9px] font-black uppercase">Medium</span>,
    high: <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded text-[9px] font-black uppercase">High</span>,
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Pump Performance
          </h1>
          <p className="text-xs font-semibold text-slate-505 mt-1">
            Comparative performance analytics, asset yield scores, and risk audit matrices
          </p>
        </div>
      </div>

      {/* Search toolbar */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search owned pump stations by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all text-slate-800"
          />
        </div>
      </div>

      {/* Comparative Performance Table */}
      <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/60 bg-slate-50 text-[9px] font-black text-slate-450 uppercase tracking-wider">
                <th className="p-4 pl-6">Pump Station</th>
                <th className="p-4">Geographic Location</th>
                <th className="p-4 text-right">MTD Revenue</th>
                <th className="p-4 text-right">Growth MoM</th>
                <th className="p-4 text-right">Fuel Discharged (L)</th>
                <th className="p-4 text-right">Active Customers</th>
                <th className="p-4 text-center">Efficiency Score</th>
                <th className="p-4 text-center">Risk rating</th>
                <th className="p-4 pr-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
              {filteredPumps.map((pump) => (
                <tr
                  key={pump.id}
                  onClick={() => {
                    setSelectedPump(pump);
                    setActiveTab('overview');
                  }}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="p-4 pl-6 font-black text-slate-800">{pump.name}</td>
                  <td className="p-4 text-slate-500">{pump.location}</td>
                  <td className="p-4 text-right font-black text-slate-850">₹{pump.revenue.toLocaleString()}</td>
                  <td className={`p-4 text-right font-bold ${pump.growth > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {pump.growth > 0 ? '+' : ''}{pump.growth}%
                  </td>
                  <td className="p-4 text-right text-slate-500">{pump.fuelSold.toLocaleString()} L</td>
                  <td className="p-4 text-right text-slate-500">{pump.activeCustomers.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <span className="font-mono text-orange-550 font-extrabold">{pump.efficiency}%</span>
                  </td>
                  <td className="p-4 text-center">{riskBadges[pump.riskScore]}</td>
                  <td className="p-4 pr-6 text-right">
                    <ChevronRight className="h-4 w-4 text-slate-400 ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide Drawer for details comparison */}
      <AnimatePresence>
        {selectedPump && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPump(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Slide drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 right-0 w-full max-w-lg bg-white border-l border-slate-200/60 shadow-2xl z-50 flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-5 bg-slate-50 border-b border-slate-200/60 flex items-center justify-between text-left">
                <div>
                  <span className="text-[9px] font-black bg-orange-500/10 text-orange-600 border border-orange-500/20 px-2 py-0.5 rounded uppercase">
                    Asset Details
                  </span>
                  <h3 className="text-base font-black text-slate-800 mt-1">
                    {selectedPump.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPump(null)}
                  className="p-1 rounded-lg text-slate-450 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs Panel */}
              <div className="bg-slate-50/50 border-b border-slate-200/60 px-4 flex gap-2 overflow-x-auto">
                {(['overview', 'revenue', 'customers', 'inventory', 'sales', 'analytics'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-3 px-3 text-[10px] font-black uppercase border-b-2 tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === tab
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-slate-450 hover:text-slate-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 text-xs text-slate-600 space-y-5">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-450 font-medium">Asset ID</span>
                        <span className="font-bold text-slate-800">{selectedPump.id}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-455 font-medium">Location</span>
                        <span className="font-bold text-slate-800">{selectedPump.location}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-455 font-medium">Risk exposure rating</span>
                        <span>{riskBadges[selectedPump.riskScore]}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-455 font-medium">Efficiency Index</span>
                        <span className="font-mono text-orange-600 font-extrabold">{selectedPump.efficiency}%</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4.5 space-y-2">
                      <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-wider">Asset Summary</h4>
                      <p className="leading-relaxed font-semibold text-slate-500">
                        This asset is fully compliant under PESO hydrotesting rules, representing stable throughput yields. Real-time ATG tank probes are online.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'revenue' && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4 space-y-3 font-bold text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-455 font-medium">MTD Sales Revenue</span>
                        <span className="text-slate-800">₹{selectedPump.revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-455 font-medium">Provisional GST Contribution</span>
                        <span className="text-orange-600">₹{(selectedPump.revenue * 0.18).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-455 font-medium">Estimated Net Margins</span>
                        <span className="text-emerald-600">₹{(selectedPump.revenue * 0.182).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'customers' && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4 space-y-3 font-bold text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-455 font-medium">Active CRM Accounts</span>
                        <span className="text-slate-800">{selectedPump.activeCustomers.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-455 font-medium">Avg Transaction Size</span>
                        <span className="text-slate-800">₹2,840.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-455 font-medium">Customer Retention Index</span>
                        <span className="text-emerald-600">92.4%</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'inventory' && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-wider">ATG tank Level Probes</h4>
                    <div className="space-y-3">
                      {/* Diesel Tank */}
                      <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4 space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-600">
                          <span>Diesel Tank 1 (Capacity: 25,000L)</span>
                          <span className="text-slate-800">16,240 L (65%)</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-orange-500 h-full rounded-full" style={{ width: '65%' }} />
                        </div>
                      </div>

                      {/* Petrol Tank */}
                      <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4 space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-600">
                          <span>Petrol Tank 1 (Capacity: 20,000L)</span>
                          <span className="text-slate-800">14,800 L (74%)</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: '74%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'sales' && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4 space-y-3 font-bold text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-455 font-medium">Liters Discharged MTD</span>
                        <span className="text-slate-800">{selectedPump.fuelSold.toLocaleString()} L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-455 font-medium">Daily Dispatch Average</span>
                        <span className="text-slate-800">1,540 L / day</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-455 font-medium">Avg Dispenser Variance</span>
                        <span className="text-emerald-600">0.03% (Pass)</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4 space-y-3 font-bold text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-455 font-medium">Workforce headcount</span>
                        <span className="text-slate-800">6 Shift Attendants</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-455 font-medium">ANPR Camera uptime</span>
                        <span className="text-emerald-600">99.8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-455 font-medium">ATG probe Status</span>
                        <span className="text-emerald-600">Connected (Online)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200/60 bg-slate-50 flex gap-3">
                <button
                  onClick={() => setSelectedPump(null)}
                  className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-200"
                >
                  Close Detail Pane
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
