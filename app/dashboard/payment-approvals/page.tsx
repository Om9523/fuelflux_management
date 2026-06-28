'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, X, Loader2, CreditCard, Banknote,
  AlertTriangle, ExternalLink, IndianRupee,
  FileText, PenLine, Shield, Info, CheckCircle2,
  Clock, RefreshCw, ChevronDown, User2,
} from 'lucide-react';
import backendApi from '@/lib/backendApi';
import { toast } from '@/components/feedback/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type PStatus = 'pending' | 'contract_generated' | 'logistic_signed' | 'pump_signed' | 'approved' | 'rejected';

interface PendingPayment {
  id: string;
  logistic_partner_id: string;
  logistic_partner_name: string;
  logistic_partner_phone: string;
  logistic_partner_email: string;
  pump_id: string;
  pump_name: string;
  amount: number;
  payment_type: string;
  transaction_reference: string | null;
  remarks: string | null;
  screenshot_url: string | null;
  existing_outstanding: number;
  net_new_credit: number;
  requested_at: string | null;
  status: PStatus;
  logistic_form_data: Record<string, any> | null;
  contract_terms: Record<string, any> | null;
  contract_generated_at: string | null;
  logistic_signed: boolean;
  logistic_signed_at: string | null;
  pump_owner_signed: boolean;
  pump_owner_signed_at: string | null;
}

