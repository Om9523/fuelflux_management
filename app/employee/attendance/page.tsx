'use client';

import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, LogIn, LogOut } from 'lucide-react';
import { useAttendanceStore } from '@/stores/attendance.store';
import { AttendanceCard } from '@/components/employee/AttendanceCard';

export default function MyAttendancePage() {
  const { records, summary, fetchAttendance } = useAttendanceStore();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchAttendance(month, year);
  }, [month, year]);

  // Calendar grid for selected month
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0=Sun
  // Convert to Mon-start: Sun=6, Mon=0 ...
  const startOffset = (firstDayOfMonth + 6) % 7;

  const calendarCells = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const getRecordForDay = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return records.find((r) => r.date === dateStr);
  };

  const isWeekend = (day: number) => {
    const d = new Date(year, month - 1, day).getDay();
    return d === 0 || d === 6;
  };

  const getStatusColor = (status: string | undefined, weekend: boolean) => {
    if (!status) return weekend ? 'bg-slate-50 border-slate-100 text-slate-300' : 'bg-white border-slate-200 text-slate-600';
    switch (status) {
      case 'Present': return 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold';
      case 'Late': return 'bg-amber-50 border-amber-200 text-amber-700 font-bold';
      case 'Leave': return 'bg-orange-50 border-orange-200 text-orange-700 font-bold';
      case 'Absent': return 'bg-rose-50 border-rose-200 text-rose-700 font-bold';
      default: return 'bg-white border-slate-200 text-slate-600';
    }
  };

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  return (
    <div className="flex flex-col gap-6 text-left font-sans">
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-orange-500" />
          My Attendance Log
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Review clock logs, punctuality metrics, and roster calendars.
        </p>
      </div>

      <AttendanceCard />

      {/* Monthly Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Present Days', value: summary?.present_days ?? 0, color: 'text-emerald-600' },
          { label: 'Late Arrivals', value: summary?.late_days ?? 0, color: 'text-amber-600' },
          { label: 'Absent Days', value: (summary?.total_days ?? 0) - (summary?.present_days ?? 0) - (summary?.leave_days ?? 0), color: 'text-rose-600' },
          { label: 'Leaves Taken', value: summary?.leave_days ?? 0, color: 'text-orange-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{label}</span>
            <span className={`text-2xl font-extrabold mt-2 block ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white border border-orange-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          {/* Month navigation */}
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (month === 1) { setMonth(12); setYear(y => y - 1); }
                  else setMonth(m => m - 1);
                }}
                className="text-xs font-bold text-slate-400 hover:text-orange-500 px-2 py-1 rounded-lg hover:bg-orange-50 transition cursor-pointer"
              >
                ← Prev
              </button>
              <h3 className="text-sm font-bold text-slate-800">{monthName} {year}</h3>
              <button
                onClick={() => {
                  if (month === 12) { setMonth(1); setYear(y => y + 1); }
                  else setMonth(m => m + 1);
                }}
                className="text-xs font-bold text-slate-400 hover:text-orange-500 px-2 py-1 rounded-lg hover:bg-orange-50 transition cursor-pointer"
              >
                Next →
              </button>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold">
              {[
                { color: 'bg-emerald-50 border-emerald-200', label: 'Present' },
                { color: 'bg-amber-50 border-amber-200', label: 'Late' },
                { color: 'bg-orange-50 border-orange-200', label: 'Leave' },
                { color: 'bg-rose-50 border-rose-200', label: 'Absent' },
              ].map(({ color, label }) => (
                <span key={label} className="flex items-center gap-1">
                  <span className={`h-2.5 w-2.5 rounded-sm border block ${color}`} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <span key={d} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1">{d}</span>
            ))}
            {calendarCells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;
              const record = getRecordForDay(day);
              const weekend = isWeekend(day);
              return (
                <div
                  key={day}
                  className={`border rounded-xl aspect-square flex flex-col items-center justify-between p-1.5 text-[11px] transition-all ${getStatusColor(record?.status, weekend)}`}
                >
                  <span className="font-bold self-start">{day}</span>
                  {record && (
                    <span className="text-[9px] font-semibold leading-none truncate w-full text-center">
                      {record.checkIn || record.status}
                    </span>
                  )}
                  {weekend && !record && (
                    <span className="text-[8px] text-slate-300 font-semibold">Off</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Ledger */}
        <div className="bg-white border border-orange-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Daily Logs Ledger</h3>
          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
            {records.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No records this month.</p>
            ) : (
              records.map((rec) => (
                <div key={rec.id} className="flex items-start justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex flex-col gap-1 text-left">
                    <span className="text-xs font-bold text-slate-700">
                      {new Date(rec.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    {rec.checkIn ? (
                      <div className="flex flex-col gap-0.5 mt-1 text-[10px] text-slate-400 font-semibold">
                        <span className="flex items-center gap-1">
                          <LogIn className="h-3 w-3 text-emerald-500" /> {rec.checkIn}
                        </span>
                        {rec.checkOut && (
                          <span className="flex items-center gap-1 mt-0.5">
                            <LogOut className="h-3 w-3 text-rose-500" /> {rec.checkOut}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic mt-1">No hours logged.</span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${rec.status === 'Present' ? 'bg-green-100 text-green-700' :
                        rec.status === 'Late' ? 'bg-amber-100 text-amber-700' :
                          rec.status === 'Leave' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                      }`}>
                      {rec.status}
                    </span>
                    {rec.workingHours > 0 && (
                      <span className="text-[10px] font-bold font-mono text-slate-500">{rec.workingHours} hrs</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}