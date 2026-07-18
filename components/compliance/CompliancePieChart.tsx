'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ComplianceStats } from '../../types/compliance';

interface CompliancePieChartProps {
  stats: ComplianceStats;
  isLoading: boolean;
}

export const CompliancePieChart: React.FC<CompliancePieChartProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary" />
      </div>
    );
  }

  const data = [
    { name: 'Active', value: stats.active, color: '#f97316' },
    { name: 'Expiring Soon', value: stats.expiringSoon, color: '#fdba74' },
    { name: 'Expired', value: stats.expired, color: '#ea580c' },
  ].filter(item => item.value > 0);

  // If no documents exist or all counts are 0, render empty state representation
  const hasData = data.length > 0;
  const chartData = hasData ? data : [{ name: 'No Documents', value: 1, color: '#e2e8f0' }];

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4 text-left h-full min-h-[300px]">
      <h3 className="text-xs font-extrabold text-text-primary uppercase tracking-wider border-b border-slate-50 pb-3">
        Compliance Status Breakdown
      </h3>

      <div className="flex-1 flex items-center justify-center h-48 relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '11px',
                fontFamily: 'Plus Jakarta Sans',
              }}
              formatter={(value: any, name: any) => [hasData ? `${value} docs` : '0 docs', name]}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-7">
          <span className="text-lg font-extrabold text-slate-800 font-mono">
            {stats.total}
          </span>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
            Total Docs
          </span>
        </div>
      </div>

      {/* Custom Legend to match Figma/Premium styling */}
      <div className="flex justify-around items-center text-[10px] font-bold text-slate-500 mt-2 px-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          <span>Active ({stats.active})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-orange-300" />
          <span>Expiring ({stats.expiringSoon})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-orange-700" />
          <span>Expired ({stats.expired})</span>
        </div>
      </div>
    </div>
  );
};
