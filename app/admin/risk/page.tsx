'use client';

import React, { useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import { useAuditStore } from '@/stores/audit.store';
import { RiskCard } from '@/components/admin/Widgets';
import { toast } from '@/components/feedback/Toast';

export default function AdminRiskPage() {
  const { fraudAlerts, fetchFraudAlerts, resolveFraudAlert, isLoading } = useAuditStore();

  useEffect(() => {
    fetchFraudAlerts();
  }, []);

  const activeAlerts = fraudAlerts.filter((a) => a.status === 'active');
  const resolvedAlerts = fraudAlerts.filter((a) => a.status === 'resolved');

  const handleClearAlert = async (id: string) => {
    try {
      await resolveFraudAlert(id, 'resolved');
      toast.success('Security alert cleared and logged.');
      fetchFraudAlerts();
    } catch (e) {
      toast.error('Failed to clear flag.');
    }
  };

  const getLevelBadge = (level: string) => {
    const levels = {
      low: 'bg-blue-50 text-blue-600 border-blue-100',
      medium: 'bg-amber-50 text-amber-600 border-amber-100',
      high: 'bg-orange-50 text-orange-600 border-orange-100',
      critical: 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse',
    };
    return (
      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 border rounded-full uppercase ${(levels as any)[level]}`}>
        {level}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Risk & Fraud Intelligence Center
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Auditing abnormal fill patterns, credit limits breaches, duplicate user registrations, and clearing alerts.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Active Threat Signals</span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{activeAlerts.length} Flags</span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-500 rounded-xl border border-rose-100 shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Resolved Threats (24h)</span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{resolvedAlerts.length} cleared</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl border border-emerald-100 shrink-0">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Platform Threat Rating</span>
            <span className="text-2xl font-extrabold text-slate-900">LOW LEVEL</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-500 rounded-xl border border-blue-100 shrink-0">
            <Shield className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Alerts Grid & History Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Risk Cards (Left 2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Critical Security Incidents Awaiting Audit ({activeAlerts.length})
          </h3>
          {isLoading ? (
            <div className="text-center py-10 text-xs font-bold text-slate-400">Syncing security vaults...</div>
          ) : activeAlerts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-xs font-bold text-slate-400">
              No active security incidents detected. Platform is fully secured.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeAlerts.map((alert) => (
                <RiskCard key={alert.id} alert={alert} onResolve={handleClearAlert} />
              ))}
            </div>
          )}
        </div>

        {/* Resolved History Table (Right Col) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Audit Trails (Resolved Flags)
            </h3>
          </div>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {resolvedAlerts.length === 0 ? (
              <div className="text-center py-10 text-xs font-semibold text-slate-400">
                No resolved incidents registered.
              </div>
            ) : (
              resolvedAlerts.map((alert) => (
                <div key={alert.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50/40 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-700">{alert.title}</span>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full uppercase">
                      Cleared
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                    {alert.description}
                  </p>
                  <span className="text-[9px] text-slate-400 block font-mono">
                    Cleared on: {new Date(alert.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
