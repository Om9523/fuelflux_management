"use client";
import Link from "next/link";
import {
  Wallet, ArrowUpRight, TrendingUp, Clock, CheckCircle2,
  ArrowDownLeft, Fuel, Zap, RefreshCw
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";

const areaData = [
  { month: "Aug", funded: 120000 },
  { month: "Sep", funded: 145000 },
  { month: "Oct", funded: 98000 },
  { month: "Nov", funded: 175000 },
  { month: "Dec", funded: 210000 },
  { month: "Jan", funded: 185000 },
];

const recentTxns = [
  { pump: "Sharma Fuel Station", amount: 25000, date: "Jan 15", status: "verified", avatar: "SF" },
  { pump: "City Petrol Hub", amount: 50000, date: "Jan 14", status: "pending", avatar: "CP" },
  { pump: "Sharma Fuel Station", amount: 30000, date: "Jan 12", status: "verified", avatar: "SF" },
  { pump: "Green Valley Fuel", amount: 75000, date: "Jan 10", status: "verified", avatar: "GV" },
];

const statCards = [
  {
    label: "Wallet Balance", value: "₹1,85,400", sub: "Available to fund",
    icon: Wallet, bg: "from-orange-500 to-orange-600", text: "text-white", wide: true,
  },
  {
    label: "Funded This Month", value: "₹9.3L", sub: "+12% vs last month",
    icon: CheckCircle2, bg: "bg-orange-50", iconColor: "text-orange-600", border: "border-orange-100",
  },
  {
    label: "Pending Verification", value: "₹50,000", sub: "Awaiting admin",
    icon: Clock, bg: "bg-amber-50", iconColor: "text-amber-600", border: "border-amber-100",
  },
];

export default function LogisticsDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">

      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, Speedy Logistics!</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
            Account Active
          </span>
        </div>
      </div>

      {/* Wallet hero card + quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Big wallet card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-brand relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-orange-400/30 rounded-full" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4 opacity-80">
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-medium">Wallet Balance</span>
            </div>
            <p className="text-4xl font-black mb-1">₹1,85,400</p>
            <p className="text-xs text-orange-100 mb-6">Last updated: Today, 11:28 AM</p>
            <Link href="/logistics/fund-wallet">
              <div className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold text-sm px-4 py-2 rounded-xl hover:bg-orange-50 transition-colors shadow-sm cursor-pointer">
                <Zap className="w-3.5 h-3.5" /> Fund a Pump
              </div>
            </Link>
          </div>
        </div>

        {/* Right stat cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="stat-card border-orange-100">
            <div className="stat-card-icon bg-orange-100 text-orange-600 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-gray-900">₹9.3L</p>
            <p className="text-xs font-semibold text-gray-500 mt-1">Funded This Month</p>
            <p className="text-xs text-green-600 font-medium mt-0.5">↑ +12% vs last month</p>
          </div>

          <div className="stat-card border-amber-100">
            <div className="stat-card-icon bg-amber-100 text-amber-600 mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-gray-900">₹50,000</p>
            <p className="text-xs font-semibold text-gray-500 mt-1">Pending Verification</p>
            <p className="text-xs text-amber-600 font-medium mt-0.5">1 transfer awaiting admin</p>
          </div>

          <div className="stat-card border-green-100">
            <div className="stat-card-icon bg-green-100 text-green-600 mb-3">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-gray-900">23</p>
            <p className="text-xs font-semibold text-gray-500 mt-1">Total Transactions</p>
            <p className="text-xs text-green-600 font-medium mt-0.5">21 verified · 2 pending</p>
          </div>

          <div className="stat-card border-orange-100">
            <div className="stat-card-icon bg-orange-100 text-orange-600 mb-3">
              <Fuel className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-gray-900">4</p>
            <p className="text-xs font-semibold text-gray-500 mt-1">Pump Partners</p>
            <p className="text-xs text-orange-600 font-medium mt-0.5">All pumps active</p>
          </div>
        </div>
      </div>

      {/* Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Monthly Funding (₹)</h2>
              <p className="text-xs text-gray-400 mt-0.5">Aug 2023 — Jan 2024</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-orange-600 font-semibold">
              <span className="w-2.5 h-2.5 rounded-sm bg-orange-500 inline-block" />
              Funded
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="logGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Funded"]}
              />
              <Area type="monotone" dataKey="funded" stroke="#f97316" strokeWidth={2.5} fill="url(#logGrad)" dot={false} activeDot={{ r: 5, fill: "#f97316" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="card p-5 flex flex-col">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3 flex-1">
            <Link href="/logistics/fund-wallet">
              <div className="group flex items-center gap-3 p-4 rounded-2xl bg-orange-50 hover:bg-orange-100 border border-orange-100 hover:border-orange-200 cursor-pointer transition-all">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-brand group-hover:scale-105 transition-transform">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-orange-900">Fund a Pump</p>
                  <p className="text-xs text-orange-600">Transfer to wallet</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-orange-400 group-hover:text-orange-600" />
              </div>
            </Link>

            <Link href="/logistics/transactions">
              <div className="group flex items-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-orange-50 border border-gray-100 hover:border-orange-100 cursor-pointer transition-all">
                <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors group-hover:scale-105">
                  <TrendingUp className="w-5 h-5 text-gray-600 group-hover:text-orange-600 transition-colors" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">Transactions</p>
                  <p className="text-xs text-gray-500">All payment history</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-orange-400" />
              </div>
            </Link>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3" /> Data refreshes every 30s
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Recent Transactions</h2>
            <p className="text-xs text-gray-400 mt-0.5">{recentTxns.length} latest transfers</p>
          </div>
          <Link href="/logistics/transactions" className="text-xs font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1">
            View All <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentTxns.map((t, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4 hover:bg-orange-50/40 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center font-bold text-orange-600 text-xs border border-orange-100">
                {t.avatar}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{t.pump}</p>
                <p className="text-xs text-gray-400">{t.date}</p>
              </div>
              <p className="font-bold text-gray-900">₹{t.amount.toLocaleString("en-IN")}</p>
              <span className={`badge ${t.status === "verified" ? "badge-green" : "badge-yellow"}`}>
                {t.status === "verified" ? "✓ Verified" : "⏳ Pending"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
