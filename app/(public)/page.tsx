'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Fuel,
  ArrowRight,
  Shield,
  Activity,
  Users,
  Layers,
  TrendingUp,
  Truck,
  Check,
  CheckCircle,
  Star,
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: 'Automated Attendance',
      desc: 'Real-time shift scheduling, check-ins, and biometric integrations synchronized with payroll modules.',
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: 'ANPR Integrations',
      desc: 'Automated Number Plate Recognition at the dispenser tracks loyalty and speeds up corporate fleet checkouts.',
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-primary" />,
      title: 'Fuel Price Analytics',
      desc: 'Integrates local market trends and predictive AI models to help forecast pricing adjustments.',
    },
    {
      icon: <Truck className="h-6 w-6 text-primary" />,
      title: 'Logistic & Fleet Controls',
      desc: 'Oversee tankers, dispatch schedules, route tracking, and automated inventory refills on a unified board.',
    },
    {
      icon: <Layers className="h-6 w-6 text-primary" />,
      title: 'Dispenser CRMs',
      desc: 'Nurture client loyalty accounts, corporate credit balances, and automated dispenser billing feeds.',
    },
    {
      icon: <Activity className="h-6 w-6 text-primary" />,
      title: 'Smart Stock Audits',
      desc: 'Continuous tank level tracking with wet-stock loss alerts, dry warnings, and automatic safety shutdowns.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 selection:bg-primary/20 selection:text-primary">
      {/* 1. NAVBAR */}
      <nav className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="FuelFlux Logo" className="h-9 w-9 object-contain" />
            <span className="text-lg font-bold tracking-tight text-text-primary">
              Fuel<span className="text-primary">Flux</span>
            </span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-text-secondary">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <Link href="#testimonials" className="hover:text-primary transition-colors">Testimonials</Link>
            <Link href="#enterprise" className="hover:text-primary transition-colors">Enterprise</Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-text-secondary hover:text-text-primary transition-colors">
              Log In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary-hover px-4 py-2 text-sm font-bold text-white shadow-md shadow-primary/10 transition-all duration-300"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-gradient-to-b from-orange-50/40 via-white to-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
          {/* Hero text */}
          <div className="lg:col-span-6 flex flex-col items-start gap-6 text-left">
            <div className="inline-flex items-center gap-2 bg-orange-100/60 border border-orange-200/40 px-3 py-1 rounded-full text-xs font-bold text-primary">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
              v2.4 Enterprise Release
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.08]">
              Decentralized <br className="hidden sm:inline" />
              Station Management, <br className="hidden sm:inline" />
              <span className="text-primary bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Unified.</span>
            </h1>
            <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl">
              Unchain your fuel network from legacy silo solutions. Consolidate attendance logs, logistics, dispensers, CRMs, and ANPR loyalty tools on a high-fidelity SaaS dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary-hover px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all duration-300 gap-2"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl bg-white hover:bg-slate-50 border border-slate-200 px-6 py-3.5 text-sm font-bold text-text-primary transition-all duration-300"
              >
                Access Dashboard
              </Link>
            </div>
          </div>

          {/* Hero Dashboard Graphic Mockup */}
          <div className="lg:col-span-6 w-full flex justify-center relative">
            <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-lg rounded-2xl border border-border-accent/40 bg-white p-5 shadow-2xl relative overflow-hidden"
            >
              <div className="flex gap-1.5 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-soft-bg border border-border-accent/30 rounded-xl p-3.5">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-[10px] font-bold text-text-secondary uppercase">DISPENSER SPEED</div>
                      <div className="text-sm font-extrabold text-text-primary">820 Liters / min</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">OPTIMAL</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex flex-col justify-between">
                    <span className="text-[9px] font-bold text-text-secondary">ACTIVE TANKS</span>
                    <span className="text-base font-extrabold text-text-primary mt-1">4 / 4 Tanks</span>
                    <div className="w-full bg-slate-200 h-1 rounded-full mt-2">
                      <div className="bg-primary h-full rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex flex-col justify-between">
                    <span className="text-[9px] font-bold text-text-secondary">ANPR MATCHES</span>
                    <span className="text-base font-extrabold text-text-primary mt-1">112 Cars today</span>
                    <span className="text-[9px] text-emerald-600 mt-1 font-semibold flex items-center gap-0.5">↑ +12.3% loyalty</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES GRID */}
      <section id="features" className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-xl mx-auto flex flex-col items-center gap-3 mb-16">
            <span className="text-xs font-bold text-primary tracking-widest uppercase">Robust Architecture</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary">Unified System Features</h2>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              Unlock modular features explicitly tailored to modern multi-role gasoline networks, fuel transport logistics, and asset auditing.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                className="bg-white rounded-2xl border border-slate-100 p-6 text-left shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-soft-bg flex items-center justify-center border border-border-accent/30 group-hover:bg-primary group-hover:border-transparent transition-colors duration-300">
                  <div className="group-hover:text-white transition-colors duration-300">
                    {f.icon}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-text-primary tracking-tight">{f.title}</h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PRICING SECTION */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-xl mx-auto flex flex-col items-center gap-3 mb-16">
            <span className="text-xs font-bold text-primary tracking-widest uppercase">Scalable pricing</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary">Engineered for Any Size</h2>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              Transparent enterprise licensing tiers that scale seamlessly with your station count.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Tier 1 */}
            <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm flex flex-col justify-between text-left">
              <div>
                <h3 className="text-lg font-bold text-text-primary">Standard</h3>
                <p className="text-xs text-text-secondary mt-1">For single-site station operators.</p>
                <div className="text-4xl font-extrabold text-text-primary mt-6">₹89<span className="text-xs text-text-secondary font-semibold">/month</span></div>
                <ul className="space-y-3 mt-8">
                  {['1 Active Fuel Station', 'Standard Dispenser CRM', 'Wet-stock Inventory Tracking', 'Email & SMS Support'].map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-text-secondary font-medium">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/register" className="mt-8 block text-center rounded-xl border border-slate-200 hover:border-primary text-text-primary hover:text-primary font-bold text-xs py-3 transition-colors duration-300">
                Choose Plan
              </Link>
            </div>

            {/* Tier 2: Popular */}
            <div className="bg-white rounded-2xl border-2 border-primary p-8 shadow-md flex flex-col justify-between text-left relative">
              <span className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-white text-[9px] font-bold tracking-widest px-3 py-1 rounded-full uppercase">POPULAR</span>
              <div>
                <h3 className="text-lg font-bold text-text-primary">Professional</h3>
                <p className="text-xs text-text-secondary mt-1">Best for expanding station groups.</p>
                <div className="text-4xl font-extrabold text-text-primary mt-6">₹249<span className="text-xs text-text-secondary font-semibold">/month</span></div>
                <ul className="space-y-3 mt-8">
                  {['Up to 5 Fuel Stations', 'Full Logistic & Fleet tracking', 'ANPR Matches and Analytics', 'Priority 24/7 Service Calls'].map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-text-secondary font-medium">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/register" className="mt-8 block text-center rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs py-3 shadow-md shadow-primary/20 transition-all duration-300">
                Get Started
              </Link>
            </div>

            {/* Tier 3 */}
            <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm flex flex-col justify-between text-left">
              <div>
                <h3 className="text-lg font-bold text-text-primary">Enterprise</h3>
                <p className="text-xs text-text-secondary mt-1">For multi-region fuel enterprises.</p>
                <div className="text-4xl font-extrabold text-text-primary mt-6">Custom</div>
                <ul className="space-y-3 mt-8">
                  {['Unlimited Fuel Stations', 'Dedicated Database Instance', 'Custom IoT Pump Integrations', 'Assigned Success Managers'].map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-text-secondary font-medium">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/register" className="mt-8 block text-center rounded-xl border border-slate-200 hover:border-primary text-text-primary hover:text-primary font-bold text-xs py-3 transition-colors duration-300">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-xl mx-auto flex flex-col items-center gap-3 mb-16">
            <span className="text-xs font-bold text-primary tracking-widest uppercase">Trusted worldwide</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary">Loved by Operators</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-text-secondary italic leading-relaxed">
                "FuelFlux completely streamlined our operations. We sync inventory refills across 4 stations, audit employee check-ins effortlessly, and manage client credit tabs in one console. Incredible architecture!"
              </p>
              <div className="flex items-center gap-3 mt-6">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary">AM</div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">Arun Mehta</h4>
                  <p className="text-[10px] text-text-secondary">Owner, Bharat Petroleum Cluster</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-text-secondary italic leading-relaxed">
                "As a Logistics Director, coordinating driver rosters and tanker dispatch routes was chaotic. With the unified dashboard operations, fuel supply schedules became predictive. A master-class in SaaS UI."
              </p>
              <div className="flex items-center gap-3 mt-6">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary">SC</div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">Sandra Collins</h4>
                  <p className="text-[10px] text-text-secondary">VP of Logistics, Apex Fuel Carriers</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-text-secondary italic leading-relaxed">
                "The ANPR loyalty dashboard increased return-rates by 18% in the first three months. Our business clients love the automatic plate recognition and credit invoices. Clean interface and responsive support."
              </p>
              <div className="flex items-center gap-3 mt-6">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary">GK</div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">Gautam Krishnan</h4>
                  <p className="text-[10px] text-text-secondary">Managing Director, GK Gas Networks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA CONVERSION BLOCK */}
      <section id="enterprise" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="bg-slate-900 rounded-3xl p-12 relative overflow-hidden flex flex-col items-center gap-6 shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px]" />
            <span className="text-[10px] font-bold tracking-widest text-primary uppercase z-10">ENTERPRISE AUTOMATION</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white max-w-lg z-10">Ready to Consolidate Your Fuel Assets?</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed z-10">
              Sign up today and get 14 days of unrestricted access to our unified multi-role console. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4 z-10 w-full sm:w-auto">
              <Link href="/register" className="inline-flex justify-center items-center rounded-xl bg-primary hover:bg-primary-hover px-6 py-3 font-bold text-xs text-white transition-all shadow-lg shadow-primary/25">
                Register Free Trial
              </Link>
              <Link href="/login" className="inline-flex justify-center items-center rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-6 py-3 font-bold text-xs text-white transition-all">
                Access Demo Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-slate-50 border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="FuelFlux Logo" className="h-6 w-6 object-contain" />
            <span className="text-sm font-bold text-text-primary">FuelFlux</span>
          </div>
          <div className="flex gap-8 text-xs text-text-secondary">
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="hover:text-primary transition-colors">API Docs</Link>
            <Link href="#" className="hover:text-primary transition-colors">Support</Link>
          </div>
          <span className="text-xs text-text-secondary font-medium">© 2026 FuelFlux Inc. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
