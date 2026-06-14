'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Check, X, Loader2, CreditCard, Banknote,
  AlertTriangle, ExternalLink, IndianRupee,
} from 'lucide-react';
import backendApi from '@/lib/backendApi';
import { toast } from '@/components/feedback/Toast';

interface PendingPayment {
  id: number;
  logistic_partner_id: number;
  logistic_partner_name: string;
  logistic_partner_phone: string;
  logistic_partner_email: string;
  pump_id: number;
  pump_name: string;
  amount: number;
  payment_type: string;
  transaction_reference: string | null;
  remarks: string | null;
  screenshot_url: string | null;
  existing_outstanding: number;
  net_new_credit: number;
  requested_at: string | null;
}

export default function PaymentApprovalsPage() {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<number, string>>({});
  const [showRejectInput, setShowRejectInput] = useState<Record<number, boolean>>({});

  const fetchPendingPayments = async () => {
    setIsLoading(true);
    try {
      const { data } = await backendApi.get('/payment/pending');
      setPayments(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load pending payment requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPendingPayments(); }, []);

  const handleApprove = async (pay: PendingPayment) => {
    setProcessingId(pay.id);
    try {
      const res = await backendApi.post(`/payment/approve/${pay.id}`);
      const { total_settled, new_credit_limit } = res.data;

      if (total_settled > 0) {
        toast.success(
          `Approved! ₹${total_settled.toLocaleString('en-IN')} settled as outstanding. ` +
          `New credit limit: ₹${new_credit_limit.toLocaleString('en-IN')}`
        );
      } else {
        toast.success(
          `Payment approved! Credit limit set to ₹${new_credit_limit.toLocaleString('en-IN')}`
        );
      }

      await fetchPendingPayments();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to approve payment');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    const reason = rejectReason[id] || 'Payment proof not verified';
    setRejectingId(id);
    try {
      await backendApi.post(`/payment/reject/${id}?reason=${encodeURIComponent(reason)}`);
      toast.success('Payment request rejected.');
      await fetchPendingPayments();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to reject payment');
    } finally {
      setRejectingId(null);
      setShowRejectInput(prev => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden shadow-2xl border border-slate-700">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #6366f1 0%, transparent 60%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Banknote className="h-5 w-5 text-indigo-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Payment Approvals</h1>
          </div>
          <p className="text-slate-400 font-medium text-sm sm:text-base max-w-xl">
            Review payment proofs from Logistic Partners. Approving will auto-settle outstanding and set new credit.
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl px-5 py-3 text-center">
            <p className="text-2xl font-black text-indigo-400">{payments.length}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Pending</p>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl flex items-center justify-center h-64 text-slate-400 gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Loading pending payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
            <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
              <CreditCard className="h-7 w-7 text-slate-300" />
            </div>
            <p className="text-sm font-semibold">No pending payment proofs.</p>
          </div>
        ) : (
          payments.map((pay) => (
            <motion.div
              key={pay.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
            >
              {/* Card body */}
              <div className="p-5 flex flex-col md:flex-row md:items-start gap-4">
                {/* Partner info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-black text-lg">
                    {(pay.logistic_partner_name || 'P').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-slate-900">{pay.logistic_partner_name}</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {pay.logistic_partner_phone !== 'N/A' && `${pay.logistic_partner_phone} • `}
                      {pay.logistic_partner_email}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Pump: <span className="font-bold text-slate-700">{pay.pump_name}</span>
                    </p>
                    {pay.transaction_reference && (
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">
                        UTR: <span className="font-bold text-slate-700">{pay.transaction_reference}</span>
                      </p>
                    )}
                    {pay.screenshot_url && (
                      <a
                        href={pay.screenshot_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 mt-1 font-bold"
                      >
                        <ExternalLink className="h-3 w-3" /> View screenshot
                      </a>
                    )}
                  </div>
                </div>

                {/* Amount breakdown */}
                <div className="shrink-0 flex flex-col gap-2 min-w-[200px]">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Payment received</span>
                      <span className="font-black text-slate-900">₹{pay.amount.toLocaleString('en-IN')}</span>
                    </div>

                    {pay.existing_outstanding > 0 && (
                      <>
                        <div className="flex justify-between text-amber-600">
                          <span className="font-medium flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Existing outstanding
                          </span>
                          <span className="font-bold">−₹{pay.existing_outstanding.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="border-t border-slate-200 pt-1.5 flex justify-between">
                          <span className="text-slate-500 font-medium">Net new credit</span>
                          <span className={`font-black ${pay.net_new_credit > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            ₹{pay.net_new_credit.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {pay.existing_outstanding > 0 && (
                    <p className="text-[10px] text-amber-600 font-medium bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5">
                      Outstanding will be settled first on approval.
                    </p>
                  )}
                </div>
              </div>

              {/* Reject reason input (shown when reject clicked) */}
              {showRejectInput[pay.id] && (
                <div className="px-5 pb-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Reason for rejection (optional)"
                    value={rejectReason[pay.id] || ''}
                    onChange={(e) => setRejectReason(prev => ({ ...prev, [pay.id]: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10"
                  />
                  <button
                    onClick={() => handleReject(pay.id)}
                    disabled={rejectingId === pay.id}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {rejectingId === pay.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                    Confirm Reject
                  </button>
                  <button
                    onClick={() => setShowRejectInput(prev => ({ ...prev, [pay.id]: false }))}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Action row */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                <p className="text-[10px] text-slate-400 font-medium">
                  {pay.requested_at}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRejectInput(prev => ({ ...prev, [pay.id]: true }))}
                    disabled={processingId === pay.id || rejectingId === pay.id || showRejectInput[pay.id]}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(pay)}
                    disabled={processingId === pay.id || rejectingId === pay.id}
                    className="flex items-center gap-1.5 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-emerald-500/20 cursor-pointer disabled:opacity-60"
                  >
                    {processingId === pay.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Check className="h-3.5 w-3.5" />
                    }
                    Approve & Set Credit
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}