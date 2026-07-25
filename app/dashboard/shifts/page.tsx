'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, ChevronLeft, ChevronRight, Sun, Sunset, Moon, X, Loader2,
  User, Plus, RefreshCw
} from 'lucide-react';
import backendApi from '@/lib/backendApi';
import { toast } from '@/components/feedback/Toast';

// ── Types ──────────────────────────────────────────────────────────────────────
const SHIFT_TYPES = ['Morning', 'Evening', 'Night'] as const;
type ShiftType = typeof SHIFT_TYPES[number];

interface ShiftCell {
  id: string;
  attendant_id: string;
  attendant_name: string | null;
  shift_type: ShiftType;
  status: string;
}

interface WeekGrid {
  [date: string]: { Morning: ShiftCell | null; Evening: ShiftCell | null; Night: ShiftCell | null };
}

interface Employee { id: string; name: string; employee_id: string; }

const SHIFT_STYLES: Record<ShiftType, { bg: string; border: string; badge: string; icon: React.ReactNode; textColor: string }> = {
  Morning: { bg: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700',     icon: <Sun className="h-3 w-3 text-blue-500" />,    textColor: 'text-blue-700' },
  Evening: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', icon: <Sunset className="h-3 w-3 text-orange-500" />, textColor: 'text-orange-700' },
  Night:   { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700', icon: <Moon className="h-3 w-3 text-purple-500" />,   textColor: 'text-purple-700' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function getMondayOf(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateISO(d: Date) {
  return d.toISOString().split('T')[0];
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function ShiftsPage() {
  const [weekStart, setWeekStart] = useState<Date>(getMondayOf(new Date()));
  const [grid, setGrid] = useState<WeekGrid>({});
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ date: string; shiftType: ShiftType } | null>(null);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [assigning, setAssigning] = useState(false);

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const fetchWeek = useCallback(() => {
    setLoading(true);
    backendApi.get('/shifts/weekly', { params: { start_date: formatDateISO(weekStart) } })
      .then((r) => setGrid(r.data.grid ?? {}))
      .catch(() => toast.error('Failed to load shifts'))
      .finally(() => setLoading(false));
  }, [weekStart]);

  useEffect(() => { fetchWeek(); }, [fetchWeek]);

  useEffect(() => {
    backendApi.get('/attendants/my-attendants')
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : (r.data.data ?? []);
        setEmployees(list);
      })
      .catch(() => {});
  }, []);

  const prevWeek = () => setWeekStart((d) => addDays(d, -7));
  const nextWeek = () => setWeekStart((d) => addDays(d, 7));

  const openModal = (date: string, shiftType: ShiftType) => {
    setModal({ date, shiftType });
    setSelectedEmp('');
  };

  const handleAssign = async () => {
    if (!modal || !selectedEmp) { toast.error('Select an employee.'); return; }
    setAssigning(true);
    try {
      await backendApi.post('/shifts/assign', {
        attendant_id: selectedEmp,
        date: modal.date,
        shift_type: modal.shiftType,
      });
      toast.success('Shift assigned successfully.');
      setModal(null);
      fetchWeek();
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign shift.');
    } finally {
      setAssigning(false);
    }
  };

  const todayISO = formatDateISO(new Date());

  return (
    <div className="flex flex-col gap-6 font-plus-jakarta text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-orange-500" /> Weekly Shift Planner
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">Assign and manage employee shifts.</p>
        </div>
        <button onClick={fetchWeek}
          className="inline-flex items-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl px-4 py-2.5 transition cursor-pointer">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Week Nav */}
      <div className="flex items-center gap-3">
        <button onClick={prevWeek} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer">
          <ChevronLeft className="h-4 w-4 text-slate-500" />
        </button>
        <span className="text-sm font-bold text-slate-700 min-w-[200px] text-center">
          {weekDates[0].toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} –{' '}
          {weekDates[6].toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
        <button onClick={nextWeek} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer">
          <ChevronRight className="h-4 w-4 text-slate-500" />
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {SHIFT_TYPES.map((st) => {
          const s = SHIFT_STYLES[st];
          return (
            <div key={st} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${s.border} ${s.bg}`}>
              {s.icon}
              <span className={`text-[10px] font-bold ${s.textColor}`}>{st}</span>
            </div>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-orange-500" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr>
                <th className="p-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider w-24">Shift</th>
                {weekDates.map((d) => {
                  const iso = formatDateISO(d);
                  const isToday = iso === todayISO;
                  return (
                    <th key={iso} className={`p-3 text-center text-[10px] font-bold uppercase tracking-wider ${isToday ? 'text-orange-500' : 'text-slate-400'}`}>
                      <div>{d.toLocaleDateString('en-IN', { weekday: 'short' })}</div>
                      <div className={`mt-0.5 font-extrabold text-sm ${isToday ? 'text-orange-500' : 'text-slate-700'}`}>
                        {d.getDate()}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {SHIFT_TYPES.map((shiftType) => {
                const s = SHIFT_STYLES[shiftType];
                return (
                  <tr key={shiftType}>
                    <td className={`p-3 rounded-l-xl`}>
                      <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${s.badge} font-bold text-[10px] uppercase w-fit`}>
                        {s.icon} {shiftType}
                      </div>
                    </td>
                    {weekDates.map((d) => {
                      const iso = formatDateISO(d);
                      const cell = grid[iso]?.[shiftType] ?? null;
                      const isToday = iso === todayISO;

                      return (
                        <td key={iso} className={`p-2 align-top border-l border-slate-100 ${isToday ? 'bg-orange-50/20' : ''}`}>
                          {cell ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`rounded-xl p-2.5 border ${s.border} ${s.bg} flex flex-col gap-1 min-h-[56px]`}
                            >
                              <div className="flex items-center gap-1.5">
                                <div className="h-5 w-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[8px] font-extrabold text-slate-600 shrink-0">
                                  {(cell.attendant_name ?? '?').charAt(0)}
                                </div>
                                <span className="text-[10px] font-bold text-slate-700 leading-tight line-clamp-1">
                                  {cell.attendant_name ?? 'Unknown'}
                                </span>
                              </div>
                              <span className={`self-start px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                cell.status === 'covered' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {cell.status}
                              </span>
                            </motion.div>
                          ) : (
                            <button
                              onClick={() => openModal(iso, shiftType)}
                              className="w-full min-h-[56px] rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 hover:border-orange-400 hover:bg-orange-50/30 transition group cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5 text-slate-300 group-hover:text-orange-400 transition" />
                              <span className="text-[9px] font-bold text-slate-300 group-hover:text-orange-400 transition">Assign</span>
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Shift Modal */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModal(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 z-10"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-5">
                <div>
                  <h3 className="text-sm font-extrabold flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-orange-500" /> Assign Shift
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    {modal.date} · {modal.shiftType}
                  </p>
                </div>
                <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" /> Select Employee
                  </label>
                  <select
                    value={selectedEmp}
                    onChange={(e) => setSelectedEmp(e.target.value)}
                    className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer"
                  >
                    <option value="">— Choose Employee —</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>{e.name} ({e.employee_id})</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-2 border-t border-slate-100">
                  <button onClick={() => setModal(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer">
                    Cancel
                  </button>
                  <button onClick={handleAssign} disabled={!selectedEmp || assigning}
                    className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60">
                    {assigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    {assigning ? 'Assigning...' : 'Assign'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
