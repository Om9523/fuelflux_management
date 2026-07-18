'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, FileText, CheckCircle2, Clock, AlertCircle,
  Loader2, RefreshCw, PenLine, Shield, Info, Banknote,
  IndianRupee, Building2, Phone, Mail, X, ExternalLink,
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

interface PaymentDetail {
  id: string;
  pump_id: string;
  pump: { id: string; name: string; address: string | null; city: string | null } | null;
  partner: { id: string; name: string; phone: string | null; email: string } | null;
  amount: number;
  payment_type: string;
  transaction_reference: string | null;
  remarks: string | null;
  screenshot_url: string | null;
  status: PaymentStatus;
  logistic_form_data: Record<string, any> | null;
  contract_terms: Record<string, any> | null;
  contract_generated_at: string | null;
  logistic_signed: boolean;
  logistic_signed_at: string | null;
  pump_owner_signed: boolean;
  pump_owner_signed_at: string | null;
  requested_at: string | null;
  reviewed_at: string | null;
}

const STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pending Review',
  contract_generated: 'Contract Ready – Sign Required',
  logistic_signed: 'Awaiting Pump Owner Signature',
  pump_signed: 'Your Signature Required',
  approved: 'Payment Approved',
  rejected: 'Rejected',
};

const STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: 'bg-amber-50 border-amber-200 text-amber-700',
  contract_generated: 'bg-violet-50 border-violet-200 text-violet-700',
  logistic_signed: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  pump_signed: 'bg-violet-50 border-violet-200 text-violet-700',
  approved: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  rejected: 'bg-red-50 border-red-200 text-red-700',
};

// ─── Timeline ─────────────────────────────────────────────────────────────────

const TIMELINE = [
  { label: 'Payment Submitted', key: 'pending' },
  { label: 'Contract Created', key: 'contract_generated' },
  { label: 'You Signed', key: 'logistic_signed' },
  { label: 'Pump Owner Signed', key: 'pump_signed' },
  { label: 'Payment Approved', key: 'approved' },
];

const STATUS_ORDER: PaymentStatus[] = ['pending', 'contract_generated', 'logistic_signed', 'pump_signed', 'approved'];

function getStepIdx(s: PaymentStatus) {
  if (s === 'rejected') return -1;
  const i = STATUS_ORDER.indexOf(s);
  return i === -1 ? 0 : i;
}

