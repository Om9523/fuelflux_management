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
    <div className="min-h-screen w-full flex bg-gradient-to-tr from-orange-50/40 via-white to-orange-100/20 bg-[linear-gradient(to_right,#f9731608_1px,transparent_1px),linear-gradient(to_bottom,#f9731608_1px,transparent_1px)] bg-[size:3rem_3rem] font-plus-jakarta relative overflow-hidden">
      {/* Background Decorative Blob for standard visual depth */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* LEFT SIDE: Immersive Branding & Mock Dashboard Preview (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] relative flex-col justify-between p-12 overflow-hidden bg-white/20 border-r border-orange-100/85">
        {/* Animated Neon Radial Gradients in background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-white to-orange-50/20 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[100px] animate-pulse pointer-events-none" />

        {/* Branding header */}
        <div className="z-10 flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-transparent shrink-0">
              <img src="/logo.png" alt="FuelFlux Logo" className="h-9 w-9 object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Fuel<span className="text-primary">Flux</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/50 rounded-full text-[10px] font-bold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Telemetry Node Online
          </div>
        </div>

        {/* Centerpiece: Beautiful Interactive Mock Dashboard Window */}
        <div className="z-10 flex flex-col justify-center items-center my-auto relative w-full">
          <div className="w-full max-w-xl bg-orange-50/10 border border-orange-100/40 p-6 rounded-3xl shadow-xl backdrop-blur-xs relative flex flex-col gap-4">
            {/* Window title bar */}
            <div className="flex items-center justify-between border-b border-orange-100/30 pb-3.5 mb-1.5">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[10px] font-semibold text-slate-400 font-mono">fuelflux-telemetry-matrix.v2</span>
            </div>

            {/* Dashboard Mock Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Card 1: Revenue Line Graph mockup */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="col-span-2 bg-white/80 border border-orange-100/80 rounded-2xl p-5 shadow-lg shadow-orange-100/20 backdrop-blur-md"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-slate-700">Live Sales Analytics</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-primary bg-orange-100/60 px-2 py-0.5 rounded-full">REALTIME</span>
                </div>
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">$48,259.00</div>
                <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
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
                    stroke="#ea580c"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.div>

              {/* Card 2: Active Dispatch */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                className="bg-white/80 border border-orange-100/80 rounded-2xl p-5 shadow-lg shadow-orange-100/20 backdrop-blur-md flex flex-col justify-between min-h-[140px]"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-bold text-slate-600">Fleet Operations</span>
                  <Truck className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">14 / 15 Active</div>
                  <div className="text-[10px] text-slate-500 font-medium">Logistic Dispatch normal</div>
                </div>
                {/* Visual mini-bar chart */}
                <div className="w-full bg-orange-100 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '93%' }} />
                </div>
              </motion.div>

              {/* Card 3: Pump Dispenser Capacity */}
              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                className="bg-white/80 border border-orange-100/80 rounded-2xl p-5 shadow-lg shadow-orange-100/20 backdrop-blur-md flex flex-col justify-between min-h-[140px]"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-bold text-slate-600">Dispensers Health</span>
                  <Zap className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">Dispenser 3</div>
                  <div className="text-[10px] text-primary font-semibold flex items-center gap-1">
                    <Activity className="h-3 w-3 animate-pulse" /> Calibrating Capacity
                  </div>
                </div>
                <div className="w-full bg-orange-100 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '65%' }} />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Floating animated support text */}
          <div className="mt-8 text-center max-w-sm">
            <h2 className="text-lg font-bold text-slate-900 tracking-wide">Enterprise-grade automation</h2>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Consolidate attendance checklists, customer CRMs, smart ANPR triggers, and fuel dispensers into a cohesive dashboard matrix.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="z-10 flex items-center justify-between text-xs text-slate-400">
          <span>© 2026 FuelFlux Inc.</span>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
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
          <span className="text-lg font-bold text-slate-900">
            Fuel<span className="text-primary">Flux</span>
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -2, boxShadow: '0 20px 40px -15px rgba(234,88,12,0.12)' }}
          className="w-full max-w-md bg-white/90 border border-orange-100/90 rounded-3xl p-8 shadow-[0_12px_40px_-12px_rgba(234,88,12,0.06)] flex flex-col gap-6 transition-all duration-300 relative overflow-hidden"
        >
          {/* Card Top Accent Orange Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-primary to-orange-600" />

          {/* Header Texts */}
          <div className="flex flex-col gap-1.5 text-left">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>

          {/* Form injection */}
          {children}
        </motion.div>
      </div>
    </div>
  );
};
