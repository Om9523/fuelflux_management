import React from 'react';
import { FileSpreadsheet, Hourglass, Landmark, AlertTriangle } from 'lucide-react';
import { CorporateBillingStats } from '../../types/corporateBilling';

interface BillingStatsProps {
  stats: CorporateBillingStats;
  isLoading: boolean;
}

export const BillingStats: React.FC<BillingStatsProps> = ({ stats, isLoading }) => {
  const cards = [
    {
      label: 'Total Invoices',
      value: stats.totalInvoices,
      subtext: 'Across all clients',
      icon: <FileSpreadsheet className="h-4 w-4" />,
      iconBg: 'bg-orange-50 border border-orange-100 text-primary',
    },
    {
      label: 'Pending Amount',
      value: `₹${stats.pendingAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      subtext: 'Awaiting collections',
      icon: <Hourglass className="h-4 w-4" />,
      iconBg: 'bg-orange-100/50 border border-orange-200 text-orange-600',
    },
    {
      label: 'Paid This Month',
      value: `₹${stats.paidThisMonth.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      subtext: 'Current month revenue',
      icon: <Landmark className="h-4 w-4" />,
      iconBg: 'bg-white border border-orange-200 text-primary',
    },
    {
      label: 'Overdue Amount',
      value: `₹${stats.overdueAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      subtext: 'Requires collection push',
      icon: <AlertTriangle className="h-4 w-4" />,
      iconBg: 'bg-orange-950/10 border border-orange-950/20 text-orange-900',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3 relative overflow-hidden text-left"
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
              {card.label}
            </span>
            <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${card.iconBg}`}>
              {card.icon}
            </div>
          </div>
          <div>
            {isLoading ? (
              <div className="h-7 w-24 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              <div className="text-xl font-extrabold text-text-primary font-mono leading-none tracking-tight">
                {card.value}
              </div>
            )}
            <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5 mt-1.5">
              {card.subtext}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
