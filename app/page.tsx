"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Truck, ShieldCheck, TrendingUp, ArrowRight, Zap, Info,
  BarChart3, Cpu, Globe, CheckCircle, Star, Phone, Mail,
  MapPin, ChevronRight, Fuel, Users, Activity, Lock, Award
} from "lucide-react";

function CountUp({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 25);
    return () => clearInterval(timer);
  }, [target]);
  return <>{prefix}{count.toLocaleString("en-IN")}{suffix}</>;
}

const features = [
  { icon: Cpu, title: "AI-Powered ANPR", desc: "Real-time number plate recognition with 96%+ accuracy using computer vision and OCR models.", color: "from-orange-500 to-red-500", bg: "bg-orange-50", iconColor: "text-orange-600" },
  { icon: BarChart3, title: "Smart Analytics", desc: "AI-driven fuel demand prediction, revenue forecasting, and investor-grade reporting dashboards.", color: "from-blue-500 to-indigo-500", bg: "bg-blue-50", iconColor: "text-blue-600" },
  { icon: Truck, title: "Logistics Tracking", desc: "Live GPS fleet management, route optimization, driver assignment, and real-time delivery updates.", color: "from-green-500 to-emerald-500", bg: "bg-green-50", iconColor: "text-green-600" },
  { icon: Globe, title: "Cloud-Ready Platform", desc: "Scalable microservices architecture with Docker, AWS, and CI/CD pipelines for enterprise deployment.", color: "from-purple-500 to-violet-500", bg: "bg-purple-50", iconColor: "text-purple-600" },
  { icon: Lock, title: "Enterprise Security", desc: "JWT authentication, RBAC, fraud detection, encrypted data, and real-time security monitoring.", color: "from-pink-500 to-rose-500", bg: "bg-pink-50", iconColor: "text-pink-600" },
  { icon: Activity, title: "Real-Time Monitoring", desc: "Live CCTV monitoring, vehicle counting, staff attendance tracking, and instant alert systems.", color: "from-amber-500 to-orange-500", bg: "bg-amber-50", iconColor: "text-amber-600" },
];

