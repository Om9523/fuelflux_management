"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Truck, Eye, EyeOff, ArrowLeft, Loader2, Package, BarChart3 } from "lucide-react";

export default function LogisticsLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    if (form.email && form.password) {
      router.push("/logistics/dashboard");
    } else {
      setError("Please enter valid credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex">

      {/* ── Left Panel — Branding ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 relative overflow-hidden flex-col justify-between p-12">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-orange-600/30 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-900 border border-white/20 shadow-brand">
            <Image src="/logo.png" alt="FuelFlux" width={40} height={40} className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-white font-extrabold text-lg leading-none">FuelFlux</p>
            <p className="text-orange-100 text-xs">Smart Fuel Management</p>
          </div>
        </div>

        {/* Hero Text */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-3 py-1.5 mb-6">
            <Truck className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-xs font-semibold">Logistics Partner Portal</span>
          </div>
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Fund pumps.<br />
            Track payments.<br />
            Stay in control.
          </h1>
          <p className="text-orange-100 text-sm leading-relaxed max-w-sm">
            The FuelFlux logistics portal lets you fund pump wallets, generate QR payments, and track every transaction in real time.
          </p>
        </div>

        {/* Feature pills */}
        <div className="relative flex flex-col gap-3">
          {[
            { icon: Truck, label: "Fund pump wallets instantly" },
            { icon: BarChart3, label: "Track all payment statuses" },
            { icon: Package, label: "Multi-pump management" },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-3 bg-white/15 border border-white/20 rounded-xl px-4 py-3 backdrop-blur-sm">
              <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <f.icon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white text-sm font-medium">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel — Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-white">
        <div className="w-full max-w-md">

          {/* Back Link */}
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-orange-500 transition-colors mb-10">
            <ArrowLeft className="w-4 h-4" />
            Back to Role Selection
          </Link>

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-900 shadow-brand">
              <Image src="/logo.png" alt="FuelFlux" width={40} height={40} className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="font-extrabold text-gray-900">FuelFlux</p>
              <p className="text-xs text-gray-400">Logistics Portal</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Welcome back 👋</h1>
            <p className="text-gray-500 text-sm">Sign in to your logistics partner account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Email Address</label>
              <input
                className="input-base"
                type="email"
                placeholder="logistics@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-600">Password</label>
                <span className="text-xs text-orange-500 cursor-pointer hover:text-orange-600 font-medium">Forgot password?</span>
              </div>
              <div className="relative">
                <input
                  className="input-base pr-11"
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600 flex items-center gap-2">
                <span className="w-4 h-4 flex-shrink-0">⚠️</span> {error}
              </div>
            )}

            {/* Demo hint */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-xs text-orange-700">
              <strong>Demo access:</strong> Enter any email and password to enter the portal
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                : <><Truck className="w-4 h-4" /> Login to Logistics Portal</>
              }
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-8">
            Need access?{" "}
            <Link href="/about#contact" className="text-orange-500 hover:text-orange-600 font-semibold">
              Contact FuelFlux support →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
