'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, X, Loader2, FileText, Phone, Mail,
  Car, Truck, ChevronDown, User2, IndianRupee,
  Shield, PenLine, CheckCircle2, Clock, AlertCircle,
  Upload, Info, RefreshCw, ExternalLink
} from 'lucide-react';
import backendApi from '@/lib/backendApi';
import { toast } from '@/components/feedback/Toast';
import { usePumpStore } from '@/stores/pumps.store';
import ContractWizardSplitScreen from '../udhaar/components/ContractWizardSplitScreen';
import { fetchPumpProfile, PumpProfile } from '@/services/settings.service';

const getFullUrl = (url: string | null): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1$/, '') ?? '';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const prefix = backendBase || apiBase || origin;
  return `${prefix.replace(/\/*$/, '')}/${url.replace(/^\/*/, '')}`;
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreditReq {
  id: string;
  logistic_partner_name: string;
  logistic_partner_phone: string;
  logistic_partner_email: string;
  vehicle_plate: string;
  vehicle_type: string;
  make_model: string;
  driver_name: string;
  pump_id: string;
  requested_limit: number;
  approved_limit: number | null;
  status: string;
  remarks?: string;
  requested_at: string;
  deposit_amount: number | null;
  deposit_confirmed: boolean;
  deposit_proof_url: string | null;
  logistic_signed: boolean;
  pump_owner_signed: boolean;
  activated_at: string | null;
  contract_terms: Record<string, any> | null;
  logistic_contract_data: Record<string, any> | null;
  udhaar_customer_id: string | null;
  vehicle_ids?: string[];
  vehicle_plates?: string[];
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pending Review', cls: 'bg-amber-50 border-amber-100 text-amber-700' },
  approved: { label: 'Approved', cls: 'bg-blue-50 border-blue-100 text-blue-700' },
  rejected: { label: 'Rejected', cls: 'bg-red-50 border-red-100 text-red-700' },
  deposit_pending: { label: 'Deposit Pending', cls: 'bg-orange-50 border-orange-100 text-orange-700' },
  deposit_confirmed: { label: 'Deposit Confirmed', cls: 'bg-blue-50 border-blue-100 text-blue-700' },
  contract_generated: { label: 'Contract Generated', cls: 'bg-violet-50 border-violet-100 text-violet-700' },
  logistic_signed: { label: 'Partner Signed', cls: 'bg-indigo-50 border-indigo-100 text-indigo-700' },
  pump_signed: { label: 'You Signed', cls: 'bg-indigo-50 border-indigo-100 text-indigo-700' },
  active: { label: 'Active', cls: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || { label: status, cls: 'bg-slate-50 border-slate-100 text-slate-500' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[11px] font-bold ${s.cls}`}>
      {s.label}
    </span>
  );
}

// ─── OTP Sign Modal ───────────────────────────────────────────────────────────

function OTPSignModal({ requestId, signingAs, onClose, onSuccess }: {
  requestId: string; signingAs: 'logistic' | 'pump_owner'; onClose: () => void; onSuccess: () => void;
}) {
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [signing, setSigning] = useState(false);

  const sendOTP = async () => {
    setSending(true);
    try {
      const { data } = await backendApi.post(`/credit/send-otp/${requestId}?signing_as=${signingAs}`);
      setDevOtp(data.otp);
      setStep('verify');
      toast.success('OTP Sent', 'Check your registered mobile');
    } catch (e: any) {
      toast.error('Failed', e?.response?.data?.detail || 'Could not send OTP');
    } finally { setSending(false); }
  };

  const sign = async () => {
    if (otp.length !== 6) { toast.error('Invalid', 'Enter 6-digit OTP'); return; }
    setSigning(true);
    try {
      const { data } = await backendApi.post(`/credit/sign/${requestId}?signing_as=${signingAs}`, { otp });
      toast.success('Signed!', data.message);
      onSuccess(); onClose();
    } catch (e: any) {
      toast.error('Failed', e?.response?.data?.detail || 'Invalid OTP');
    } finally { setSigning(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm border border-slate-100 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
              <PenLine className="h-4 w-4 text-violet-600" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900">Sign Contract</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-xl cursor-pointer text-slate-400">
            <X className="h-4 w-4" />
          </button>
        </div>

        {step === 'send' ? (
          <>
            <p className="text-xs text-slate-500 mb-4">
              An OTP will be sent to your registered mobile/email to digitally sign this credit agreement.
            </p>
            <button onClick={sendOTP} disabled={sending}
              className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
              {sending ? 'Sending...' : 'Send Signing OTP'}
            </button>
          </>
        ) : (
          <>
            {devOtp && (
              <div className="flex items-center gap-2 p-2.5 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-700 font-bold mb-3">
                <Info className="h-3.5 w-3.5 flex-shrink-0" />
                Dev OTP: <span className="font-mono ml-1">{devOtp}</span>
              </div>
            )}
            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
              Enter 6-Digit OTP
            </label>
            <input type="text" maxLength={6} value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="• • • • • •"
              className="w-full px-4 py-3 text-center text-xl font-bold tracking-[0.5em] border border-slate-200 rounded-xl outline-none focus:border-violet-400 mb-3" />
            <div className="flex gap-2">
              <button onClick={() => { setStep('send'); setOtp(''); }}
                className="flex-1 py-2.5 text-xs font-bold border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 cursor-pointer">
                ← Resend
              </button>
              <button onClick={sign} disabled={signing || otp.length !== 6}
                className="flex-1 py-2.5 text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all">
                {signing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign Contract'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CreditApprovalsPage() {
  const { selectedPump } = usePumpStore();
  const pumpId = selectedPump?.id ? String(selectedPump.id) : null;

  const [tab, setTab] = useState<'pending' | 'all'>('pending');
  const [requests, setRequests] = useState<CreditReq[]>([]);
  const [allRequests, setAllRequests] = useState<CreditReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [approvedLimits, setApprovedLimits] = useState<Record<string, string>>({});
  const [depositAmounts, setDepositAmounts] = useState<Record<string, string>>({});
  const [signingId, setSigningId] = useState<string | null>(null);
  const [pumpProfile, setPumpProfile] = useState<PumpProfile | null>(null);

  // Wizard state — kis req ke liye, kaunsa mode (confirm-deposit ya build-contract)
  const [wizardFor, setWizardFor] = useState<CreditReq | null>(null);
  const [wizardMode, setWizardMode] = useState<'confirm-deposit' | 'build-contract' | null>(null);

  const fetchPending = async () => {
    if (!pumpId) {
      setRequests([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await backendApi.get(`/credit/pending?pump_id=${pumpId}`);
      setRequests(data);
      const limits: Record<string, string> = {};
      const deposits: Record<string, string> = {};
      data.forEach((r: CreditReq) => {
        limits[r.id] = String(r.requested_limit);
        deposits[r.id] = '';
      });
      setApprovedLimits(limits);
      setDepositAmounts(deposits);
    } catch { toast.error('Error', 'Failed to load requests'); }
    finally { setLoading(false); }
  };

  const pendingApprovalCount = requests.filter(r => r.status === 'pending').length;
  const depositConfirmCount = requests.filter(r => r.status === 'deposit_pending' && r.deposit_proof_url).length;

  const fetchAll = async () => {
    if (!pumpId) return;
    setLoading(true);
    try {
      const { data } = await backendApi.get(`/credit/all?pump_id=${pumpId}`);
      setAllRequests(data);
    } catch { toast.error('Error', 'Failed to load all requests'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === 'pending') fetchPending();
    else fetchAll();
  }, [tab, pumpId]);

  // Fetch pump profile for logo
  useEffect(() => {
    if (!pumpId) return;
    fetchPumpProfile(pumpId).then(setPumpProfile).catch(() => { });
  }, [pumpId]);

  const handleApprove = async (req: CreditReq) => {
    const limit = parseFloat(approvedLimits[req.id] || String(req.requested_limit));
    const deposit = parseFloat(depositAmounts[req.id] || '0') || 0;
    if (!limit || limit <= 0) { toast.error('Invalid', 'Enter valid credit limit'); return; }
    setProcessingId(req.id);
    try {
      await backendApi.post(
        `/credit/approve/${req.id}?approved_limit=${limit}&deposit_required=${deposit}`
      );
      toast.success('Approved', `Credit approved for ${req.vehicle_plate}`);
      fetchPending();
    } catch (e: any) {
      toast.error('Failed', e?.response?.data?.detail || 'Approval failed');
    } finally { setProcessingId(null); }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await backendApi.post(`/credit/reject/${id}`);
      toast.success('Rejected', 'Request rejected');
      fetchPending();
    } catch { setRequests(p => p.filter(r => r.id !== id)); }
    finally { setProcessingId(null); }
  };

  // Wizard submit — confirm-deposit ya build-contract endpoint call karega based on mode
  const handleWizardSubmit = async (payload: any) => {
    if (!wizardFor || !wizardMode) return;
    const endpoint = wizardMode === 'confirm-deposit'
      ? `/credit/confirm-deposit/${wizardFor.id}`
      : `/credit/build-contract/${wizardFor.id}`;
    await backendApi.post(endpoint, payload);
  };

  const closeWizard = () => { setWizardFor(null); setWizardMode(null); };

  const displayList = tab === 'pending' ? requests : allRequests;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden shadow-xl border border-slate-700">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #f97316 0%, transparent 60%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
              <FileText className="h-5 w-5 text-orange-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Credit Agreements</h1>
          </div>
          <p className="text-slate-400 text-sm">Review, approve, and manage credit agreements with logistic partners</p>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl px-5 py-3 text-center">
            <p className="text-2xl font-black text-orange-400">{requests.length}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Pending</p>
          </div>
          <button onClick={() => tab === 'pending' ? fetchPending() : fetchAll()}
            className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-400 hover:text-white cursor-pointer transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-xs select-none">
        <button onClick={() => setTab('pending')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5
            ${tab === 'pending' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
          Action Required
          {(pendingApprovalCount + depositConfirmCount) > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${tab === 'pending' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
              }`}>
              {pendingApprovalCount + depositConfirmCount}
            </span>
          )}
        </button>
        <button onClick={() => setTab('all')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer
            ${tab === 'all' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
          All Requests
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl flex items-center justify-center h-48 gap-3 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading...</p>
          </div>
        ) : displayList.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center h-48 text-slate-400">
            <FileText className="h-10 w-10 mb-3 opacity-20" />
            <p className="text-sm font-bold">No requests found</p>
          </div>
        ) : displayList.map(req => (
          <motion.div key={req.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

            {/* Card Top */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 p-5">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                  <User2 className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 truncate">{req.logistic_partner_name}</p>
                    <StatusBadge status={req.status} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 mt-0.5">
                    {req.logistic_partner_phone !== 'N/A' && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Phone className="h-3 w-3" /> {req.logistic_partner_phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Mail className="h-3 w-3" /> {req.logistic_partner_email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  {req.vehicle_type === 'car'
                    ? <Car className="h-4 w-4 text-slate-500" />
                    : <Truck className="h-4 w-4 text-slate-500" />}
                  <div>
                    <p className="text-sm font-black text-slate-800">{req.vehicle_plate}</p>
                    <p className="text-[10px] text-slate-400">{req.make_model}</p>
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 text-center">
                  <p className="text-[10px] font-bold text-orange-500 uppercase">Requested</p>
                  <p className="text-sm font-black text-orange-700">₹{req.requested_limit.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* Expand toggle */}
            <button onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
              className="w-full flex items-center justify-between px-5 py-2.5 border-t border-slate-100 hover:bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider cursor-pointer transition-colors">
              <span>Details & Actions</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${expandedId === req.id ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {expandedId === req.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} className="border-t border-slate-100 overflow-hidden">

                  <div className="p-5 space-y-4">

                    {/* Info grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 rounded-2xl p-4">
                      {[
                        { label: 'Driver', value: req.driver_name },
                        { label: 'Vehicle Type', value: req.vehicle_type },
                        { label: 'Requested At', value: req.requested_at },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{label}</p>
                          <p className="text-xs font-bold text-slate-700 capitalize">{value}</p>
                        </div>
                      ))}
                      {req.remarks && (
                        <div className="col-span-full">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Partner Message</p>
                          <p className="text-xs text-slate-600 italic bg-white border border-slate-100 px-3 py-2 rounded-xl">
                            &ldquo;{req.remarks}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>

                    {/* ── PENDING → Approve/Reject ── */}
                    {req.status === 'pending' && (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 space-y-2">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                              Approved Credit Limit (₹)
                            </label>
                            <input type="number"
                              value={approvedLimits[req.id] ?? req.requested_limit}
                              onChange={e => setApprovedLimits(p => ({ ...p, [req.id]: e.target.value }))}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-primary/50 transition-colors" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                              Security Deposit Required (₹) — 0 for none
                            </label>
                            <input type="number" placeholder="0"
                              value={depositAmounts[req.id] ?? ''}
                              onChange={e => setDepositAmounts(p => ({ ...p, [req.id]: e.target.value }))}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-primary/50 transition-colors" />
                          </div>
                        </div>
                        <div className="flex sm:flex-col gap-2 sm:justify-end">
                          <button onClick={() => handleApprove(req)} disabled={processingId === req.id}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50 transition-all">
                            {processingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            Approve
                          </button>
                          <button onClick={() => handleReject(req.id)} disabled={processingId === req.id}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50 hover:bg-red-100 transition-all">
                            <X className="h-4 w-4" /> Reject
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ── DEPOSIT_PENDING → Confirm deposit + build contract (wizard) ── */}
                    {req.status === 'deposit_pending' && (
                      <div className="flex flex-col gap-3">
                        {req.deposit_proof_url ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-xs font-bold text-emerald-800">
                                  Payment Proof Received! ₹{(req.deposit_amount || 0).toLocaleString('en-IN')}
                                </p>
                                <p className="text-[10px] text-emerald-700 mt-0.5">
                                  Logistic partner ne payment proof upload kar diya hai. Review karke contract finalize karein.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white border border-emerald-200 rounded-xl">
                              <a href={getFullUrl(req.deposit_proof_url)}
                                target="_blank" rel="noopener noreferrer"
                                className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5">
                                <Upload className="h-3.5 w-3.5" /> View Payment Proof
                              </a>
                              <button
                                disabled={!req.udhaar_customer_id}
                                onClick={() => { setWizardFor(req); setWizardMode('confirm-deposit'); }}
                                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer transition-all disabled:opacity-50">
                                <FileText className="h-3.5 w-3.5" />
                                Confirm Receipt & Build Contract
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                            <IndianRupee className="h-4 w-4 text-amber-600 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-xs font-bold text-amber-800">
                                Deposit Pending: ₹{(req.deposit_amount || 0).toLocaleString('en-IN')}
                              </p>
                              <p className="text-[10px] text-amber-600 mt-0.5">
                                Partner se payment proof ka wait kar rahe hain...
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── CONTRACT_GENERATED, NO CONTRACT TERMS YET → Build (no-deposit path) ── */}
                    {req.status === 'contract_generated' && !req.pump_owner_signed && !req.contract_terms && (
                      <div className="flex items-center justify-between p-3 bg-violet-50 border border-violet-100 rounded-xl">
                        <div>
                          <p className="text-xs font-bold text-violet-800">Build the credit contract</p>
                          <p className="text-[10px] text-violet-600 mt-0.5">
                            No deposit required for this request — fill contract terms before signing.
                          </p>
                        </div>
                        <button
                          disabled={!req.udhaar_customer_id}
                          onClick={() => { setWizardFor(req); setWizardMode('build-contract'); }}
                          className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all disabled:opacity-50">
                          <FileText className="h-3.5 w-3.5" /> Build Contract
                        </button>
                      </div>
                    )}

                    {/* ── CONTRACT_GENERATED (built) / LOGISTIC_SIGNED → Sign ── */}
                    {['contract_generated', 'logistic_signed'].includes(req.status) && !req.pump_owner_signed && !!req.contract_terms && (
                      <div className="flex items-center justify-between p-3 bg-violet-50 border border-violet-100 rounded-xl">
                        <div>
                          <p className="text-xs font-bold text-violet-800">Contract ready for your signature</p>
                          <p className="text-[10px] text-violet-600 mt-0.5">
                            {req.logistic_signed
                              ? 'Partner has signed. Your signature will activate the credit.'
                              : 'Sign first, then partner will countersign.'}
                          </p>
                        </div>
                        <button onClick={() => setSigningId(req.id)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all">
                          <PenLine className="h-3.5 w-3.5" /> Sign
                        </button>
                      </div>
                    )}

                    {/* ── ACTIVE ── */}
                    {req.status === 'active' && (
                      <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-emerald-800">Credit Agreement Active</p>
                          <p className="text-[10px] text-emerald-600 mt-0.5">
                            ₹{(req.approved_limit || 0).toLocaleString('en-IN')} credit activated.
                            {req.activated_at && ` Since ${new Date(req.activated_at).toLocaleDateString('en-IN')}.`}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Signing status summary */}
                    {req.status !== 'pending' && req.status !== 'deposit_pending' && req.status !== 'rejected' && (
                      <div className="flex gap-3">
                        {[
                          { label: 'Your Signature', done: req.pump_owner_signed },
                          { label: 'Partner Signature', done: req.logistic_signed },
                        ].map(({ label, done }) => (
                          <div key={label} className={`flex-1 flex items-center gap-2 p-2.5 rounded-xl border text-xs
                            ${done ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                            {done
                              ? <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                              : <Clock className="h-4 w-4 text-slate-300 flex-shrink-0" />}
                            <span className={`font-bold ${done ? 'text-emerald-700' : 'text-slate-400'}`}>{label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* OTP Sign Modal */}
      {signingId && (
        <OTPSignModal
          requestId={signingId}
          signingAs="pump_owner"
          onClose={() => setSigningId(null)}
          onSuccess={() => { setSigningId(null); fetchPending(); fetchAll(); }}
        />
      )}

      {/* Contract Wizard (deposit confirm / build contract) — pump owner side, with preview */}
      {wizardFor && wizardFor.udhaar_customer_id && (
        <ContractWizardSplitScreen
          pumpId={wizardFor.pump_id}
          customerId={wizardFor.udhaar_customer_id}
          customerName={wizardFor.logistic_partner_name}
          existingContract={null}
          prefillData={wizardFor.logistic_contract_data}
          logoUrl={pumpProfile?.logo_url || null}
          onSubmitOverride={handleWizardSubmit}
          onClose={closeWizard}
          onSuccess={() => { closeWizard(); fetchPending(); fetchAll(); }}
        />
      )}
    </div>
  );
}