const testimonials = [
  { name: "Rajesh Sharma", role: "Pump Owner, Mumbai", text: "FuelFlux transformed our station management. The ANPR system saves hours every day and the billing is seamless.", avatar: "RS", stars: 5 },
  { name: "Priya Mehta", role: "Investor, Delhi", text: "As an investor I can track every metric in real-time. The ROI dashboards are exactly what I needed for portfolio management.", avatar: "PM", stars: 5 },
  { name: "Vikram Singh", role: "Logistics Head, Bangalore", text: "Fleet tracking and route optimization has cut our delivery costs by 23%. Excellent platform for logistics operations.", avatar: "VS", stars: 5 },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f8f9fa" }}>
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gray-900 shadow-lg">
              <Image src="/logo.png" alt="FuelFlux" width={40} height={40} className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-xl text-gray-900" style={{ fontWeight: 800 }}>FuelFlux</span>
              <p className="text-xs text-gray-400 -mt-0.5">Smart Fuel Ecosystem</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">Features</a>
            <a href="#analytics" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">Analytics</a>
            <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">Testimonials</a>
            <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/about" className="hidden md:flex items-center gap-1.5 text-sm font-medium text-orange-600 border border-orange-200 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors">
              <Info className="w-3.5 h-3.5" /> About
            </Link>
            <Link href="/admin/login" className="btn-primary text-sm py-2 px-4">Admin Portal</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28" style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)" }}>
        {/* Background orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #f97316, transparent)" }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px opacity-10" style={{ background: "linear-gradient(90deg, transparent, #f97316, transparent)" }} />

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 border border-orange-500/30 rounded-full px-4 py-2 mb-8" style={{ background: "rgba(249,115,22,0.1)" }}>
            <Zap className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-semibold text-orange-400">AI-Powered Fuel Logistics Platform</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            The Future of
            <span className="block" style={{ background: "linear-gradient(135deg, #f97316, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Fuel Management
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            A complete AI-powered ecosystem connecting Pump Owners, Logistics Providers, Investors, and Admins on one intelligent platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/pump-owner/login" className="btn-primary flex items-center gap-2 px-8 py-3.5 text-base cursor-pointer">
                Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/admin/login" className="flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white border border-white/20 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                <ShieldCheck className="w-4 h-4" /> Admin Portal
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { label: "Active Stations", value: 500, suffix: "+", prefix: "" },
              { label: "Vehicles Tracked", value: 12000, suffix: "+", prefix: "" },
              { label: "Revenue Processed", value: 50, suffix: "Cr+", prefix: "₹" },
              { label: "AI Detections/Day", value: 25000, suffix: "+", prefix: "" },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-5 text-center" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <p className="text-3xl font-black text-white mb-1"><CountUp target={s.value} suffix={s.suffix} prefix={s.prefix} /></p>
                <p className="text-sm text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Choose Your Portal</h2>
            <p className="text-gray-500">Role-based dashboards with tailored features for every stakeholder</p>
          </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              { title: "Customer", desc: "Book fuel, find nearby stations, skip the queue, and earn rewards.", href: "/login", icon: "🚗", color: "from-purple-500 to-pink-500", badge: "New" },
              { title: "Pump Owner", desc: "Manage inventory, billing, employees, AI monitoring, and sales analytics.", href: "/pump-owner/login", icon: "⛽", color: "from-orange-500 to-amber-500", badge: "Most Popular" },
              { title: "Logistics", desc: "Fund pump wallets, track transactions, manage payments and fleet operations.", href: "/logistics/login", icon: "🚛", color: "from-blue-500 to-cyan-500", badge: "" },
              { title: "Investor", desc: "Monitor ROI, platform revenue, growth analytics, and investment insights.", href: "/investor/login", icon: "📈", color: "from-emerald-500 to-teal-500", badge: "Exclusive" },
              { title: "Admin", desc: "Control the entire platform, approve users, monitor fraud, and manage subscriptions.", href: "/admin/login", icon: "🛡️", color: "from-red-500 to-rose-500", badge: "" },
            ].map((role) => (
              <Link key={role.title} href={role.href} className="group card p-6 cursor-pointer hover:border-orange-200 hover:-translate-y-2 transition-all duration-300 h-full relative overflow-hidden block">
                  {role.badge && (
                    <span className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "linear-gradient(135deg, #f97316, #ea6c0c)", color: "white" }}>{role.badge}</span>
                  )}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 bg-gradient-to-br ${role.color} shadow-lg group-hover:scale-110 transition-transform`}>{role.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{role.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{role.desc}</p>
                  <div className="flex items-center gap-2 text-orange-500 text-sm font-semibold group-hover:gap-3 transition-all">
                    Login <ArrowRight className="w-4 h-4" />
                  </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20" style={{ background: "#f8f9fa" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-4 py-2 mb-4">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-orange-600">Platform Capabilities</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-gray-500 max-w-xl mx-auto">From AI-powered monitoring to enterprise analytics — built for modern fuel logistics.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card p-6 group hover:-translate-y-1 transition-all">
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-6 h-6 ${f.iconColor}`} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Preview */}
      <section id="analytics" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-2 mb-6">
                <BarChart3 className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-semibold text-indigo-600">AI Analytics Engine</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-tight">
                Intelligence at Every
                <span className="gradient-text block">Decision Point</span>
              </h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                FuelFlux's AI core analyzes millions of data points to provide demand forecasting, fraud detection, and actionable insights — all in real time.
              </p>
              <div className="space-y-4">
                {[
                  { icon: TrendingUp, label: "Fuel Demand Prediction", sub: "ML-based 30-day forecasts", color: "text-orange-500 bg-orange-50" },
                  { icon: ShieldCheck, label: "Fraud Detection", sub: "Anomaly detection in real-time", color: "text-red-500 bg-red-50" },
                  { icon: Cpu, label: "OCR Vehicle Monitoring", sub: "ANPR with 96%+ accuracy", color: "text-blue-500 bg-blue-50" },
                  { icon: Award, label: "Smart Investor Reports", sub: "AI-generated ROI analysis", color: "text-purple-500 bg-purple-50" },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-orange-100 transition-all group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform flex-shrink-0`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.sub}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-orange-400" />
                  </div>
                ))}
              </div>
            </div>
            {/* Mock Dashboard Preview */}
            <div className="relative">
              <div className="card p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900">Platform Overview</h3>
                  <span className="badge badge-green text-xs">● Live</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { label: "Revenue", value: "₹28.5L", change: "+15.3%", color: "bg-orange-50 border-orange-100" },
                    { label: "Active Pumps", value: "89", change: "+7", color: "bg-blue-50 border-blue-100" },
                    { label: "Deliveries", value: "142", change: "+23", color: "bg-green-50 border-green-100" },
                    { label: "Fraud Alerts", value: "3", change: "-2", color: "bg-red-50 border-red-100" },
                  ].map(m => (
                    <div key={m.label} className={`${m.color} border rounded-xl p-3`}>
                      <p className="text-xs text-gray-500 mb-1">{m.label}</p>
                      <p className="text-lg font-black text-gray-900">{m.value}</p>
                      <p className="text-xs text-green-600 font-semibold">{m.change}</p>
                    </div>
                  ))}
                </div>
                {/* Fake bar chart */}
                <div>
                  <p className="text-xs text-gray-500 mb-3 font-semibold">Monthly Revenue (₹)</p>
                  <div className="flex items-end gap-1.5 h-24">
                    {[65, 80, 70, 90, 85, 100, 88].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-lg transition-all hover:opacity-80" style={{ height: `${h}%`, background: i === 5 ? "linear-gradient(180deg, #f97316, #ea6c0c)" : i === 6 ? "linear-gradient(180deg, #6366f1, #4f46e5)" : "#f0f0f0" }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    {["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"].map(m => (
                      <span key={m} className="text-xs text-gray-400">{m}</span>
                    ))}
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">AI Prediction</p>
                    <p className="text-xs text-gray-500">+18% demand next week</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20" style={{ background: "#f8f9fa" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Trusted by Professionals</h2>
            <p className="text-gray-500">What our users say about FuelFlux</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card p-6">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-bold">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16" style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)" }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to Transform Your Fuel Business?</h2>
          <p className="text-gray-300 mb-8 text-lg">Join 500+ fuel stations already using FuelFlux to streamline operations and boost profitability.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pump-owner/login" className="btn-primary flex items-center gap-2 px-8 py-3.5 text-base cursor-pointer">
                Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/about" className="flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white border border-white/20 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-900">
                  <Image src="/logo.png" alt="FuelFlux" width={40} height={40} className="w-full h-full object-contain" />
                </div>
                <span className="text-lg font-black text-gray-900">FuelFlux</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">The next-generation AI-powered fuel logistics and management platform for the modern energy ecosystem.</p>
              <div className="flex items-center gap-2">
                <span className="status-dot online" />
                <span className="text-xs text-gray-500">All systems operational</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4">Portals</h3>
              <div className="space-y-2">
                {[
                  { label: "Customer Login", href: "/login" },
                  { label: "Pump Owner Login", href: "/pump-owner/login" },
                  { label: "Logistics Login", href: "/logistics/login" },
                  { label: "Investor Portal", href: "/investor/login" },
                  { label: "Admin Control Panel", href: "/admin/login" },
                  { label: "About Us", href: "/about" },
                ].map(l => (
                  <Link key={l.label} href={l.href} className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors">
                    <ChevronRight className="w-3 h-3" /> {l.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-4">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-500"><Mail className="w-4 h-4 text-orange-500" /> support@fuelflux.ai</div>
                <div className="flex items-center gap-3 text-sm text-gray-500"><Phone className="w-4 h-4 text-orange-500" /> +91 98765 43210</div>
                <div className="flex items-center gap-3 text-sm text-gray-500"><MapPin className="w-4 h-4 text-orange-500" /> Mumbai, India</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">© 2024 FuelFlux Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Privacy Policy</span><span>Terms of Service</span><span>Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
