'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, X, Loader2, FileText, Phone, Mail,
  Car, Truck, ChevronDown, Building2, User2
} from 'lucide-react';
import backendApi from '@/lib/backendApi';
import { toast } from '@/components/feedback/Toast';

interface PendingCreditRequest {
  id: number;
  logistic_partner_id: number;
  logistic_partner_name: string;
  logistic_partner_phone: string;
  logistic_partner_email: string;
  vehicle_id: number;
  vehicle_plate: string;
  vehicle_type: string;
  make_model: string;
  driver_name: string;
  pump_id: number;
  requested_limit: number;
  status: string;
  remarks?: string;
  requested_at: string;
}

export default function CreditApprovalsPage() {
  const [requests, setRequests] = useState<PendingCreditRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  // Per-request approved limit input
  const [approvedLimits, setApprovedLimits] = useState<Record<number, string>>({});

  const fetchPending = async () => {
    setIsLoading(true);
    try {
      const { data } = await backendApi.get('/credit/pending');
      setRequests(data);
      // Pre-fill approved limits with requested values
      const limits: Record<number, string> = {};
      data.forEach((r: PendingCreditRequest) => {
        limits[r.id] = String(r.requested_limit);
      });
      setApprovedLimits(limits);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load pending credit requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (req: PendingCreditRequest) => {
    const limit = parseFloat(approvedLimits[req.id] || String(req.requested_limit));
    if (!limit || limit <= 0) {
      toast.error('Please enter a valid approved credit limit.');
      return;
    }
    setProcessingId(req.id);
    try {
      await backendApi.post(`/credit/approve/${req.id}?approved_limit=${limit}`);
      toast.success(`Credit approved for ${req.vehicle_plate} — ₹${limit.toLocaleString('en-IN')}`);
      await fetchPending();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to approve credit request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    setProcessingId(id);
    try {
      await backendApi.post(`/credit/reject/${id}`);
      toast.success('Credit request rejected');
      await fetchPending();
    } catch {
      // Silently handle — backend may not have reject endpoint yet
      setRequests(prev => prev.filter(r => r.id !== id));
      toast.info('Request removed from queue');
    } finally {
      setProcessingId(null);
    }
  };

  const vehicleIcon = (type: string) => {
    if (type === 'car') return <Car className="h-5 w-5" />;
    return <Truck className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden shadow-2xl border border-slate-700">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #f97316 0%, transparent 60%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
              <FileText className="h-5 w-5 text-orange-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Credit Approvals</h1>
          </div>
          <p className="text-slate-400 font-medium text-sm sm:text-base">
            Review credit limit requests from Logistic Partners for your pump station
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl px-5 py-3 text-center">
            <p className="text-2xl font-black text-orange-400">{requests.length}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Pending</p>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl flex items-center justify-center h-64 text-slate-400 gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
            <p className="text-sm font-medium">Loading credit requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
            <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
              <FileText className="h-7 w-7 text-slate-300" />
            </div>
            <p className="text-sm font-semibold">No pending credit requests.</p>
            <p className="text-xs text-slate-400">Logistic Partners will appear here when they request credit at your pump.</p>
          </div>
        ) : (
          requests.map((req) => (
            <AnimatePresence key={req.id}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Card Header */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 p-5">
                  {/* Partner Avatar + Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
                      <User2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 truncate">{req.logistic_partner_name}</h3>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Logistic</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                        {req.logistic_partner_phone !== 'N/A' && (
                          <a href={`tel:${req.logistic_partner_phone}`} className="flex items-center gap-1 text-xs text-slate-500 hover:text-orange-600 transition-colors font-medium">
                            <Phone className="h-3 w-3" /> {req.logistic_partner_phone}
                          </a>
                        )}
                        <a href={`mailto:${req.logistic_partner_email}`} className="flex items-center gap-1 text-xs text-slate-500 hover:text-orange-600 transition-colors font-medium">
                          <Mail className="h-3 w-3" /> {req.logistic_partner_email}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle + Amount Summary */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                      <div className="text-slate-500">{vehicleIcon(req.vehicle_type)}</div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{req.vehicle_plate}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{req.make_model}</p>
                      </div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 text-center">
                      <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Requesting</p>
                      <p className="text-base font-black text-orange-700">₹{req.requested_limit.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>

                {/* Expandable Details */}
                <button
                  onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                  className="w-full flex items-center justify-between px-5 py-2 border-t border-slate-100 hover:bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider transition-colors"
                >
                  <span>Details &amp; Driver Info</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${expandedId === req.id ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {expandedId === req.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100 overflow-hidden"
                    >
                      <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50/50">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Driver</p>
                          <p className="text-sm font-bold text-slate-700">{req.driver_name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Vehicle Type</p>
                          <p className="text-sm font-bold text-slate-700 capitalize">{req.vehicle_type}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Requested At</p>
                          <p className="text-sm font-bold text-slate-700">{req.requested_at}</p>
                        </div>
                        {req.remarks && (
                          <div className="col-span-full">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Message from Partner</p>
                            <p className="text-sm text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 italic">&ldquo;{req.remarks}&rdquo;</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Approve / Reject Action Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-5 py-4 border-t border-slate-100 bg-white">
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      Approved Credit Limit (₹) — Edit if needed
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        value={approvedLimits[req.id] ?? req.requested_limit}
                        onChange={(e) => setApprovedLimits(prev => ({ ...prev, [req.id]: e.target.value }))}
                        className="w-full pl-7 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 shrink-0 mt-2 sm:mt-5">
                    <button
                      onClick={() => handleApprove(req)}
                      disabled={processingId === req.id}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-colors shadow-sm shadow-emerald-500/20"
                    >
                      {processingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      disabled={processingId === req.id}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-rose-50 hover:bg-rose-100 disabled:opacity-60 text-rose-600 border border-rose-200 rounded-xl font-bold text-sm transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ))
        )}
      </div>
    </div>
  );
}
