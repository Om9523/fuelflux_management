'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Banknote, CheckCircle2, Clock, AlertCircle, FileText,
  ChevronRight, Loader2, RefreshCw, PenLine, Shield,
} from 'lucide-react';
import backendApi from '@/lib/backendApi';
import { toast } from '@/components/feedback/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentStatus =
  | 'pending'
  | 'contract_generated'
  | 'logistic_signed'
  | 'pump_signed'
  | 'approved'
  | 'rejected';

interface PaymentSummary {
  id: string;
  pump_id: string;
  pump_name: string;
  amount: number;
  payment_type: string;
  transaction_reference: string | null;
  status: PaymentStatus;
  contract_terms: Record<string, any> | null;
  logistic_signed: boolean;
  pump_owner_signed: boolean;
  requested_at: string | null;
  reviewed_at: string | null;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<PaymentStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  pending: {
    label: 'Pending Review',
    cls: 'bg-amber-50 border-amber-200 text-amber-700',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  contract_generated: {
    label: 'Sign Contract',
    cls: 'bg-violet-50 border-violet-200 text-violet-700',
    icon: <PenLine className="h-3.5 w-3.5" />,
  },
  logistic_signed: {
    label: 'Awaiting Pump Sign',
    cls: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  pump_signed: {
    label: 'You Must Sign',
    cls: 'bg-violet-50 border-violet-200 text-violet-700',
    icon: <PenLine className="h-3.5 w-3.5" />,
  },
  approved: {
    label: 'Approved',
    cls: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  rejected: {
    label: 'Rejected',
    cls: 'bg-red-50 border-red-200 text-red-700',
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
};

function StatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    cls: 'bg-slate-50 border-slate-200 text-slate-500',
    icon: null,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${cfg.cls}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LogisticPaymentsPage() {
  const [payments, setPayments] = useState<PaymentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await backendApi.get('/payment/my-requests');
      setPayments(data);
    } catch (e: any) {
      toast.error('Error', e?.response?.data?.detail || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const actionNeeded = payments.filter(p =>
    p.status === 'contract_generated' || p.status === 'pump_signed'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden shadow-xl border border-slate-700">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #8b5cf6 0%, transparent 60%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
              <Banknote className="h-5 w-5 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">My Payments</h1>
          </div>
          <p className="text-slate-400 text-sm">Payment proofs submitted to pump owners, contract status & signing</p>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          {actionNeeded > 0 && (
            <div className="bg-violet-600/30 border border-violet-500/40 rounded-2xl px-4 py-3 text-center">
              <p className="text-2xl font-black text-violet-300">{actionNeeded}</p>
              <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wider mt-0.5">Needs Signature</p>
            </div>
          )}
          <button onClick={load}
            className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-400 hover:text-white cursor-pointer transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl flex items-center justify-center h-48 gap-3 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
            <p className="text-sm font-medium">Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center h-48 text-slate-400">
            <Banknote className="h-10 w-10 mb-3 opacity-20" />
            <p className="text-sm font-bold">No payments submitted yet</p>
            <p className="text-xs mt-1">Submit payment proof from the Wallet page</p>
          </div>
        ) : (
          payments.map(pay => {
            const needsAction = pay.status === 'contract_generated' || pay.status === 'pump_signed';
            return (
              <motion.div key={pay.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all ${needsAction ? 'border-violet-200 shadow-violet-50' : 'border-slate-200'}`}>
                <Link href={`/logistic/payments/${pay.id}`}
                  className="flex items-center gap-4 p-5 hover:bg-slate-50/50 transition-colors">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border
                    ${pay.status === 'approved'
                      ? 'bg-emerald-50 border-emerald-100'
                      : needsAction
                        ? 'bg-violet-50 border-violet-100'
                        : 'bg-slate-50 border-slate-100'}`}>
                    {pay.status === 'approved'
                      ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      : needsAction
                        ? <PenLine className="h-5 w-5 text-violet-600" />
                        : <Banknote className="h-5 w-5 text-slate-400" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-slate-900">PAY-{pay.id}</p>
                      <StatusBadge status={pay.status} />
                      {needsAction && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500 text-white text-[10px] font-black animate-pulse">
                          Action Required
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{pay.pump_name}</span>
                      {pay.transaction_reference && ` · UTR: ${pay.transaction_reference}`}
                    </p>
                    {pay.requested_at && (
                      <p className="text-[10px] text-slate-400 mt-0.5">{pay.requested_at}</p>
                    )}
                  </div>

                  {/* Amount + Arrow */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">₹{pay.amount.toLocaleString('en-IN')}</p>
                      {pay.contract_terms && (
                        <div className="flex items-center gap-1 justify-end mt-1">
                          <FileText className="h-3 w-3 text-violet-400" />
                          <span className="text-[10px] text-violet-500 font-bold">Contract</span>
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  </div>
                </Link>

                {/* Signature progress bar */}
                {pay.contract_terms && (
                  <div className="px-5 pb-4 flex gap-2">
                    {[
                      { label: 'Pump Owner', done: pay.pump_owner_signed },
                      { label: 'You', done: pay.logistic_signed },
                    ].map(({ label, done }) => (
                      <div key={label} className={`flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px]
                        ${done ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                        {done
                          ? <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                          : <Clock className="h-3 w-3 text-slate-300 flex-shrink-0" />}
                        <span className={`font-bold ${done ? 'text-emerald-700' : 'text-slate-400'}`}>{label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
