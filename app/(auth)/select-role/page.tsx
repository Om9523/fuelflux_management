'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, Truck, ShieldCheck, TrendingUp, User, Fuel, ArrowRight, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { Role } from '@/lib/mock-db';
import { toast } from '@/components/feedback/Toast';

export default function SelectRolePage() {
  const router = useRouter();
  const { user, switchRole, logout, initializeSession, isLoading } = useAuthStore();

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // If user session is lost, send to login
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  // Exact 5 roles requested with custom titles and clean white-theme icons
  const roleCardsMeta: Record<Role, {
    title: string;
    desc: string;
    icon: React.ReactNode;
    colorClass: string;
    borderGlow: string;
  }> = {
    pump_owner: {
      title: 'Pump Owner',
      desc: 'Audit daily operations, schedule employees, manage dispensers capacity, and view sales ledgers.',
      icon: <Building2 className="h-5.5 w-5.5" />,
      colorClass: 'bg-orange-50 border border-orange-100 text-primary',
      borderGlow: 'hover:border-primary/40 hover:shadow-md hover:shadow-primary/5',
    },
    admin: {
      title: 'Admin',
      desc: 'Modify system variables, manage station licenses, configure global integrations, and pull API logs.',
      icon: <ShieldCheck className="h-5.5 w-5.5" />,
      colorClass: 'bg-slate-50 border border-slate-200 text-slate-500',
      borderGlow: 'hover:border-slate-350 hover:shadow-md hover:shadow-slate-100/50',
    },
    investor: {
      title: 'Investor',
      desc: 'Access global aggregated revenue graphs, capital projections, audit trials, and financial spreadsheets.',
      icon: <TrendingUp className="h-5.5 w-5.5" />,
      colorClass: 'bg-emerald-50 border border-emerald-100 text-emerald-600',
      borderGlow: 'hover:border-emerald-500/40 hover:shadow-md hover:shadow-emerald-500/5',
    },
    employee: {
      title: 'Employee',
      desc: 'Record shift metrics, flag dispenser shortages, log retail transactions, and check roster hours.',
      icon: <User className="h-5.5 w-5.5" />,
      colorClass: 'bg-indigo-50 border border-indigo-100 text-indigo-600',
      borderGlow: 'hover:border-indigo-500/40 hover:shadow-md hover:shadow-indigo-500/5',
    },
    logistic: {
      title: 'Logistic',
      desc: 'Oversee carrier tankers dispatcher logs, map optimized routes, and manage driver rumbles.',
      icon: <Truck className="h-5.5 w-5.5" />,
      colorClass: 'bg-blue-50 border border-blue-100 text-blue-600',
      borderGlow: 'hover:border-blue-500/40 hover:shadow-md hover:shadow-blue-500/5',
    },
  };

  // Mapped roles in the exact order requested by the user
  const ROLES_ORDER: Role[] = ['pump_owner', 'admin', 'investor', 'employee', 'logistic'];

  const handleRoleSelection = async (role: Role) => {
    try {
      await switchRole(role);
      toast.success(`Role selected: ${roleCardsMeta[role].title}`);
      
      // If Pump Owner is selected, redirect to the Pump Owner Operations Dashboard (/dashboard)
      if (role === 'pump_owner') {
        router.push('/dashboard');
      } else if (role === 'logistic') {
        router.push('/logistic/dashboard');
      } else if (role === 'investor') {
        router.push('/investor');
      } else {
        toast.info(`Redirecting to mock ${roleCardsMeta[role].title} panel...`);
        router.push('/dashboard'); // All other route contexts fallback elegantly to dashboard
      }
    } catch (err: any) {
      toast.error('Failed to select role');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden font-plus-jakarta">
      {/* Premium White and Orange theme radial glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-200/20 rounded-full blur-[120px] animate-pulse" />

      {/* Main Bright Portal Container Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 shadow-xl shadow-slate-100/50 relative z-10 flex flex-col gap-8"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6 text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 border border-orange-100 text-primary">
              <Fuel className="h-5.5 w-5.5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">Select Active Role</h1>
              <p className="text-xs text-slate-500 mt-0.5">Welcome back, {user.name} ({user.email})</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition-all outline-none cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log Out
          </button>
        </div>

        {/* Roles Cards Grid */}
        <div className="grid sm:grid-cols-2 gap-4 my-2">
          {ROLES_ORDER.map((role) => {
            const meta = roleCardsMeta[role];
            if (!meta) return null;

            return (
              <motion.div
                key={role}
                whileHover={{ y: -3, scale: 1.005 }}
                onClick={() => handleRoleSelection(role)}
                className={`
                  flex items-start gap-4 p-5 rounded-2xl bg-slate-50/50 hover:bg-white border border-slate-200/60 hover:border-slate-350 cursor-pointer transition-all duration-300 select-none text-left relative group
                  ${meta.borderGlow}
                `}
              >
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border ${meta.colorClass}`}>
                  {meta.icon}
                </div>
                <div className="flex flex-col gap-1 pr-6">
                  <span className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{meta.title}</span>
                  <span className="text-xs text-slate-500 leading-relaxed font-semibold">{meta.desc}</span>
                </div>
                <ArrowRight className="absolute right-5 top-5 h-4 w-4 text-slate-350 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </motion.div>
            );
          })}
        </div>

        {/* Security Checklist Footer */}
        <div className="flex justify-between items-center text-[10px] sm:text-xs text-slate-400 border-t border-slate-100 pt-6 font-semibold">
          <span>Active Session secured by FuelFlux Security Core</span>
          <span className="font-mono">IP: SECURE_TUNNEL</span>
        </div>
      </motion.div>
    </div>
  );
}
