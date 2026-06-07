'use client';

import React, { useEffect, useState } from 'react';
import { DollarSign, IndianRupee, Info } from 'lucide-react';
import { SalaryCard } from '@/components/employee/SalaryCard';
import { salaryService } from '@/services/salary.service';
import { SalaryRecord } from '@/lib/mock-db';
import { toast } from '@/components/feedback/Toast';

export default function MySalaryPage() {
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    salaryService.getSalarySummary()
      .then((data) => setSalaries(data))
      .catch(() => toast.error('Failed to load salary summaries'))
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
          <IndianRupee className="h-5.5 w-5.5 text-orange-500" />
          Salary & Payroll Ledger
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">Check monthly net salary payouts, overtime bonuses, and download PDF payslips.</p>
      </div>

      <SalaryCard salaries={salaries} />

      {/* Roster tips */}
      <div className="bg-orange-50/40 border border-orange-150/40 p-4 rounded-xl flex items-start gap-3 mt-2">
        <Info className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-slate-850">Tax and Provident Fund Information</h4>
          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-1">
            Deductions shown are inclusive of PF contribution, professional tax, and state insurance policies where applicable. For questions regarding customized incentives or roster overtime logs discrepancy, please check with the Accounts desk.
          </p>
        </div>
      </div>
    </div>
  );
}
