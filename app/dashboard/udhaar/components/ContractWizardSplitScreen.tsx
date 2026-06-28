'use client';

import React, { useState, useRef } from 'react';
import {
  X, Loader2, Plus, Trash2, FileText, Download, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from '@/components/feedback/Toast';
import { issueContract, amendContract, UdhaarContract, BillingFrequency, BillingCycle, BillBy } from '@/services/udhaar.service';
import { getLogoBase64ForPrint, getLogoUrl } from '@/services/settings.service';
// ─── Types ────────────────────────────────────────────────────────────────────

interface SlipBooklet { booklet_number: string; start_number: string; end_number: string; }
interface ItemLimit { item_name: string; qty_per_fill: string; qty_per_day: string; qty_per_cycle: string; }
interface Condition { vehicle_type: string; item_name: string; station_id: string; money_per_fill: string; money_per_day: string; money_per_cycle: string; qty_per_fill: string; qty_per_day: string; qty_per_cycle: string; max_slips: string; }
interface Recipient { type: string; value: string; }

interface FormState {
  station_name: string; org_name: string; address: string; gst_number: string;
  valid_to: string; security_deposit: string;
  slip_booklets: SlipBooklet[];
  total_credit_limit: string; max_spending_slips: string;
  money_limit_per_fill: string; money_limit_per_day: string; money_limit_per_cycle: string;
  item_limits: ItemLimit[];
  custom_conditions: Condition[];
  billing_frequency: BillingFrequency; bill_by: BillBy;
  billing_cycle: BillingCycle; billing_start_date: string; round_off: boolean;
  require_meter_photo: boolean; require_vehicle_photo: boolean;
  require_fueling_video: boolean; require_driver_verification: boolean;
  sop_recipients: Recipient[];
  late_payment_interest: string; deposit_utilization_days: string;
  suspension_period_days: string; invoice_dispute_days: string; custom_terms: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(v: string | number) {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (!n || isNaN(n)) return '₹0.00';
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2 });
}
function fmtDate(s: string) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}
function today() { return new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); }
function totalSlips(booklets: SlipBooklet[]) {
  return booklets.reduce((sum, b) => {
    if (b.start_number && b.end_number) return sum + Math.max(0, parseInt(b.end_number) - parseInt(b.start_number) + 1);
    return sum;
  }, 0);
}

// ─── Live Document Preview ────────────────────────────────────────────────────

