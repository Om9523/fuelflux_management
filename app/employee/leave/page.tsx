'use client';

import React, { useEffect, useState } from 'react';
import { CalendarClock, FileSpreadsheet, Hourglass, Info } from 'lucide-react';
import { LeaveForm } from '@/components/employee/LeaveForm';
import { leaveService } from '@/services/leave.service';
import { LeaveRecord } from '@/lib/mock-db';
import { toast } from '@/components/feedback/Toast';

export default function LeaveRequestsPage() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaveHistory = () => {
    leaveService.getLeaveHistory()
      .then((data) => setLeaves(data))
      .catch(() => toast.error('Failed to load leave history'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  const getStatusBadge = (status: LeaveRecord['status']) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      default: // Pending
        return 'bg-amber-100 text-amber-700';
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left font-sans">
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <CalendarClock className="h-5.5 w-5.5 text-orange-500" />
          Leave Requests Portal
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">Apply for roster time-off and track request status approvals.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Application Form */}
        <div className="bg-white border border-orange-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-850 border-b border-slate-50 pb-2 mb-1">
            Apply for Time-Off
          </h3>
          <LeaveForm onSuccess={fetchLeaveHistory} />
        </div>

        {/* Request History */}
        <div className="lg:col-span-2 bg-white border border-orange-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-850 mb-4">Leave Application History</h3>

          {loading ? (
            <div className="min-h-[200px] w-full flex items-center justify-center bg-transparent">
              <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-orange-500" />
            </div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-semibold">
              No leave requests logged yet.
            </div>
          ) : (
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <th className="px-4 py-3 text-left">Leave Type</th>
                      <th className="px-4 py-3 text-left">Dates</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Remarks</th>
                      <th className="px-4 py-3 text-right">Applied</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {leaves.map((l) => {
                      const start = new Date(l.startDate);
                      const end = new Date(l.endDate);
                      const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;

                      return (
                        <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3.5 flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4 text-slate-400 shrink-0" />
                            <span>{l.leaveType}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-slate-700">
                                {l.startDate} to {l.endDate}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium font-mono">
                                Duration: {duration} {duration === 1 ? 'day' : 'days'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-full uppercase tracking-wider ${getStatusBadge(l.status)}`}>
                              {l.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 max-w-[150px] truncate text-[10px] text-slate-500 italic">
                            {l.managerRemarks || 'ΓÇö'}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono text-slate-400 text-[10px]">
                            {l.appliedDate}
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

      {/* Info Warning */}
      <div className="bg-orange-50/40 border border-orange-150/40 p-4 rounded-xl flex items-start gap-3 mt-2">
        <Info className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-slate-850">Emergency Leave Clause</h4>
          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-1">
            Emergency leaves applied on the active shift day must be accompanied by direct telephonic verification to the Supervisor. Failure to notify will mark the roster date as Uninformed Absenteeism.
          </p>
        </div>
      </div>
    </div>
  );
}
