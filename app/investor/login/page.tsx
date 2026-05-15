"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, ArrowLeft, Loader2, TrendingUp } from "lucide-react";

export default function InvestorLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    router.push("/investor/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-500 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-4 shadow-lg bg-gray-900 flex items-center justify-center">
              <Image src="/logo.png" alt="FuelFlux" width={64} height={64} className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-800 text-gray-900 mb-1" style={{ fontWeight: 800 }}>Investor Portal</h1>
            <p className="text-sm text-gray-500">View-only analytics and performance reports</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-600 text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Email Address</label>
              <input className="input-base" type="email" placeholder="investor@capital.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs font-600 text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Password</label>
              <div className="relative">
                <input className="input-base pr-10" type={showPw ? "text" : "password"} placeholder="Enter password"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-700">
              <strong>Demo:</strong> Any email and password — read-only access
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl font-600 text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg transition-all flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Logging in...</> : "View Analytics"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
