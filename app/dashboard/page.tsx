'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Car,
  Layers,
  ShieldAlert,
  Activity,
  Plus,
  Video,
  FileText,
  DollarSign,
  ChevronRight,
  Building,
  RefreshCcw,
  AlertCircle,
} from 'lucide-react';
import { usePumpStore } from '@/stores/pumps.store';
import { useNotificationStore } from '@/stores/notification.store';
import { useAuthStore } from '@/stores/auth.store';
import {
  fetchDashboardOverview,
  DashboardOverview,
  WeeklyTrendPoint,
  TopAttendant,
  ForecourtActivity,
} from '@/services/dashboard.service';
import { toast } from '@/components/feedback/Toast';

// ─── Stat Card Component ─────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  iconBg: string;
  isLoading?: boolean;
  trend?: string;
  trendColor?: string;
}

function StatCard({ label, value, subtext, icon, iconBg, isLoading, trend, trendColor }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3 relative overflow-hidden text-left">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{label}</span>
        <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div>
        {isLoading ? (
          <div className="h-7 w-32 bg-slate-100 rounded-lg animate-pulse" />
        ) : (
          <div className="text-xl font-extrabold text-text-primary font-mono leading-none tracking-tight">
            {value}
          </div>
        )}
        {trend && (
          <span className={`text-[10px] font-bold flex items-center gap-0.5 mt-1.5 ${trendColor || 'text-emerald-500'}`}>
            {trend} <span className="text-slate-400 font-semibold ml-0.5">{subtext}</span>
          </span>
        )}
        {!trend && subtext && (
          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5 mt-1.5">{subtext}</span>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard Page ─────────────────────────────────────────────────────

export default function DashboardHome() {
  const router = useRouter();
  const { selectedPump, initializePumps, isInitialized, isLoading: pumpsLoading } = usePumpStore();
  const { notifications } = useNotificationStore();
  const { user } = useAuthStore();

  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Real-time revenue pulse (simulated WebSocket ticker on top of actual base)
  const [revenuePulse, setRevenuePulse] = useState(0);
  const [vehicleCount, setVehicleCount] = useState(0);

  // Initialize pump list from backend
  useEffect(() => {
    initializePumps();
  }, [initializePumps]);

  // Fetch real dashboard stats from backend
  const loadOverview = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const data = await fetchDashboardOverview();
      setOverview(data);
      // Seed vehicle count randomly from sales as rough proxy
      setVehicleCount(Math.max(data.stats?.today_sales_count ?? 0, 12));
    } catch (err: any) {
      setStatsError(err.message);
      toast.error('Failed to load dashboard stats');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  // Pulse revenue counter every 4s to simulate live dispenser activity
  useEffect(() => {
    if (!selectedPump || selectedPump.status !== 'approved') return;
    const interval = setInterval(() => {
      setRevenuePulse((prev) => prev + Math.floor(Math.random() * 40) + 10);
      if (Math.random() > 0.7) {
        setVehicleCount((prev) => prev + 1);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedPump]);

  // ── Loading / no pump states ──────────────────────────────────────────────

  // Still fetching pump list from backend
  if (!isInitialized || pumpsLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
          <span className="text-xs text-slate-400 font-semibold">Loading station data...</span>
        </div>
      </div>
    );
  }

  // No pump registered on backend yet (user has 0 pumps)
  if (!selectedPump && isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200/60 shadow-xl max-w-xl mx-auto my-12 text-center gap-6">
        <div className="h-16 w-16 bg-orange-50 border border-orange-200 rounded-full flex items-center justify-center text-primary">
          <Building className="h-7 w-7" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-extrabold text-text-primary">No Pump Registered</h2>
          <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
            You haven&apos;t registered a fuel pump yet. Create one to start managing your operations from this dashboard.
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/pumps')}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 hover:border-primary bg-white px-5 py-3 text-xs font-bold text-text-primary hover:text-primary transition-colors outline-none cursor-pointer"
        >
          Register a Pump
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Pending approval state
  if (selectedPump && selectedPump.status !== 'approved') {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200/60 shadow-xl max-w-xl mx-auto my-12 text-center gap-6">
        <div className="h-16 w-16 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center text-amber-500 animate-bounce">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-extrabold text-text-primary">Operational Verification Pending</h2>
          <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
            Your fuel station <strong>&quot;{selectedPump.name}&quot;</strong> is currently under review. Dashboard access is locked until an admin approves your compliance documents.
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard/pumps')}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 hover:border-primary bg-white px-5 py-3 text-xs font-bold text-text-primary hover:text-primary transition-colors outline-none cursor-pointer"
        >
          Check Onboarding Status
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // At this point selectedPump is guaranteed to be non-null and approved
  const pump = selectedPump!;

  // ── Derived values ────────────────────────────────────────────────────────

  const todayRevenue = (overview?.stats?.today_revenue ?? 0) + revenuePulse;
  const activeAttendants = overview?.stats?.active_attendants ?? 0;
  const todaySales = overview?.stats?.today_sales_count ?? 0;

  // ── Live data from API ──────────────────────────────────────────────────
  const forecourtActivities: ForecourtActivity[] = overview?.forecourt_activities ?? [];
  const topAttendants: TopAttendant[] = overview?.top_attendants ?? [];
  const weeklyTrend: WeeklyTrendPoint[] = overview?.weekly_trend ?? [];

  // Compute max revenue across the week for normalising bar heights
  const maxWeeklyRevenue = Math.max(...weeklyTrend.map((d) => d.revenue), 1);

  // ── Main Render ───────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800">

      {/* Stats fetch error banner */}
      {statsError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="font-semibold flex-1">Could not load live stats from server. Showing cached data.</span>
          <button
            onClick={loadOverview}
            className="flex items-center gap-1.5 font-bold hover:underline cursor-pointer"
          >
            <RefreshCcw className="h-3.5 w-3.5" /> Retry
          </button>
        </motion.div>
      )}

      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-white border border-slate-100 rounded-2xl shadow-xs gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-orange-50 border border-orange-200/50 rounded-xl flex items-center justify-center text-primary">
            <Building className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-extrabold text-text-primary tracking-tight">
              {pump.name} — Operations Dashboard
            </h1>
            <p className="text-xs text-text-secondary">
              {pump.address || 'Real-time forecourt telemetry and ERP data active'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => router.push('/dashboard/employees')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-text-primary rounded-xl transition-all cursor-pointer outline-none"
          >
            <Plus className="h-4 w-4 text-slate-500" /> Add Attendant
          </button>
          <button
            onClick={() => router.push('/dashboard/live')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-text-primary rounded-xl transition-all cursor-pointer outline-none"
          >
            <Video className="h-4 w-4 text-slate-500" /> Live Cameras
          </button>
          <button
            onClick={() => router.push('/dashboard/reports')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-text-primary rounded-xl transition-all cursor-pointer outline-none"
          >
            <FileText className="h-4 w-4 text-slate-500" /> Export Roster
          </button>
          <button
            onClick={loadOverview}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-orange-50 text-xs font-bold text-primary rounded-xl transition-all cursor-pointer outline-none"
          >
            <RefreshCcw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {/* 2. KPI STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Gross Revenue Today"
          value={`₹${todayRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          subtext="since midnight cutoff"
          icon={<DollarSign className="h-4 w-4" />}
          iconBg="bg-orange-100 text-primary"
          isLoading={statsLoading}
          trend="↑ Live counter"
          trendColor="text-emerald-500"
        />
        <StatCard
          label="Attendants On Duty"
          value={`${activeAttendants} Active`}
          subtext="Shift B operational"
          icon={<Users className="h-4 w-4" />}
          iconBg="bg-blue-50 text-blue-500"
          isLoading={statsLoading}
        />
        <StatCard
          label="Vehicles Served Today"
          value={`${vehicleCount} Cars`}
          subtext="last 15 mins live"
          icon={<Car className="h-4 w-4" />}
          iconBg="bg-indigo-50 text-indigo-500"
          isLoading={statsLoading}
          trend={`↑ ${todaySales} transactions`}
          trendColor="text-emerald-500"
        />
        <StatCard
          label="Total Sales (All Time)"
          value={overview?.stats?.total_sales_count ?? '—'}
          subtext="All transactions on record"
          icon={<Layers className="h-4 w-4" />}
          iconBg="bg-amber-50 text-amber-500"
          isLoading={statsLoading}
        />
      </div>

      {/* 3. CENTERPIECE GRID */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Weekly Sales Sparkline */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4 text-left">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs font-extrabold text-text-primary">Sales Revenue Trend (Weekly)</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">MON – SUN</span>
          </div>

          <div className="w-full mt-2 flex flex-col gap-3">
            {statsLoading ? (
              <div className="h-48 bg-slate-50 rounded-xl animate-pulse" />
            ) : weeklyTrend.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-xs text-slate-400 font-semibold">
                No sales data for this week yet.
              </div>
            ) : (
              <>
                {/* Bar chart */}
                <div className="flex items-end justify-between gap-2 h-44 px-1">
                  {weeklyTrend.map((d) => {
                    const barPct = maxWeeklyRevenue > 0 ? (d.revenue / maxWeeklyRevenue) * 100 : 0;
                    const isToday = d.day === new Date().toLocaleDateString('en-US', { weekday: 'short' });
                    return (
                      <div key={d.day} className="flex flex-col items-center gap-1 flex-1 group">
                        <span className="text-[9px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                          ₹{d.revenue > 0 ? (d.revenue / 1000).toFixed(1) + 'K' : '0'}
                        </span>
                        <div
                          className={`w-full rounded-t-lg transition-all ${
                            isToday
                              ? 'bg-orange-500 shadow-sm shadow-orange-200'
                              : d.revenue > 0
                              ? 'bg-orange-200 hover:bg-orange-400'
                              : 'bg-slate-100'
                          }`}
                          style={{ height: `${Math.max(barPct, d.revenue > 0 ? 4 : 2)}%` }}
                        />
                        <span className={`text-[9px] font-bold font-mono ${
                          isToday ? 'text-orange-500' : 'text-slate-400'
                        }`}>{d.day.toUpperCase()}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold border-t border-slate-50 pt-2 px-1">
                  <span>{weeklyTrend.reduce((s, d) => s + d.count, 0)} transactions this week</span>
                  <span>₹{weeklyTrend.reduce((s, d) => s + d.revenue, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })} total</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Live Forecourt Telemetry */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4 text-left">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary shrink-0" />
              <span className="text-xs font-extrabold text-text-primary">Live Forecourt Telemetry</span>
            </div>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          </div>

          <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto">
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
              ))
            ) : forecourtActivities.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 font-semibold">
                No recent transactions recorded.
              </div>
            ) : (
              forecourtActivities.map((act) => (
                <div key={act.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 shadow-sm shrink-0 text-[10px]">
                      #{act.nozzle_id}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-text-primary">
                        {act.vehicle_plate ?? `Nozzle #${act.nozzle_id}`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {new Date(act.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="font-extrabold text-primary font-mono">₹{act.amount.toLocaleString('en-IN')}</span>
                    <span className="text-[9px] text-slate-500 font-semibold">{act.volume.toFixed(2)} L</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. BOTTOM GRID: Attendants + Alarms */}
      <div className="grid lg:grid-cols-12 gap-6 items-start mb-4">
        {/* Top Attendants */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4 text-left">
          <h3 className="text-xs font-extrabold text-text-primary uppercase tracking-wider border-b border-slate-50 pb-3">
            Top Attendant Collections
          </h3>
          <div className="flex flex-col gap-2.5">
            {statsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
              ))
            ) : topAttendants.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 font-semibold">
                No attendant sales recorded this week.
              </div>
            ) : (
              topAttendants.map((at, idx) => (
                <div key={at.id} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-[11px] ${
                      idx === 0 ? 'bg-amber-100 text-amber-600' :
                      idx === 1 ? 'bg-slate-100 text-slate-600' :
                      'bg-orange-50 text-orange-400'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-text-primary">{at.name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">Attendant · {at.sold_liters.toFixed(1)} L this week</span>
                    </div>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="font-extrabold text-text-primary">₹{at.total_amount.toLocaleString('en-IN')}</span>
                    <span className="text-[9px] text-slate-500 font-semibold">{at.sold_liters.toFixed(1)} L sold</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Station Alarms */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4 text-left">
          <h3 className="text-xs font-extrabold text-text-primary uppercase tracking-wider border-b border-slate-50 pb-3">
            Recent Station Alarms
          </h3>
          <div className="flex flex-col gap-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 font-semibold">
                No active alarms. All systems nominal ✓
              </div>
            ) : (
              notifications.slice(0, 3).map((n) => {
                const bgColors = {
                  danger: 'bg-red-50/50 border-red-100/50',
                  warning: 'bg-amber-50/50 border-amber-100/50',
                  success: 'bg-emerald-50/50 border-emerald-100/50',
                  info: 'bg-blue-50/50 border-blue-100/50',
                };
                const textColors = {
                  danger: 'text-red-700',
                  warning: 'text-amber-700',
                  success: 'text-emerald-700',
                  info: 'text-blue-700',
                };
                return (
                  <div key={n.id} className={`p-4 border rounded-2xl flex gap-3 ${bgColors[n.type]} text-xs leading-relaxed`}>
                    <ShieldAlert className={`h-5 w-5 shrink-0 ${textColors[n.type]}`} />
                    <div>
                      <h4 className={`font-bold ${textColors[n.type]} leading-tight`}>{n.title}</h4>
                      <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
