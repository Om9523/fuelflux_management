'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  Building2,
  MapPin,
  Coins,
  ChevronRight,
  ShieldCheck,
  Zap,
  Target,
  ArrowUpRight,
  Sparkles,
  Info
} from 'lucide-react';
import { useInvestorStore } from '@/stores/investor.store';

export default function PortfolioPage() {
  const { activePortfolioId, portfolios, pumps } = useInvestorStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timer);
  }, [activePortfolioId]);

  const activePortfolio = portfolios.find(p => p.id === activePortfolioId) || portfolios[0];
  const portfolioPumps = pumps[activePortfolioId] || [];

  if (loading || !activePortfolio) {
    return (
      <div className="space-y-6 animate-pulse bg-[#F8FAFC]">
        <div className="h-10 bg-slate-200 rounded-xl w-1/4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-slate-200 rounded-2xl"></div>
          <div className="h-96 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const initialInvested = activePortfolio.investedAmount;
  const currentValuation = activePortfolio.currentValue;
  const capitalGains = currentValuation - initialInvested;

  const mockExpansions = [
    { name: 'Vizag Port Bypass Junction', cost: '₹12.0M', projectedRoi: '15.4%', risk: 'low' },
    { name: 'Hyderabad Ringroad Plaza', cost: '₹18.5M', projectedRoi: '16.8%', risk: 'medium' },
  ];

  return (
    <div className="space-y-6 text-slate-800">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Portfolio Assets
          </h1>
          <p className="text-xs font-semibold text-slate-505 mt-1">
            Venture clusters, asset allocations, ROI performance indexes, and expansion opportunities
          </p>
        </div>
      </div>

      {/* ROI & Capital Gains row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Initial Seed Capital</p>
            <h3 className="text-2xl font-black text-slate-800 mt-2">
              ₹{initialInvested.toLocaleString()}
            </h3>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 font-semibold">Total capital deployed across all active station nodes</p>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Current Market Valuation</p>
            <h3 className="text-2xl font-black text-slate-800 mt-2">
              ₹{currentValuation.toLocaleString()}
            </h3>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-3">
            ▲ +{(activePortfolio.roi).toFixed(1)}% ROI Yield
          </span>
        </div>

        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Accrued Capital Gains</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-2">
              +₹{capitalGains.toLocaleString()}
            </h3>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 font-semibold">Net valuation growth since deployment</p>
        </div>
      </div>

      {/* Asset list grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Active Asset Cards */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-450 uppercase tracking-wider">Active Station Assets</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {portfolioPumps.map((pump) => {
              const pumpRoi = activePortfolioId === 'portfolio_1' ? 14.8 : 12.5;
              
              return (
                <div key={pump.id} className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:border-orange-500/30 transition-all flex flex-col justify-between h-48">
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                        <Building2 className="h-4.5 w-4.5" />
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[8px] font-black uppercase">
                        Online
                      </span>
                    </div>

                    <h4 className="font-black text-slate-800 text-sm mt-3 truncate" title={pump.name}>{pump.name}</h4>
                    <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-slate-400" /> {pump.location}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                    <span>Revenue: ₹{(pump.revenue / 1000).toFixed(0)}k</span>
                    <span className="text-emerald-600">ROI: {pumpRoi}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Expansion Opportunities */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-450 uppercase tracking-wider">Expansion Opportunities</h3>
          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Target className="h-5 w-5 text-orange-500" />
              <div>
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Target Station Acquisitions</h4>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Locations flagged for high highway transit volume</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {mockExpansions.map((exp, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4.5 flex justify-between items-center text-xs font-semibold">
                  <div>
                    <h5 className="font-black text-slate-800">{exp.name}</h5>
                    <p className="text-[10px] text-slate-500 mt-1">Projected ROI: <span className="text-emerald-600 font-bold">{exp.projectedRoi}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">Est: {exp.cost}</p>
                    <span className={`inline-block px-1.5 py-0.5 mt-1 rounded text-[8px] font-black uppercase ${
                      exp.risk === 'low' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {exp.risk} risk
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-start gap-2.5">
              <Sparkles className="h-4.5 w-4.5 text-orange-500 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-slate-650 leading-normal">
                AI analytics indicates high capital returns if deploying a station node at the <span className="text-orange-600 font-extrabold">Hyderabad Ringroad Plaza</span> due to the recent cargo bypass diversions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
