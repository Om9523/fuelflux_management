'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle2, Percent, TrendingUp } from 'lucide-react';
import { EmployeeProfile } from '@/lib/mock-db';

interface PerformanceCardProps {
  profile: EmployeeProfile | null;
}

export const PerformanceCard: React.FC<PerformanceCardProps> = ({ profile }) => {
  if (!profile) {
    return (
      <div className="bg-white border border-orange-100 rounded-2xl p-6 text-center text-slate-400 text-sm">
        No performance records available.
      </div>
    );
  }

  const { designation, metrics } = profile;

  const getRatingColor = (score: number) => {
    if (score >= 90) return { label: 'Excellent', bg: 'bg-green-50 text-green-600 border-green-150', color: 'text-green-600' };
    if (score >= 80) return { label: 'Good', bg: 'bg-orange-50 text-orange-600 border-orange-150', color: 'text-orange-500' };
    if (score >= 70) return { label: 'Average', bg: 'bg-amber-50 text-amber-600 border-amber-150', color: 'text-amber-500' };
    return { label: 'Needs Improvement', bg: 'bg-rose-50 text-rose-600 border-rose-150', color: 'text-rose-500' };
  };

  const rating = getRatingColor(metrics.performanceScore);

  const renderAttendantMetrics = () => (
    <div className="grid sm:grid-cols-3 gap-4">
      {/* Metric 1 */}
      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fuel Dispensed</span>
        <h4 className="text-xl font-extrabold text-slate-800 mt-1">14,250 L</h4>
        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
          <div className="bg-orange-500 h-full rounded-full" style={{ width: '85%' }} />
        </div>
        <p className="text-[9px] text-slate-400 mt-1.5 font-semibold">Target: 15,000 L (95% achieved)</p>
      </div>
      {/* Metric 2 */}
      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transactions Handled</span>
        <h4 className="text-xl font-extrabold text-slate-800 mt-1">{metrics.transactionsHandled}</h4>
        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
          <div className="bg-orange-500 h-full rounded-full" style={{ width: '78%' }} />
        </div>
        <p className="text-[9px] text-slate-400 mt-1.5 font-semibold">Monthly roster transaction count</p>
      </div>
      {/* Metric 3 */}
      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance Score</span>
        <h4 className="text-xl font-extrabold text-slate-800 mt-1">{metrics.attendanceScore}%</h4>
        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
          <div className="bg-green-500 h-full rounded-full" style={{ width: `${metrics.attendanceScore}%` }} />
        </div>
        <p className="text-[9px] text-slate-400 mt-1.5 font-semibold">Goal: 95% threshold</p>
      </div>
    </div>
  );

  const renderCashierMetrics = () => (
    <div className="grid sm:grid-cols-3 gap-4">
      {/* Metric 1 */}
      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transactions Processed</span>
        <h4 className="text-xl font-extrabold text-slate-800 mt-1">{metrics.transactionsHandled}</h4>
        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
          <div className="bg-orange-500 h-full rounded-full" style={{ width: '80%' }} />
        </div>
        <p className="text-[9px] text-slate-400 mt-1.5 font-semibold">Billing terminal reconciliations</p>
      </div>
      {/* Metric 2 */}
      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cash Accuracy</span>
        <h4 className="text-xl font-extrabold text-slate-800 mt-1">{metrics.cashAccuracy || 99.8}%</h4>
        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
          <div className="bg-green-500 h-full rounded-full" style={{ width: `${metrics.cashAccuracy || 99.8}%` }} />
        </div>
        <p className="text-[9px] text-slate-400 mt-1.5 font-semibold">Mismatch: ±0.2% tolerance</p>
      </div>
      {/* Metric 3 */}
      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance Score</span>
        <h4 className="text-xl font-extrabold text-slate-800 mt-1">{metrics.attendanceScore}%</h4>
        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
          <div className="bg-green-500 h-full rounded-full" style={{ width: `${metrics.attendanceScore}%` }} />
        </div>
        <p className="text-[9px] text-slate-400 mt-1.5 font-semibold">Goal: 95% threshold</p>
      </div>
    </div>
  );

  const renderSupervisorMetrics = () => (
    <div className="grid sm:grid-cols-3 gap-4">
      {/* Metric 1 */}
      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Team Attendance</span>
        <h4 className="text-xl font-extrabold text-slate-800 mt-1">{metrics.teamAttendance || 94}%</h4>
        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
          <div className="bg-orange-500 h-full rounded-full" style={{ width: `${metrics.teamAttendance || 94}%` }} />
        </div>
        <p className="text-[9px] text-slate-400 mt-1.5 font-semibold">Attendants roster coverage</p>
      </div>
      {/* Metric 2 */}
      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operational Compliance</span>
        <h4 className="text-xl font-extrabold text-slate-800 mt-1">{metrics.operationalCompliance || 98}%</h4>
        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
          <div className="bg-green-500 h-full rounded-full" style={{ width: `${metrics.operationalCompliance || 98}%` }} />
        </div>
        <p className="text-[9px] text-slate-400 mt-1.5 font-semibold">Safety checks & decanting logs</p>
      </div>
      {/* Metric 3 */}
      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Rating score</span>
        <h4 className="text-xl font-extrabold text-slate-800 mt-1">{metrics.performanceScore}%</h4>
        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
          <div className="bg-orange-500 h-full rounded-full" style={{ width: `${metrics.performanceScore}%` }} />
        </div>
        <p className="text-[9px] text-slate-400 mt-1.5 font-semibold">KPI Scoreweight target: 90%</p>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-orange-100 rounded-2xl p-6 shadow-sm flex flex-col gap-6 text-left"
    >
      {/* Header info */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-50 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-850">Performance Overview</h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Role metrics tracked for your profile designation: {designation}.</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl font-bold text-xs self-start sm:self-auto ${rating.bg}`}>
          <Award className="h-4 w-4" />
          Rating: {rating.label}
        </div>
      </div>

      {/* Role specific rendering */}
      <div>
        {designation === 'Fuel Attendant' && renderAttendantMetrics()}
        {designation === 'Cashier' && renderCashierMetrics()}
        {designation === 'Supervisor' && renderSupervisorMetrics()}
      </div>

      {/* Roster tips */}
      <div className="bg-orange-50/40 border border-orange-150/50 p-4 rounded-xl flex items-start gap-3 mt-2">
        <TrendingUp className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-slate-850">Performance Score Tip</h4>
          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-1">
            Keep shift check-ins punctual. Completing digital reconciliations within 15 minutes of shift-end directly increments your compliance and performance rating.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
export default PerformanceCard;
