'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Coins,
  Filter,
  Calendar,
  Building2,
  Fuel,
  Map,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Percent,
  Download,
  Info
} from 'lucide-react';
import { useInvestorStore } from '@/stores/investor.store';
import { toast } from '@/components/feedback/Toast';

export default function RevenueAnalytics() {
  const { activePortfolioId, revenues, portfolios } = useInvestorStore();

  const [filterRegion, setFilterRegion] = useState('all');
  const [filterFuel, setFilterFuel] = useState('all');
  const [filterDate, setFilterDate] = useState('30d');

  const portfolioRevenues = revenues[activePortfolioId] || [];
  const activePortfolio = portfolios.find(p => p.id === activePortfolioId) || portfolios[0];

  const handleExportCSV = () => {
    toast.success('Tax ledgers and GST statements exported as CSV.');
  };

  // Aggregates
  const totalRevenue = portfolioRevenues.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalOpCost = portfolioRevenues.reduce((acc, curr) => acc + curr.operatingCost, 0);
  const totalProfit = portfolioRevenues.reduce((acc, curr) => acc + curr.profit, 0);
  const marginPct = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Mock GST calculations
  const totalGst = totalRevenue * 0.18; // 18% GST average
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;

  return (
    <div className="space-y-6 text-slate-800">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Revenue Analytics
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Financial ledgers, SGST/CGST tax reconciliations, and portfolio margins
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-slate-50 border border-slate-200 hover:border-orange-500/30 text-slate-700 hover:text-orange-600 rounded-xl text-xs font-bold transition-all cursor-pointer hover:bg-slate-100"
        >
          <Download className="h-4 w-4" /> Export Ledger
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Region Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shrink-0">
            <Map className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none cursor-pointer text-slate-800"
            >
              <option value="all" className="bg-white text-slate-800">All Regions</option>
              <option value="south" className="bg-white text-slate-800">South India</option>
              <option value="west" className="bg-white text-slate-800">West India</option>
            </select>
          </div>

          {/* Fuel Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shrink-0">
            <Fuel className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={filterFuel}
              onChange={(e) => setFilterFuel(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none cursor-pointer text-slate-800"
            >
              <option value="all" className="bg-white text-slate-800">All Fuels</option>
              <option value="diesel" className="bg-white text-slate-800">Diesel</option>
              <option value="petrol" className="bg-white text-slate-800">Petrol</option>
              <option value="cng" className="bg-white text-slate-800">CNG</option>
            </select>
          </div>
        </div>

        {/* Date presets selection */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1 rounded-xl">
          {['30d', '90d', 'ytd', 'yearly'].map((period) => (
            <button
              key={period}
              onClick={() => setFilterDate(period)}
              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                filterDate === period
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200/60 rounded-2xl p-4.5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Gross Sales Margin</p>
          <h3 className="text-xl font-black text-slate-800 mt-1.5">Γé╣{totalRevenue.toLocaleString()}</h3>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-2">
            Γû▓ +5.2% MoM
          </span>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-2xl p-4.5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Net Operating Yield</p>
          <h3 className="text-xl font-black text-slate-800 mt-1.5">Γé╣{totalProfit.toLocaleString()}</h3>
          <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-0.5 mt-2">
            Margin: {marginPct.toFixed(1)}%
          </span>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-2xl p-4.5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Provisional CGST (9%)</p>
          <h3 className="text-xl font-black text-orange-600 mt-1.5">Γé╣{cgst.toLocaleString()}</h3>
          <span className="text-[10px] text-slate-500 font-semibold mt-2 block">Accrued Central input tax</span>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-2xl p-4.5 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Provisional SGST (9%)</p>
          <h3 className="text-xl font-black text-orange-600 mt-1.5">Γé╣{sgst.toLocaleString()}</h3>
          <span className="text-[10px] text-slate-500 font-semibold mt-2 block">Accrued State input tax</span>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Custom Stacked Bar: Revenue vs Costs (2/3 width) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Revenue Breakdown</h3>
              <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Ratio of operating margins vs tax overheads</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold">
              <span className="flex items-center gap-1.5 text-orange-500">
                <span className="w-2.5 h-2.5 bg-orange-500 rounded-full" /> Profit
              </span>
              <span className="flex items-center gap-1.5 text-blue-500">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" /> Costs
              </span>
              <span className="flex items-center gap-1.5 text-emerald-500">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> GST (18%)
              </span>
            </div>
          </div>

          <div className="h-60 mt-4">
            <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
              <line x1="0" y1="20" x2="600" y2="20" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="70" x2="600" y2="70" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="170" x2="600" y2="170" stroke="#CBD5E1" strokeWidth="1.5" />

              {/* Six stacked bars mapping the monthly records */}
              {portfolioRevenues.map((rev, index) => {
                const x = 50 + index * 90;
                // Normalize values to fit inside [0, 150] height
                const maxVal = activePortfolioId === 'portfolio_1' ? 7000000 : 5000000;
                
                const costHeight = (rev.operatingCost / maxVal) * 150;
                const profitHeight = (rev.profit / maxVal) * 150;
                const gstHeight = (rev.gstPaid / maxVal) * 150;

                const yCost = 170 - costHeight;
                const yProfit = yCost - profitHeight;
                const yGst = yProfit - gstHeight;

                return (
                  <g key={rev.month}>
                    {/* Cost Block */}
                    <rect x={x} y={yCost} width="28" height={costHeight} fill="#2563EB" rx="4" />
                    {/* Profit Block */}
                    <rect x={x} y={yProfit} width="28" height={profitHeight} fill="#f97316" />
                    {/* GST Block */}
                    <rect x={x} y={yGst} width="28" height={gstHeight} fill="#10b981" rx="4" />

                    <text x={x + 14} y="190" fill="#94A3B8" fontSize="8" fontWeight="bold" textAnchor="middle">
                      {rev.month.substring(0, 3)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* GST Allocations Pie */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Revenue Allocation</h3>
            <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Allocation of MTD funds collected</p>
          </div>

          <div className="flex items-center justify-center my-6 relative">
            <svg width="150" height="150" viewBox="0 0 36 36" className="transform -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F1F5F9" strokeWidth="5" />
              {/* Cost Segment (approx 78%) */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="#2563EB"
                strokeWidth="5"
                strokeDasharray="78 22"
                strokeDashoffset="0"
              />
              {/* Profit Segment (approx 17.5%) */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="#f97316"
                strokeWidth="5"
                strokeDasharray="17.5 82.5"
                strokeDashoffset="-78"
              />
              {/* GST Segment (approx 4.5%) */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="#10b981"
                strokeWidth="5"
                strokeDasharray="4.5 95.5"
                strokeDashoffset="-95.5"
              />
            </svg>
            <div className="absolute text-center flex flex-col justify-center items-center">
              <Coins className="h-5 w-5 text-slate-400" />
              <span className="text-[8px] font-black text-slate-400 mt-1 uppercase">Net Margin</span>
              <span className="text-xs font-black text-slate-850">{marginPct.toFixed(1)}%</span>
            </div>
          </div>

          <div className="space-y-2 text-xs font-bold text-slate-650">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#2563EB] rounded-full" />
                <span>Operating Cost</span>
              </div>
              <span className="text-slate-850">Γé╣{totalOpCost.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#f97316] rounded-full" />
                <span>Net Profit</span>
              </div>
              <span className="text-slate-850">Γé╣{totalProfit.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#10b981] rounded-full" />
                <span>accrued GST (18%)</span>
              </div>
              <span className="text-slate-850">Γé╣{totalGst.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Ledger Audit table */}
      <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">GST Ledger & Input Tax Accounts</h3>
          <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Audit log of sales margins and tax reserves mapped by month</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/60 bg-slate-50 text-[9px] font-black text-slate-450 uppercase tracking-wider">
                <th className="p-4 pl-6">Financial Month</th>
                <th className="p-4 text-right">Gross Revenues</th>
                <th className="p-4 text-right">Operating Costs</th>
                <th className="p-4 text-right">Net Profit Yield</th>
                <th className="p-4 text-right">GST Collected (18%)</th>
                <th className="p-4 text-right">Provisional CGST (9%)</th>
                <th className="p-4 text-right pr-6">Provisional SGST (9%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
              {portfolioRevenues.map((rev) => {
                const monthGst = rev.revenue * 0.18;
                return (
                  <tr key={rev.month} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 font-black text-slate-800">{rev.month}</td>
                    <td className="p-4 text-right font-black text-slate-850">Γé╣{rev.revenue.toLocaleString()}</td>
                    <td className="p-4 text-right text-slate-550">Γé╣{rev.operatingCost.toLocaleString()}</td>
                    <td className="p-4 text-right text-emerald-600 font-bold">Γé╣{rev.profit.toLocaleString()}</td>
                    <td className="p-4 text-right text-orange-600 font-bold">Γé╣{monthGst.toLocaleString()}</td>
                    <td className="p-4 text-right text-slate-500">Γé╣{(monthGst / 2).toLocaleString()}</td>
                    <td className="p-4 text-right text-slate-500 pr-6">Γé╣{(monthGst / 2).toLocaleString()}</td>
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
