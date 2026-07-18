'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, CornerDownRight, Info, LogIn, LogOut } from 'lucide-react';
import { useAttendanceStore } from '@/stores/attendance.store';
import { AttendanceCard } from '@/components/employee/AttendanceCard';

export default function MyAttendancePage() {
  const { records, todayRecord, fetchAttendance } = useAttendanceStore();

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Compute stats
  const presentCount = records.filter((r) => r.status === 'Present').length;
  const lateCount = records.filter((r) => r.status === 'Late').length;
  const absentCount = records.filter((r) => r.status === 'Absent').length;
  const leaveCount = records.filter((r) => r.status === 'Leave').length;

  // Let's generate a premium calendar for June 2026
  // June 2026 starts on a Monday (June 1, 2026)
  // Let's create an array of 30 days.
  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-06-${String(dayNum).padStart(2, '0')}`;
    const record = records.find((r) => r.date === dateStr);
    
    // Check if weekend (Saturday or Sunday)
    // June 6, 7 are Sat, Sun; June 13, 14; June 20, 21; June 27, 28
    const isWeekend = [6, 7, 13, 14, 20, 21, 27, 28].includes(dayNum);

    return {
      day: dayNum,
      dateStr,
      record,
      isWeekend,
    };
  });

  const getStatusColor = (status: string | undefined, isWeekend: boolean) => {
    if (!status) {
      return isWeekend 
        ? 'bg-slate-50 border-slate-100 text-slate-400' 
        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300';
    }
    switch (status) {
      case 'Present':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold';
      case 'Late':
        return 'bg-amber-50 border-amber-250 text-amber-700 font-bold';
      case 'Leave':
        return 'bg-orange-50 border-orange-200 text-orange-700 font-bold';
      case 'Absent':
        return 'bg-rose-50 border-rose-250 text-rose-700 font-bold';
      default:
        return 'bg-white border-slate-200 text-slate-700';
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left font-sans">
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <CalendarIcon className="h-5.5 w-5.5 text-orange-500" />
          My Attendance Log
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">Review clock logs, punctuality metrics, and roster calendars.</p>
      </div>

      {/* Attendance Check-in console */}
      <AttendanceCard />

      {/* Monthly summaries grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Present Days</span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-2 block">{presentCount}</span>
        </div>
        <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Late Arrivals</span>
          <span className="text-2xl font-extrabold text-amber-600 mt-2 block">{lateCount}</span>
        </div>
        <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Absent Days</span>
          <span className="text-2xl font-extrabold text-rose-600 mt-2 block">{absentCount}</span>
        </div>
        <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Leaves Taken</span>
          <span className="text-2xl font-extrabold text-orange-500 mt-2 block">{leaveCount}</span>
        </div>
      </div>

      {/* Main Section */}
      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Calendar Column */}
        <div className="lg:col-span-2 bg-white border border-orange-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <h3 className="text-sm font-bold text-slate-850">June 2026</h3>
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-50 border border-emerald-200 block"></span>Present</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-amber-50 border border-amber-250 block"></span>Late</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-orange-50 border border-orange-200 block"></span>Leave</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-rose-50 border border-rose-250 block"></span>Absent</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2.5 text-center">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <span key={d} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1">{d}</span>
            ))}

            {calendarDays.map(({ day, record, isWeekend }) => {
              const colorClass = getStatusColor(record?.status, isWeekend);
              return (
                <div
                  key={day}
                  className={`border rounded-xl aspect-square flex flex-col items-center justify-between p-1.5 transition-all text-[11px] ${colorClass}`}
                >
                  <span className="font-bold self-start">{day}</span>
                  {record && (
                    <span className="text-[9px] font-semibold leading-none scale-90 sm:scale-100 truncate">
                      {record.checkIn || record.status}
                    </span>
                  )}
                  {isWeekend && !record && (
                    <span className="text-[8px] text-slate-350 font-semibold leading-none">Off</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Ledger Column */}
        <div className="bg-white border border-orange-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-850 mb-4">Daily Logs Ledger</h3>
          <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
            {[...records].map((rec) => (
              <div
                key={rec.id}
                className="flex items-start justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:shadow-xs transition-shadow"
              >
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-xs font-bold text-slate-700">{new Date(rec.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  
                  {rec.checkIn ? (
                    <div className="flex flex-col gap-0.5 mt-1 font-semibold text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <LogIn className="h-3 w-3 text-emerald-500" />
                        Check-In: {rec.checkIn}
                      </span>
                      {rec.checkOut && (
                        <span className="flex items-center gap-1 mt-0.5">
                          <LogOut className="h-3 w-3 text-rose-500" />
                          Check-Out: {rec.checkOut}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400 italic mt-1">
                      No shift hours logged.
                    </span>
                  )}
                </div>

                <div className="text-right flex flex-col gap-1.5 shrink-0 items-end">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      rec.status === 'Present'
                        ? 'bg-green-100 text-green-700'
                        : rec.status === 'Late'
                          ? 'bg-amber-100 text-amber-700'
                          : rec.status === 'Leave'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {rec.status}
                  </span>
                  {rec.workingHours > 0 && (
                    <span className="text-[10px] font-bold font-mono text-slate-500">
                      {rec.workingHours} hrs
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
