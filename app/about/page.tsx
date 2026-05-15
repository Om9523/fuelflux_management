"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  ArrowLeft, Target, Eye, Heart, Users, Zap, Shield,
  BarChart2, Cpu, MapPin, Phone, Mail, Globe, ArrowRight,
  CheckCircle2, Truck, Star, Fuel
} from "lucide-react";

// default stats removed from here, moving to state
const TEAM = [
  { name: "Arjun Mehta", role: "Founder & CEO", avatar: "AM", bio: "10+ years in petroleum industry and SaaS." },
  { name: "Priya Sharma", role: "CTO", avatar: "PS", bio: "Ex-Google engineer. AI and infrastructure expert." },
  { name: "Rohit Patel", role: "Head of Operations", avatar: "RP", bio: "Managed logistics for 200+ fuel networks." },
  { name: "Kavitha Nair", role: "Head of Product", avatar: "KN", bio: "UX and product leader with 8 years in FinTech." },
];

const VALUES = [
  {
    icon: Target,
    title: "Mission-Driven",
    desc: "We exist to modernise India's fuel retail ecosystem with smart technology that empowers every pump owner.",
  },
  {
    icon: Eye,
    title: "Transparency",
    desc: "Every transaction, every bill, every wallet movement — fully auditable and visible to authorised stakeholders.",
  },
  {
    icon: Heart,
    title: "Customer First",
    desc: "Our product decisions start and end with the pump owner experience. If it doesn't help them, we don't build it.",
  },
  {
    icon: Zap,
    title: "Innovation",
    desc: "ANPR, face recognition, live CCTV monitoring — we bring enterprise-grade AI to local fuel stations.",
  },
];

const FEATURES = [
  "AI-powered Number Plate Recognition (ANPR)",
  "Real-time vehicle counting & analytics",
  "Face-recognition attendance for employees",
  "Integrated wallet & logistics payment system",
  "Gold & Diamond subscription plans",
  "Multi-role access: Owner · Logistics · Admin · Investor",
  "Live CCTV monitoring (multi-camera)",
  "Sales register with mismatch detection",
];

const TIMELINE = [
  { year: "2021", event: "FuelFlux founded in Bangalore with a seed team of 4 engineers and 1 pilot pump." },
  { year: "2022", event: "Launched billing & wallet system. Onboarded 50 pumps across Karnataka." },
  { year: "2023", event: "Introduced AI modules: ANPR, Vehicle Count, and Face Attendance. Expanded to 5 states." },
  { year: "2024", event: "500+ pumps active. Diamond plan with full AI suite launched. Series A funded." },
];