function Timeline({ status }: { status: PaymentStatus }) {
  const cur = getStepIdx(status);
  return (
    <div className="flex items-start gap-0">
      {TIMELINE.map((step, i) => {
        const done = i < cur;
        const active = i === cur;
        const isLast = i === TIMELINE.length - 1;
        return (
          <div key={step.key} className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all
                ${done ? 'border-emerald-500 bg-emerald-500'
                  : active ? 'border-violet-500 bg-violet-50'
                    : 'border-slate-200 bg-white'}`}>
                {done
                  ? <CheckCircle2 className="h-4 w-4 text-white" />
                  : active
                    ? <div className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />
                    : <div className="w-2 h-2 rounded-full bg-slate-200" />}
              </div>
              {!isLast && <div className={`flex-1 h-0.5 ${done ? 'bg-emerald-500' : 'bg-slate-100'}`} />}
            </div>
            <div className="mt-2 text-center px-1">
              <p className={`text-[10px] font-bold ${active ? 'text-violet-600' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
                {step.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Contract Preview ─────────────────────────────────────────────────────────

function ContractPreview({ data }: { data: PaymentDetail }) {
  const c = data.contract_terms;
  if (!c) return null;

  const fmt = (v: string | number) => {
    const n = typeof v === 'string' ? parseFloat(v) : v;
    if (!n || isNaN(n)) return '₹0.00';
    return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  };

  const fmtDate = (s: string) => {
    if (!s) return '—';
    return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const today = () => new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="bg-white text-slate-800 text-[11px] leading-relaxed p-8 border border-slate-200 shadow-lg rounded-2xl font-serif"
      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

      {/* Letterhead */}
      <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-slate-800">
        <div>
          <h2 className="text-lg font-black text-slate-900 font-sans">
            {c.pump_name || data.pump?.name || 'Fuel Station Operator'}
          </h2>
          {(c.pump_address || data.pump?.address) && (
            <p className="text-[10px] text-slate-500 mt-0.5">Address: {c.pump_address || data.pump?.address}</p>
          )}
          {(c.pump_gst || (data.pump as any)?.gst) && (
            <p className="text-[10px] text-slate-500">GST: {c.pump_gst || (data.pump as any)?.gst}</p>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
          <span className="text-slate-300 text-xs font-black">LOGO</span>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-center text-sm font-black uppercase tracking-widest text-slate-900 mb-1">
        Credit Fueling Agreement
      </h1>
      <p className="text-center text-[10px] text-slate-500 mb-6">
        Execution Date: {data.contract_generated_at ? fmtDate(data.contract_generated_at) : today()}
      </p>

      {/* Parties */}
      <p className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
        Parties to the Agreement
      </p>
      <p className="mb-2 text-[11px]">
        This Agreement is entered into on the Execution Date between:
      </p>
      <p className="mb-1">
        <span className="font-bold">The Dealer:</span> Operating under the trade name &quot;{c.pump_name || data.pump?.name || 'Dealer'}&quot;, being the authorized fuel station operator managing credit facilities.
      </p>
      <p className="mb-2">
        <span className="font-bold">The Customer:</span> <span className="underline">{c.partner_name || data.partner?.name || data.partner?.email}</span>, representing the fleet owner or corporate entity authorized to procure fuel on credit.
      </p>
      {c.vehicle_plate && (
        <p className="mb-4">
          <span className="font-bold">Registered Fleet Vehicle:</span>{' '}
          <span className="font-mono text-[10px] bg-slate-100 px-2.5 py-1 rounded border border-slate-200 font-bold">
            {c.vehicle_plate}
          </span>
        </p>
      )}

      {/* Covenant line */}
      <p className="font-bold text-[10px] mb-4 text-slate-700">
        NOW, THEREFORE, IN CONSIDERATION OF THE MUTUAL PROMISES AND COVENANTS SET FORTH HEREIN, BOTH PARTIES HEREBY AGREE TO BE BOUND BY THE FOLLOWING:
      </p>

      {/* 1. Global Credit */}
      <p className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
        1. Credit Ceiling and Spend Limits
      </p>
      <ul className="mb-4 pl-4 space-y-1 list-none">
        <li><span className="font-bold">a. Total Credit Ceiling:</span> The maximum aggregate credit limit available under this contract is <span className="font-bold">{fmt(c.credit_limit)}</span>.</li>
        <li><span className="font-bold">b. Validity Period:</span> Valid from <span className="underline">{c.valid_from ? fmtDate(c.valid_from) : today()}</span> to <span className="underline">{c.valid_to ? fmtDate(c.valid_to) : '—'}</span>.</li>
      </ul>

      {/* 2. Billing */}
      <p className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
        2. Billing and Invoicing
      </p>
      <ul className="mb-4 pl-4 space-y-1">
        <li><span className="font-bold">Frequency:</span> Consolidated billing cycle configured on a <span className="font-bold">{c.billing_cycle || 'Monthly'}</span> basis.</li>
        <li><span className="font-bold">Invoice Round-Off:</span> Enabled to the nearest currency unit.</li>
      </ul>

      {/* 3. T&C */}
      <p className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
        3. Terms and Conditions
      </p>
      <ul className="mb-4 pl-4 space-y-1">
        {c.late_payment_interest && <li><span className="font-bold">Late Payment Interest:</span> {c.late_payment_interest}% per billing cycle on overdue amounts.</li>}
        {c.dispute_window_days && <li><span className="font-bold">Dispute Window:</span> Invoices may be disputed within {c.dispute_window_days} days of generation.</li>}
        {c.purpose && <li><span className="font-bold">Additional Terms:</span> {c.purpose}</li>}
      </ul>

      {/* Signatures */}
      <div className="mt-8 pt-4 border-t border-slate-300 grid grid-cols-2 gap-8">
        <div>
          <div className={`h-10 border-b flex items-end justify-center pb-1 mb-1
            ${data.pump_owner_signed ? 'border-emerald-500' : 'border-slate-300'}`}>
            {data.pump_owner_signed ? (
              <span className="text-xs font-bold text-emerald-600">✓ Digitally Signed</span>
            ) : (
              <span className="text-[10px] text-slate-300">Awaiting Signature</span>
            )}
          </div>
          <p className="text-[10px] font-bold text-slate-600">Authorised Signatory — Dealer</p>
          <p className="text-[10px] text-slate-400">{c.pump_name || data.pump?.name}</p>
          {data.pump_owner_signed_at && (
            <p className="text-[9px] text-slate-400 mt-0.5">
              Signed on: {new Date(data.pump_owner_signed_at).toLocaleDateString('en-IN')}
            </p>
          )}
        </div>
        <div>
          <div className={`h-10 border-b flex items-end justify-center pb-1 mb-1
            ${data.logistic_signed ? 'border-emerald-500' : 'border-slate-300'}`}>
            {data.logistic_signed ? (
              <span className="text-xs font-bold text-emerald-600">✓ Digitally Signed</span>
            ) : (
              <span className="text-[10px] text-slate-300">Awaiting Signature</span>
            )}
          </div>
          <p className="text-[10px] font-bold text-slate-600">Authorised Signatory — Customer</p>
          <p className="text-[10px] text-slate-400">{c.partner_name || data.partner?.name || data.partner?.email}</p>
          {data.logistic_signed_at && (
            <p className="text-[9px] text-slate-400 mt-0.5">
              Signed on: {new Date(data.logistic_signed_at).toLocaleDateString('en-IN')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── OTP Sign Section ─────────────────────────────────────────────────────────

function OTPSignSection({ paymentId, onSuccess }: { paymentId: number | string; onSuccess: () => void }) {
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
      toast.success('OTP Sent', 'Check your registered mobile number');
    } catch (e: any) {
      toast.error('Failed', e?.response?.data?.detail || 'Could not send OTP');
    } finally { setSending(false); }
  };

  const sign = async () => {
    if (otp.length !== 6) { toast.error('Invalid OTP', 'Enter 6-digit OTP'); return; }
    setSigning(true);
    try {
      const { data } = await backendApi.post(`/payment/sign/${paymentId}`, { otp });
      toast.success('Signed!', data.message);
      onSuccess();
    } catch (e: any) {
      toast.error('Invalid OTP', e?.response?.data?.detail || 'Signing failed');
    } finally { setSigning(false); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 p-4 bg-violet-50 border border-violet-100 rounded-2xl">
        <PenLine className="h-5 w-5 text-violet-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-violet-800">Digital Signature Required</p>
          <p className="text-xs text-violet-600 mt-0.5">
            Sign this payment contract using OTP verification. This is legally equivalent to a physical signature.
          </p>
        </div>
      </div>

      {step === 'send' ? (
        <button onClick={sendOTP} disabled={sending}
          className="flex items-center justify-center gap-2 w-full py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
          {sending ? 'Sending OTP...' : 'Send Signing OTP'}
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          {devOtp && (
            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-700 font-bold">
              <Info className="h-3.5 w-3.5 flex-shrink-0" />
              Dev Mode OTP: <span className="font-mono text-yellow-900 ml-1">{devOtp}</span>
            </div>
          )}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
              Enter 6-Digit OTP
            </label>
            <input
              type="text" maxLength={6} value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="• • • • • •"
              className="w-full px-4 py-3 text-center text-xl font-bold tracking-[0.5em] border border-slate-200 rounded-xl outline-none focus:border-violet-400 transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setStep('send'); setOtp(''); setDevOtp(null); }}
              className="flex-1 py-2.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
              ← Resend OTP
            </button>
            <button onClick={sign} disabled={signing || otp.length !== 6}
              className="flex-1 py-2.5 text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer">
              {signing ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4" />}
              {signing ? 'Signing...' : 'Sign Contract'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LogisticPaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.id ? String(params.id) : '';

  const [data, setData] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: d } = await backendApi.get(`/payment/detail/${paymentId}`);
      setData(d);
    } catch (e: any) {
      toast.error('Error', e?.response?.data?.detail || 'Failed to load payment');
    } finally { setLoading(false); }
  }, [paymentId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center justify-center py-24 text-slate-400">
      <AlertCircle className="h-10 w-10 mb-3 opacity-30" />
      <p className="font-bold text-sm">Payment not found</p>
    </div>
  );

  const status = data.status;
  const needsSign = (status === 'contract_generated' || status === 'pump_signed') && !data.logistic_signed;
  const waitingPumpSign = status === 'logistic_signed';
  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
        <button onClick={() => router.push('/logistic/payments')}
          className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 cursor-pointer transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 border border-violet-200 text-violet-600 flex-shrink-0">
            <Banknote className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-extrabold text-slate-900">
              PAY-{data.id} · {data.pump?.name}
            </h1>
            <p className="text-xs text-slate-400">₹{data.amount.toLocaleString('en-IN')} payment request</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold ${STATUS_COLORS[status]}`}>
            {STATUS_LABELS[status]}
          </span>
          <button onClick={load} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 cursor-pointer">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Timeline */}
      {!isRejected && (
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-4">Payment Progress</p>
          <Timeline status={status} />
        </div>
      )}

      {/* Rejected / Approved banners */}
      {isRejected && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-800">Payment Rejected</p>
            <p className="text-xs text-red-600 mt-0.5">{data.remarks || 'No reason provided'}</p>
          </div>
        </div>
      )}
      {isApproved && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-emerald-800">Payment Approved & Credit Updated!</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              ₹{data.amount.toLocaleString('en-IN')} processed.
              {data.reviewed_at && ` Approved on ${new Date(data.reviewed_at).toLocaleDateString('en-IN')}.`}
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Left — Details + Actions */}
        <div className="flex flex-col gap-4">

          {/* Payment Info */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Payment Details</p>
            <div className="flex flex-col gap-2 text-xs">
              {[
                { label: 'Amount', value: `₹${data.amount.toLocaleString('en-IN')}` },
                { label: 'Pump', value: data.pump?.name || '—' },
                { label: 'UTR / Ref', value: data.transaction_reference || '—' },
                { label: 'Submitted', value: data.requested_at ? new Date(data.requested_at).toLocaleDateString('en-IN') : '—' },
                { label: 'Remarks', value: data.remarks || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400 font-semibold">{label}</span>
                  <span className="font-bold text-slate-800 text-right max-w-[60%] truncate">{value}</span>
                </div>
              ))}
              {data.screenshot_url && (
                <a href={data.screenshot_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-violet-600 hover:underline mt-1">
                  <ExternalLink className="h-3.5 w-3.5" /> View Screenshot
                </a>
              )}
            </div>
          </div>

          {/* Logistic Form Data */}
          {data.logistic_form_data && Object.keys(data.logistic_form_data).length > 0 && (
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Your Submitted Info</p>
              <div className="flex flex-col gap-2 text-xs">
                {Object.entries(data.logistic_form_data).map(([key, val]) => val ? (
                  <div key={key} className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-400 font-semibold capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-bold text-slate-800">{String(val)}</span>
                  </div>
                ) : null)}
              </div>
            </div>
          )}

          {/* Action: Waiting for Contract */}
          {status === 'pending' && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
              <Clock className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-800">Waiting for Pump Owner</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Pump owner will review your payment and create a contract. You'll need to sign it next.
                </p>
              </div>
            </div>
          )}

          {/* Action: Sign Contract */}
          {needsSign && (
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Action Required</p>
              <OTPSignSection paymentId={data.id} onSuccess={load} />
            </div>
          )}

          {/* Waiting for pump owner to sign */}
          {waitingPumpSign && (
            <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
              <Clock className="h-5 w-5 text-indigo-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-indigo-800">Waiting for Pump Owner</p>
                <p className="text-xs text-indigo-600 mt-0.5">
                  You have signed. Pump owner needs to countersign to approve payment.
                </p>
              </div>
            </div>
          )}

          {/* Signature Status */}
          {data.contract_terms && (
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Signature Status</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Pump Owner', signed: data.pump_owner_signed, at: data.pump_owner_signed_at },
                  { label: 'You (Logistic Partner)', signed: data.logistic_signed, at: data.logistic_signed_at },
                ].map(({ label, signed, at }) => (
                  <div key={label} className={`flex items-center justify-between p-3 rounded-xl border
                    ${signed ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-2">
                      {signed
                        ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        : <Clock className="h-4 w-4 text-slate-300" />}
                      <p className="text-xs font-bold text-slate-700">{label}</p>
                    </div>
                    <p className={`text-[10px] font-bold ${signed ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {signed ? (at ? new Date(at).toLocaleDateString('en-IN') : 'Signed') : 'Pending'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — Contract Document */}
        <div className="flex flex-col gap-4">
          {data.contract_terms ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Contract Document</p>
              <ContractPreview data={data} />
            </div>
          ) : (
            <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-slate-400 gap-3">
              <FileText className="h-10 w-10 opacity-20" />
              <p className="text-sm font-bold">No contract yet</p>
              <p className="text-xs text-center">Pump owner will create a contract after reviewing your payment proof.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
