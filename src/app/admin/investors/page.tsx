'use client';

import React, { useEffect } from 'react';
import { ShieldCheck, LineChart, Calendar, Mail } from 'lucide-react';
import { useAdminStore } from '@/stores/admin.store';

export default function AdminInvestorsPage() {
  const { investors, fetchInvestors, isLoading } = useAdminStore();

  useEffect(() => {
    fetchInvestors();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Platform Investors
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Auditing financial backing allocations, portfolio volumes, and platform configurations.
        </p>
      </div>

      {/* Investors Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4">Investor Profile</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 text-right">Portfolio Value</th>
                <th className="px-6 py-4">Allocation Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 font-bold text-slate-400">
                    Syncing investor records...
                  </td>
                </tr>
              ) : investors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 font-bold text-slate-400">
                    No investors registered.
                  </td>
                </tr>
              ) : (
                investors.map((investor) => (
                  <tr key={investor.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex gap-3 items-center">
                        <div className="h-8.5 w-8.5 rounded-lg bg-orange-50 text-orange-500 border border-orange-100/50 flex items-center justify-center shrink-0">
                          <LineChart className="h-4.5 w-4.5" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-slate-800 font-extrabold block">
                            {investor.name}
                          </span>
                          <span className="text-[9.5px] text-slate-400 block font-mono">
                            ID: {investor.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span>{investor.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-800">
                      ₹{investor.portfolioValue.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{new Date(investor.investmentDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 border rounded-full uppercase
                        ${investor.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}
                      `}>
                        {investor.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
