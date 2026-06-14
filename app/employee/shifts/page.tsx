'use client';

import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Clock, CornerDownRight, Info, ShieldCheck } from 'lucide-react';
import { ShiftCard } from '@/components/employee/ShiftCard';
import { shiftService } from '@/services/shift.service';
import { ShiftDetails } from '@/lib/mock-db';
import { toast } from '@/components/feedback/Toast';

export default function MyShiftsPage() {
  const [shift, setShift] = useState<ShiftDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    shiftService.getShiftDetails()
      .then((data) => setShift(data))
      .catch(() => toast.error('Failed to load shifts schedule'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] w-full flex items-center justify-center bg-transparent">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-left font-sans">
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <CalendarIcon className="h-5.5 w-5.5 text-orange-500" />
          My Shifts & Roster
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">Check assigned timings, shift types, and weekly rest days.</p>
      </div>

      <ShiftCard shift={shift} />

      {/* Roster & Timing guidelines */}
      <div className="grid md:grid-cols-3 gap-6 mt-2">
        {/* Shift Type 1 */}
        <div className="bg-white border border-orange-100 p-5 rounded-2xl shadow-sm text-left">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-2 mb-3">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Morning Shift</h4>
          </div>
          <p className="text-xs font-mono font-bold text-slate-800 mb-2">08:00 AM - 04:00 PM</p>
          <ul className="text-[10px] text-slate-500 font-medium space-y-1">
            <li className="flex items-center gap-1.5"><CornerDownRight className="h-3.5 w-3.5 text-slate-400" /> 15-minute grace check-in</li>
            <li className="flex items-center gap-1.5"><CornerDownRight className="h-3.5 w-3.5 text-slate-400" /> 30-minute lunch interval</li>
            <li className="flex items-center gap-1.5"><CornerDownRight className="h-3.5 w-3.5 text-slate-400" /> Shift handovers completed by 04:00 PM</li>
          </ul>
        </div>

        {/* Shift Type 2 */}
        <div className="bg-white border border-orange-100 p-5 rounded-2xl shadow-sm text-left">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-2 mb-3">
            <span className="h-2 w-2 rounded-full bg-orange-500"></span>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Afternoon Shift</h4>
          </div>
          <p className="text-xs font-mono font-bold text-slate-800 mb-2">04:00 PM - 12:00 AM</p>
          <ul className="text-[10px] text-slate-500 font-medium space-y-1">
            <li className="flex items-center gap-1.5"><CornerDownRight className="h-3.5 w-3.5 text-slate-400" /> Cash register tally by 11:45 PM</li>
            <li className="flex items-center gap-1.5"><CornerDownRight className="h-3.5 w-3.5 text-slate-400" /> 30-minute dinner interval</li>
            <li className="flex items-center gap-1.5"><CornerDownRight className="h-3.5 w-3.5 text-slate-400" /> Transport logistics support enabled</li>
          </ul>
        </div>

        {/* Shift Type 3 */}
        <div className="bg-white border border-orange-100 p-5 rounded-2xl shadow-sm text-left">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-2 mb-3">
            <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Night Shift</h4>
          </div>
          <p className="text-xs font-mono font-bold text-slate-800 mb-2">12:00 AM - 08:00 AM</p>
          <ul className="text-[10px] text-slate-500 font-medium space-y-1">
            <li className="flex items-center gap-1.5"><CornerDownRight className="h-3.5 w-3.5 text-slate-400" /> Mandatory security audits at 02:00 AM</li>
            <li className="flex items-center gap-1.5"><CornerDownRight className="h-3.5 w-3.5 text-slate-400" /> Emergency contacts checklist active</li>
            <li className="flex items-center gap-1.5"><CornerDownRight className="h-3.5 w-3.5 text-slate-400" /> Decanting guidelines strictly enforced</li>
          </ul>
        </div>
      </div>

      {/* Roster rules alert */}
      <div className="bg-orange-50/40 border border-orange-150/40 p-4 rounded-xl flex items-start gap-3">
        <Info className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-slate-850">Shift Swap Guidelines</h4>
          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-1">
            If you wish to swap shifts with a coworker, submissions must be signed and requested to the Pump Manager at least 48 hours prior. Emergency shifts require supervisor authorization.
          </p>
        </div>
      </div>
    </div>
  );
}
