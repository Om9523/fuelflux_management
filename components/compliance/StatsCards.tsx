import React from 'react';
import { FileText, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';
import { ComplianceStats } from '../../types/compliance';

interface StatsCardsProps {
  stats: ComplianceStats;
  isLoading: boolean;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, isLoading }) => {
  const cards = [
    {
      label: 'Total Documents',
      value: stats.total,
      subtext: 'Registered categories',
      icon: <FileText className="h-4 w-4" />,
      iconBg: 'bg-orange-50 border border-orange-100 text-primary',
    },
    {
      label: 'Active Documents',
      value: stats.active,
      subtext: 'Fully compliant',
      icon: <CheckCircle className="h-4 w-4" />,
      iconBg: 'bg-white border border-orange-200 text-primary',
    },
    {
      label: 'Expiring Soon',
      value: stats.expiringSoon,
      subtext: 'Requires attention',
      icon: <AlertTriangle className="h-4 w-4" />,
      iconBg: 'bg-orange-100/50 border border-orange-200 text-orange-600',
    },
    {
      label: 'Expired Documents',
      value: stats.expired,
      subtext: 'Action required immediately',
      icon: <AlertOctagon className="h-4 w-4" />,
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
              <div className="h-7 w-16 bg-slate-100 rounded-lg animate-pulse" />
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
