'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Fuel, TrendingUp, Truck, Zap, Activity } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  const { initializeSession } = useAuthStore();

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-plus-jakarta relative overflow-hidden">
      {/* Background Decorative Blob for standard visual depth */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />

      {/* LEFT SIDE: Immersive Branding & Mock Dashboard Preview (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] relative flex-col justify-between p-12 overflow-hidden bg-slate-900 border-r border-slate-800">
        {/* Animated Neon Radial Gradients in background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-slate-950 to-slate-950" />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/20 rounded-full blur-[100px] animate-pulse" />

        {/* Branding header */}
        <div className="z-10 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-transparent shrink-0">
            <img src="/logo.png" alt="FuelFlux Logo" className="h-9 w-9 object-contain" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Fuel<span className="text-primary">Flux</span>
          </span>
        </div>

        {/* Centerpiece: Beautiful Interactive Mock Dashboard Window */}
        <div className="z-10 flex flex-col justify-center items-center my-auto relative w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="w-full max-w-xl rounded-2xl bg-slate-950/70 border border-slate-800 p-6 shadow-2xl backdrop-blur-md relative overflow-hidden"
          >
            {/* Mac-like Window Controls */}
            <div className="flex gap-1.5 mb-6">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-semibold text-slate-500 ml-4 font-mono">fuelflux-dashboard-preview.v2</span>
            </div>

            {/* Dashboard Mock Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Card 1: Revenue Line Graph mockup */}
              <div className="col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-slate-300">Live Sales Analytics</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">REALTIME</span>
                </div>
                <div className="text-2xl font-extrabold text-white tracking-tight">$48,259.00</div>
                <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
                  ↑ +24.8% <span className="text-slate-500 font-normal">from yesterday</span>
                </div>
                {/* SVG Mock Sparkline Graph */}
                <svg className="w-full h-16 mt-4" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 25 C10 20, 20 28, 30 15 C40 10, 50 18, 60 8 C70 5, 80 12, 90 4 L100 2 L100 30 L0 30 Z"
                    fill="url(#gradient)"
                  />
                  <path
                    d="M0 25 C10 20, 20 28, 30 15 C40 10, 50 18, 60 8 C70 5, 80 12, 90 4 L100 2"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Card 2: Active Dispatch */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-bold text-slate-400">Fleet Operations</span>
                  <Truck className="h-4.5 w-4.5 text-blue-400" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">14 / 15 Active</div>
                  <div className="text-[10px] text-slate-500 font-medium">Logistic Dispatch normal</div>
                </div>
                {/* Visual mini-bar chart */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-blue-400 h-full rounded-full" style={{ width: '93%' }} />
                </div>
              </div>

              {/* Card 3: Pump Dispenser Capacity */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-bold text-slate-400">Dispensers Health</span>
                  <Zap className="h-4.5 w-4.5 text-amber-400" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">Dispenser 3</div>
                  <div className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                    <Activity className="h-3 w-3 animate-pulse" /> Calibrating Capacity
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating animated support text */}
          <div className="mt-8 text-center max-w-sm">
            <h2 className="text-lg font-semibold text-white tracking-wide">Enterprise-grade automation</h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Consolidate attendance checklists, customer CRMs, smart ANPR triggers, and fuel dispensers into a cohesive dashboard matrix.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="z-10 flex items-center justify-between text-xs text-slate-500">
          <span>© 2026 FuelFlux Inc.</span>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Dedicated Auth Card Shell */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
        {/* Mobile-only Branding header */}
        <div className="lg:hidden flex items-center gap-2 mb-8 absolute top-8 left-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-transparent shrink-0">
            <img src="/logo.png" alt="FuelFlux Logo" className="h-7 w-7 object-contain" />
          </div>
          <span className="text-lg font-bold text-text-primary">
            Fuel<span className="text-primary">Flux</span>
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white/70 backdrop-blur-md rounded-2xl border border-border-accent/40 p-8 shadow-xl shadow-slate-200/50 flex flex-col gap-6"
        >
          {/* Header Texts */}
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">{title}</h1>
            <p className="text-sm text-text-secondary">{subtitle}</p>
          </div>

          {/* Form injection */}
          {children}
        </motion.div>
      </div>
    </div>
  );
};
