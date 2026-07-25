'use client';

import React, { useEffect, useState } from 'react';
import { CalendarClock, FileSpreadsheet, Info, PlusCircle, X } from 'lucide-react';
import { leaveService } from '@/services/leave.service';
import { LeaveRecord, LeaveApplyPayload, LeaveType } from '@/types/employee';
import { toast } from '@/components/feedback/Toast';

const LEAVE_TYPES: LeaveType[] = ['Casual', 'Sick', 'Earned', 'Emergency'];

const statusBadge = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-700';
    case 'rejected': return 'bg-red-100 text-red-700';
    default: return 'bg-amber-100 text-amber-700';
  }
};

export default function LeaveRequestsPage() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<LeaveApplyPayload>({
    leave_type: 'Casual',
    from_date: '',
    to_date: '',
    reason: '',
  });

  const fetchLeaves = () => {
    setLoading(true);
    leaveService.getLeaveHistory()
      .then(setLeaves)
      .catch(() => toast.error('Failed to load leave history'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.from_date || !form.to_date || !form.reason.trim()) {
      toast.error('Please fill all fields.');
      return;
    }
    if (new Date(form.to_date) < new Date(form.from_date)) {
      toast.error('End date cannot be before start date.');
      return;
    }
    setSubmitting(true);
    try {
      await leaveService.applyLeave(form);
      toast.success('Leave application submitted successfully!');
      setForm({ leave_type: 'Casual', from_date: '', to_date: '', reason: '' });
      fetchLeaves();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit leave.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left font-sans">
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-orange-500" />
          Leave Requests Portal
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Apply for roster time-off and track request status approvals.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">

        {/* Apply Form */}
        <div className="bg-white border border-orange-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2">
            Apply for Time-Off
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Leave Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Leave Type</label>
              <select
                value={form.leave_type}
                onChange={(e) => setForm(f => ({ ...f, leave_type: e.target.value as LeaveType }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition cursor-pointer"
              >
                {LEAVE_TYPES.map(t => <option key={t} value={t}>{t} Leave</option>)}
              </select>
            </div>

            {/* From Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">From Date</label>
              <input
                type="date"
                value={form.from_date}
                onChange={(e) => setForm(f => ({ ...f, from_date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">To Date</label>
              <input
                type="date"
                value={form.to_date}
                onChange={(e) => setForm(f => ({ ...f, to_date: e.target.value }))}
                min={form.from_date || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
              />
            </div>

            {/* Reason */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Reason</label>
              <textarea
                rows={3}
                value={form.reason}
                onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))}
                placeholder="Brief reason for leave..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-3 rounded-xl transition shadow-md shadow-orange-100 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting
                ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <PlusCircle className="h-4 w-4" />
              }
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 bg-white border border-orange-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Leave Application History</h3>

          {loading ? (
            <div className="min-h-[200px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-orange-500" />
            </div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-semibold">
              No leave requests yet.
            </div>
          ) : (
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Dates</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Note</th>
                      <th className="px-4 py-3 text-right">Applied</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {leaves.map((l) => {
                      const start = new Date(l.from_date);
                      const end = new Date(l.to_date);
                      const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
                      return (
                        <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3.5">
                            <span className="flex items-center gap-2">
                              <FileSpreadsheet className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              {l.leave_type}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold">{l.from_date} → {l.to_date}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{days} {days === 1 ? 'day' : 'days'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${statusBadge(l.status)}`}>
                              {l.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 max-w-[150px] truncate text-[10px] text-slate-500 italic">
                            {l.reviewed_note || '—'}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono text-slate-400 text-[10px]">
                            {new Date(l.applied_on).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info note */}
      <div className="bg-orange-50/40 border border-orange-100 p-4 rounded-xl flex items-start gap-3">
        <Info className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-slate-800">Emergency Leave Clause</h4>
          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-1">
            Emergency leaves applied on the active shift day must be accompanied by direct telephonic verification to the Supervisor.
            Failure to notify will mark the roster date as Uninformed Absenteeism.
          </p>
        </div>
      </div>
    </div>
  );
}