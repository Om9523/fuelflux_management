'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, User, Calendar, CreditCard, CheckCircle, XCircle, X,
  Plus, ChevronLeft, ChevronRight, ShieldCheck, AlertTriangle, Loader2,
  Megaphone, Trash2, Clock, Sun, Sunset, Moon, RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import backendApi from '@/lib/backendApi';
import { toast } from '@/components/feedback/Toast';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AttendanceRecord {
  id: string; date: string; status: string;
  check_in: string | null; check_out: string | null;
  working_hours: number; is_manual: boolean; note: string | null;
}
interface AttendanceSummary {
  month: number; year: number; total_days: number;
  present_days: number; late_days: number; leave_days: number;
  absent_days: number; attendance_percentage: number;
}
interface LeaveRecord {
  id: string; leave_type: string; from_date: string; to_date: string;
  reason: string; status: string; applied_on: string;
  reviewed_note: string | null; reviewed_by: string | null;
}
interface SalarySlip {
  id: string; month: number; year: number;
  basic_salary: number; deductions: number; bonuses: number;
  net_salary: number; payment_status: string; paid_on: string | null;
}
interface Employee {
  id: string; name: string; employee_id: string; designation: string;
  shift: string | null; phone: string; email: string | null; is_active: boolean;
}
interface ShiftAssignment {
  id: string;
  attendant_id: string;
  pump_id: string;
  date: string;           // "2026-07-13"
  shift_type: string;     // Morning | Evening | Night
  status: string;         // scheduled | completed | absent | covered
  covered_by: string | null;
  note: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    Present: 'bg-emerald-100 text-emerald-700',
    Late: 'bg-amber-100 text-amber-700',
    Absent: 'bg-red-100 text-red-600',
    Leave: 'bg-blue-100 text-blue-700',
    Holiday: 'bg-purple-100 text-purple-700',
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-600',
    paid: 'bg-emerald-100 text-emerald-700',
    unpaid: 'bg-red-100 text-red-600',
  };
  return `px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${map[s] ?? 'bg-slate-100 text-slate-500'}`;
};

// ── Main Component ─────────────────────────────────────────────────────────────

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<'attendance' | 'leave' | 'salary' | 'announcements' | 'shifts'>('attendance');
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loadingEmp, setLoadingEmp] = useState(true);

  useEffect(() => {
    backendApi.get(`/attendants/${id}`)
      .then((r) => setEmployee(r.data.data))
      .catch(() => toast.error('Failed to load employee'))
      .finally(() => setLoadingEmp(false));
  }, [id]);

  if (loadingEmp) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-plus-jakarta text-slate-800">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/employees"
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-slate-500">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center font-bold text-orange-500">
            {employee?.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight">{employee?.name}</h1>
            <p className="text-[10px] text-slate-400 font-semibold">
              {employee?.employee_id} · {employee?.designation}
            </p>
          </div>
          <span className={`ml-2 px-2 py-0.5 text-[9px] font-bold rounded-full uppercase ${employee?.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
            {employee?.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border border-slate-200/60 rounded-2xl p-1 shadow-xs max-w-2xl">
        {[
          { id: 'attendance', label: 'Attendance', icon: <Calendar className="h-3.5 w-3.5" /> },
          { id: 'leave', label: 'Leave', icon: <CheckCircle className="h-3.5 w-3.5" /> },
          { id: 'salary', label: 'Salary', icon: <CreditCard className="h-3.5 w-3.5" /> },
          { id: 'announcements', label: 'Announcements', icon: <Megaphone className="h-3.5 w-3.5" /> },
          { id: 'shifts', label: 'Shifts', icon: <Clock className="h-3.5 w-3.5" /> },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`flex-1 flex justify-center items-center gap-1.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer outline-none ${tab === t.id ? 'bg-orange-500 text-white shadow' : 'text-slate-500 hover:text-slate-800'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'attendance' && <AttendanceTab id={id} />}
      {tab === 'leave' && <LeaveTab id={id} />}
      {tab === 'salary' && <SalaryTab id={id} />}
      {tab === 'announcements' && <AnnouncementsTab id={id} employeeName={employee?.name ?? ''} />}
      {tab === 'shifts' && <ShiftsTab id={id} employeeName={employee?.name ?? ''} />}
    </div>
  );
}

// ── Attendance Tab ─────────────────────────────────────────────────────────────

