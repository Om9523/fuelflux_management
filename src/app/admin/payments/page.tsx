'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, Search, ArrowUpRight, ShieldCheck, CornerUpLeft } from 'lucide-react';
import { useAnalyticsStore } from '@/stores/analytics.store';
import { toast } from '@/components/feedback/Toast';

export default function AdminPaymentsPage() {
  const { payments, fetchAnalytics, refundPayment, isLoading } = useAnalyticsStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefund = async (id: string) => {
    try {
      await refundPayment(id);
      toast.success('Refund processed successfully.');
    } catch (e) {
      toast.error('Failed to process refund.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statuses = {
      success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      failed: 'bg-rose-50 text-rose-600 border-rose-100',
      refunded: 'bg-slate-100 text-slate-500 border-slate-200',
      disputed: 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse',
    };
    return (
      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 border rounded-full uppercase ${(statuses as any)[status]}`}>
        {status}
      </span>
    );
  };

  const filteredPayments = payments.filter((p) => {
    return (
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.pumpName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Payments & Transactions Logs
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Auditing card/UPI transactions, failed billing alerts, disputes, and executing refund actions.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Tx ID, owner or pump..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-orange-500"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Client Entity</th>
                <th className="px-6 py-4">Transaction Type</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date / Time</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 font-bold text-slate-400">
                    Syncing payment logs...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 font-bold text-slate-400">
                    No transactions matched filters.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">
                      {pay.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <span className="text-slate-800 font-extrabold block">
                          {pay.pumpName || 'Logistics Wallet'}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          By {pay.ownerName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 border rounded-md uppercase
                        ${pay.type === 'subscription' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'}
                      `}>
                        {pay.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-800">
                      ₹{pay.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-500">
                      {pay.paymentMethod}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(pay.status)}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium font-mono text-[10px]">
                      {new Date(pay.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1.5">
                        {(pay.status === 'success' || pay.status === 'disputed') && (
                          <button
                            onClick={() => handleRefund(pay.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-extrabold text-rose-500 hover:text-white bg-white hover:bg-rose-500 border border-rose-200 hover:border-rose-500 rounded-lg cursor-pointer transition-colors outline-none"
                            title="Issue Refund to client"
                          >
                            <CornerUpLeft className="h-3 w-3" />
                            Refund
                          </button>
                        )}
                      </div>
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
