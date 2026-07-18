'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Check, X, ShieldAlert, Heart, Activity } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Pump, FraudAlert } from '@/lib/mock-db';

// 1. KPI CARD
export const AdminKpiCard: React.FC<{
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  description?: string;
}> = ({ title, value, change, changeType = 'neutral', icon, description }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {title}
          </span>
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight block">
            {value}
          </span>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 shrink-0">
          {icon}
        </div>
      </div>
      
      {(change || description) && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100/80">
          {change && (
            <span className={`
              text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0
              ${changeType === 'positive' && 'bg-emerald-50 text-emerald-600 border border-emerald-100'}
              ${changeType === 'negative' && 'bg-rose-50 text-rose-600 border border-rose-100'}
              ${changeType === 'neutral' && 'bg-slate-50 text-slate-600 border border-slate-100'}
            `}>
              {changeType === 'positive' && <ArrowUpRight className="h-3 w-3" />}
              {changeType === 'negative' && <ArrowDownRight className="h-3 w-3" />}
              {change}
            </span>
          )}
          {description && (
            <span className="text-[10px] font-bold text-slate-400 truncate">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// 2. APPROVAL CARD
export const ApprovalCard: React.FC<{
  pump: Pump;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onView: (id: string) => void;
}> = ({ pump, onApprove, onReject, onView }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-orange-500/30 transition-colors">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
            {pump.name}
          </h4>
          <p className="text-[10px] font-semibold text-slate-400">
            {pump.city}, {pump.state}
          </p>
        </div>
        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 border border-amber-100 rounded-full uppercase shrink-0">
          Pending
        </span>
      </div>

      <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-xs space-y-1.5 font-semibold text-slate-600">
        <div className="flex justify-between">
          <span>Owner:</span>
          <span className="text-slate-800 font-bold">{pump.ownerName}</span>
        </div>
        <div className="flex justify-between">
          <span>License:</span>
          <span className="text-slate-800 font-mono">{pump.licenseNumber}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onView(pump.id)}
          className="flex-1 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors outline-none"
        >
          Verify Docs
        </button>
        <button
          onClick={() => onApprove(pump.id)}
          className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl cursor-pointer transition-colors outline-none"
          title="Approve immediately"
        >
          <Check className="h-4.5 w-4.5" />
        </button>
        <button
          onClick={() => onReject(pump.id)}
          className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl cursor-pointer transition-colors outline-none"
          title="Reject immediately"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
};

// 3. RISK ALERT CARD
export const RiskCard: React.FC<{
  alert: FraudAlert;
  onResolve: (id: string) => void;
}> = ({ alert, onResolve }) => {
  const levelColors: Record<string, string> = {
    low: 'text-blue-600 bg-blue-50 border-blue-100',
    medium: 'text-amber-600 bg-amber-50 border-amber-100',
    high: 'text-orange-600 bg-orange-50 border-orange-100',
    critical: 'text-rose-600 bg-rose-50 border-rose-100 animate-pulse',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-red-500/20 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex gap-2.5 items-center">
          <div className="p-2 bg-rose-50 text-rose-500 rounded-xl border border-rose-100/55 shrink-0">
            <ShieldAlert className="h-4.5 w-4.5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-extrabold text-slate-800">{alert.type}</h4>
            <span className="text-[9px] font-bold text-slate-400 font-mono">
              {new Date(alert.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
        <span className={`text-[9px] font-extrabold px-2 py-0.5 border rounded-full uppercase shrink-0 ${levelColors[alert.severity]}`}>
          {alert.severity}
        </span>
      </div>

      <p className="text-xs text-slate-500 font-semibold leading-relaxed">
        {alert.description}
      </p>

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100/80">
        <button
          onClick={() => onResolve(alert.id)}
          className="px-3 py-1.5 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-lg cursor-pointer transition-colors outline-none"
        >
          Resolve Threat
        </button>
      </div>
    </div>
  );
};

// 4. REVENUE CARD
export const RevenueCard: React.FC<{
  mrr: number;
  arr: number;
  activeCount: number;
}> = ({ mrr, arr, activeCount }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
        Recurring Subscriptions
      </span>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 block">MRR (Monthly)</span>
          <span className="text-xl font-extrabold text-slate-900 block font-mono">
            Γé╣{mrr.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 block">ARR (Annual)</span>
          <span className="text-xl font-extrabold text-slate-900 block font-mono">
            Γé╣{arr.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
      <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs font-semibold text-slate-500">
        <span>Active Subscriptions</span>
        <span className="font-extrabold text-slate-800">{activeCount} Pumps</span>
      </div>
    </div>
  );
};

// 5. PLATFORM HEALTH WIDGET
export const PlatformHealthWidget: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          System Core Diagnostics
        </span>
        <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-extrabold">
          <Activity className="h-4.5 w-4.5 animate-pulse" />
          <span>Operational</span>
        </div>
      </div>

      <div className="space-y-3 font-semibold text-xs text-slate-600">
        <div className="flex justify-between items-center">
          <span>Kubernetes Clusters</span>
          <span className="text-slate-800">4 Active</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Worker Node Load</span>
          <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5" style={{ width: '42%' }} />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span>Replica DB Nodes</span>
          <span className="text-slate-800">2 Syncing</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Platform Latency</span>
          <span className="text-slate-800 font-mono">18ms (Avg)</span>
        </div>
      </div>
    </div>
  );
};

// 6. FRAUD ALERTS PANEL
export const FraudAlertPanel: React.FC<{
  alerts: FraudAlert[];
  onResolve: (id: string) => void;
}> = ({ alerts, onResolve }) => {
  const levelText: Record<string, string> = {
    low: 'text-blue-600 bg-blue-50 border-blue-100',
    medium: 'text-amber-600 bg-amber-50 border-amber-100',
    high: 'text-orange-600 bg-orange-50 border-orange-100',
    critical: 'text-rose-600 bg-rose-50 border-rose-100 animate-pulse',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Active Threat Intelligence ({alerts.length})
        </span>
        <span className="text-[10px] font-bold text-slate-400">Real-time triggers</span>
      </div>

      <div className="divide-y divide-slate-100 max-h-[280px] overflow-y-auto pr-1">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-xs font-semibold text-slate-400">
            No active threat signals detected.
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="py-3 first:pt-0 last:pb-0 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-slate-800">{alert.type}</span>
                <span className={`text-[8px] font-extrabold px-1.5 py-0.5 border rounded-full uppercase ${levelText[alert.severity]}`}>
                  {alert.severity}
                </span>
              </div>
              <p className="text-[10.5px] text-slate-500 font-medium leading-relaxed">
                {alert.description}
              </p>
              <div className="flex justify-between items-center text-[10px] pt-1">
                <span className="text-slate-400 font-bold">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                <button
                  onClick={() => onResolve(alert.id)}
                  className="text-orange-500 hover:text-orange-600 font-extrabold cursor-pointer outline-none hover:underline"
                >
                  Clear Flag
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// 7. USER REGISTRATION GROWTH CHART (HYDRATION-SAFE)
export const UserGrowthChart: React.FC<{
  data: { month: string; amount: number; registrations: number }[];
}> = ({ data }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 h-72 flex items-center justify-center">
        <div className="animate-pulse flex flex-col gap-2 items-center">
          <div className="h-4 w-24 bg-slate-100 rounded" />
          <div className="h-12 w-48 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Acquisition & Platform Traction
          </span>
          <span className="text-sm font-extrabold text-slate-800 block">
            6-Month Registration Growth
          </span>
        </div>
        <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded-full">
          +48% YoY Growth
        </span>
      </div>

      <div className="h-60 w-full font-semibold text-slate-500">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRegs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '11px',
                fontFamily: 'inherit',
                fontWeight: '600',
              }}
            />
            <Area
              type="monotone"
              dataKey="registrations"
              name="New Registrations"
              stroke="#f97316"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorRegs)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
