'use client';

import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Sun, Sunset, Moon, Info } from 'lucide-react';
import backendApi from '@/lib/backendApi';
import { toast } from '@/components/feedback/Toast';

interface DaySchedule {
  date: string;
  day_name: string;
  shift_type: string | null;
  status: string | null;
  assignment_id: string | null;
}

const SHIFT_STYLES: Record<string, { bg: string; border: string; badge: string; icon: React.ReactNode }> = {
  Morning: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    icon: <Sun className="h-4 w-4 text-blue-500" />,
  },
  Evening: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    icon: <Sunset className="h-4 w-4 text-orange-500" />,
  },
  Night: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    icon: <Moon className="h-4 w-4 text-purple-500" />,
  },
};

const STATUS_BADGE: Record<string, string> = {
  scheduled: 'bg-slate-100 text-slate-600',
  completed: 'bg-emerald-100 text-emerald-700',
  absent: 'bg-red-100 text-red-600',
  covered: 'bg-amber-100 text-amber-700',
};

export default function MyShiftsPage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const todayIso = new Date().toISOString().split('T')[0];

  useEffect(() => {
    backendApi.get('/shifts/my-schedule')
      .then((res) => setSchedule(res.data.schedule ?? []))
      .catch(() => toast.error('Failed to load shift schedule'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 font-sans text-slate-800">
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-orange-500" />
          My Shifts &amp; Schedule
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">Next 7 days of your assigned shifts.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {schedule.map((day) => {
          const isToday = day.date === todayIso;
          const style = day.shift_type ? SHIFT_STYLES[day.shift_type] : null;

          return (
            <div
              key={day.date}
              className={`rounded-2xl p-4 border-2 shadow-sm transition-all ${
                isToday
                  ? 'border-orange-400 bg-orange-50'
                  : style
                  ? `${style.bg} ${style.border}`
                  : 'bg-white border-slate-100'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{day.day_name}</p>
                  <p className="text-sm font-extrabold text-slate-800 mt-0.5">
                    {new Date(day.date + 'T00:00:00').toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short',
                    })}
                  </p>
                </div>
                {isToday && (
                  <span className="px-2 py-0.5 bg-orange-500 text-white text-[9px] font-bold rounded-full uppercase">Today</span>
                )}
              </div>

              {day.shift_type ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {style?.icon}
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${style?.badge}`}>
                      {day.shift_type}
                    </span>
                  </div>
                  {day.status && (
                    <span className={`self-start px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${STATUS_BADGE[day.status] ?? 'bg-slate-100 text-slate-500'}`}>
                      {day.status}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 font-semibold mt-1">No shift assigned</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Info callout */}
      <div className="bg-orange-50/40 border border-orange-200/50 p-4 rounded-xl flex items-start gap-3">
        <Info className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
          Shift assignments are managed by your Pump Manager. Contact them for shift changes at least 48 hours in advance.
        </p>
      </div>
    </div>
  );
}