const STATUS_MAP: Record<PStatus, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'bg-amber-50 border-amber-200 text-amber-700' },
  contract_generated: { label: 'Contract Sent', cls: 'bg-violet-50 border-violet-200 text-violet-700' },
  logistic_signed: { label: 'Partner Signed', cls: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  pump_signed: { label: 'You Signed', cls: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  approved: { label: 'Approved', cls: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  rejected: { label: 'Rejected', cls: 'bg-red-50 border-red-200 text-red-700' },
};

function StatusBadge({ status }: { status: PStatus }) {
  const s = STATUS_MAP[status] ?? { label: status, cls: 'bg-slate-50 border-slate-100 text-slate-500' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[11px] font-bold ${s.cls}`}>
      {s.label}
    </span>
  );
}

// ─── Contract Creation Modal ──────────────────────────────────────────────────

function ContractModal({
  pay,
  onClose,
  onSuccess,
}: {
  pay: PendingPayment;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const fd = pay.logistic_form_data || {};
  const [creditLimit, setCreditLimit] = useState(String(pay.amount));
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [interest, setInterest] = useState('2.0');
  const [disputeDays, setDisputeDays] = useState('15');
  const [validDays, setValidDays] = useState('365');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(creditLimit);
    if (!limit || limit <= 0) { toast.error('Invalid', 'Enter valid credit limit'); return; }
    setSaving(true);
    try {
      await backendApi.post(`/payment/generate-contract/${pay.id}`, {
        credit_limit: limit,
        billing_cycle: billingCycle,
        late_payment_interest: parseFloat(interest) || 2.0,
        dispute_window_days: parseInt(disputeDays) || 15,
        valid_days: parseInt(validDays) || 365,
        remarks: remarks.trim() || null,
      });
      toast.success('Contract Created!', 'Logistic partner will now sign the contract');
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error('Failed', e?.response?.data?.detail || 'Could not create contract');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="bg-white rounded-3xl w-full max-w-lg border border-slate-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
              <FileText className="h-4 w-4 text-violet-600" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Create Payment Contract</h2>
              <p className="text-[10px] text-slate-400">For PAY-{pay.id} · {pay.logistic_partner_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-xl cursor-pointer text-slate-400">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Payment info banner */}
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs">
            <p className="font-bold text-indigo-800 mb-1">Payment Details</p>
            <div className="grid grid-cols-2 gap-1 text-indigo-700">
              <span>Amount Received:</span>
              <span className="font-black">₹{pay.amount.toLocaleString('en-IN')}</span>
              {pay.transaction_reference && <>
                <span>UTR Ref:</span>
                <span className="font-bold font-mono">{pay.transaction_reference}</span>
              </>}
            </div>
          </div>

          {/* Logistic info (from their form) */}
          {Object.keys(fd).length > 0 && (
            <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl text-xs">
              <p className="font-bold text-orange-800 mb-1">Partner's Info (from logistic)</p>
              <div className="grid grid-cols-2 gap-1 text-orange-700">
                {fd.vehicle_plate && <><span>Vehicle Plate:</span><span className="font-black">{fd.vehicle_plate}</span></>}
                {fd.vehicle_type && <><span>Vehicle Type:</span><span className="font-bold capitalize">{fd.vehicle_type}</span></>}
                {fd.driver_name && <><span>Driver:</span><span className="font-bold">{fd.driver_name}</span></>}
                {fd.purpose && <><span className="col-span-2 mt-1 text-orange-600 italic">Purpose: {fd.purpose}</span></>}
              </div>
            </div>
          )}

          {/* Contract Terms Form */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Contract Terms</p>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                Credit Limit (₹) — pre-filled from payment amount
              </label>
              <input type="number" value={creditLimit}
                onChange={e => setCreditLimit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-violet-400 transition-colors"
                required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Billing Cycle</label>
                <select value={billingCycle} onChange={e => setBillingCycle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-violet-400">
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="fortnightly">Fortnightly</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Late Interest (%)</label>
                <input type="number" step="0.5" min="0" max="10" value={interest}
                  onChange={e => setInterest(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-violet-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Dispute Window (days)</label>
                <input type="number" min="7" max="30" value={disputeDays}
                  onChange={e => setDisputeDays(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-violet-400" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Valid For (days)</label>
                <input type="number" min="30" max="730" value={validDays}
                  onChange={e => setValidDays(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-violet-400" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Contract Remarks (optional)</label>
              <input type="text" value={remarks} onChange={e => setRemarks(e.target.value)}
                placeholder="Any special terms or conditions..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-violet-400 transition-colors" />
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            {saving ? 'Creating Contract...' : 'Create & Send Contract to Partner'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ─── OTP Sign Modal (Pump Owner) ─────────────────────────────────────────────

function OTPSignModal({ paymentId, onClose, onSuccess }: {
  paymentId: string; onClose: () => void; onSuccess: () => void;
}) {
  const [step, setStep] = useState<'send' | 'verify'>('send');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [signing, setSigning] = useState(false);

  const sendOTP = async () => {
    setSending(true);
    try {
      const { data } = await backendApi.post(`/payment/send-otp/${paymentId}`);
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
      const { data } = await backendApi.post(`/payment/sign/${paymentId}`, { otp });
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
              An OTP will be sent to your registered mobile/email to digitally sign this payment contract.
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

export default function PaymentApprovalsPage() {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [contractModalFor, setContractModalFor] = useState<PendingPayment | null>(null);
  const [signingId, setSigningId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [showRejectInput, setShowRejectInput] = useState<Record<string, boolean>>({});

  const fetch = async () => {
    setIsLoading(true);
    try {
      const { data } = await backendApi.get('/payment/pending');
      setPayments(data);
    } catch (err) {
      toast.error('Error', 'Failed to load pending payment requests');
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleReject = async (id: string) => {
    const reason = rejectReason[id] || 'Payment proof not verified';
    setProcessingId(id);
    try {
      await backendApi.post(`/payment/reject/${id}?reason=${encodeURIComponent(reason)}`);
      toast.success('Rejected', 'Payment request rejected');
      fetch();
    } catch (e: any) {
      toast.error('Error', e?.response?.data?.detail || 'Failed to reject');
    } finally {
      setProcessingId(null);
      setShowRejectInput(p => ({ ...p, [id]: false }));
    }
  };

  const pendingActionCount = payments.filter(p =>
    p.status === 'pending' || p.status === 'logistic_signed'
  ).length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden shadow-xl border border-slate-700">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #6366f1 0%, transparent 60%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Banknote className="h-5 w-5 text-indigo-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Payment Approvals</h1>
          </div>
          <p className="text-slate-400 font-medium text-sm max-w-xl">
            Review payment proofs, create contracts, sign to approve credit
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl px-5 py-3 text-center">
            <p className="text-2xl font-black text-indigo-400">{payments.length}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Pending</p>
          </div>
          <button onClick={fetch}
            className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-400 hover:text-white cursor-pointer transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
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
            <p className="text-sm font-semibold">No pending payment requests</p>
          </div>
        ) : payments.map(pay => (
          <motion.div key={pay.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

            {/* Card Top */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 p-5">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <User2 className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 truncate">{pay.logistic_partner_name}</p>
                    <StatusBadge status={pay.status} />
                  </div>
                  <div className="flex flex-wrap gap-x-4 mt-0.5">
                    {pay.logistic_partner_phone !== 'N/A' && (
                      <span className="text-xs text-slate-400">{pay.logistic_partner_phone}</span>
                    )}
                    <span className="text-xs text-slate-400">{pay.logistic_partner_email}</span>
                    {pay.transaction_reference && (
                      <span className="text-xs font-mono text-slate-400">UTR: {pay.transaction_reference}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2 text-center">
                  <p className="text-[10px] font-bold text-indigo-500 uppercase">Payment</p>
                  <p className="text-sm font-black text-indigo-700">₹{pay.amount.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {/* Expand toggle */}
            <button onClick={() => setExpandedId(expandedId === pay.id ? null : pay.id)}
              className="w-full flex items-center justify-between px-5 py-2.5 border-t border-slate-100 hover:bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider cursor-pointer transition-colors">
              <span>Details & Actions</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${expandedId === pay.id ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {expandedId === pay.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} className="border-t border-slate-100 overflow-hidden">

                  <div className="p-5 space-y-4">

                    {/* Amount breakdown */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs space-y-1.5">
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

                    {/* Logistic form data */}
                    {pay.logistic_form_data && Object.keys(pay.logistic_form_data).length > 0 && (
                      <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-xs">
                        <p className="font-black text-orange-600 uppercase text-[10px] mb-1.5">Partner's Info</p>
                        <div className="grid grid-cols-2 gap-1 text-orange-700">
                          {Object.entries(pay.logistic_form_data).map(([k, v]) => v ? (
                            <React.Fragment key={k}>
                              <span className="capitalize text-orange-500">{k.replace(/_/g, ' ')}</span>
                              <span className="font-bold">{String(v)}</span>
                            </React.Fragment>
                          ) : null)}
                        </div>
                      </div>
                    )}

                    {pay.screenshot_url && (
                      <a href={pay.screenshot_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline">
                        <ExternalLink className="h-3.5 w-3.5" /> View Payment Screenshot
                      </a>
                    )}

                    {/* ── ACTION: Create Contract (pending) ── */}
                    {pay.status === 'pending' && (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button onClick={() => setContractModalFor(pay)}
                          className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all">
                          <FileText className="h-4 w-4" /> Create Contract
                        </button>
                        <button onClick={() => setShowRejectInput(p => ({ ...p, [pay.id]: true }))}
                          disabled={showRejectInput[pay.id]}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl cursor-pointer hover:bg-red-100 transition-all disabled:opacity-50">
                          <X className="h-4 w-4" /> Reject
                        </button>
                      </div>
                    )}

                    {/* ── ACTION: Sign Contract (logistic_signed) ── */}
                    {pay.status === 'logistic_signed' && !pay.pump_owner_signed && (
                      <div className="flex items-center justify-between p-3 bg-violet-50 border border-violet-100 rounded-xl">
                        <div>
                          <p className="text-xs font-bold text-violet-800">Partner has signed! Your signature required</p>
                          <p className="text-[10px] text-violet-600 mt-0.5">Sign to finalize and approve this payment</p>
                        </div>
                        <button onClick={() => setSigningId(pay.id)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all">
                          <PenLine className="h-3.5 w-3.5" /> Sign
                        </button>
                      </div>
                    )}

                    {/* ── STATUS: Contract sent, waiting for logistic ── */}
                    {pay.status === 'contract_generated' && (
                      <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                        <Clock className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-amber-800">Contract sent — Waiting for partner to sign</p>
                          <p className="text-[10px] text-amber-600 mt-0.5">Once they sign, you'll need to countersign</p>
                        </div>
                      </div>
                    )}

                    {/* Reject input */}
                    {showRejectInput[pay.id] && (
                      <div className="flex gap-2">
                        <input type="text"
                          placeholder="Reason for rejection (optional)"
                          value={rejectReason[pay.id] || ''}
                          onChange={e => setRejectReason(p => ({ ...p, [pay.id]: e.target.value }))}
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-red-400"
                        />
                        <button onClick={() => handleReject(pay.id)} disabled={processingId === pay.id}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-60 flex items-center gap-1.5">
                          {processingId === pay.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                          Confirm
                        </button>
                        <button onClick={() => setShowRejectInput(p => ({ ...p, [pay.id]: false }))}
                          className="px-3 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold cursor-pointer">
                          Cancel
                        </button>
                      </div>
                    )}

                    {/* Signature status */}
                    {pay.contract_terms && (
                      <div className="flex gap-2">
                        {[
                          { label: 'Your Signature', done: pay.pump_owner_signed, at: pay.pump_owner_signed_at },
                          { label: 'Partner Signature', done: pay.logistic_signed, at: pay.logistic_signed_at },
                        ].map(({ label, done, at }) => (
                          <div key={label} className={`flex-1 flex items-center gap-2 p-2.5 rounded-xl border text-xs
                            ${done ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                            {done
                              ? <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                              : <Clock className="h-4 w-4 text-slate-300 flex-shrink-0" />}
                            <div>
                              <p className={`font-bold text-[10px] ${done ? 'text-emerald-700' : 'text-slate-400'}`}>{label}</p>
                              {done && at && <p className="text-[9px] text-emerald-500">{new Date(at).toLocaleDateString('en-IN')}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-[10px] text-slate-400">{pay.requested_at}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Contract Creation Modal */}
      <AnimatePresence>
        {contractModalFor && (
          <ContractModal
            pay={contractModalFor}
            onClose={() => setContractModalFor(null)}
            onSuccess={fetch}
          />
        )}
      </AnimatePresence>

      {/* OTP Sign Modal */}
      {signingId && (
        <OTPSignModal
          paymentId={signingId}
          onClose={() => setSigningId(null)}
          onSuccess={() => { setSigningId(null); fetch(); }}
        />
      )}
    </div>
  );
}