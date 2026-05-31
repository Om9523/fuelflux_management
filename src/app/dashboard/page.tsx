'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Car,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Sliders,
  CheckCircle,
  Activity,
  Plus,
  Video,
  FileText,
  DollarSign,
  ChevronRight,
  Building,
} from 'lucide-react';
import { usePumpStore } from '@/stores/pumps.store';
import { useNotificationStore } from '@/stores/notification.store';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from '@/components/feedback/Toast';

export default function DashboardHome() {
  const router = useRouter();
  const { selectedPump, initializePumps } = usePumpStore();
  const { notifications, unreadCount } = useNotificationStore();
  const { user } = useAuthStore();

  // State for simulated WebSocket active operations data
  const [pulseRevenue, setPulseRevenue] = useState(0);
  const [activeVehicles, setActiveVehicles] = useState(112);

  useEffect(() => {
    initializePumps();
  }, [initializePumps]);

  // Simulate real-time operational WebSockets trigger intervals
  useEffect(() => {
    if (!selectedPump || selectedPump.status !== 'approved') return;

    // Pulse sales and vehicle counts periodically
    const interval = setInterval(() => {
      setPulseRevenue((prev) => prev + Math.floor(Math.random() * 40) + 10);
      if (Math.random() > 0.7) {
        setActiveVehicles((prev) => prev + 1);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedPump]);

  if (!selectedPump) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  // Define pump-specific stats scale to simulate real-world contextual data loads
  const getMultiplier = (pumpId: string) => {
    switch (pumpId) {
      case 'pump_1': return 1.2;
      case 'pump_2': return 0.8;
      default: return 1.5;
    }
  };

  const mult = getMultiplier(selectedPump.id);
  const baseRevenue = 42890 * mult;
  const attendantsCount = Math.floor(4 * mult);
  const totalCapacity = selectedPump.dailyCapacity;
  const currentLevels = Math.floor(totalCapacity * 0.72);

  // Simulated Dispenser Forecourt logs
  const forecourtActivities = [
    { id: 1, pumpNo: 2, fuel: 'Petrol', amount: '12.4 L', rate: '45L/min', status: 'dispensing' },
    { id: 2, pumpNo: 4, fuel: 'Diesel', amount: '122.5 L', rate: '70L/min', status: 'dispensing' },
    { id: 3, pumpNo: 1, fuel: 'Petrol', amount: '0.0 L', rate: '0L/min', status: 'idle' },
    { id: 4, pumpNo: 3, fuel: 'CNG', amount: '8.2 Kg', rate: '12Kg/min', status: 'complete' },
  ];

  // Simulated top attendants
  const topAttendants = [
    { name: 'K. Rakesh', sold: '4,820 L', amount: '₹4,91,640', performance: '102% of quota' },
    { name: 'G. Suresh', sold: '3,910 L', amount: '₹3,98,820', performance: '98% of quota' },
    { name: 'M. Vikram', sold: '3,240 L', amount: '₹3,30,480', performance: '94% of quota' },
  ];

  // If active selected pump is NOT approved yet, show verification pending overlay!
  // This is a major security business requirement.
  if (selectedPump.status !== 'approved') {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200/60 shadow-xl max-w-xl mx-auto my-12 text-center gap-6 font-plus-jakarta">
        <div className="h-16 w-16 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center text-amber-500 animate-bounce">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-extrabold text-text-primary">Operational Verification Pending</h2>
          <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
            Your fuel station **"{selectedPump.name}"** is currently in review status. Access to ERP ledgers, attendance schedule registers, and sales analytics is locked until the admin approves compliance documents.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full bg-slate-50 p-4 border border-slate-100 rounded-2xl text-xs">
          <div className="flex flex-col items-start gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">GST REGISTERED</span>
            <span className="font-bold text-slate-700 font-mono">{selectedPump.gst}</span>
          </div>
          <div className="flex flex-col items-start gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">EXPLOSIVES LICENSE</span>
            <span className="font-bold text-slate-700 font-mono">{selectedPump.license}</span>
          </div>
        </div>

        <button
          onClick={() => router.push('/dashboard/pumps')}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 hover:border-primary bg-white px-5 py-3 text-xs font-bold text-text-primary hover:text-primary transition-colors outline-none cursor-pointer"
        >
          Check Onboarding status
          <ChevronRight className="h-4.5 w-4.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800">
      {/* 1. TOP QUICK ACTIONS BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-white border border-slate-100 rounded-2xl shadow-xs gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-orange-50 border border-orange-200/50 rounded-xl flex items-center justify-center text-primary">
            <Building className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-extrabold text-text-primary tracking-tight">
              {selectedPump.name} Overview
            </h1>
            <p className="text-xs text-text-secondary">Real-time forecourt telemetry and ERP sales ledger active</p>
          </div>
        </div>

        {/* Quick actions buttons group */}
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
        </div>
      </div>

      {/* 2. CORE KPI GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sales KPI */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3 relative overflow-hidden text-left">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Gross Sales Today</span>
            <div className="h-7 w-7 rounded-lg bg-orange-100 flex items-center justify-center text-primary">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-text-primary font-mono leading-none tracking-tight">
              ₹{(baseRevenue + pulseRevenue).toLocaleString('en-IN')}.00
            </div>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5 mt-1.5">
              ↑ +18.4% <span className="text-slate-400 font-semibold ml-0.5">yesterday comparisons</span>
            </span>
          </div>
        </div>

        {/* Attendants KPI */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3 text-left">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Attendants Roster</span>
            <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-text-primary leading-none tracking-tight">
              {attendantsCount} Attendants Active
            </div>
            <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5 mt-1.5">
              Shift B Operational
            </span>
          </div>
        </div>

        {/* Vehicle ANPR KPI */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3 text-left">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Detected Vehicles</span>
            <div className="h-7 w-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
              <Car className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-text-primary font-mono leading-none tracking-tight">
              {activeVehicles} Cars
            </div>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5 mt-1.5">
              ↑ +5 ANPR matches <span className="text-slate-400 font-semibold ml-0.5">last 15 mins</span>
            </span>
          </div>
        </div>

        {/* Inventory KPI */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3 text-left">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Average Tank levels</span>
            <div className="h-7 w-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-text-primary leading-none tracking-tight">
              {((currentLevels / totalCapacity) * 100).toFixed(0)}% Fill Threshold
            </div>
            {/* mini progress line */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-amber-400 h-full rounded-full" style={{ width: `${(currentLevels / totalCapacity) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. CENTERPIECE GRID: WIDGETS & AUDITING */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Weekly sales graph panel (Recharts alternative SVG) */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4 text-left">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-primary" />
              <span className="text-xs font-extrabold text-text-primary">Sales Revenue Trend (Weekly)</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">MON - SUN</span>
          </div>

          <div className="w-full h-64 relative mt-2 flex flex-col justify-end">
            {/* SVG Sparkline Weekly sales charts */}
            <svg className="w-full h-48" viewBox="0 0 100 30" preserveAspectRatio="none">
              <defs>
                <linearGradient id="dashboard-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 25 C15 22, 30 28, 45 14 C60 8, 75 16, 90 6 L100 4 L100 30 L0 30 Z"
                fill="url(#dashboard-gradient)"
              />
              <path
                d="M0 25 C15 22, 30 28, 45 14 C60 8, 75 16, 90 6 L100 4"
                fill="none"
                stroke="#f97316"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 px-1 border-t border-slate-50 pt-2 font-mono">
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
              <span>SUN</span>
            </div>
          </div>
        </div>

        {/* Live Nozzles Dispenser Forecourt logs */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4 text-left">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-primary shrink-0" />
              <span className="text-xs font-extrabold text-text-primary">Live Forecourt Telemetry</span>
            </div>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          </div>

          <div className="flex flex-col gap-2.5">
            {forecourtActivities.map((act) => (
              <div key={act.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="h-8.5 w-8.5 rounded-lg bg-white border border-slate-150 flex items-center justify-center font-bold text-slate-600 shadow-xs shrink-0">
                    #{act.pumpNo}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-text-primary">Dispenser {act.pumpNo}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{act.fuel} Nozzle</span>
                  </div>
                </div>

                <div className="flex flex-col text-right">
                  {act.status === 'dispensing' ? (
                    <>
                      <span className="font-extrabold text-primary font-mono">{act.amount}</span>
                      <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-0.5 justify-end">
                        <span className="flex h-1 w-1 rounded-full bg-emerald-500 animate-ping" /> {act.rate}
                      </span>
                    </>
                  ) : act.status === 'complete' ? (
                    <>
                      <span className="font-bold text-slate-600 font-mono">{act.amount}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Transaction Completed</span>
                    </>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Idle Nozzle</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. BASEMENT GRID: LEADERS & ALARMS */}
      <div className="grid lg:grid-cols-12 gap-6 items-start mb-4">
        {/* Attendant performance registry */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4 text-left">
          <h3 className="text-xs font-extrabold text-text-primary uppercase tracking-wider border-b border-slate-50 pb-3">
            Top Attendant Collections
          </h3>
          <div className="flex flex-col gap-2.5">
            {topAttendants.map((at, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-xs">
                <div className="flex items-center gap-3">
                  <div className="h-8.5 w-8.5 rounded-full bg-slate-100 text-text-secondary flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-text-primary">{at.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">Attendant Shift B</span>
                  </div>
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-extrabold text-text-primary">{at.amount}</span>
                  <span className="text-[9px] text-slate-500 font-semibold">{at.sold} dispensed ({at.performance})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live dynamic notifications alerts feed */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4 text-left">
          <h3 className="text-xs font-extrabold text-text-primary uppercase tracking-wider border-b border-slate-50 pb-3">
            Recent Station Alarms
          </h3>
          <div className="flex flex-col gap-3">
            {notifications.slice(0, 2).map((n) => {
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
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