function LiveDocument({ form, customerName, logoUrl }: { form: FormState; customerName: string; logoUrl: string | null; }) {
  const slipTotal = totalSlips(form.slip_booklets);

  return (
    <div className="bg-white text-slate-800 text-[11px] leading-relaxed p-8 min-h-full font-serif"
      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

      {/* Letterhead */}
      <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-slate-800">
        <div>
          <h2 className="text-lg font-black text-slate-900 font-sans">
            {form.org_name || 'Organisation Name'}
          </h2>
          {form.address && <p className="text-[10px] text-slate-500 mt-0.5">Address: {form.address}</p>}
          {form.gst_number && <p className="text-[10px] text-slate-500">GST: {form.gst_number}</p>}
        </div>
        <div className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {logoUrl ? (
            <img
              src={getLogoUrl(logoUrl) || ''}
              alt="Logo"
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                // Fallback if image fails
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="text-slate-300 text-xs font-black">LOGO</span>
          )}
        </div>
      </div>

      {/* Title */}
      <h1 className="text-center text-sm font-black uppercase tracking-widest text-slate-900 mb-1">
        Credit Fueling Agreement
      </h1>
      <p className="text-center text-[10px] text-slate-500 mb-6">Execution Date: {today()}</p>

      {/* Parties */}
      <p className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
        Parties to the Agreement
      </p>
      <p className="mb-2 text-[11px]">
        This Agreement is entered into on the Execution Date between:
      </p>
      <p className="mb-1">
        <span className="font-bold">The Dealer:</span> Operating under the trade name &quot;{form.station_name || form.org_name || 'Station Name'}&quot;, being the authorized fuel station operator managing credit facilities.
      </p>
      <p className="mb-4">
        <span className="font-bold">The Customer:</span> <span className="underline">{customerName}</span>, representing the fleet owner or corporate entity authorized to procure fuel on credit.
      </p>
      <p className="mb-6 text-slate-600 text-[10px]">
        <span className="font-bold">Operational Scope:</span> This agreement governs fueling activities across the Dealer's authorized service network, adhering to any site-specific configurations.
      </p>

      {/* Term and Security */}
      <p className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
        Term and Security
      </p>
      <p className="mb-1">
        <span className="font-bold">Effective Period:</span> This Agreement shall be valid from <span className="underline">{today()}</span> to <span className="underline">{form.valid_to ? fmtDate(form.valid_to) : '—'}</span>.
      </p>
      <p className="mb-6">
        <span className="font-bold">Security Deposit:</span> The Customer has provided a refundable security deposit of <span className="font-bold">{fmt(form.security_deposit)}</span> to mitigate financial risk for the Dealer.
      </p>

      {/* Covenant line */}
      <p className="font-bold text-[10px] mb-4 text-slate-700">
        NOW, THEREFORE, IN CONSIDERATION OF THE MUTUAL PROMISES AND COVENANTS SET FORTH HEREIN, BOTH PARTIES HEREBY AGREE TO BE BOUND BY THE FOLLOWING:
      </p>

      {/* 1. Global Credit */}
      <p className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
        1. Global Credit and Spend Limits
      </p>
      <ul className="mb-4 pl-4 space-y-1 list-none">
        <li><span className="font-bold">a. Total Credit Ceiling:</span> The maximum aggregate credit limit available under this contract is <span className="font-bold">{fmt(form.total_credit_limit)}</span>.</li>
        {form.max_spending_slips && <li><span className="font-bold">b. Maximum Spending Slips:</span> The Customer is limited to <span className="font-bold">{form.max_spending_slips}</span> spending slips.</li>}
        {(form.money_limit_per_fill || form.money_limit_per_day || form.money_limit_per_cycle) && (
          <li>
            <span className="font-bold">c. Money Limits:</span>{' '}
            {[
              form.money_limit_per_fill && `Per Fill: ${fmt(form.money_limit_per_fill)}`,
              form.money_limit_per_day && `Per Day: ${fmt(form.money_limit_per_day)}`,
              form.money_limit_per_cycle && `Per Cycle: ${fmt(form.money_limit_per_cycle)}`,
            ].filter(Boolean).join(' · ')}
          </li>
        )}
      </ul>

      {/* 2. Slip Booklets */}
      {slipTotal > 0 && (
        <>
          <p className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
            2. Slip Assignment
          </p>
          <ul className="mb-4 pl-4 space-y-1">
            <li><span className="font-bold">Total Slips Assigned:</span> {slipTotal} slips across {form.slip_booklets.length} booklet(s).</li>
            {form.slip_booklets.map((b, i) => b.booklet_number && (
              <li key={i}>Booklet {b.booklet_number}: #{b.start_number} – #{b.end_number}{b.start_number && b.end_number ? ` (${Math.max(0, parseInt(b.end_number) - parseInt(b.start_number) + 1)} slips)` : ''}</li>
            ))}
          </ul>
        </>
      )}

      {/* 3. Item Limits */}
      {form.item_limits.length > 0 && (
        <>
          <p className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
            3. Item-Specific Quantity Limits
          </p>
          <ul className="mb-4 pl-4 space-y-1">
            {form.item_limits.map((il, i) => (
              <li key={i}>
                <span className="font-bold capitalize">{il.item_name}:</span>{' '}
                {[
                  il.qty_per_fill && `${il.qty_per_fill}L/fill`,
                  il.qty_per_day && `${il.qty_per_day}L/day`,
                  il.qty_per_cycle && `${il.qty_per_cycle}L/cycle`,
                ].filter(Boolean).join(' · ')}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* 4. Custom Conditions */}
      {form.custom_conditions.length > 0 && (
        <>
          <p className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
            4. Custom Conditions
          </p>
          <ul className="mb-4 pl-4 space-y-2">
            {form.custom_conditions.map((c, i) => (
              <li key={i}>
                <span className="font-bold">Condition {i + 1}:</span> Applicable to {c.vehicle_type || 'all vehicles'} using {c.item_name || 'any fuel'}{c.station_id ? ` at Station #${c.station_id}` : ''}.
                {(c.money_per_fill || c.money_per_day) && (
                  <span> Money limits: {[c.money_per_fill && `${fmt(c.money_per_fill)}/fill`, c.money_per_day && `${fmt(c.money_per_day)}/day`].filter(Boolean).join(', ')}.</span>
                )}
                {(c.qty_per_fill || c.qty_per_day) && (
                  <span> Qty limits: {[c.qty_per_fill && `${c.qty_per_fill}L/fill`, c.qty_per_day && `${c.qty_per_day}L/day`].filter(Boolean).join(', ')}.</span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* 5. Billing */}
      <p className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
        5. Billing and Invoicing
      </p>
      <ul className="mb-4 pl-4 space-y-1">
        <li><span className="font-bold">Frequency:</span> {form.billing_frequency === 'one_time' ? 'One-time invoice' : `Recurring — ${form.billing_cycle}`}.</li>
        <li><span className="font-bold">Billed By:</span> {form.bill_by === 'customer' ? 'Consolidated per customer' : 'Individual per vehicle'}.</li>
        {form.billing_start_date && <li><span className="font-bold">Cycle Start:</span> {fmtDate(form.billing_start_date)}.</li>}
        {form.round_off && <li>Invoice amounts will be rounded off to the nearest unit.</li>}
      </ul>

      {/* 6. SOPs */}
      {(form.require_meter_photo || form.require_vehicle_photo || form.require_fueling_video || form.require_driver_verification) && (
        <>
          <p className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
            6. Operational SOPs
          </p>
          <p className="mb-1">The following evidence shall be mandatory at each fueling event:</p>
          <ul className="mb-4 pl-4 list-disc space-y-0.5">
            {form.require_meter_photo && <li>Meter reading photograph</li>}
            {form.require_vehicle_photo && <li>Vehicle photograph</li>}
            {form.require_fueling_video && <li>Fueling video recording</li>}
            {form.require_driver_verification && <li>Driver identity verification</li>}
          </ul>
        </>
      )}

      {/* 7. T&C */}
      {(form.late_payment_interest || form.deposit_utilization_days || form.suspension_period_days || form.invoice_dispute_days || form.custom_terms) && (
        <>
          <p className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
            7. Terms and Conditions
          </p>
          <ul className="mb-4 pl-4 space-y-1">
            {form.late_payment_interest && <li><span className="font-bold">Late Payment Interest:</span> {form.late_payment_interest}% per billing cycle on overdue amounts.</li>}
            {form.deposit_utilization_days && <li><span className="font-bold">Deposit Utilization:</span> Security deposit will be applied after {form.deposit_utilization_days} days of non-payment.</li>}
            {form.suspension_period_days && <li><span className="font-bold">Suspension Period:</span> {form.suspension_period_days} days suspension applicable in case of abuse or policy violation.</li>}
            {form.invoice_dispute_days && <li><span className="font-bold">Dispute Window:</span> Invoices may be disputed within {form.invoice_dispute_days} days of generation.</li>}
            {form.custom_terms && <li><span className="font-bold">Additional Terms:</span> {form.custom_terms}</li>}
          </ul>
        </>
      )}

      {/* Signature */}
      <div className="mt-8 pt-4 border-t border-slate-300 grid grid-cols-2 gap-8">
        <div>
          <div className="h-8 border-b border-slate-400 mb-1" />
          <p className="text-[10px] font-bold text-slate-600">Authorised Signatory — Dealer</p>
          <p className="text-[10px] text-slate-400">{form.org_name || 'Organisation'}</p>
        </div>
        <div>
          <div className="h-8 border-b border-slate-400 mb-1" />
          <p className="text-[10px] font-bold text-slate-600">Authorised Signatory — Customer</p>
          <p className="text-[10px] text-slate-400">{customerName}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Section Accordion ────────────────────────────────────────────────────────

function Section({ title, step, children }: { title: string; step: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden mb-3">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-left">
        <span className="text-xs font-extrabold text-slate-700">{step}. {title}</span>
        {open ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
      </button>
      {open && <div className="p-4 flex flex-col gap-3">{children}</div>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ContractWizardSplitScreen({
  pumpId, customerId, customerName, existingContract, onClose, onSuccess,
  logoUrl = null, prefillData = null, onSubmitOverride,
}: {
  pumpId: string;
  customerId: string;
  customerName: string;
  existingContract: UdhaarContract | null;
  onClose: () => void;
  onSuccess: () => void;
  logoUrl?: string | null;
  prefillData?: Record<string, any> | null;
  onSubmitOverride?: (payload: any) => Promise<void>;
}) {
  const isAmend = !!existingContract;
  const [loading, setLoading] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormState>({
    station_name: existingContract?.station_name || prefillData?.station_name || '',
    org_name: existingContract?.org_name || prefillData?.org_name || '',
    address: existingContract?.address || prefillData?.address || '',
    gst_number: existingContract?.gst_number || prefillData?.gst_number || '',
    valid_to: existingContract?.valid_to?.split('T')[0] || prefillData?.valid_to?.split('T')[0] || '',
    security_deposit: existingContract?.security_deposit?.toString() || prefillData?.security_deposit?.toString() || '',
    slip_booklets: (prefillData?.slip_booklets || []).map((b: any) => ({
      booklet_number: b.booklet_number || '', start_number: String(b.start_number ?? ''), end_number: String(b.end_number ?? ''),
    })),
    total_credit_limit: existingContract?.total_credit_limit?.toString() || prefillData?.total_credit_limit?.toString() || '',
    max_spending_slips: existingContract?.max_spending_slips?.toString() || prefillData?.max_spending_slips?.toString() || '',
    money_limit_per_fill: existingContract?.money_limit_per_fill?.toString() || prefillData?.money_limit_per_fill?.toString() || '',
    money_limit_per_day: existingContract?.money_limit_per_day?.toString() || prefillData?.money_limit_per_day?.toString() || '',
    money_limit_per_cycle: existingContract?.money_limit_per_cycle?.toString() || prefillData?.money_limit_per_cycle?.toString() || '',
    item_limits: (prefillData?.item_limits || []).map((i: any) => ({
      item_name: i.item_name || 'petrol', qty_per_fill: String(i.qty_per_fill ?? ''), qty_per_day: String(i.qty_per_day ?? ''), qty_per_cycle: String(i.qty_per_cycle ?? ''),
    })),
    custom_conditions: (prefillData?.custom_conditions || []).map((c: any) => ({
      vehicle_type: c.vehicle_type || '', item_name: c.item_name || '', station_id: String(c.station_id ?? ''),
      money_per_fill: String(c.money_per_fill ?? ''), money_per_day: String(c.money_per_day ?? ''), money_per_cycle: String(c.money_per_cycle ?? ''),
      qty_per_fill: String(c.qty_per_fill ?? ''), qty_per_day: String(c.qty_per_day ?? ''), qty_per_cycle: String(c.qty_per_cycle ?? ''), max_slips: String(c.max_slips ?? ''),
    })),
    billing_frequency: existingContract?.billing_frequency || prefillData?.billing_frequency || 'recurring',
    bill_by: existingContract?.bill_by || prefillData?.bill_by || 'customer',
    billing_cycle: existingContract?.billing_cycle || prefillData?.billing_cycle || 'monthly',
    billing_start_date: existingContract?.billing_start_date?.split('T')[0] || prefillData?.billing_start_date?.split('T')[0] || '',
    round_off: existingContract?.round_off ?? prefillData?.round_off ?? false,
    require_meter_photo: existingContract?.require_meter_photo ?? prefillData?.require_meter_photo ?? false,
    require_vehicle_photo: existingContract?.require_vehicle_photo ?? prefillData?.require_vehicle_photo ?? false,
    require_fueling_video: existingContract?.require_fueling_video ?? prefillData?.require_fueling_video ?? false,
    require_driver_verification: existingContract?.require_driver_verification ?? prefillData?.require_driver_verification ?? false,
    sop_recipients: existingContract?.sop_recipients || prefillData?.sop_recipients || [],
    late_payment_interest: existingContract?.late_payment_interest?.toString() || prefillData?.late_payment_interest?.toString() || '',
    deposit_utilization_days: existingContract?.deposit_utilization_days?.toString() || prefillData?.deposit_utilization_days?.toString() || '',
    suspension_period_days: existingContract?.suspension_period_days?.toString() || prefillData?.suspension_period_days?.toString() || '',
    invoice_dispute_days: existingContract?.invoice_dispute_days?.toString() || prefillData?.invoice_dispute_days?.toString() || '',
    custom_terms: existingContract?.custom_terms || prefillData?.custom_terms || '',
  });

  const set = (k: keyof FormState, v: any) => setForm(f => ({ ...f, [k]: v }));

  // Slip booklet helpers
  const addSlip = () => set('slip_booklets', [...form.slip_booklets, { booklet_number: '', start_number: '', end_number: '' }]);
  const removeSlip = (i: number) => set('slip_booklets', form.slip_booklets.filter((_, idx) => idx !== i));
  const updateSlip = (i: number, k: keyof SlipBooklet, v: string) => {
    const u = [...form.slip_booklets]; u[i] = { ...u[i], [k]: v }; set('slip_booklets', u);
  };

  // Item limit helpers
  const addItem = () => set('item_limits', [...form.item_limits, { item_name: 'petrol', qty_per_fill: '', qty_per_day: '', qty_per_cycle: '' }]);
  const removeItem = (i: number) => set('item_limits', form.item_limits.filter((_, idx) => idx !== i));
  const updateItem = (i: number, k: keyof ItemLimit, v: string) => {
    const u = [...form.item_limits]; u[i] = { ...u[i], [k]: v }; set('item_limits', u);
  };

  // Condition helpers
  const addCond = () => set('custom_conditions', [...form.custom_conditions, { vehicle_type: 'HMV', item_name: 'diesel', station_id: '', money_per_fill: '', money_per_day: '', money_per_cycle: '', qty_per_fill: '', qty_per_day: '', qty_per_cycle: '', max_slips: '' }]);
  const removeCond = (i: number) => set('custom_conditions', form.custom_conditions.filter((_, idx) => idx !== i));
  const updateCond = (i: number, k: keyof Condition, v: string) => {
    const u = [...form.custom_conditions]; u[i] = { ...u[i], [k]: v }; set('custom_conditions', u);
  };

  // Recipient helpers
  const addRecipient = () => set('sop_recipients', [...form.sop_recipients, { type: 'email', value: '' }]);
  const removeRecipient = (i: number) => set('sop_recipients', form.sop_recipients.filter((_, idx) => idx !== i));
  const updateRecipient = (i: number, k: keyof Recipient, v: string) => {
    const u = [...form.sop_recipients]; u[i] = { ...u[i], [k]: v }; set('sop_recipients', u);
  };

  // Download as HTML print
  // ─── Professional Print Handler ───────────────────────────────────────────────

  const handlePrint = async () => {
    // Load logo as base64 BEFORE generating HTML
    const logoBase64 = await getLogoBase64ForPrint(logoUrl);
    const logoHtml = logoBase64
      ? `<div style="width:56px;height:56px;border-radius:8px;border:1px solid #e2e8f0;overflow:hidden;display:flex;align-items:center;justify-content:center;">
        <img src="${logoBase64}" style="width:100%;height:100%;object-fit:contain;padding:4px;" />
       </div>`
      : `<div class="logo-box">
        <svg viewBox="0 0 24 24" fill="#f97316" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#f97316" stroke-width="2" fill="none" stroke-linecap="round"/>
        </svg>
       </div>`;



    const today = new Date().toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    const fmtNum = (v: string | number) => {
      const n = typeof v === 'string' ? parseFloat(v) : v;
      if (!n || isNaN(n)) return '₹0.00';
      return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    };

    const fmtDateStr = (s: string) => {
      if (!s) return '—';
      return new Date(s).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    };

    const slipTotal = form.slip_booklets.reduce((sum, b) => {
      if (b.start_number && b.end_number)
        return sum + Math.max(0, parseInt(b.end_number) - parseInt(b.start_number) + 1);
      return sum;
    }, 0);

    // ── Build sections HTML ──────────────────────────────────────────────────────

    const slipSection = slipTotal > 0 ? `
    <div class="section">
      <div class="section-title">2. Slip Assignment</div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Booklet #</th>
            <th>Start No.</th>
            <th>End No.</th>
            <th>Total Slips</th>
          </tr>
        </thead>
        <tbody>
          ${form.slip_booklets.filter(b => b.booklet_number).map(b => `
            <tr>
              <td><strong>${b.booklet_number}</strong></td>
              <td>${b.start_number}</td>
              <td>${b.end_number}</td>
              <td><strong>${b.start_number && b.end_number
        ? Math.max(0, parseInt(b.end_number) - parseInt(b.start_number) + 1)
        : '—'
      }</strong></td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="3"><strong>Total Slips Assigned</strong></td>
            <td><strong>${slipTotal}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  ` : '';

    const itemLimitsSection = form.item_limits.length > 0 ? `
    <div class="section">
      <div class="section-title">3. Item-Specific Quantity Limits</div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Fuel Item</th>
            <th>Per Fill (L)</th>
            <th>Per Day (L)</th>
            <th>Per Cycle (L)</th>
          </tr>
        </thead>
        <tbody>
          ${form.item_limits.map(il => `
            <tr>
              <td class="capitalize"><strong>${il.item_name}</strong></td>
              <td>${il.qty_per_fill || '—'}</td>
              <td>${il.qty_per_day || '—'}</td>
              <td>${il.qty_per_cycle || '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  ` : '';

    const conditionsSection = form.custom_conditions.length > 0 ? `
    <div class="section">
      <div class="section-title">4. Custom Condition Cards</div>
      ${form.custom_conditions.map((c, i) => `
        <div class="condition-card">
          <div class="condition-header">Condition ${i + 1}: ${c.vehicle_type || 'All Vehicles'} · ${c.item_name ? c.item_name.charAt(0).toUpperCase() + c.item_name.slice(1) : 'All Fuels'}${c.station_id ? ` · Station #${c.station_id}` : ''}</div>
          <div class="condition-grid">
            ${c.money_per_fill ? `<div class="cond-item"><span class="cond-label">₹ Per Fill</span><span class="cond-value">${fmtNum(c.money_per_fill)}</span></div>` : ''}
            ${c.money_per_day ? `<div class="cond-item"><span class="cond-label">₹ Per Day</span><span class="cond-value">${fmtNum(c.money_per_day)}</span></div>` : ''}
            ${c.money_per_cycle ? `<div class="cond-item"><span class="cond-label">₹ Per Cycle</span><span class="cond-value">${fmtNum(c.money_per_cycle)}</span></div>` : ''}
            ${c.qty_per_fill ? `<div class="cond-item"><span class="cond-label">Qty/Fill</span><span class="cond-value">${c.qty_per_fill} L</span></div>` : ''}
            ${c.qty_per_day ? `<div class="cond-item"><span class="cond-label">Qty/Day</span><span class="cond-value">${c.qty_per_day} L</span></div>` : ''}
            ${c.max_slips ? `<div class="cond-item"><span class="cond-label">Max Slips</span><span class="cond-value">${c.max_slips}</span></div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  ` : '';

    const sopSection = (form.require_meter_photo || form.require_vehicle_photo || form.require_fueling_video || form.require_driver_verification) ? `
    <div class="section">
      <div class="section-title">6. Operational SOPs & Anti-Fraud Requirements</div>
      <p class="section-para">The following evidence shall be mandatorily captured at each fueling event:</p>
      <div class="sop-grid">
        ${form.require_meter_photo ? `<div class="sop-item">✓ Meter Reading Photograph</div>` : ''}
        ${form.require_vehicle_photo ? `<div class="sop-item">✓ Vehicle Photograph</div>` : ''}
        ${form.require_fueling_video ? `<div class="sop-item">✓ Fueling Video Recording</div>` : ''}
        ${form.require_driver_verification ? `<div class="sop-item">✓ Driver Identity Verification</div>` : ''}
      </div>
      ${form.sop_recipients.filter(r => r.value).length > 0 ? `
        <p class="section-para" style="margin-top:8px">Evidence shall be dispatched to:</p>
        <ul class="clause-list">
          ${form.sop_recipients.filter(r => r.value).map(r => `<li>${r.type.toUpperCase()}: ${r.value}</li>`).join('')}
        </ul>
      ` : ''}
    </div>
  ` : '';

    const tcSection = (form.late_payment_interest || form.deposit_utilization_days || form.suspension_period_days || form.invoice_dispute_days || form.custom_terms) ? `
    <div class="section">
      <div class="section-title">7. Terms & Conditions</div>
      <ul class="clause-list">
        ${form.late_payment_interest ? `<li><strong>Late Payment Interest:</strong> ${form.late_payment_interest}% per billing cycle shall be levied on all overdue invoice amounts.</li>` : ''}
        ${form.deposit_utilization_days ? `<li><strong>Security Deposit Utilization:</strong> The security deposit shall be applied automatically after <strong>${form.deposit_utilization_days} days</strong> of non-payment.</li>` : ''}
        ${form.suspension_period_days ? `<li><strong>Suspension Period:</strong> A suspension of <strong>${form.suspension_period_days} days</strong> shall be enforced in the event of verbal or physical abuse or policy violation.</li>` : ''}
        ${form.invoice_dispute_days ? `<li><strong>Invoice Dispute Window:</strong> Disputes must be raised within <strong>${form.invoice_dispute_days} days</strong> of invoice generation.</li>` : ''}
        ${form.custom_terms ? `<li><strong>Additional Terms:</strong> ${form.custom_terms}</li>` : ''}
      </ul>
    </div>
  ` : '';

    // ── Full HTML Document ───────────────────────────────────────────────────────

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Credit Fueling Agreement — ${customerName}</title>
      <style>
        /* ── Reset ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Page Setup ── */
        @page {
          size: A4;
          margin: 18mm 20mm 22mm 20mm;
        }

        body {
          font-family: 'Times New Roman', Times, Georgia, serif;
          font-size: 11pt;
          line-height: 1.65;
          color: #0f172a;
          background: #fff;
        }

        /* ── Letterhead ── */
        .letterhead {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 14px;
          border-bottom: 3px solid #0f172a;
          margin-bottom: 20px;
        }

        .letterhead-left {}

        .org-name {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 18pt;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.5px;
          line-height: 1.1;
        }

        .org-detail {
          font-size: 9pt;
          color: #475569;
          margin-top: 4px;
          line-height: 1.5;
        }

        .org-detail span {
          display: block;
        }

        .logo-box {
          width: 56px;
          height: 56px;
          background: #0f172a;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .logo-box svg {
          width: 28px;
          height: 28px;
          fill: #f97316;
        }

        /* ── Document Title ── */
        .doc-title-block {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 1px solid #e2e8f0;
        }

        .doc-title {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 14pt;
          font-weight: 900;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #0f172a;
        }

        .doc-subtitle {
          font-size: 9pt;
          color: #64748b;
          margin-top: 4px;
        }

        .ref-number {
          display: inline-block;
          margin-top: 6px;
          font-size: 8pt;
          font-family: 'Courier New', monospace;
          color: #94a3b8;
          letter-spacing: 1px;
        }

        /* ── Info Strip ── */
        .info-strip {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          margin-bottom: 20px;
          overflow: hidden;
        }

        .info-cell {
          padding: 10px 14px;
          border-right: 1px solid #e2e8f0;
        }

        .info-cell:last-child { border-right: none; }

        .info-label {
          font-size: 7.5pt;
          font-family: Arial, sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #94a3b8;
          margin-bottom: 3px;
        }

        .info-value {
          font-size: 10pt;
          font-weight: 700;
          color: #0f172a;
        }

        /* ── Parties Block ── */
        .parties-block {
          background: #f8fafc;
          border-left: 4px solid #f97316;
          padding: 14px 16px;
          border-radius: 0 6px 6px 0;
          margin-bottom: 20px;
        }

        .parties-block p {
          margin-bottom: 8px;
          font-size: 10.5pt;
        }

        .parties-block p:last-child { margin-bottom: 0; }

        .party-label {
          font-family: Arial, sans-serif;
          font-weight: 800;
          color: #0f172a;
        }

        .party-name {
          font-weight: 700;
          text-decoration: underline;
          color: #0f172a;
        }

        /* ── Covenant Line ── */
        .covenant {
          font-size: 8.5pt;
          font-weight: 700;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          color: #475569;
          padding: 10px 0;
          border-top: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 20px;
        }

        /* ── Section ── */
        .section {
          margin-bottom: 20px;
          page-break-inside: avoid;
        }

        .section-title {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 9.5pt;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #0f172a;
          padding: 6px 10px;
          background: #f1f5f9;
          border-left: 3px solid #f97316;
          margin-bottom: 10px;
          border-radius: 0 4px 4px 0;
        }

        .section-para {
          font-size: 10.5pt;
          color: #1e293b;
          margin-bottom: 8px;
        }

        /* ── Limits Grid ── */
        .limits-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: #e2e8f0;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .limit-cell {
          background: #fff;
          padding: 10px 12px;
        }

        .limit-label {
          font-size: 7.5pt;
          font-family: Arial, sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #94a3b8;
          margin-bottom: 3px;
        }

        .limit-value {
          font-size: 11pt;
          font-weight: 800;
          color: #0f172a;
          font-family: Arial, sans-serif;
        }

        .limit-value.highlight {
          color: #f97316;
          font-size: 13pt;
        }

        /* ── Data Table ── */
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10pt;
        }

        .data-table th {
          background: #f1f5f9;
          font-family: Arial, sans-serif;
          font-size: 8pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
          padding: 8px 10px;
          text-align: left;
          border-bottom: 2px solid #e2e8f0;
        }

        .data-table td {
          padding: 8px 10px;
          border-bottom: 1px solid #f1f5f9;
          color: #1e293b;
        }

        .data-table .total-row td {
          background: #fff7ed;
          border-top: 2px solid #fed7aa;
          font-size: 10.5pt;
          color: #ea580c;
        }

        .capitalize { text-transform: capitalize; }

        /* ── Condition Card ── */
        .condition-card {
          border: 1px solid #fed7aa;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .condition-header {
          background: #fff7ed;
          padding: 8px 12px;
          font-family: Arial, sans-serif;
          font-size: 9pt;
          font-weight: 800;
          color: #c2410c;
          border-bottom: 1px solid #fed7aa;
        }

        .condition-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0;
          background: #fff;
        }

        .cond-item {
          flex: 1;
          min-width: 120px;
          padding: 8px 12px;
          border-right: 1px solid #fef3c7;
          border-bottom: 1px solid #fef3c7;
        }

        .cond-label {
          display: block;
          font-size: 7.5pt;
          font-family: Arial, sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          color: #94a3b8;
          margin-bottom: 2px;
        }

        .cond-value {
          font-size: 10.5pt;
          font-weight: 700;
          color: #0f172a;
        }

        /* ── Billing Info ── */
        .billing-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: #e2e8f0;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          overflow: hidden;
        }

        .billing-cell {
          background: #fff;
          padding: 10px 14px;
        }

        .billing-label {
          font-size: 7.5pt;
          font-family: Arial, sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #94a3b8;
          margin-bottom: 3px;
        }

        .billing-value {
          font-size: 10.5pt;
          font-weight: 700;
          color: #0f172a;
          text-transform: capitalize;
        }

        /* ── SOP Grid ── */
        .sop-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-top: 6px;
        }

        .sop-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 10px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 5px;
          font-size: 9.5pt;
          font-family: Arial, sans-serif;
          font-weight: 600;
          color: #166534;
        }

        /* ── Clause List ── */
        .clause-list {
          padding-left: 18px;
        }

        .clause-list li {
          font-size: 10.5pt;
          color: #1e293b;
          margin-bottom: 6px;
          line-height: 1.6;
        }

        /* ── Signature Block ── */
        .signature-section {
          margin-top: 36px;
          page-break-inside: avoid;
        }

        .signature-title {
          font-family: Arial, sans-serif;
          font-size: 8.5pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #94a3b8;
          text-align: center;
          margin-bottom: 24px;
        }

        .signature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }

        .sig-block {
          text-align: center;
        }

        .sig-line {
          height: 48px;
          border-bottom: 2px solid #0f172a;
          margin-bottom: 8px;
        }

        .sig-name {
          font-family: Arial, sans-serif;
          font-size: 9pt;
          font-weight: 800;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sig-role {
          font-size: 8.5pt;
          color: #64748b;
          margin-top: 2px;
        }

        .sig-date {
          font-size: 8pt;
          color: #94a3b8;
          margin-top: 4px;
          font-family: 'Courier New', monospace;
        }

        /* ── Footer ── */
        .doc-footer {
          margin-top: 28px;
          padding-top: 10px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-text {
          font-size: 7.5pt;
          color: #94a3b8;
          font-family: Arial, sans-serif;
        }

        .footer-brand {
          font-size: 8pt;
          font-family: Arial, sans-serif;
          font-weight: 800;
          color: #cbd5e1;
          letter-spacing: 1px;
        }

        /* ── Print specific ── */
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>

      <!-- LETTERHEAD -->
      <div class="letterhead">
        <div class="letterhead-left">
          <div class="org-name">${form.org_name || 'Organisation Name'}</div>
          <div class="org-detail">
            ${form.address ? `<span>📍 ${form.address}</span>` : ''}
            ${form.gst_number ? `<span>GST: ${form.gst_number}</span>` : ''}
            ${form.station_name ? `<span>Station: ${form.station_name}</span>` : ''}
          </div>
        </div>
        <div class="logo-box">
        <Image
         src="public\logo.svg"
         alt="FuelFlux"
         width={36}
         height={36}
        />
        </div>
      </div>

      <!-- TITLE BLOCK -->
      <div class="doc-title-block">
        <div class="doc-title">Credit Fueling Agreement</div>
        <div class="doc-subtitle">Governed under the terms of Fuelflux Credit Management Platform</div>
        <div class="ref-number">REF: CFA-${Date.now().toString(36).toUpperCase()} · ${today}</div>
      </div>

      <!-- INFO STRIP -->
      <div class="info-strip">
        <div class="info-cell">
          <div class="info-label">Execution Date</div>
          <div class="info-value">${today}</div>
        </div>
        <div class="info-cell">
          <div class="info-label">Valid Until</div>
          <div class="info-value">${form.valid_to ? fmtDateStr(form.valid_to) : '—'}</div>
        </div>
        <div class="info-cell">
          <div class="info-label">Security Deposit</div>
          <div class="info-value">${fmtNum(form.security_deposit)}</div>
        </div>
      </div>

      <!-- PARTIES -->
      <div class="parties-block">
        <p><span class="party-label">The Dealer:</span> Operating under the trade name <span class="party-name">"${form.station_name || form.org_name || 'Station Name'}"</span>, being the authorised fuel station operator managing credit facilities via the Fuelflux platform.</p>
        <p><span class="party-label">The Customer:</span> <span class="party-name">${customerName}</span>, representing the fleet owner or corporate entity authorised to procure fuel on credit.</p>
        <p style="font-size:9.5pt; color:#475569;"><strong>Operational Scope:</strong> This agreement governs fueling activities across the Dealer's authorised service network, adhering to any site-specific configurations and limit structures defined herein.</p>
      </div>

      <!-- COVENANT -->
      <div class="covenant">
        Now, Therefore, In Consideration of the Mutual Promises and Covenants Set Forth Herein, Both Parties Hereby Agree to be Bound by the Following:
      </div>

      <!-- SECTION 1: GLOBAL LIMITS -->
      <div class="section">
        <div class="section-title">1. Global Credit and Spend Limits</div>
        <div class="limits-grid">
          <div class="limit-cell">
            <div class="limit-label">Total Credit Ceiling</div>
            <div class="limit-value highlight">${fmtNum(form.total_credit_limit)}</div>
          </div>
          <div class="limit-cell">
            <div class="limit-label">Max Spending Slips</div>
            <div class="limit-value">${form.max_spending_slips || '—'}</div>
          </div>
          <div class="limit-cell">
            <div class="limit-label">Money Limit / Fill</div>
            <div class="limit-value">${form.money_limit_per_fill ? fmtNum(form.money_limit_per_fill) : '—'}</div>
          </div>
          <div class="limit-cell">
            <div class="limit-label">Money Limit / Day</div>
            <div class="limit-value">${form.money_limit_per_day ? fmtNum(form.money_limit_per_day) : '—'}</div>
          </div>
          <div class="limit-cell">
            <div class="limit-label">Money Limit / Cycle</div>
            <div class="limit-value">${form.money_limit_per_cycle ? fmtNum(form.money_limit_per_cycle) : '—'}</div>
          </div>
          <div class="limit-cell">
            <div class="limit-label">Round Off</div>
            <div class="limit-value">${form.round_off ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>

      <!-- SECTION 2: SLIPS -->
      ${slipSection}

      <!-- SECTION 3: ITEM LIMITS -->
      ${itemLimitsSection}

      <!-- SECTION 4: CONDITIONS -->
      ${conditionsSection}

      <!-- SECTION 5: BILLING -->
      <div class="section">
        <div class="section-title">5. Billing & Invoicing</div>
        <div class="billing-grid">
          <div class="billing-cell">
            <div class="billing-label">Billing Frequency</div>
            <div class="billing-value">${form.billing_frequency === 'one_time' ? 'One-Time Invoice' : `Recurring — ${form.billing_cycle}`}</div>
          </div>
          <div class="billing-cell">
            <div class="billing-label">Billed By</div>
            <div class="billing-value">By ${form.bill_by}</div>
          </div>
          ${form.billing_start_date ? `
          <div class="billing-cell">
            <div class="billing-label">Cycle Start Date</div>
            <div class="billing-value">${fmtDateStr(form.billing_start_date)}</div>
          </div>
          ` : ''}
          <div class="billing-cell">
            <div class="billing-label">Invoice Round-Off</div>
            <div class="billing-value">${form.round_off ? 'Enabled (up to 1 unit)' : 'Disabled'}</div>
          </div>
        </div>
      </div>

      <!-- SECTION 6: SOPs -->
      ${sopSection}

      <!-- SECTION 7: T&C -->
      ${tcSection}

      <!-- SIGNATURE BLOCK -->
      <div class="signature-section">
        <div class="signature-title">— Signatures & Acknowledgement —</div>
        <div class="signature-grid">
          <div class="sig-block">
            <div class="sig-line"></div>
            <div class="sig-name">${form.org_name || 'Authorised Signatory'}</div>
            <div class="sig-role">Dealer / Fuel Station Operator</div>
            <div class="sig-date">Date: ___________________</div>
          </div>
          <div class="sig-block">
            <div class="sig-line"></div>
            <div class="sig-name">${customerName}</div>
            <div class="sig-role">Customer / Fleet Authorised Representative</div>
            <div class="sig-date">Date: ___________________</div>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="doc-footer">
        <div class="footer-text">This document is system-generated via Fuelflux Credit Management Platform. Subject to applicable laws.</div>
        <div class="footer-brand">FUELFLUX</div>
      </div>

    </body>
    </html>
  `;

    const win = window.open('', '_blank');
    if (!win) {
      toast.error('Blocked', 'Please allow popups for this site to print');
      return;
    }
    win.document.write(html);
    win.document.close();
    win.onload = () => {
      win.focus();
      win.print();
    };
  };

  const handleSubmit = async () => {
    if (!form.valid_to || !form.total_credit_limit) {
      toast.error('Required', 'Valid To date and Credit Limit are required');
      return;
    }
    setLoading(true);
    const payload = {
      customer_id: customerId,
      station_name: form.station_name || undefined,
      org_name: form.org_name || undefined,
      address: form.address || undefined,
      gst_number: form.gst_number || undefined,
      valid_to: new Date(form.valid_to).toISOString(),
      security_deposit: parseFloat(form.security_deposit) || 0,
      slip_booklets: form.slip_booklets.filter(b => b.booklet_number && b.start_number && b.end_number).map(b => ({
        booklet_number: b.booklet_number,
        start_number: parseInt(b.start_number),
        end_number: parseInt(b.end_number),
      })),
      total_credit_limit: parseFloat(form.total_credit_limit) || 0,
      max_spending_slips: form.max_spending_slips ? parseInt(form.max_spending_slips) : undefined,
      money_limit_per_fill: form.money_limit_per_fill ? parseFloat(form.money_limit_per_fill) : undefined,
      money_limit_per_day: form.money_limit_per_day ? parseFloat(form.money_limit_per_day) : undefined,
      money_limit_per_cycle: form.money_limit_per_cycle ? parseFloat(form.money_limit_per_cycle) : undefined,
      item_limits: form.item_limits.filter(i => i.item_name).map(i => ({
        item_name: i.item_name,
        qty_per_fill: i.qty_per_fill ? parseFloat(i.qty_per_fill) : undefined,
        qty_per_day: i.qty_per_day ? parseFloat(i.qty_per_day) : undefined,
        qty_per_cycle: i.qty_per_cycle ? parseFloat(i.qty_per_cycle) : undefined,
      })),
      custom_conditions: form.custom_conditions.map(c => ({
        vehicle_type: c.vehicle_type || undefined,
        item_name: c.item_name || undefined,
        station_id: c.station_id || undefined,
        max_slips: c.max_slips ? parseInt(c.max_slips) : undefined,
        money_per_fill: c.money_per_fill ? parseFloat(c.money_per_fill) : undefined,
        money_per_day: c.money_per_day ? parseFloat(c.money_per_day) : undefined,
        money_per_cycle: c.money_per_cycle ? parseFloat(c.money_per_cycle) : undefined,
        qty_per_fill: c.qty_per_fill ? parseFloat(c.qty_per_fill) : undefined,
        qty_per_day: c.qty_per_day ? parseFloat(c.qty_per_day) : undefined,
        qty_per_cycle: c.qty_per_cycle ? parseFloat(c.qty_per_cycle) : undefined,
      })),
      billing_frequency: form.billing_frequency,
      bill_by: form.bill_by,
      billing_cycle: form.billing_frequency === 'recurring' ? form.billing_cycle : undefined,
      billing_start_date: form.billing_start_date ? new Date(form.billing_start_date).toISOString() : undefined,
      round_off: form.round_off,
      require_meter_photo: form.require_meter_photo,
      require_vehicle_photo: form.require_vehicle_photo,
      require_fueling_video: form.require_fueling_video,
      require_driver_verification: form.require_driver_verification,
      sop_recipients: form.sop_recipients.filter(r => r.value),
      late_payment_interest: form.late_payment_interest ? parseFloat(form.late_payment_interest) : undefined,
      deposit_utilization_days: form.deposit_utilization_days ? parseInt(form.deposit_utilization_days) : undefined,
      suspension_period_days: form.suspension_period_days ? parseInt(form.suspension_period_days) : undefined,
      invoice_dispute_days: form.invoice_dispute_days ? parseInt(form.invoice_dispute_days) : undefined,
      custom_terms: form.custom_terms || undefined,
    };
    try {
      if (onSubmitOverride) {
        await onSubmitOverride(payload);
        toast.success('Saved', 'Proceed to the next step');
      } else if (isAmend) {
        await amendContract(pumpId, existingContract!.id, payload);
        toast.success('Contract Amended', 'New version created');
      } else {
        await issueContract(pumpId, payload);
        toast.success('Contract Issued', 'Customer contract activated');
      }
      onSuccess(); onClose();
    } catch (e: any) {
      toast.error('Failed', e?.response?.data?.detail || 'Contract operation failed');
    } finally { setLoading(false); }
    try {
      if (isAmend) {
        await amendContract(pumpId, existingContract!.id, payload);
        toast.success('Contract Amended', 'New version created');
      } else {
        await issueContract(pumpId, payload);
        toast.success('Contract Issued', 'Customer contract activated');
      }
      onSuccess(); onClose();
    } catch (e: any) {
      toast.error('Failed', e?.response?.data?.detail || 'Contract operation failed');
    } finally { setLoading(false); }
  };

  const inputCls = "w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors bg-white";
  const labelCls = "block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-3">
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col" style={{ height: '92vh' }}>

        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 border border-orange-200 text-primary">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">{isAmend ? 'Amend Contract' : 'Issue Contract'}</h2>
              <p className="text-[10px] text-slate-400">{customerName} — fill fields to see live document preview →</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 cursor-pointer transition-colors">
              <Download className="h-3.5 w-3.5" /> Download
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 cursor-pointer transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Split Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* LEFT — Form */}
          <div className="w-1/2 overflow-y-auto p-5 border-r border-slate-100">

            {/* 1. Letterhead */}
            <Section title="Letterhead" step="1">
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Station Name</label><input value={form.station_name} onChange={e => set('station_name', e.target.value)} placeholder="Sharma Fuel Station" className={inputCls} /></div>
                <div><label className={labelCls}>Organisation Name</label><input value={form.org_name} onChange={e => set('org_name', e.target.value)} placeholder="Sharma Enterprises" className={inputCls} /></div>
              </div>
              <div><label className={labelCls}>Address</label><textarea value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full address..." rows={2} className={`${inputCls} resize-none`} /></div>
              <div><label className={labelCls}>GST Number</label><input value={form.gst_number} onChange={e => set('gst_number', e.target.value)} placeholder="27AABCS1429B1ZB" className={inputCls} /></div>
            </Section>

            {/* 2. Validity */}
            <Section title="Validity & Deposit" step="2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Valid From</label>
                  <input value={new Date().toISOString().split('T')[0]} disabled className={`${inputCls} bg-slate-50 text-slate-400 cursor-not-allowed`} />
                </div>
                <div>
                  <label className={labelCls}>Valid Up To *</label>
                  <input type="date" value={form.valid_to} onChange={e => set('valid_to', e.target.value)} className={inputCls} />
                </div>
              </div>
              <div><label className={labelCls}>Security Deposit (₹)</label><input type="number" value={form.security_deposit} onChange={e => set('security_deposit', e.target.value)} placeholder="500000" className={inputCls} /></div>
            </Section>

            {/* 3. Slips */}
            <Section title="Slip Assignment" step="3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-400">Total slips auto-calculated from start/end</p>
                <button onClick={addSlip} className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer">
                  <Plus className="h-3 w-3" /> Add Booklet
                </button>
              </div>
              {form.slip_booklets.map((b, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div><label className={labelCls}>Booklet #</label><input value={b.booklet_number} onChange={e => updateSlip(i, 'booklet_number', e.target.value)} placeholder="B001" className={inputCls} /></div>
                  <div><label className={labelCls}>Start</label><input type="number" value={b.start_number} onChange={e => updateSlip(i, 'start_number', e.target.value)} placeholder="1" className={inputCls} /></div>
                  <div><label className={labelCls}>End</label><input type="number" value={b.end_number} onChange={e => updateSlip(i, 'end_number', e.target.value)} placeholder="100" className={inputCls} /></div>
                  <div className="flex flex-col justify-end gap-1">
                    <span className="text-[10px] font-extrabold text-primary bg-orange-50 border border-orange-100 px-2 py-1.5 rounded-xl text-center">
                      {b.start_number && b.end_number ? Math.max(0, parseInt(b.end_number) - parseInt(b.start_number) + 1) : '—'}
                    </span>
                    <button onClick={() => removeSlip(i)} className="p-1 hover:bg-red-50 text-red-400 rounded-lg cursor-pointer text-center"><Trash2 className="h-3.5 w-3.5 mx-auto" /></button>
                  </div>
                </div>
              ))}
              {form.slip_booklets.length === 0 && (
                <p className="text-[11px] text-slate-300 text-center py-4 border border-dashed border-slate-100 rounded-xl">No booklets added</p>
              )}
            </Section>

            {/* 4. Global Limits */}
            <Section title="Global Credit and Spend Limits" step="4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Total Credit Limit (₹) *</label><input type="number" value={form.total_credit_limit} onChange={e => set('total_credit_limit', e.target.value)} placeholder="1000000" className={inputCls} /></div>
                <div>
                  <label className={labelCls}>Max. Spending Slips</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => set('max_spending_slips', String(Math.max(0, parseInt(form.max_spending_slips || '0') - 1)))}
                      className="px-2.5 py-2 text-xs font-bold border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">—</button>
                    <input type="number" value={form.max_spending_slips} onChange={e => set('max_spending_slips', e.target.value)} className={`${inputCls} text-center`} />
                    <button onClick={() => set('max_spending_slips', String(parseInt(form.max_spending_slips || '0') + 1))}
                      className="px-2.5 py-2 text-xs font-bold border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">+</button>
                  </div>
                </div>
              </div>
              <div>
                <label className={labelCls}>Max Money Limits</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Per Fill', key: 'money_limit_per_fill' as keyof FormState },
                    { label: 'Per Day', key: 'money_limit_per_day' as keyof FormState },
                    { label: 'Per Cycle', key: 'money_limit_per_cycle' as keyof FormState },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <p className="text-[10px] text-slate-400 mb-1">{label}</p>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                        <input type="number" value={form[key] as string} onChange={e => set(key, e.target.value)} placeholder="0.00" className={`${inputCls} pl-6`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Item-specific */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelCls + ' mb-0'}>Items</label>
                  <button onClick={addItem} className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer"><Plus className="h-3 w-3" /></button>
                </div>
                {form.item_limits.length === 0
                  ? <div className="border border-dashed border-slate-200 rounded-xl px-3 py-2"><select className="w-full text-xs text-slate-400 bg-transparent outline-none cursor-pointer" disabled><option>Select an option</option></select></div>
                  : form.item_limits.map((il, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 mb-2 p-2 bg-slate-50 border border-slate-100 rounded-xl">
                      <div>
                        <p className="text-[10px] text-slate-400 mb-1">Item</p>
                        <select value={il.item_name} onChange={e => updateItem(i, 'item_name', e.target.value)} className={`${inputCls} cursor-pointer`}>
                          <option value="petrol">Petrol</option><option value="diesel">Diesel</option><option value="cng">CNG</option>
                        </select>
                      </div>
                      <div><p className="text-[10px] text-slate-400 mb-1">Qty/Fill</p><input type="number" value={il.qty_per_fill} onChange={e => updateItem(i, 'qty_per_fill', e.target.value)} placeholder="L" className={inputCls} /></div>
                      <div><p className="text-[10px] text-slate-400 mb-1">Qty/Day</p><input type="number" value={il.qty_per_day} onChange={e => updateItem(i, 'qty_per_day', e.target.value)} placeholder="L" className={inputCls} /></div>
                      <div className="flex flex-col">
                        <p className="text-[10px] text-slate-400 mb-1">Qty/Cycle</p>
                        <div className="flex gap-1">
                          <input type="number" value={il.qty_per_cycle} onChange={e => updateItem(i, 'qty_per_cycle', e.target.value)} placeholder="L" className={inputCls} />
                          <button onClick={() => removeItem(i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg cursor-pointer flex-shrink-0"><Trash2 className="h-3 w-3" /></button>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </Section>

            {/* 5. Custom Conditions */}
            <Section title="Custom Conditions" step="5">
              <button onClick={addCond} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-orange-50 text-primary border border-orange-100 rounded-xl hover:bg-orange-100 cursor-pointer w-fit">
                <Plus className="h-3.5 w-3.5" /> Add New Condition
              </button>
              {form.custom_conditions.map((c, i) => (
                <div key={i} className="p-3 bg-orange-50/40 border border-orange-100 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold text-orange-600 uppercase">Condition {i + 1}</span>
                    <button onClick={() => removeCond(i)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 className="h-3 w-3" /></button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div><label className={labelCls}>By Vehicle Type</label><input value={c.vehicle_type} onChange={e => updateCond(i, 'vehicle_type', e.target.value)} placeholder="HMV" className={inputCls} /></div>
                    <div><label className={labelCls}>Item</label>
                      <select value={c.item_name} onChange={e => updateCond(i, 'item_name', e.target.value)} className={`${inputCls} cursor-pointer`}>
                        <option value="diesel">Diesel</option><option value="petrol">Petrol</option><option value="cng">CNG</option>
                      </select>
                    </div>
                    <div><label className={labelCls}>Station ID</label><input type="number" value={c.station_id} onChange={e => updateCond(i, 'station_id', e.target.value)} placeholder={pumpId.toString()} className={inputCls} /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div><label className={labelCls}>₹/Fill</label><input type="number" value={c.money_per_fill} onChange={e => updateCond(i, 'money_per_fill', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>₹/Day</label><input type="number" value={c.money_per_day} onChange={e => updateCond(i, 'money_per_day', e.target.value)} className={inputCls} /></div>
                    <div><label className={labelCls}>Max Slips</label><input type="number" value={c.max_slips} onChange={e => updateCond(i, 'max_slips', e.target.value)} className={inputCls} /></div>
                  </div>
                </div>
              ))}
            </Section>

            {/* 6. Billing */}
            <Section title="Billing Settings" step="6">
              <div>
                <label className={labelCls}>Billing Frequency</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200/50">
                  {(['one_time', 'recurring'] as BillingFrequency[]).map(f => (
                    <button key={f} type="button" onClick={() => set('billing_frequency', f)}
                      className={`py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${form.billing_frequency === f ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                      {f === 'one_time' ? 'One Time' : 'Recurring'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Bill By</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200/50">
                  {(['vehicle', 'customer'] as BillBy[]).map(b => (
                    <button key={b} type="button" onClick={() => set('bill_by', b)}
                      className={`py-2 text-xs font-bold rounded-lg cursor-pointer capitalize transition-all ${form.bill_by === b ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                      By {b}
                    </button>
                  ))}
                </div>
              </div>
              {form.billing_frequency === 'recurring' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Cycle</label>
                    <select value={form.billing_cycle} onChange={e => set('billing_cycle', e.target.value as BillingCycle)} className={`${inputCls} cursor-pointer`}>
                      <option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div><label className={labelCls}>Start Date</label><input type="date" value={form.billing_start_date} onChange={e => set('billing_start_date', e.target.value)} className={inputCls} /></div>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer" onClick={() => set('round_off', !form.round_off)}>
                <div className={`w-9 h-5 rounded-full flex-shrink-0 transition-colors relative ${form.round_off ? 'bg-primary' : 'bg-slate-200'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.round_off ? 'left-4' : 'left-0.5'}`} />
                </div>
                <p className="text-xs font-bold text-slate-700">Round Off Amount</p>
              </div>
            </Section>

            {/* 7. SOPs */}
            <Section title="Operational SOPs" step="7">
              {[
                { key: 'require_meter_photo' as keyof FormState, label: 'Meter Reading Photo' },
                { key: 'require_vehicle_photo' as keyof FormState, label: 'Vehicle Photo' },
                { key: 'require_fueling_video' as keyof FormState, label: 'Fueling Video' },
                { key: 'require_driver_verification' as keyof FormState, label: 'Driver Verification' },
              ].map(({ key, label }) => (
                <div key={key} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form[key] ? 'bg-orange-50/50 border-orange-100' : 'bg-slate-50 border-slate-100'}`}
                  onClick={() => set(key, !form[key])}>
                  <div className={`w-9 h-5 rounded-full flex-shrink-0 transition-colors relative ${form[key] ? 'bg-primary' : 'bg-slate-200'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form[key] ? 'left-4' : 'left-0.5'}`} />
                  </div>
                  <p className="text-xs font-bold text-slate-700">{label}</p>
                </div>
              ))}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelCls + ' mb-0'}>Recipients</label>
                  <button onClick={addRecipient} className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer"><Plus className="h-3 w-3" /> Add</button>
                </div>
                {form.sop_recipients.map((r, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <select value={r.type} onChange={e => updateRecipient(i, 'type', e.target.value)} className="px-2 py-2 text-xs font-bold border border-slate-200 rounded-xl bg-white cursor-pointer w-20">
                      <option value="email">Email</option><option value="sms">SMS</option>
                    </select>
                    <input value={r.value} onChange={e => updateRecipient(i, 'value', e.target.value)} placeholder={r.type === 'email' ? 'email@co.com' : '9876543210'} className={`${inputCls} flex-1`} />
                    <button onClick={() => removeRecipient(i)} className="p-2 hover:bg-red-50 text-red-400 rounded-xl cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
            </Section>

            {/* 8. T&C */}
            <Section title="Terms & Conditions" step="8">
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Late Payment Interest (%)</label><input type="number" step="0.1" value={form.late_payment_interest} onChange={e => set('late_payment_interest', e.target.value)} placeholder="2.5" className={inputCls} /></div>
                <div><label className={labelCls}>Deposit Utilization (days)</label><input type="number" value={form.deposit_utilization_days} onChange={e => set('deposit_utilization_days', e.target.value)} placeholder="30" className={inputCls} /></div>
                <div><label className={labelCls}>Suspension Period (days)</label><input type="number" value={form.suspension_period_days} onChange={e => set('suspension_period_days', e.target.value)} placeholder="7" className={inputCls} /></div>
                <div><label className={labelCls}>Dispute Window (days)</label><input type="number" value={form.invoice_dispute_days} onChange={e => set('invoice_dispute_days', e.target.value)} placeholder="15" className={inputCls} /></div>
              </div>
              <div><label className={labelCls}>Custom Terms</label><textarea value={form.custom_terms} onChange={e => set('custom_terms', e.target.value)} rows={2} placeholder="Station-specific clauses..." className={`${inputCls} resize-none`} /></div>
            </Section>

            {/* Submit */}
            <div className="flex gap-3 mt-2 pb-2">
              <button onClick={onClose} className="flex-1 py-3 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">Cancel</button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 py-3 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isAmend ? '✓ Amend Contract' : '✓ Issue Contract'}
              </button>
            </div>
          </div>

          {/* RIGHT — Live Document Preview */}
          <div className="w-1/2 overflow-y-auto bg-slate-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Document Preview</p>
              <button onClick={handlePrint}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                <Download className="h-3 w-3" /> Download
              </button>
            </div>
            <div ref={docRef} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <LiveDocument form={form} customerName={customerName} logoUrl={logoUrl} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}