'use client';

import React, { useEffect } from 'react';
import { Wallet, CreditCard, ArrowUpRight, ArrowDownRight, Users, Check } from 'lucide-react';
import { useAdminStore } from '@/stores/admin.store';
import { useAnalyticsStore } from '@/stores/analytics.store';

export default function AdminWalletsPage() {
  const { logistics, fetchLogistics, isLoading: logLoading } = useAdminStore();
  const { payments, fetchAnalytics, isLoading: payLoading } = useAnalyticsStore();

  useEffect(() => {
    fetchLogistics();
    fetchAnalytics();
  }, []);

  const totalCreditLimit = logistics.reduce((sum, l) => sum + l.creditLimit, 0);
  const totalCreditUsed = logistics.reduce((sum, l) => sum + l.creditUsed, 0);
  const walletTopups = payments.filter((p) => p.type === 'wallet_topup');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          System Wallet & Credit Monitoring
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Auditing corporate virtual wallets, outstanding fleet credits, and prepaid settlements.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Platform Credit Limit</span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono">Γé╣{totalCreditLimit.toLocaleString('en-IN')}</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-500 rounded-xl border border-blue-100 shrink-0">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Outstanding Credit Used</span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono">Γé╣{totalCreditUsed.toLocaleString('en-IN')}</span>
          </div>
          <div className="p-3 bg-orange-50 text-orange-500 rounded-xl border border-orange-100 shrink-0">
            <Wallet className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Prepaid Topups Volume</span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              Γé╣{walletTopups.reduce((sum, p) => sum + p.amount, 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl border border-emerald-100 shrink-0">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logistics Credit Limits Util */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Fleet Partners Outstanding Credits
            </h3>
          </div>
          <div className="space-y-4">
            {logLoading ? (
              <div className="text-center py-8 text-xs font-bold text-slate-400">Syncing balances...</div>
            ) : logistics.length === 0 ? (
              <div className="text-center py-8 text-xs font-bold text-slate-400">No active credits.</div>
            ) : (
              logistics.map((partner) => {
                const pct = Math.round((partner.creditUsed / partner.creditLimit) * 100);
                return (
                  <div key={partner.id} className="space-y-2 border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-800 font-extrabold">{partner.companyName}</span>
                      <span className="font-mono text-slate-600">
                        Γé╣{partner.creditUsed.toLocaleString('en-IN')} / Γé╣{partner.creditLimit.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                      <span>Manager: {partner.managerName}</span>
                      <span>{pct}% Credit Used</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top-up logs */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Recent Prepaid Deposit Receipts
            </h3>
            <span className="text-[9.5px] text-slate-400 font-bold">Real-time sync</span>
          </div>
          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {payLoading ? (
              <div className="text-center py-8 text-xs font-bold text-slate-400">Syncing logs...</div>
            ) : walletTopups.length === 0 ? (
              <div className="text-center py-8 text-xs font-bold text-slate-400">No prepaid top-ups.</div>
            ) : (
              walletTopups.map((topup) => (
                <div key={topup.id} className="flex justify-between items-start text-xs border border-slate-100 p-3 rounded-xl bg-slate-50/20">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span>{topup.ownerName} (Logistic Partner)</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Tx: {topup.id} | {topup.paymentMethod}
                    </span>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="font-mono font-bold text-emerald-600 block">
                      +Γé╣{topup.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-mono">
                      {new Date(topup.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
