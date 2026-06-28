'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Fuel, FileCheck, Users, Truck, IndianRupee, MessageSquare, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAdminStore } from '@/stores/admin.store';
import { useAnalyticsStore } from '@/stores/analytics.store';
import { useAuditStore } from '@/stores/audit.store';
import {
  AdminKpiCard,
  ApprovalCard,
  RiskCard,
  RevenueCard,
  PlatformHealthWidget,
  FraudAlertPanel,
  UserGrowthChart
} from '@/components/admin/Widgets';
import { toast } from '@/components/feedback/Toast';

export default function AdminDashboardPage() {
  const router = useRouter();

  const {
    pumps,
    owners,
    logistics,
    supportTickets,
    fetchPumps,
    fetchOwners,
    fetchLogistics,
    fetchSupportTickets,
    updatePumpStatus
  } = useAdminStore();

  const {
    mrr,
    arr,
    activeSubscriptionsCount,
    revenueGrowthHistory,
    fetchAnalytics
  } = useAnalyticsStore();

  const {
    auditLogs,
    fraudAlerts,
    fetchAuditLogs,
    fetchFraudAlerts,
    resolveFraudAlert
  } = useAuditStore();

  const loadData = async () => {
    try {
      await Promise.all([
        fetchPumps(),
        fetchOwners(),
        fetchLogistics(),
        fetchSupportTickets(),
        fetchAnalytics(),
        fetchAuditLogs(),
        fetchFraudAlerts(),
      ]);
    } catch (e) {
      toast.error('Failed to sync operations data.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter pending pumps
  const pendingPumps = pumps.filter((p) => p.status === 'pending');
  const activeFraudAlerts = fraudAlerts.filter((a) => a.status === 'active');
  const openTickets = supportTickets.filter((t) => t.status === 'open');

  const handleApprovePump = async (id: string) => {
    try {
      await updatePumpStatus(id, 'approved');
      toast.success('Pump registration activated successfully.');
      loadData();
    } catch (e) {
      toast.error('Failed to approve pump.');
    }
  };

  const handleRejectPump = async (id: string) => {
    try {
      await updatePumpStatus(id, 'rejected');
      toast.success('Pump registration rejected.');
      loadData();
    } catch (e) {
      toast.error('Failed to reject pump.');
    }
  };

  const handleResolveAlert = async (id: string) => {
    try {
      await resolveFraudAlert(id, 'resolved');
      toast.success('Security alert cleared.');
      loadData();
    } catch (e) {
      toast.error('Failed to resolve threat.');
    }
  };

  const navigateToApproval = (id: string) => {
    router.push('/admin/pending');
  };

  return (
    <div className="space-y-6">
      {/* Title Panel */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Control Center Overview
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Real-time platform metrics and core operation queues.
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors cursor-pointer outline-none active:scale-95"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Sync Control Center
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <AdminKpiCard
          title="Registered Pumps"
          value={pumps.length}
          icon={<Fuel className="h-5 w-5 text-blue-500" />}
          description="Total Fuel Stations"
        />
        <AdminKpiCard
          title="Pending Approvals"
          value={pendingPumps.length}
          icon={<FileCheck className="h-5 w-5 text-amber-500" />}
          change={pendingPumps.length > 0 ? `${pendingPumps.length} actions` : 'Clean queue'}
          changeType={pendingPumps.length > 0 ? 'negative' : 'positive'}
          description="Awaiting verification"
        />
        <AdminKpiCard
          title="Active Owners"
          value={owners.length}
          icon={<Users className="h-5 w-5 text-emerald-500" />}
          description="Registered Pump Owners"
        />
        <AdminKpiCard
          title="Logistics Fleets"
          value={logistics.length}
          icon={<Truck className="h-5 w-5 text-indigo-500" />}
          description="Partner logistics companies"
        />
        <AdminKpiCard
          title="MRR Recurring"
          value={`Γé╣${mrr.toLocaleString('en-IN')}`}
          icon={<IndianRupee className="h-5 w-5 text-orange-500" />}
          change="+12.4%"
          changeType="positive"
          description="Active station licenses"
        />
        <AdminKpiCard
          title="Open Tickets"
          value={openTickets.length}
          icon={<MessageSquare className="h-5 w-5 text-rose-500" />}
          change={openTickets.length > 0 ? 'Needs agent' : 'Clean'}
          changeType={openTickets.length > 0 ? 'negative' : 'positive'}
          description="Unresolved complaints"
        />
      </div>

      {/* Main Grid Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Charts and Approvals */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Registration Chart */}
          <UserGrowthChart data={revenueGrowthHistory} />

          {/* Pending Approval Queue */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                Pending Registration Approvals ({pendingPumps.length})
              </h3>
              <button
                onClick={() => router.push('/admin/pending')}
                className="text-xs font-bold text-orange-500 hover:text-orange-600 outline-none hover:underline"
              >
                View all queue
              </button>
            </div>

            {pendingPumps.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs font-semibold text-slate-400">
                All pump registrations verified. Operational queue is empty.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingPumps.slice(0, 2).map((pump) => (
                  <ApprovalCard
                    key={pump.id}
                    pump={pump}
                    onApprove={handleApprovePump}
                    onReject={handleRejectPump}
                    onView={navigateToApproval}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recent Operations Activity logs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Recent Operations Feed
              </span>
              <button
                onClick={() => router.push('/admin/audit')}
                className="text-xs font-bold text-orange-500 hover:underline outline-none"
              >
                Audits logs
              </button>
            </div>
            <div className="space-y-3.5">
              {auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="flex justify-between items-start text-xs font-semibold">
                  <div className="space-y-0.5">
                    <span className="text-slate-800 block leading-tight">{log.action}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      By {log.adminName} ({log.ipAddress})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Finance widgets, security alerts, and system health */}
        <div className="space-y-6">
          {/* Revenue Widget */}
          <RevenueCard mrr={mrr} arr={arr} activeCount={activeSubscriptionsCount} />

          {/* Security threats panel */}
          <FraudAlertPanel alerts={activeFraudAlerts} onResolve={handleResolveAlert} />

          {/* System diagnostics */}
          <PlatformHealthWidget />
        </div>
      </div>
    </div>
  );
}