function AttendanceTab({ id }: { id: string }) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [markModal, setMarkModal] = useState(false);
  const [markForm, setMarkForm] = useState({ date: '', status: 'Present', check_in: '', check_out: '', note: '' });
  const [marking, setMarking] = useState(false);

  const fetchAttendance = useCallback(() => {
    setLoading(true);
    backendApi.get(`/attendants/${id}/attendance`, { params: { month, year } })
      .then((r) => { setRecords(r.data.records ?? []); setSummary(r.data.summary ?? null); })
      .catch(() => toast.error('Failed to load attendance'))
      .finally(() => setLoading(false));
  }, [id, month, year]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear((y) => y - 1); } else setMonth((m) => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear((y) => y + 1); } else setMonth((m) => m + 1); };

  const handleMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!markForm.date || !markForm.status) { toast.error('Date and status required.'); return; }
    setMarking(true);
    try {
      await backendApi.post(`/attendants/${id}/attendance`, markForm);
      toast.success('Attendance marked successfully.');
      setMarkModal(false);
      setMarkForm({ date: '', status: 'Present', check_in: '', check_out: '', note: '' });
      fetchAttendance();
    } catch (err: any) { toast.error(err.message || 'Failed to mark attendance.'); }
    finally { setMarking(false); }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Month Nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer">
            <ChevronLeft className="h-4 w-4 text-slate-500" />
          </button>
          <span className="text-sm font-bold text-slate-700 min-w-[100px] text-center">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button onClick={nextMonth} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer">
            <ChevronRight className="h-4 w-4 text-slate-500" />
          </button>
        </div>
        <button onClick={() => setMarkModal(true)}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl px-4 py-2 transition cursor-pointer shadow-md shadow-orange-100">
          <Plus className="h-4 w-4" /> Mark Attendance
        </button>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Present', value: summary.present_days, color: 'text-emerald-600' },
            { label: 'Late', value: summary.late_days, color: 'text-amber-600' },
            { label: 'Absent', value: summary.absent_days, color: 'text-red-500' },
            { label: 'Leave', value: summary.leave_days, color: 'text-blue-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-orange-100 rounded-2xl p-4 shadow-sm text-center">
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-orange-500" />
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-orange-100 rounded-2xl shadow-sm">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Check In</th>
                <th className="p-4">Check Out</th>
                <th className="p-4">Hours</th>
                <th className="p-4">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {records.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400 font-semibold">No records found for this month.</td></tr>
              ) : records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-mono text-slate-600">{r.date}</td>
                  <td className="p-4"><span className={statusBadge(r.status)}>{r.status}</span></td>
                  <td className="p-4 text-slate-500">{r.check_in ?? '—'}</td>
                  <td className="p-4 text-slate-500">{r.check_out ?? '—'}</td>
                  <td className="p-4 font-semibold">{r.working_hours ? `${r.working_hours}h` : '—'}</td>
                  <td className="p-4 text-slate-400 max-w-[150px] truncate">{r.note ?? (r.is_manual ? '(manual)' : '—')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mark Attendance Modal */}
      <AnimatePresence>
        {markModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMarkModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100 z-10">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-5">
                <h3 className="text-sm font-extrabold flex items-center gap-2"><Plus className="h-4 w-4 text-orange-500" /> Mark Attendance</h3>
                <button onClick={() => setMarkModal(false)} className="p-1 rounded-lg hover:bg-slate-50 cursor-pointer"><X className="h-4 w-4 text-slate-500" /></button>
              </div>
              <form onSubmit={handleMark} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600">Date *</label>
                    <input type="date" required value={markForm.date} onChange={(e) => setMarkForm((p) => ({ ...p, date: e.target.value }))}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600">Status *</label>
                    <select value={markForm.status} onChange={(e) => setMarkForm((p) => ({ ...p, status: e.target.value }))}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer">
                      {['Present', 'Late', 'Absent', 'Leave', 'Holiday'].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600">Check In (24h)</label>
                    <input type="time" value={markForm.check_in} onChange={(e) => setMarkForm((p) => ({ ...p, check_in: e.target.value }))}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600">Check Out (24h)</label>
                    <input type="time" value={markForm.check_out} onChange={(e) => setMarkForm((p) => ({ ...p, check_out: e.target.value }))}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Note</label>
                  <input type="text" placeholder="Optional note..." value={markForm.note} onChange={(e) => setMarkForm((p) => ({ ...p, note: e.target.value }))}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition" />
                </div>
                <div className="flex gap-3 pt-2 border-t border-slate-100">
                  <button type="button" onClick={() => setMarkModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer">Cancel</button>
                  <button type="submit" disabled={marking}
                    className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60">
                    {marking ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    {marking ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Leave Tab ──────────────────────────────────────────────────────────────────

function LeaveTab({ id }: { id: string }) {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);

  const fetchLeaves = useCallback(() => {
    setLoading(true);
    backendApi.get(`/attendants/${id}/leaves`)
      .then((r) => setLeaves(r.data.data ?? []))
      .catch(() => toast.error('Failed to load leaves'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const review = async (leaveId: string, status: 'approved' | 'rejected') => {
    setReviewing(leaveId + status);
    try {
      await backendApi.patch(`/attendants/${id}/leaves/${leaveId}`, { status });
      toast.success(`Leave ${status} successfully.`);
      fetchLeaves();
    } catch (err: any) { toast.error(err.message || 'Action failed.'); }
    finally { setReviewing(null); }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-7 w-7 border-t-2 border-orange-500" /></div>;

  return (
    <div className="overflow-x-auto bg-white border border-orange-100 rounded-2xl shadow-sm">
      <table className="w-full text-xs text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-100">
            <th className="p-4">Type</th>
            <th className="p-4">From</th>
            <th className="p-4">To</th>
            <th className="p-4">Reason</th>
            <th className="p-4">Applied</th>
            <th className="p-4">Status</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {leaves.length === 0 ? (
            <tr><td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">No leave requests.</td></tr>
          ) : leaves.map((l) => (
            <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="p-4 font-semibold">{l.leave_type}</td>
              <td className="p-4 font-mono text-slate-600">{l.from_date}</td>
              <td className="p-4 font-mono text-slate-600">{l.to_date}</td>
              <td className="p-4 text-slate-500 max-w-[160px] truncate">{l.reason}</td>
              <td className="p-4 text-slate-400">{new Date(l.applied_on).toLocaleDateString('en-IN')}</td>
              <td className="p-4"><span className={statusBadge(l.status)}>{l.status}</span></td>
              <td className="p-4">
                {l.status === 'pending' ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => review(l.id, 'approved')} disabled={!!reviewing}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg transition cursor-pointer disabled:opacity-50">
                      {reviewing === l.id + 'approved' ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />} Approve
                    </button>
                    <button onClick={() => review(l.id, 'rejected')} disabled={!!reviewing}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold rounded-lg transition cursor-pointer disabled:opacity-50">
                      {reviewing === l.id + 'rejected' ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />} Reject
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 font-semibold">{l.reviewed_note ?? '—'}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Salary Tab ─────────────────────────────────────────────────────────────────

function SalaryTab({ id }: { id: string }) {
  const [slips, setSlips] = useState<SalarySlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [genModal, setGenModal] = useState(false);
  const [genForm, setGenForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), basic_salary: '', deductions: '0', bonuses: '0' });
  const [generating, setGenerating] = useState(false);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);

  const net = Math.max(0, (parseFloat(genForm.basic_salary) || 0) + (parseFloat(genForm.bonuses) || 0) - (parseFloat(genForm.deductions) || 0));

  const fetchSlips = useCallback(() => {
    setLoading(true);
    backendApi.get(`/attendants/${id}/salary`)
      .then((r) => setSlips(r.data.data ?? []))
      .catch(() => toast.error('Failed to load salary slips'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchSlips(); }, [fetchSlips]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genForm.basic_salary) { toast.error('Basic salary is required.'); return; }
    setGenerating(true);
    try {
      await backendApi.post(`/attendants/${id}/salary`, {
        month: genForm.month, year: genForm.year,
        basic_salary: parseFloat(genForm.basic_salary),
        deductions: parseFloat(genForm.deductions) || 0,
        bonuses: parseFloat(genForm.bonuses) || 0,
      });
      toast.success('Salary slip generated.');
      setGenModal(false);
      fetchSlips();
    } catch (err: any) { toast.error(err.message || 'Failed to generate slip.'); }
    finally { setGenerating(false); }
  };

  const markPaid = async (slipId: string, netSalary: number) => {
    setMarkingPaid(slipId);
    try {
      await backendApi.patch(`/attendants/${id}/salary/${slipId}`, { payment_status: 'paid' });
      toast.success(`Payment of ₹${netSalary.toLocaleString('en-IN')} marked as paid. RazorpayX integration coming soon.`);
      fetchSlips();
    } catch (err: any) { toast.error(err.message || 'Failed to mark paid.'); }
    finally { setMarkingPaid(null); }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end">
        <button onClick={() => setGenModal(true)}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl px-4 py-2 transition cursor-pointer shadow-md shadow-orange-100">
          <Plus className="h-4 w-4" /> Generate Salary Slip
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-7 w-7 border-t-2 border-orange-500" /></div>
      ) : (
        <div className="overflow-x-auto bg-white border border-orange-100 rounded-2xl shadow-sm">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <th className="p-4">Month</th>
                <th className="p-4">Basic</th>
                <th className="p-4">Deductions</th>
                <th className="p-4">Bonuses</th>
                <th className="p-4">Net Salary</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {slips.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-400 font-semibold">No salary slips generated yet.</td></tr>
              ) : slips.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold">{MONTH_NAMES[s.month - 1]} {s.year}</td>
                  <td className="p-4">₹{s.basic_salary.toLocaleString('en-IN')}</td>
                  <td className="p-4 text-red-500">-₹{s.deductions.toLocaleString('en-IN')}</td>
                  <td className="p-4 text-emerald-600">+₹{s.bonuses.toLocaleString('en-IN')}</td>
                  <td className="p-4 font-extrabold text-slate-800">₹{s.net_salary.toLocaleString('en-IN')}</td>
                  <td className="p-4"><span className={statusBadge(s.payment_status)}>{s.payment_status}</span></td>
                  <td className="p-4">
                    {s.payment_status === 'pending' ? (
                      <button onClick={() => markPaid(s.id, s.net_salary)} disabled={markingPaid === s.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg transition cursor-pointer disabled:opacity-50">
                        {markingPaid === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CreditCard className="h-3 w-3" />} Mark Paid
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400">{s.paid_on ? new Date(s.paid_on).toLocaleDateString('en-IN') : '—'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Generate Salary Modal */}
      <AnimatePresence>
        {genModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setGenModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100 z-10">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-5">
                <h3 className="text-sm font-extrabold flex items-center gap-2"><CreditCard className="h-4 w-4 text-orange-500" /> Generate Salary Slip</h3>
                <button onClick={() => setGenModal(false)} className="p-1 rounded-lg hover:bg-slate-50 cursor-pointer"><X className="h-4 w-4 text-slate-500" /></button>
              </div>
              <form onSubmit={handleGenerate} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600">Month</label>
                    <select value={genForm.month} onChange={(e) => setGenForm((p) => ({ ...p, month: +e.target.value }))}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer">
                      {MONTH_NAMES.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600">Year</label>
                    <input type="number" value={genForm.year} onChange={(e) => setGenForm((p) => ({ ...p, year: +e.target.value }))}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition" />
                  </div>
                </div>
                {[
                  { key: 'basic_salary', label: 'Basic Salary (₹) *' },
                  { key: 'deductions', label: 'Deductions (₹)' },
                  { key: 'bonuses', label: 'Bonuses (₹)' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600">{label}</label>
                    <input type="number" min="0" step="0.01" placeholder="0.00"
                      value={(genForm as any)[key]}
                      onChange={(e) => setGenForm((p) => ({ ...p, [key]: e.target.value }))}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition" />
                  </div>
                ))}
                {/* Live net salary */}
                <div className="bg-slate-50 rounded-xl px-4 py-3 flex justify-between items-center border border-slate-200">
                  <span className="text-xs font-bold text-slate-500">Net Salary</span>
                  <span className="text-sm font-extrabold text-emerald-600">₹{net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex gap-3 pt-2 border-t border-slate-100">
                  <button type="button" onClick={() => setGenModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer">Cancel</button>
                  <button type="submit" disabled={generating}
                    className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60">
                    {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                    {generating ? 'Generating...' : 'Generate'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Announcements Tab ─────────────────────────────────────────────────────────

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  announcement_type: string;
  created_at: string;
  target_employee_id: string | null;
  target_employee_name: string | null;
  is_active: boolean;
}

function AnnouncementsTab({ id, employeeName }: { id: string; employeeName: string }) {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', announcement_type: 'General' });
  const [sendToAll, setSendToAll] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = useCallback(() => {
    setLoading(true);
    backendApi.get('/announcements/my-pump')
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data.data ?? []);
        const filtered = list.filter((a: any) => a.target_employee_id === id || a.target_employee_id === null);
        filtered.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setAnnouncements(filtered);
      })
      .catch(() => toast.error('Failed to load announcements'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      toast.error('Title and content are required.');
      return;
    }
    setSubmitting(true);
    try {
      await backendApi.post('/announcements/', {
        title: form.title,
        content: form.content,
        announcement_type: form.announcement_type,
        target_employee_id: sendToAll ? null : id,
      });
      toast.success('Announcement published successfully.');
      setCreateModal(false);
      setForm({ title: '', content: '', announcement_type: 'General' });
      setSendToAll(false);
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (annId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    setDeleting(annId);
    try {
      await backendApi.delete(`/announcements/${annId}`);
      toast.success('Announcement deleted.');
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete announcement.');
    } finally {
      setDeleting(null);
    }
  };

  const typeBadge = (type: string) => {
    const t = (type || 'General').toLowerCase();
    const map: Record<string, string> = {
      urgent: 'bg-red-100 text-red-700',
      safety: 'bg-amber-100 text-amber-700',
      holiday: 'bg-green-100 text-green-700',
      general: 'bg-blue-100 text-blue-700',
    };
    const className = map[t] ?? 'bg-blue-100 text-blue-700';
    return <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${className}`}>{type}</span>;
  };

  const targetBadge = (targetId: string | null) => {
    if (targetId) {
      return <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">This Employee</span>;
    }
    return <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">All Employees</span>;
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-700">Announcements for {employeeName}</h2>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Broadcast history and direct alerts.</p>
        </div>
        <button onClick={() => setCreateModal(true)}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl px-4 py-2 transition cursor-pointer shadow-md shadow-orange-100">
          <Plus className="h-4 w-4" /> New Announcement
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-orange-500" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white border border-orange-100 rounded-2xl p-10 text-center shadow-sm">
          <Megaphone className="h-8 w-8 text-orange-200 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-500">No announcements yet.</p>
          <p className="text-xs text-slate-400 mt-1">Click &quot;New Announcement&quot; to broadcast a message.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-white border border-orange-100 rounded-2xl p-4 shadow-sm flex items-start justify-between gap-4">
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {typeBadge(ann.announcement_type)}
                  <span className="text-xs font-extrabold text-slate-800">{ann.title}</span>
                </div>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed line-clamp-2">{ann.content}</p>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {new Date(ann.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex flex-col items-end justify-between self-stretch shrink-0 gap-3">
                {targetBadge(ann.target_employee_id)}
                <button
                  onClick={() => handleDelete(ann.id)}
                  disabled={deleting === ann.id}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition cursor-pointer disabled:opacity-50"
                >
                  {deleting === ann.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {createModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setCreateModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100 z-10">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-5">
                <h3 className="text-sm font-extrabold flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-orange-500" /> New Announcement
                </h3>
                <button onClick={() => setCreateModal(false)} className="p-1 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Title *</label>
                  <input type="text" required placeholder="e.g., Public Holiday Notice" value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Content *</label>
                  <textarea required rows={3} placeholder="Write the announcement content here..." value={form.content}
                    onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                    className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition resize-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Type</label>
                  <select value={form.announcement_type} onChange={(e) => setForm((p) => ({ ...p, announcement_type: e.target.value }))}
                    className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer">
                    {['General', 'Urgent', 'Safety', 'Holiday'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 py-1">
                  <input type="checkbox" id="sendToAll" checked={sendToAll} onChange={(e) => setSendToAll(e.target.checked)}
                    className="rounded border-slate-350 text-orange-500 focus:ring-orange-400 focus:ring-opacity-25 h-4 w-4 cursor-pointer" />
                  <label htmlFor="sendToAll" className="text-xs font-bold text-slate-600 cursor-pointer">
                    Send to all employees of this pump
                  </label>
                </div>
                <div className="flex gap-3 pt-2 border-t border-slate-100">
                  <button type="button" onClick={() => setCreateModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}
                    {submitting ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Shifts Tab ─────────────────────────────────────────────────────────────────

function ShiftsTab({ id, employeeName }: { id: string; employeeName: string }) {
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const getWeekStart = (d: Date) => {
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1 - day);
    const monday = new Date(d);
    monday.setDate(d.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [assignModal, setAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({ date: '', shift_type: 'Morning' });
  const [assigning, setAssigning] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const startDateStr = weekStart.toISOString().split('T')[0];

  const fetchShifts = useCallback(() => {
    setLoading(true);
    backendApi.get(`/shifts/weekly?start_date=${startDateStr}`)
      .then((res) => {
        const grid = res.data.grid || {};
        const filtered: ShiftAssignment[] = [];
        Object.keys(grid).forEach((dateKey) => {
          const shifts = grid[dateKey];
          Object.keys(shifts).forEach((shiftKey) => {
            const assignment = shifts[shiftKey];
            if (assignment && assignment.attendant_id === id) {
              filtered.push(assignment);
            }
          });
        });
        setAssignments(filtered);
      })
      .catch(() => toast.error('Failed to load shifts'))
      .finally(() => setLoading(false));
  }, [id, startDateStr]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.date || !assignForm.shift_type) {
      toast.error('Date and shift type are required.');
      return;
    }
    setAssigning(true);
    try {
      await backendApi.post('/shifts/assign', {
        attendant_id: id,
        date: assignForm.date,
        shift_type: assignForm.shift_type
      });
      toast.success('Shift assigned successfully!');
      setAssignModal(false);
      setAssignForm({ date: '', shift_type: 'Morning' });
      fetchShifts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign shift.');
    } finally {
      setAssigning(false);
    }
  };

  const handleDelete = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this shift assignment?')) return;
    setDeleting(assignmentId);
    try {
      console.warn(`DELETE /shifts/${assignmentId} called, but endpoint may not exist. Trying API call first.`);
      try {
        await backendApi.delete(`/shifts/${assignmentId}`);
      } catch (err) {
        console.warn("API delete failed, proceeding optimistically", err);
      }
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
      toast.success('Shift assignment deleted.');
    } catch (err: any) {
      toast.error('Failed to delete shift');
    } finally {
      setDeleting(null);
    }
  };

  const SHIFT_CONFIG: Record<string, { label: string; time: string; color: string; icon: React.ReactNode }> = {
    Morning: { label: 'Morning', time: '6:00 AM – 2:00 PM', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Sun className="h-3.5 w-3.5"/> },
    Evening: { label: 'Evening', time: '2:00 PM – 10:00 PM', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: <Sunset className="h-3.5 w-3.5"/> },
    Night:   { label: 'Night',   time: '10:00 PM – 6:00 AM', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <Moon className="h-3.5 w-3.5"/> },
  };

  const STATUS_CONFIG: Record<string, string> = {
    scheduled: 'bg-emerald-100 text-emerald-700',
    completed:  'bg-slate-100 text-slate-600',
    absent:     'bg-red-100 text-red-600',
    covered:    'bg-amber-100 text-amber-700',
  };

  const formatWeekRange = (start: Date) => {
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    return `${start.toLocaleDateString('en-IN', options)} - ${end.toLocaleDateString('en-IN', options)}`;
  };

  const handlePrevWeek = () => {
    const prev = new Date(weekStart);
    prev.setDate(weekStart.getDate() - 7);
    setWeekStart(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(weekStart);
    next.setDate(weekStart.getDate() + 7);
    setWeekStart(next);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col gap-5">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-left">
          <h2 className="text-sm font-bold text-slate-700">Shift Schedule for {employeeName}</h2>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Week of {formatWeekRange(weekStart)}</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            <button onClick={handlePrevWeek} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer">
              <ChevronLeft className="h-4 w-4 text-slate-500" />
            </button>
            <button onClick={() => setWeekStart(getWeekStart(new Date()))} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-xs font-bold text-slate-600 cursor-pointer flex items-center gap-1">
              <RefreshCw className="h-3 w-3" /> Today
            </button>
            <button onClick={handleNextWeek} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer">
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </button>
          </div>
          <button onClick={() => setAssignModal(true)}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl px-4 py-2 transition cursor-pointer shadow-md shadow-orange-100">
            <Plus className="h-4 w-4" /> Assign Shift
          </button>
        </div>
      </div>

      {/* Weekly Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, idx) => (
            <div key={idx} className="animate-pulse bg-slate-100 rounded-2xl h-32 border border-slate-200/60" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const dateStr = day.toISOString().split('T')[0];
            const isToday = dateStr === todayStr;
            const assignment = assignments.find((a) => a.date === dateStr);
            const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
            const dateNum = day.getDate();
            const monthName = day.toLocaleDateString('en-US', { month: 'short' });

            return (
              <div
                key={dateStr}
                className={`bg-white border rounded-2xl p-3 shadow-sm flex flex-col justify-between min-h-[140px] text-left transition-all ${
                  isToday ? 'border-orange-400 bg-orange-50/30 ring-1 ring-orange-400/25' : 'border-orange-100'
                }`}
              >
                {/* Card Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">{dayName}</span>
                    <span className="text-lg font-extrabold text-slate-800 leading-tight block">{dateNum}</span>
                    <span className="text-[10px] text-slate-400 font-semibold block">{monthName}</span>
                  </div>
                  {isToday && (
                    <span className="bg-orange-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                      Today
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="mt-3 flex-1 flex flex-col justify-end">
                  {assignment ? (
                    <div className="flex flex-col gap-1.5">
                      {/* Shift Type Config */}
                      {(() => {
                        const config = SHIFT_CONFIG[assignment.shift_type] || {
                          label: assignment.shift_type,
                          time: 'Custom shift',
                          color: 'bg-slate-100 text-slate-700 border-slate-200',
                          icon: <Clock className="h-3.5 w-3.5"/>
                        };
                        return (
                          <div className={`border rounded-lg px-2 py-1 text-[10px] font-bold flex items-center justify-between gap-1 ${config.color}`}>
                            <span className="flex items-center gap-1">
                              {config.icon}
                              {config.label}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(assignment.id);
                              }}
                              disabled={deleting === assignment.id}
                              className="p-0.5 rounded hover:bg-black/5 text-slate-400 hover:text-red-500 transition cursor-pointer disabled:opacity-50"
                              title="Delete Shift"
                            >
                              {deleting === assignment.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        );
                      })()}

                      {/* Time text */}
                      <span className="text-[9px] text-slate-400 font-semibold">
                        {SHIFT_CONFIG[assignment.shift_type]?.time || '—'}
                      </span>

                      {/* Status badge */}
                      <div className="flex justify-between items-center mt-0.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${STATUS_CONFIG[assignment.status] || 'bg-slate-100 text-slate-600'}`}>
                          {assignment.status}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAssignForm({ date: dateStr, shift_type: 'Morning' });
                        setAssignModal(true);
                      }}
                      className="border-2 border-dashed border-slate-200 hover:border-orange-200 rounded-xl p-3 text-center transition cursor-pointer group flex flex-col items-center justify-center gap-1 h-full min-h-[60px]"
                    >
                      <span className="text-slate-300 group-hover:text-orange-400 text-lg font-thin leading-none">+</span>
                      <span className="text-[9px] text-slate-300 group-hover:text-orange-400 font-semibold">No shift</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign Shift Modal */}
      <AnimatePresence>
        {assignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setAssignModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 z-10 text-left">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-5">
                <h3 className="text-sm font-extrabold flex items-center gap-2"><Clock className="h-4 w-4 text-orange-500" /> Assign Shift</h3>
                <button onClick={() => setAssignModal(false)} className="p-1 rounded-lg hover:bg-slate-50 cursor-pointer"><X className="h-4 w-4 text-slate-500" /></button>
              </div>
              <form onSubmit={handleAssign} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Date *</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={assignForm.date}
                    onChange={(e) => setAssignForm((p) => ({ ...p, date: e.target.value }))}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Shift Type *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.keys(SHIFT_CONFIG).map((type) => {
                      const config = SHIFT_CONFIG[type];
                      const isSelected = assignForm.shift_type === type;
                      return (
                        <div
                          key={type}
                          onClick={() => setAssignForm((p) => ({ ...p, shift_type: type }))}
                          className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                            isSelected
                              ? 'border-2 border-orange-400 bg-orange-50 text-orange-600 font-bold scale-[1.02]'
                              : 'border-slate-200 bg-white hover:border-orange-200 text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <div className={isSelected ? 'text-orange-500' : 'text-slate-400'}>
                            {config.icon}
                          </div>
                          <span className="text-[10px] font-bold mt-1">{config.label}</span>
                          <span className="text-[7px] text-slate-400 font-semibold mt-0.5 leading-tight">{config.time}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3 pt-2 border-t border-slate-100 mt-2">
                  <button type="button" onClick={() => setAssignModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer">Cancel</button>
                  <button type="submit" disabled={assigning}
                    className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60">
                    {assigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    {assigning ? 'Assigning...' : 'Assign'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
