'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Check,
  X,
  Loader2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Building,
  User,
  Truck,
  Fuel,
  Calendar,
  ShieldAlert,
  Mail,
} from 'lucide-react';
import backendApi from '@/lib/backendApi';
import { toast } from '@/components/feedback/Toast';

interface PendingVoucher {
  id: string;
  voucher_ref: string;
  logistic_partner_id: string;
  logistic_partner_name: string;
  logistic_partner_email: string;
  vehicle_plate: string;
  fuel_type: string;
  amount: number;
  notes: string;
  expiry_date: string;
  requested_at: string;
  pump_id: string;
  pump_name: string;
  status: string;
}

export default function VoucherApprovalsPage() {
  const [vouchers, setVouchers] = useState<PendingVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectingVoucher, setRejectingVoucher] = useState<PendingVoucher | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPendingVouchers = async () => {
    setIsLoading(true);
    try {
      const { data } = await backendApi.get('/pumps/vouchers/pending');
      setVouchers(data);
    } catch (err: any) {
      toast.error('Failed to load pending vouchers', err?.response?.data?.detail || 'Could not fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVouchers();
  }, []);

  const handleApprove = async (id: string, ref: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await backendApi.post(`/pumps/vouchers/${id}/approve`);
      toast.success('Voucher Approved!', `Voucher ${ref} is now active.`);
      fetchPendingVouchers();
    } catch (err: any) {
      toast.error('Approval failed', err?.response?.data?.detail || 'Could not approve voucher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingVoucher || !rejectReason.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await backendApi.post(`/pumps/vouchers/${rejectingVoucher.id}/reject`, {
        reason: rejectReason.trim()
      });
      toast.success('Voucher Rejected', `Voucher ${rejectingVoucher.voucher_ref} has been rejected.`);
      setRejectingVoucher(null);
      setRejectReason('');
      fetchPendingVouchers();
    } catch (err: any) {
      toast.error('Rejection failed', err?.response?.data?.detail || 'Could not reject voucher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = vouchers.reduce((acc, v) => acc + v.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden shadow-xl border border-slate-700">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #f97316 0%, transparent 60%)' }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
              <QrCode className="h-5 w-5 text-orange-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Fuel Voucher Approvals</h1>
          </div>
          <p className="text-slate-400 font-medium text-sm max-w-xl">
            Authorize dynamic QR fuel vouchers requested by verified logistic partners.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl px-5 py-3 text-center">
            <p className="text-2xl font-black text-orange-400">{vouchers.length}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Pending</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl px-5 py-3 text-center">
            <p className="text-2xl font-black text-orange-400">₹{totalAmount.toLocaleString('en-IN')}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Total Value</p>
          </div>
          <button
            onClick={fetchPendingVouchers}
            className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl flex items-center justify-center h-64 text-slate-400 gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
            <p className="text-sm font-medium">Loading pending vouchers...</p>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
            <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
              <QrCode className="h-7 w-7 text-slate-300" />
            </div>
            <p className="text-sm font-semibold">No pending fuel voucher requests</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vouchers.map((v) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-3.5">
                  {/* Top Bar: Ref & Amount */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-3 items-center">
                      <div className="h-10 w-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shrink-0 shadow-sm">
                        <QrCode className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                          {v.vehicle_plate}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                          Ref: {v.voucher_ref}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Limit</p>
                      <p className="text-base font-black text-slate-800">₹{v.amount.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Metadata fields */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] font-semibold text-slate-600">
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase block tracking-wider mb-0.5">Station</span>
                      <span className="text-slate-800 font-bold truncate block">{v.pump_name}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase block tracking-wider mb-0.5">Fuel Authorized</span>
                      <span className="text-orange-600 font-black uppercase">{v.fuel_type}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase block tracking-wider mb-0.5">Expires</span>
                      <span className="text-slate-800 font-bold">{v.expiry_date || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Partner Details */}
                  <div className="space-y-1.5 text-xs text-slate-500 font-semibold border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{v.logistic_partner_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{v.logistic_partner_email}</span>
                    </div>
                    {v.notes && (
                      <div className="bg-slate-50/80 border border-slate-100 rounded-lg p-2.5 mt-2 italic text-[11px] text-slate-500 font-medium">
                        "{v.notes}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t border-slate-100 pt-3">
                  <button
                    onClick={() => handleApprove(v.id, v.voucher_ref)}
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-orange-500/10 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" /> Authorize & Issue
                  </button>
                  <button
                    onClick={() => setRejectingVoucher(v)}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <X className="h-4 w-4" /> Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectingVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-md shadow-2xl p-6 relative z-10 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Reject Fuel Voucher</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Voucher {rejectingVoucher.voucher_ref}</p>
                </div>
              </div>
              <button
                onClick={() => setRejectingVoucher(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  Rejection Reason *
                </label>
                <textarea
                  placeholder="Explain why this fuel voucher is being rejected (e.g. Credit limit exceeded, Target vehicle route mismatch)."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-rose-500 h-24 resize-none transition-all"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setRejectingVoucher(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !rejectReason.trim()}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/10 cursor-pointer disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
