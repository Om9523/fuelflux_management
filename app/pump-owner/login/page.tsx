"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";

export default function PumpOwnerLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ phone: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNew, setIsNew] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    if (form.phone === "9999999999" && form.password === "demo123") {
      router.push("/pump-owner/onboarding");
    } else if (form.phone && form.password) {
      router.push("/pump-owner/dashboard");
    } else {
      setError("Invalid credentials. Try phone: 9999999999, password: demo123");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Role Selection
        </Link>

        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-4 shadow-brand bg-gray-900 flex items-center justify-center">
              <Image src="/logo.png" alt="FuelFlux" width={64} height={64} className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-800 text-gray-900 mb-1" style={{ fontWeight: 800 }}>Pump Owner Login</h1>
            <p className="text-sm text-gray-500">Access your fuel station dashboard</p>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button onClick={() => setIsNew(false)} className={`flex-1 py-2 rounded-lg text-sm font-600 transition-all ${!isNew ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`} style={{ fontWeight: 600 }}>
              Existing User
            </button>
            <button onClick={() => setIsNew(true)} className={`flex-1 py-2 rounded-lg text-sm font-600 transition-all ${isNew ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`} style={{ fontWeight: 600 }}>
              New Registration
            </button>
          </div>

          {!isNew ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-600 text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Phone Number</label>
                <input className="input-base" type="tel" placeholder="Enter your 10-digit phone" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs font-600 text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Password</label>
                <div className="relative">
                  <input className="input-base pr-10" type={showPw ? "text" : "password"} placeholder="Enter your password" value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">{error}</div>
              )}
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-xs text-orange-700">
                <strong>Demo:</strong> Phone: 9999999999 | Password: demo123 (new user) or any credentials for dashboard
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Logging in...</> : "Login to Dashboard"}
              </button>
              <p className="text-center text-xs text-gray-400">
                Forgot password? <span className="text-orange-500 cursor-pointer hover:underline">Reset here</span>
              </p>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="text-4xl mb-4">⛽</div>
              <p className="text-sm text-gray-600 mb-4">Register your fuel pump and start managing operations with FuelFlux</p>
              <button onClick={() => router.push("/pump-owner/onboarding")} className="btn-primary w-full">
                Start Registration
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
