'use client';

import React, { useEffect, useState } from 'react';
import { IndianRupee, Info, TrendingDown, TrendingUp, Gift, CheckCircle, Clock } from 'lucide-react';
import { salaryService } from '@/services/salary.service';
import { SalarySlip } from '@/types/employee';
import { toast } from '@/components/feedback/Toast';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function MySalaryPage() {
  const [salaries, setSalaries] = useState<SalarySlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SalarySlip | null>(null);

  useEffect(() => {
    salaryService.getSalarySummary()
      .then((data) => {
        setSalaries(data);
        if (data.length > 0) setSelected(data[0]); // latest slip selected by default
      })
      .catch(() => toast.error('Failed to load salary data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-left font-sans">
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <IndianRupee className="h-5 w-5 text-orange-500" />
          Salary & Payroll Ledger
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Check monthly net salary payouts, bonuses, and deductions.
        </p>
      </div>

      {salaries.length === 0 ? (
        <div className="bg-white border border-orange-100 rounded-2xl p-12 text-center text-slate-400 text-xs font-semibold">
          No salary records found. Contact your pump owner.
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6 items-start">

          {/* Slip List */}
          <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm flex flex-col gap-2">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Pay History</h3>
            {salaries.map((slip) => (
              <button
                key={slip.id}
                onClick={() => setSelected(slip)}
                className={`w-full flex justify-between items-center p-3.5 rounded-xl border text-left transition-all cursor-pointer ${selected?.id === slip.id
                    ? 'bg-orange-50 border-orange-300 shadow-sm'
                    : 'bg-slate-50 border-slate-100 hover:border-orange-200'
                  }`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-slate-800">
                    {MONTH_NAMES[slip.month - 1]} {slip.year}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Net: ₹{slip.net_salary.toLocaleString('en-IN')}
                  </span>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${slip.payment_status === 'paid'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                  }`}>
                  {slip.payment_status}
                </span>
              </button>
            ))}
          </div>

          {/* Slip Detail */}
          {selected && (
            <div className="lg:col-span-2 bg-white border border-orange-100 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">
                    {MONTH_NAMES[selected.month - 1]} {selected.year} — Salary Slip
                  </h3>
                  {selected.paid_on && (
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">
                      Paid on {new Date(selected.paid_on).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <span className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-xl border ${selected.payment_status === 'paid'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                  {selected.payment_status === 'paid'
                    ? <CheckCircle className="h-3.5 w-3.5" />
                    : <Clock className="h-3.5 w-3.5" />
                  }
                  {selected.payment_status === 'paid' ? 'PAID' : 'PENDING'}
                </span>
              </div>

              {/* Breakdown */}
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Basic Salary', value: selected.basic_salary, icon: <IndianRupee className="h-4 w-4 text-slate-400" />, color: 'text-slate-800' },
                  { label: 'Bonuses', value: selected.bonuses, icon: <Gift className="h-4 w-4 text-emerald-500" />, color: 'text-emerald-600' },
                  { label: 'Deductions', value: selected.deductions, icon: <TrendingDown className="h-4 w-4 text-rose-500" />, color: 'text-rose-600' },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} className="flex justify-between items-center p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      {icon} {label}
                    </span>
                    <span className={`text-sm font-bold font-mono ${color}`}>
                      {value < 0 ? '-' : ''}₹{Math.abs(value).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}

                {/* Net Total */}
                <div className="flex justify-between items-center p-4 bg-orange-50 border border-orange-200 rounded-xl mt-1">
                  <span className="flex items-center gap-2 text-sm font-extrabold text-orange-700">
                    <TrendingUp className="h-4 w-4" /> Net Salary
                  </span>
                  <span className="text-lg font-extrabold font-mono text-orange-600">
                    ₹{selected.net_salary.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="bg-orange-50/40 border border-orange-100 p-4 rounded-xl flex items-start gap-3">
        <Info className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-slate-800">Tax & Provident Fund</h4>
          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-1">
            Deductions shown are inclusive of PF contribution, professional tax, and state insurance where applicable.
            For discrepancies, contact the accounts desk.
          </p>
        </div>
      </div>
    </div>
  );
}