export default function AboutPage() {
  const [stats, setStats] = useState([
    { value: "...", label: "Fuel Stations", icon: Fuel },
    { value: "...", label: "Daily Transactions", icon: BarChart2 },
    { value: "99.9%", label: "Uptime SLA", icon: Shield },
    { value: "15+", label: "States Covered", icon: MapPin },
  ]);

  useEffect(() => {
    fetch('http://localhost:5000/api/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats([
            { value: `${data.data.fuelStations}+`, label: "Fuel Stations", icon: Fuel },
            { value: `${data.data.dailyTransactions}+`, label: "Daily Transactions", icon: BarChart2 },
            { value: data.data.uptimeSla, label: "Uptime SLA", icon: Shield },
            { value: `${data.data.statesCovered}+`, label: "States Covered", icon: MapPin },
          ]);
        }
      })
      .catch(err => console.error("Failed to fetch stats:", err));
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-orange-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 shadow-brand bg-gray-900">
              <Image src="/logo.png" alt="FuelFlux" width={36} height={36} className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-extrabold text-gray-900">FuelFlux</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#mission" className="text-gray-500 hover:text-orange-500 transition-colors">Mission</a>
            <a href="#features" className="text-gray-500 hover:text-orange-500 transition-colors">Features</a>
            <a href="#team" className="text-gray-500 hover:text-orange-500 transition-colors">Team</a>
            <a href="#contact" className="text-gray-500 hover:text-orange-500 transition-colors">Contact</a>
          </nav>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 border border-orange-200 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-all">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 text-white">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-orange-600/30 rounded-full blur-2xl" />

        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1.5 mb-6 text-sm font-semibold backdrop-blur-sm">
            <div className="w-5 h-5">
              <Image src="/logo.png" alt="FuelFlux" width={20} height={20} className="w-full h-full object-contain" />
            </div>
            Smart Fuel Management Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
            Powering India's<br />
            <span className="text-white drop-shadow-lg">Fuel Retail Revolution</span>
          </h1>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto leading-relaxed mb-10">
            FuelFlux is the all-in-one platform that brings AI, automation, and financial clarity
            to petrol pump owners, logistics companies, and investors across India.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/pump-owner/login" className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-6 py-3 rounded-xl hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              <Image src="/logo.png" alt="FuelFlux" width={16} height={16} className="object-contain" /> Get Started
            </Link>
            <a href="#mission" className="inline-flex items-center gap-2 bg-white/20 text-white font-semibold px-6 py-3 rounded-xl border border-white/30 hover:bg-white/30 transition-all backdrop-blur-sm">
              Learn More <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-orange-500 text-white">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-4xl font-black">{s.value}</p>
              <p className="text-orange-100 text-sm mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSION / VALUES ── */}
      <section id="mission" className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">Who We Are</span>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Built for the Fuel Industry</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-base leading-relaxed">
              We started FuelFlux because we saw pump owners struggling with paperwork, cash leakage,
              employee mismanagement, and zero data visibility. We decided to fix all of that — together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="flex gap-5 p-6 rounded-2xl border border-orange-100 bg-orange-50/40 hover:bg-orange-50 hover:border-orange-200 transition-all group">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-brand group-hover:scale-105 transition-transform">
                  <v.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="bg-gradient-to-br from-orange-50 to-amber-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block bg-orange-100 border border-orange-200 text-orange-600 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest">What We Offer</span>
              <h2 className="text-4xl font-black text-gray-900 mb-4 leading-tight">
                Everything a pump needs —<br />
                <span className="text-orange-500">in one platform.</span>
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                From billing a single vehicle to monitoring 10 CCTV cameras simultaneously,
                FuelFlux handles every operational need of a modern petrol station.
              </p>
              <Link href="/pump-owner/login" className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold px-5 py-2.5 rounded-xl hover:shadow-brand hover:-translate-y-0.5 transition-all">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEATURES.map((f) => (
                <div key={f} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-orange-100 shadow-card hover:border-orange-300 transition-colors">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-gray-700">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">Our Journey</span>
            <h2 className="text-4xl font-black text-gray-900">From Startup to Scale</h2>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-orange-100" />
            <div className="space-y-8">
              {TIMELINE.map((t, i) => (
                <div key={t.year} className="flex gap-6 items-start animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-brand z-10 relative">
                      {t.year}
                    </div>
                  </div>
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex-1 hover:border-orange-300 transition-colors">
                    <p className="text-sm text-gray-700 leading-relaxed">{t.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section id="team" className="bg-gradient-to-br from-orange-50 to-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-orange-100 border border-orange-200 text-orange-600 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">The People</span>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Meet the Team</h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm">Passionate engineers, operators, and product thinkers working to transform fuel retail.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member) => (
              <div key={member.name} className="group text-center bg-white border border-orange-100 rounded-2xl p-6 hover:border-orange-300 hover:-translate-y-1 transition-all shadow-card hover:shadow-soft">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white font-black text-lg mx-auto mb-4 shadow-brand group-hover:scale-105 transition-transform">
                  {member.avatar}
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-0.5">{member.name}</h3>
                <p className="text-xs font-semibold text-orange-500 mb-3">{member.role}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL BANNER ── */}
      <section className="bg-orange-500 py-16 px-6 text-white text-center relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto">
          <Star className="w-8 h-8 text-orange-200 mx-auto mb-4" />
          <blockquote className="text-2xl font-bold leading-relaxed mb-6 text-white">
            "FuelFlux reduced our billing errors by 90% and gave us complete visibility over every drop of fuel."
          </blockquote>
          <p className="text-orange-100 font-medium text-sm">— Rajesh Sharma, Sharma Fuel Station, Mumbai</p>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">Get in Touch</span>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm">Have questions? Want a demo? Our team is ready to help you get started.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-4xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-5">
              {[
                { icon: MapPin, label: "Headquarters", value: "FuelFlux Technologies Pvt. Ltd.\n12th Floor, Prestige Tech Park,\nBangalore, Karnataka — 560103" },
                { icon: Phone, label: "Phone", value: "+91 80 4567 8900\nMon–Sat, 9 AM – 6 PM IST" },
                { icon: Mail, label: "Email", value: "support@fuelflux.in\nhello@fuelflux.in" },
                { icon: Globe, label: "Website", value: "www.fuelflux.in" },
              ].map((c) => (
                <div key={c.label} className="flex gap-4 p-5 rounded-2xl border border-orange-100 bg-orange-50/30 hover:bg-orange-50 hover:border-orange-200 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-brand">
                    <c.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">{c.label}</p>
                    <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <form className="bg-orange-50 border border-orange-100 rounded-2xl p-7 space-y-4" onSubmit={e => e.preventDefault()}>
              <h3 className="text-base font-bold text-gray-900 mb-2">Send us a message</h3>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Your Name</label>
                <input className="input-base" placeholder="e.g. Rajesh Kumar" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                <input className="input-base" type="email" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number</label>
                <input className="input-base" type="tel" placeholder="10-digit number" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Message</label>
                <textarea className="input-base resize-none" rows={3} placeholder="How can we help you?" />
              </div>
              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                Send Message <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER ── */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 py-16 px-6 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black mb-4">Ready to modernise your fuel station?</h2>
          <p className="text-orange-100 mb-8 text-base">Join 500+ pump owners already using FuelFlux to run smarter operations.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/pump-owner/login" className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-6 py-3 rounded-xl hover:bg-orange-50 transition-all shadow-lg hover:-translate-y-0.5">
              <Image src="/logo.png" alt="FuelFlux" width={16} height={16} className="object-contain" /> Start as Pump Owner
            </Link>
            <Link href="/logistics/login" className="inline-flex items-center gap-2 bg-white/20 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/30 transition-all">
              <Truck className="w-4 h-4" /> Logistics Login
            </Link>
          </div>
        </div>
      </section>

      {/* ── SITE FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden bg-gray-900">
              <Image src="/logo.png" alt="FuelFlux" width={28} height={28} className="w-full h-full object-contain" />
            </div>
            <span className="text-white font-bold text-sm">FuelFlux</span>
          </div>
          <p className="text-xs text-center">© 2024 FuelFlux Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-5 text-xs">
            <Link href="/" className="hover:text-orange-400 transition-colors">Home</Link>
            <Link href="/about" className="text-orange-400 font-semibold">About Us</Link>
            <Link href="/admin/login" className="hover:text-orange-400 transition-colors">Admin</Link>
            <Link href="/investor/login" className="hover:text-orange-400 transition-colors">Investor</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
