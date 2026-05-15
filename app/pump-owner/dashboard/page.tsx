"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import Link from "next/link";
import { Wallet, Receipt, Users, TrendingUp, ArrowUpRight, ArrowDownRight, Zap, AlertTriangle } from "lucide-react";

const salesData = [
  { day: "Mon", petrol: 4200, diesel: 3100 },
  { day: "Tue", petrol: 3800, diesel: 2900 },
  { day: "Wed", petrol: 5100, diesel: 3400 },
  { day: "Thu", petrol: 4700, diesel: 3200 },
  { day: "Fri", petrol: 6200, diesel: 4100 },
  { day: "Sat", petrol: 7400, diesel: 4800 },
  { day: "Sun", petrol: 5600, diesel: 3700 },
];

const recentBills = [
  { id: "FF001", vehicle: "MH12AB1234", fuel: "Petrol", qty: "12L", amount: "₹1,320", time: "09:42 AM", status: "settled" },
  { id: "FF002", vehicle: "DL4C5678", fuel: "Diesel", qty: "25L", amount: "₹2,275", time: "10:15 AM", status: "settled" },
  { id: "FF003", vehicle: "KA03CD9012", fuel: "Petrol", qty: "8L", amount: "₹880", time: "10:51 AM", status: "settled" },
  { id: "FF004", vehicle: "TN07EF3456", fuel: "Diesel", qty: "40L", amount: "₹3,640", time: "11:28 AM", status: "settled" },
];

const stats = [
  { label: "Wallet Balance", value: "₹48,250", change: "+₹12,000", up: true, icon: Wallet, color: "bg-orange-100 text-orange-600", bg: "from-orange-50" },
  { label: "Today's Sales", value: "₹32,480", change: "+8.4%", up: true, icon: Receipt, color: "bg-blue-100 text-blue-600", bg: "from-blue-50" },
  { label: "Total Employees", value: "12", change: "2 on leave", up: false, icon: Users, color: "bg-purple-100 text-purple-600", bg: "from-purple-50" },
  { label: "Monthly Revenue", value: "₹9.2L", change: "+15.3%", up: true, icon: TrendingUp, color: "bg-green-100 text-green-600", bg: "from-green-50" },
];

const quickActions = [
  { label: "New Bill", href: "/pump-owner/billing", icon: "⛽", color: "bg-orange-500" },
  { label: "Add Employee", href: "/pump-owner/employees", icon: "👤", color: "bg-blue-500" },
  { label: "View Wallet", href: "/pump-owner/wallet", icon: "💳", color: "bg-purple-500" },
  { label: "Sales Report", href: "/pump-owner/sales", icon: "📊", color: "bg-green-500" },
  { label: "ANPR Camera", href: "/pump-owner/ai/anpr", icon: "🤖", color: "bg-red-500" },
  { label: "Live Monitor", href: "/pump-owner/monitor", icon: "📹", color: "bg-indigo-500" },
];

export default function PumpOwnerDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-800 text-gray-900" style={{ fontWeight: 800 }}>Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Good morning, Rajesh! Here's your station overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
            <span className="status-dot online" />
            <span className="text-xs font-600 text-green-700" style={{ fontWeight: 600 }}>Station Online</span>
          </div>
          <div className="live-badge">
            <span className="live-dot" />
            LIVE
          </div>
        </div>
      </div>

      {/* Subscription Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-600 text-amber-800" style={{ fontWeight: 600 }}>Subscription Required</p>
          <p className="text-xs text-amber-700 mt-0.5">You're on the Free plan. Upgrade to Gold or Diamond to unlock full features.</p>
        </div>
        <Link href="/pump-owner/subscription" className="text-xs font-600 text-amber-700 hover:text-amber-900 underline whitespace-nowrap" style={{ fontWeight: 600 }}>
          Upgrade Now →
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-start justify-between mb-4">
              <div className={`stat-card-icon ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className={`flex items-center gap-1 text-xs font-600 ${s.up ? "text-green-600" : "text-gray-500"}`} style={{ fontWeight: 600 }}>
                {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {s.change}
              </span>
            </div>
            <p className="text-2xl font-800 text-gray-900" style={{ fontWeight: 800 }}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-700 text-gray-700 mb-3" style={{ fontWeight: 700 }}>Quick Actions</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {quickActions.map((a) => (
            <Link key={a.label} href={a.href}>
              <div className="card p-4 text-center cursor-pointer hover:-translate-y-1 transition-all group">
                <div className={`w-10 h-10 ${a.color} rounded-xl flex items-center justify-center text-lg mx-auto mb-2 group-hover:scale-110 transition-transform shadow-sm`}>
                  {a.icon}
                </div>
                <p className="text-xs font-500 text-gray-700" style={{ fontWeight: 500 }}>{a.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-700 text-gray-900" style={{ fontWeight: 700 }}>Weekly Sales (₹)</h2>
              <p className="text-xs text-gray-400 mt-0.5">Petrol vs Diesel — this week</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-orange-400 inline-block" />Petrol</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-400 inline-block" />Diesel</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="petrolGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dieselGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
              <Area type="monotone" dataKey="petrol" stroke="#f97316" strokeWidth={2} fill="url(#petrolGrad)" />
              <Area type="monotone" dataKey="diesel" stroke="#3b82f6" strokeWidth={2} fill="url(#dieselGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Fuel Stock */}
        <div className="card p-5">
          <h2 className="text-sm font-700 text-gray-900 mb-4" style={{ fontWeight: 700 }}>Fuel Stock Status</h2>
          <div className="space-y-4">
            {[
              { label: "Petrol", stock: 68, total: "10,000L", current: "6,800L", color: "#f97316" },
              { label: "Diesel", stock: 42, total: "8,000L", current: "3,360L", color: "#3b82f6" },
              { label: "CNG", stock: 85, total: "5,000 Kg", current: "4,250 Kg", color: "#22c55e" },
            ].map((f) => (
              <div key={f.label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs font-600 text-gray-700" style={{ fontWeight: 600 }}>{f.label}</span>
                  <span className="text-xs text-gray-500">{f.current}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${f.stock}%`, background: f.color }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{f.stock}% of {f.total}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-orange-600">
              <Zap className="w-3 h-3" />
              <span className="font-500" style={{ fontWeight: 500 }}>Diesel below 50% — restock soon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bills */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-700 text-gray-900" style={{ fontWeight: 700 }}>Recent Bills</h2>
          <Link href="/pump-owner/billing" className="text-xs font-600 text-orange-500 hover:text-orange-600" style={{ fontWeight: 600 }}>
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Vehicle No.</th>
                <th>Fuel Type</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBills.map((bill) => (
                <tr key={bill.id}>
                  <td className="font-600 text-orange-600" style={{ fontWeight: 600 }}>{bill.id}</td>
                  <td><span className="font-mono text-sm">{bill.vehicle}</span></td>
                  <td>
                    <span className={`badge ${bill.fuel === "Petrol" ? "badge-orange" : "badge-blue"}`}>{bill.fuel}</span>
                  </td>
                  <td>{bill.qty}</td>
                  <td className="font-700" style={{ fontWeight: 700 }}>{bill.amount}</td>
                  <td className="text-gray-400">{bill.time}</td>
                  <td><span className="badge badge-green">✓ Settled</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
