'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, IndianRupee } from 'lucide-react';
import { SalaryRecord } from '@/lib/mock-db';
import { toast } from '@/components/feedback/Toast';

interface SalaryCardProps {
  salaries: SalaryRecord[];
}

export const SalaryCard: React.FC<SalaryCardProps> = ({ salaries }) => {
  const latestSalary = salaries[0];

  const handleDownloadPayslip = (record: SalaryRecord) => {
    toast.info(`Downloading Payslip for ${record.month}...`);
    setTimeout(() => {
      toast.success(`Payslip_${record.month.replace(' ', '_')}.pdf saved successfully!`);
    }, 1500);
  };

  if (salaries.length === 0) {
    return (
      <div className="bg-white border border-orange-100 rounded-2xl p-6 text-center text-slate-400 text-sm">
        No salary breakdown records found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Latest Month Breakdown */}
      {latestSalary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-orange-100 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex justify-between items-center border-b border-slate-50 pb-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-850">Latest Payout Summary</h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Pay cycle record: {latestSalary.month}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net Take-Home Pay</span>
              <span className="text-2xl font-extrabold text-orange-500 tracking-tight flex items-center justify-end mt-0.5">
                <IndianRupee className="h-5 w-5 shrink-0" />
                {latestSalary.netPay.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Base Salary</span>
              <span className="text-sm font-bold text-slate-800 mt-1 block font-mono">Γé╣{latestSalary.monthlySalary.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overtime Pay</span>
              <span className="text-sm font-bold text-green-600 mt-1 block font-mono">+Γé╣{latestSalary.overtimePay.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Shift Bonuses</span>
              <span className="text-sm font-bold text-green-600 mt-1 block font-mono">+Γé╣{latestSalary.bonus.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Deductions</span>
              <span className="text-sm font-bold text-rose-600 mt-1 block font-mono">-Γé╣{latestSalary.deductions.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attendance Rate</span>
              <span className="text-sm font-bold text-slate-800 mt-1 block">{latestSalary.attendanceRate}%</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end">
            <button
              onClick={() => handleDownloadPayslip(latestSalary)}
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-500 hover:text-orange-700 font-bold rounded-xl text-xs transition-colors cursor-pointer border border-orange-150/40"
            >
              <Download className="h-3.5 w-3.5" />
              Download Payslip PDF
            </button>
          </div>
        </motion.div>
      )}

      {/* Salary History Ledger */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-orange-100 rounded-2xl p-6 shadow-sm"
      >
        <h3 className="text-sm font-bold text-slate-850 mb-4">Historical Pay Records</h3>
        <div className="border border-slate-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <th className="px-4 py-3 text-left">Pay Period</th>
                  <th className="px-4 py-3 text-left">Base Pay</th>
                  <th className="px-4 py-3 text-left">Additions (OT + Bonus)</th>
                  <th className="px-4 py-3 text-left">Deductions</th>
                  <th className="px-4 py-3 text-left">Net Pay</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {salaries.map((rec) => {
                  const additions = rec.overtimePay + rec.bonus;
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <span>{rec.month}</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono">Γé╣{rec.monthlySalary.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3.5 font-mono text-green-600">+Γé╣{additions.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3.5 font-mono text-rose-600">-Γé╣{rec.deductions.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3.5 font-bold font-mono text-slate-800">Γé╣{rec.netPay.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleDownloadPayslip(rec)}
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-orange-50 text-slate-450 hover:text-orange-500 border border-slate-200/60 hover:border-orange-100 cursor-pointer outline-none transition-colors"
                          title="Download Payslip"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default SalaryCard;
