"use client";
import Link from "next/link";
import { FileCheck, CreditCard, DollarSign, Users, AlertTriangle, TrendingUp, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const pendingItems = [
  { type: "doc", pump: "Sunrise Fuels", item: "Pump License Upload", time: "2h ago", priority: "high" },
  { type: "sub", pump: "Mehta Petrolium", item: "Diamond Plan Payment", time: "4h ago", priority: "medium" },
  { type: "pay", pump: "Speedy Logistics → City Hub", item: "₹50,000 Fund Transfer", time: "5h ago", priority: "high" },
  { type: "doc", pump: "Kumar Gas Station", item: "NOC Certificate", time: "6h ago", priority: "medium" },
];

const monthData = [
  { month: "Aug", pumps: 12, revenue: 180000 },
  { month: "Sep", pumps: 15, revenue: 225000 },
  { month: "Oct", pumps: 14, revenue: 198000 },
  { month: "Nov", pumps: 18, revenue: 267000 },
  { month: "Dec", pumps: 22, revenue: 312000 },
  { month: "Jan", pumps: 19, revenue: 285000 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-800 text-gray-900" style={{ fontWeight: 800 }}>Admin Control Panel</h1>
          <p className="text-sm text-gray-500 mt-0.5">System overview — FuelFlux Platform</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-red flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> 4 Pending Actions</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Pumps", value: "89", sub: "12 pending", icon: "⛽", color: "bg-orange-100 text-orange-600" },
          { label: "Active Subscriptions", value: "67", sub: "Gold: 42 · Diamond: 25", icon: "💎", color: "bg-purple-100 text-purple-600" },
          { label: "Platform Revenue", value: "₹28.5L", sub: "+15.3% this month", icon: "💰", color: "bg-green-100 text-green-600" },
          { label: "Total Users", value: "142", sub: "Pumps + Logistics", icon: "👥", color: "bg-blue-100 text-blue-600" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-card-icon ${s.color} mb-3`}>{s.icon}</div>
            <p className="text-2xl font-800 text-gray-900" style={{ fontWeight: 800 }}>{s.value}</p>
            <p className="text-xs font-500 text-gray-500 mt-0.5" style={{ fontWeight: 500 }}>{s.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Pending Actions */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <h2 className="text-sm font-700 text-gray-900" style={{ fontWeight: 700 }}>Pending Actions</h2>
          <span className="badge badge-red ml-auto">{pendingItems.length} actions</span>
        </div>
        <div className="divide-y divide-gray-50">
          {pendingItems.map((item, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${item.type === "doc" ? "bg-blue-100" : item.type === "sub" ? "bg-purple-100" : "bg-orange-100"}`}>
                {item.type === "doc" ? "📄" : item.type === "sub" ? "💎" : "💳"}
              </div>
              <div className="flex-1">
                <p className="text-sm font-600 text-gray-900" style={{ fontWeight: 600 }}>{item.pump}</p>
                <p className="text-xs text-gray-500">{item.item}</p>
              </div>
              <span className="text-xs text-gray-400">{item.time}</span>
              <span className={`badge ${item.priority === "high" ? "badge-red" : "badge-yellow"}`}>{item.priority}</span>
              <Link href={item.type === "doc" ? "/admin/documents" : item.type === "sub" ? "/admin/subscriptions" : "/admin/payments"}
                className="btn-secondary text-xs py-1.5 px-3">Review</Link>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Chart */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="text-sm font-700 text-gray-900 mb-4" style={{ fontWeight: 700 }}>Platform Growth (Pumps & Revenue)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                formatter={(v: number, n: string) => n === "revenue" ? `₹${v.toLocaleString()}` : v} />
              <Bar dataKey="revenue" name="Revenue" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="card p-5">
          <h2 className="text-sm font-700 text-gray-900 mb-4" style={{ fontWeight: 700 }}>Admin Actions</h2>
          <div className="space-y-2">
            {[
              { href: "/admin/documents", label: "Verify Documents", icon: FileCheck, count: 3 },
              { href: "/admin/subscriptions", label: "Approve Subscriptions", icon: CreditCard, count: 2 },
              { href: "/admin/payments", label: "Verify Payments", icon: DollarSign, count: 1 },
              { href: "/admin/users", label: "Manage Users", icon: Users, count: 0 },
            ].map(a => (
              <Link key={a.href} href={a.href}>
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 cursor-pointer transition-colors border border-transparent hover:border-purple-100">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <a.icon className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="flex-1 text-sm font-500 text-gray-700" style={{ fontWeight: 500 }}>{a.label}</span>
                  {a.count > 0 && <span className="badge badge-red">{a.count}</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
