"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    if (form.username && form.password) {
      router.push("/admin/dashboard");
    } else {
      setError("Invalid admin credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-purple-500 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <div className="card p-8 border-purple-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-4 shadow-lg bg-gray-900 flex items-center justify-center">
              <Image src="/logo.png" alt="FuelFlux" width={64} height={64} className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-800 text-gray-900 mb-1" style={{ fontWeight: 800 }}>Admin Control Panel</h1>
            <p className="text-sm text-gray-500">Restricted access — authorized personnel only</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-600 text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Admin Username</label>
              <input className="input-base" placeholder="admin@fuelflux.com" value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs font-600 text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Password</label>
              <div className="relative">
                <input className="input-base pr-10" type={showPw ? "text" : "password"} placeholder="Admin password"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">{error}</div>}
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-xs text-purple-700">
              <strong>Demo:</strong> Enter any username and password
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl font-600 text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg transition-all flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : "Access Admin Panel"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
