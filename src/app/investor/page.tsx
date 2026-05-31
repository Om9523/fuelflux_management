'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Coins,
  Building2,
  Truck,
  AlertCircle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Sparkles,
  BarChart3,
  Clock,
  Compass,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useInvestorStore } from '@/stores/investor.store';

export default function InvestorDashboard() {
  const { activePortfolioId, portfolios, revenues, pumps, fleets } = useInvestorStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timer);
  }, [activePortfolioId]);

  const activePortfolio = portfolios.find(p => p.id === activePortfolioId) || portfolios[0];
  const portfolioRevenues = revenues[activePortfolioId] || [];
  const portfolioPumps = pumps[activePortfolioId] || [];
  const portfolioFleets = fleets[activePortfolioId] || [];

  // Calculate Aggregates
  const totalRevenueMtd = portfolioRevenues.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalProfitMtd = portfolioRevenues.reduce((acc, curr) => acc + curr.profit, 0);
  const totalGstPaid = portfolioRevenues.reduce((acc, curr) => acc + curr.gstPaid, 0);

  // Heatmap Data (Days vs Peak Slots)
  const heatmapData = [
    { day: 'Mon', morning: 40, afternoon: 95, evening: 70, night: 15 },
    { day: 'Tue', morning: 45, afternoon: 88, evening: 75, night: 12 },
    { day: 'Wed', morning: 50, afternoon: 90, evening: 80, night: 20 },
    { day: 'Thu', morning: 55, afternoon: 92, evening: 85, night: 18 },
    { day: 'Fri', morning: 60, afternoon: 99, evening: 95, night: 30 },
    { day: 'Sat', morning: 70, afternoon: 85, evening: 98, night: 45 },
    { day: 'Sun', morning: 30, afternoon: 60, evening: 75, night: 25 },
  ];

  const getHeatmapColor = (value: number) => {
    if (value > 90) return 'bg-orange-500 text-white font-extrabold';
    if (value > 75) return 'bg-orange-500/75 text-white font-bold';
    if (value > 50) return 'bg-orange-500/40 text-slate-800 font-extrabold';
    if (value > 25) return 'bg-orange-500/15 text-slate-600 font-semibold';
    return 'bg-slate-100 text-slate-400';
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse bg-[#F8FAFC]">
        <div className="h-10 bg-slate-200 rounded-xl w-1/4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200 rounded-2xl"></div>
          <div className="h-96 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header Summary Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Portfolio Intelligence
          </h1>
          <p className="text-xs font-bold text-slate-500 mt-1">
            Aggregated corporate analytics and yield performance for <span className="text-orange-600 font-extrabold">{activePortfolio?.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200/60 rounded-xl text-xs font-bold text-emerald-600 shadow-sm shadow-slate-100/50">
            <ShieldCheck className="h-4 w-4" /> SECURE AUDIT ONLY
          </span>
          <Link href="/investor/reports" className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-orange-500/25 transition-all">
            <BarChart3 className="h-4 w-4" /> Report Exports
          </Link>
        </div>
      </div>

      {/* Primary Executive KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {/* Metric 1: Total Portfolio Value */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200/60 rounded-2xl p-4.5 shadow-sm hover:border-orange-500/30 transition-all flex flex-col justify-between"
        >
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Asset Valuation</p>
            <h3 className="text-lg font-black text-slate-800 mt-1.5 truncate">
              ₹{(activePortfolio.currentValue / 1000000).toFixed(2)}M
            </h3>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] font-bold">
            <span className="text-emerald-600 flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> +{(activePortfolio.roi).toFixed(1)}% ROI
            </span>
            <span className="text-slate-400">Yield</span>
          </div>
        </motion.div>

        {/* Metric 2: MTD Spends/Revenues */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white border border-slate-200/60 rounded-2xl p-4.5 shadow-sm hover:border-orange-500/30 transition-all flex flex-col justify-between"
        >
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Sales (MTD)</p>
            <h3 className="text-lg font-black text-slate-800 mt-1.5 truncate">
              ₹{(totalRevenueMtd / 1000000).toFixed(2)}M
            </h3>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] font-bold">
            <span className="text-emerald-600 flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> +{activePortfolio.monthlyGrowth}% MoM
            </span>
            <span className="text-slate-400">Aggregate</span>
          </div>
        </motion.div>

        {/* Metric 3: Active Station Nodes */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-slate-200/60 rounded-2xl p-4.5 shadow-sm hover:border-orange-500/30 transition-all flex flex-col justify-between"
        >
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Station Nodes</p>
            <h3 className="text-lg font-black text-slate-800 mt-1.5">
              {activePortfolio.activePumps} <span className="text-xs text-slate-500 font-semibold">Active</span>
            </h3>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] font-bold">
            <span className="text-emerald-600">100% Online</span>
            <span className="text-slate-400">Pumps</span>
          </div>
        </motion.div>

        {/* Metric 4: B2B Active Fleets */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white border border-slate-200/60 rounded-2xl p-4.5 shadow-sm hover:border-orange-500/30 transition-all flex flex-col justify-between"
        >
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Fleets</p>
            <h3 className="text-lg font-black text-slate-800 mt-1.5">
              {activePortfolio.activeFleets} <span className="text-xs text-slate-500 font-semibold">Accounts</span>
            </h3>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] font-bold">
            <span className="text-emerald-600 flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> +12.4% MoM
            </span>
            <span className="text-slate-400">B2B Carriers</span>
          </div>
        </motion.div>

        {/* Metric 5: Outstanding Credit Exposure */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-slate-200/60 rounded-2xl p-4.5 shadow-sm hover:border-orange-500/30 transition-all flex flex-col justify-between"
        >
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Udhaar Balances</p>
            <h3 className="text-lg font-black text-rose-600 mt-1.5 truncate">
              ₹{(activePortfolio.outstandingCredit / 100000).toFixed(1)}L
            </h3>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] font-bold">
            <span className="text-rose-600 flex items-center gap-0.5">
              <ArrowDownRight className="h-3 w-3" /> Debt Cap High
            </span>
            <span className="text-slate-400">Exposure</span>
          </div>
        </motion.div>

        {/* Metric 6: Net Profit Margin */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white border border-slate-200/60 rounded-2xl p-4.5 shadow-sm hover:border-orange-500/30 transition-all flex flex-col justify-between"
        >
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Net Profit margin</p>
            <h3 className="text-lg font-black text-slate-800 mt-1.5">
              {activePortfolio.netProfitMargin}%
            </h3>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] font-bold">
            <span className="text-emerald-600 flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> +1.8% vs Q4
            </span>
            <span className="text-slate-400">Net Yield</span>
          </div>
        </motion.div>
      </div>

      {/* Main Charts & Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Custom SVG Spline Area Chart: Revenue vs Cost (2/3 width) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Sales Revenue vs Operating Costs</h3>
              <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Historical comparison index over the last 6 months</p>
            </div>
            <div className="flex items-center gap-3.5 text-[10px] font-bold">
              <span className="flex items-center gap-1.5 text-orange-500">
                <span className="w-2.5 h-2.5 bg-orange-500 rounded-full" /> Revenue
              </span>
              <span className="flex items-center gap-1.5 text-[#2563EB]">
                <span className="w-2.5 h-2.5 bg-[#2563EB] rounded-full" /> Op Cost
              </span>
            </div>
          </div>

          <div className="w-full h-64 mt-6">
            <svg viewBox="0 0 600 220" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.20" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="20" x2="600" y2="20" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="70" x2="600" y2="70" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="170" x2="600" y2="170" stroke="#CBD5E1" strokeWidth="1.5" />

              {/* Area Paths */}
              {activePortfolioId === 'portfolio_1' ? (
                <>
                  <path d="M 20 170 C 100 150, 200 130, 300 110 C 400 100, 500 80, 580 40 L 580 170 Z" fill="url(#revGrad)" />
                  <path d="M 20 170 C 100 160, 200 145, 300 130 C 400 120, 500 105, 580 75 L 580 170 Z" fill="url(#costGrad)" />
                  {/* Splines */}
                  <path d="M 20 170 C 100 150, 200 130, 300 110 C 400 100, 500 80, 580 40" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 20 170 C 100 160, 200 145, 300 130 C 400 120, 500 105, 580 75" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <path d="M 20 170 C 100 155, 200 140, 300 125 C 400 115, 500 95, 580 65 L 580 170 Z" fill="url(#revGrad)" />
                  <path d="M 20 170 C 100 162, 200 152, 300 142 C 400 132, 500 115, 580 90 L 580 170 Z" fill="url(#costGrad)" />
                  {/* Splines */}
                  <path d="M 20 170 C 100 155, 200 140, 300 125 C 400 115, 500 95, 580 65" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 20 170 C 100 162, 200 152, 300 142 C 400 132, 500 115, 580 90" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
                </>
              )}

              {/* Labels */}
              <text x="20" y="192" fill="#94A3B8" fontSize="9" fontWeight="bold" textAnchor="middle">Dec 2025</text>
              <text x="130" y="192" fill="#94A3B8" fontSize="9" fontWeight="bold" textAnchor="middle">Jan 2026</text>
              <text x="240" y="192" fill="#94A3B8" fontSize="9" fontWeight="bold" textAnchor="middle">Feb 2026</text>
              <text x="350" y="192" fill="#94A3B8" fontSize="9" fontWeight="bold" textAnchor="middle">Mar 2026</text>
              <text x="460" y="192" fill="#94A3B8" fontSize="9" fontWeight="bold" textAnchor="middle">Apr 2026</text>
              <text x="570" y="192" fill="#94A3B8" fontSize="9" fontWeight="bold" textAnchor="middle">May 2026</text>
            </svg>
          </div>
        </div>

        {/* Interactive Forecourt Busy Hours Heatmap (1/3 width) */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Forecourt Busiest Hours</h3>
            <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Average customer density index mapped across shifts</p>
          </div>

          <div className="my-5 grid grid-cols-5 gap-1.5 text-center text-[10px] font-bold">
            <div className="text-slate-450">Day</div>
            <div className="text-slate-450">Shift A</div>
            <div className="text-slate-450">Shift B</div>
            <div className="text-slate-450">Shift C</div>
            <div className="text-slate-450">Night</div>

            {heatmapData.map((row) => (
              <React.Fragment key={row.day}>
                <div className="text-slate-500 flex items-center justify-center font-black">{row.day}</div>
                <div className={`p-2 rounded-lg transition-all ${getHeatmapColor(row.morning)}`}>{row.morning}%</div>
                <div className={`p-2 rounded-lg transition-all ${getHeatmapColor(row.afternoon)}`}>{row.afternoon}%</div>
                <div className={`p-2 rounded-lg transition-all ${getHeatmapColor(row.evening)}`}>{row.evening}%</div>
                <div className={`p-2 rounded-lg transition-all ${getHeatmapColor(row.night)}`}>{row.night}%</div>
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-bold text-slate-450">
            <span>Legend:</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-slate-100 rounded" /> Idle</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-orange-500/40 rounded" /> Normal</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-orange-500 rounded" /> Peak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Ranked Station performanc leaderboards and B2B stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ranked Stations Leaderboard (2/3 width) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Top Performing Station Nodes</h3>
              <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Asset rankings sorted by total MTD sales volume</p>
            </div>
            <Link href="/investor/pumps" className="text-xs font-bold text-orange-600 hover:text-orange-500 flex items-center gap-1">
              Performance Board <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/60 text-[9px] font-black text-slate-450 uppercase tracking-wider">
                  <th className="pb-3 pr-2">Station Name</th>
                  <th className="pb-3 pr-2">Location</th>
                  <th className="pb-3 pr-2 text-right">Revenue</th>
                  <th className="pb-3 pr-2 text-right">Fuel Sold (L)</th>
                  <th className="pb-3 pr-2 text-right">Growth MoM</th>
                  <th className="pb-3">Efficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
                {portfolioPumps.map((pump) => (
                  <tr key={pump.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 pr-2 font-black text-slate-800">{pump.name}</td>
                    <td className="py-3.5 pr-2 text-slate-500">{pump.location}</td>
                    <td className="py-3.5 pr-2 text-right font-black text-slate-850">₹{pump.revenue.toLocaleString()}</td>
                    <td className="py-3.5 pr-2 text-right text-slate-500">{pump.fuelSold.toLocaleString()} L</td>
                    <td className={`py-3.5 pr-2 text-right font-bold ${pump.growth > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {pump.growth > 0 ? '+' : ''}{pump.growth}%
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-orange-500 h-full rounded-full" style={{ width: `${pump.efficiency}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-450">{pump.efficiency}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* B2B Fleet Insights & Overview */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <Truck className="h-5 w-5 text-orange-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Fleet Ecosystem Yield</h3>
                <p className="text-[10px] font-semibold text-slate-500 mt-0.5">B2B client credit allocations & limits</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {portfolioFleets.slice(0, 3).map((f, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200/40 rounded-2xl p-3 flex justify-between items-center text-xs font-semibold">
                  <div>
                    <h4 className="font-black text-slate-800">{f.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{f.activeVehicles} Trucks Registered</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">₹{f.monthlySpend.toLocaleString()}</p>
                    <span className={`inline-block px-1.5 py-0.5 mt-1 rounded text-[8px] font-black uppercase ${
                      f.riskRating === 'low' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      f.riskRating === 'medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {f.riskRating} risk
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link href="/investor/fleet" className="w-full flex items-center justify-center gap-1.5 mt-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold rounded-xl text-slate-700 transition-all cursor-pointer">
            Fleet Intelligence logs <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
