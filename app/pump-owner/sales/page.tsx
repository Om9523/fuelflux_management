"use client";
import { useState } from "react";
import { TrendingUp, TrendingDown, Download, Filter, Calendar, BarChart2 } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

const dailySales = [
  { day: "Mon", petrol: 42000, diesel: 31000, cng: 8500 },
  { day: "Tue", petrol: 38000, diesel: 29000, cng: 7200 },
  { day: "Wed", petrol: 51000, diesel: 34000, cng: 9800 },
  { day: "Thu", petrol: 47000, diesel: 32000, cng: 8100 },
  { day: "Fri", petrol: 62000, diesel: 41000, cng: 11200 },
  { day: "Sat", petrol: 74000, diesel: 48000, cng: 14500 },
  { day: "Sun", petrol: 56000, diesel: 37000, cng: 10300 },
];

const monthlyData = [
  { month: "Aug", revenue: 820000, transactions: 2100 },
  { month: "Sep", revenue: 945000, transactions: 2350 },
  { month: "Oct", revenue: 880000, transactions: 2200 },
  { month: "Nov", revenue: 1050000, transactions: 2600 },
  { month: "Dec", revenue: 1230000, transactions: 3100 },
  { month: "Jan", revenue: 1180000, transactions: 2900 },
];

const transactions = [
  { id: "FF001", vehicle: "MH12AB1234", fuel: "Petrol", qty: "12L", amount: 1320, time: "09:42 AM", staff: "Ramesh K." },
  { id: "FF002", vehicle: "DL4C5678", fuel: "Diesel", qty: "25L", amount: 2275, time: "10:15 AM", staff: "Suresh M." },
  { id: "FF003", vehicle: "KA03CD9012", fuel: "Petrol", qty: "8L", amount: 880, time: "10:51 AM", staff: "Ramesh K." },
  { id: "FF004", vehicle: "TN07EF3456", fuel: "Diesel", qty: "40L", amount: 3640, time: "11:28 AM", staff: "Priya R." },
  { id: "FF005", vehicle: "GJ05GH7890", fuel: "CNG", qty: "5 Kg", amount: 450, time: "12:03 PM", staff: "Suresh M." },
];

export default function SalesPage() {
  const [period, setPeriod] = useState("week");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900" style={{ fontWeight: 800 }}>Sales Register</h1>
          <p className="text-sm text-gray-500 mt-0.5">Revenue, transactions, and fuel-wise breakdown</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-xl p-1">
            {["week", "month"].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${period === p ? "bg-white shadow text-orange-600" : "text-gray-500"}`}>
                {p}
              </button>
            ))}
          </div>
          <button className="btn-secondary flex items-center gap-2 py-2 px-4 text-xs">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Revenue", value: "₹32,480", change: "+8.4%", up: true, color: "bg-orange-100 text-orange-600" },
          { label: "Weekly Revenue", value: "₹3,70,000", change: "+12.1%", up: true, color: "bg-blue-100 text-blue-600" },
          { label: "Total Transactions", value: "284", change: "+18", up: true, color: "bg-green-100 text-green-600" },
          { label: "Avg. Ticket Size", value: "₹1,302", change: "-2.3%", up: false, color: "bg-purple-100 text-purple-600" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-card-icon ${s.color} mb-3`}><BarChart2 className="w-5 h-5" /></div>
            <p className="text-2xl text-gray-900" style={{ fontWeight: 800 }}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            <p className={`text-xs font-semibold mt-1 flex items-center gap-1 ${s.up ? "text-green-600" : "text-red-500"}`}>
              {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {s.change}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Sales Chart */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Daily Sales by Fuel Type (₹)</h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-2 bg-orange-400 rounded inline-block" />Petrol</span>
              <span className="flex items-center gap-1"><span className="w-3 h-2 bg-blue-400 rounded inline-block" />Diesel</span>
              <span className="flex items-center gap-1"><span className="w-3 h-2 bg-green-400 rounded inline-block" />CNG</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailySales} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
              <Bar dataKey="petrol" name="Petrol" fill="#f97316" radius={[3, 3, 0, 0]} />
              <Bar dataKey="diesel" name="Diesel" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="cng" name="CNG" fill="#22c55e" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fuel Split */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Revenue Split — Today</h2>
          <div className="space-y-4">
            {[
              { label: "Petrol", pct: 55, value: "₹17,864", color: "#f97316" },
              { label: "Diesel", pct: 35, value: "₹11,368", color: "#3b82f6" },
              { label: "CNG", pct: 10, value: "₹3,248", color: "#22c55e" },
            ].map(f => (
              <div key={f.label}>
                <div className="flex justify-between mb-1.5 text-xs">
                  <span className="font-semibold text-gray-700">{f.label}</span>
                  <span className="text-gray-500">{f.value} ({f.pct}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: `${f.pct}%`, background: f.color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-700 mb-3">Top Staff Performance</h3>
            <div className="space-y-2">
              {[
                { name: "Ramesh K.", txns: 12, revenue: "₹14,200" },
                { name: "Suresh M.", txns: 9, revenue: "₹11,500" },
                { name: "Priya R.", txns: 7, revenue: "₹6,780" },
              ].map(s => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-600">
                      {s.name[0]}
                    </div>
                    <span className="text-xs text-gray-700">{s.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-900">{s.revenue}</p>
                    <p className="text-xs text-gray-400">{s.txns} txns</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900">Monthly Revenue Trend</h2>
          <span className="badge badge-green text-xs">↑ 14.2% YoY</span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
              tickFormatter={v => `₹${(v/100000).toFixed(1)}L`} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
              formatter={(v: number) => `₹${(v/100000).toFixed(2)}L`} />
            <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} fill="url(#salesGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Transactions Table */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">Today's Transactions</h2>
          <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
            <Filter className="w-3 h-3" /> Filter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr><th>Bill ID</th><th>Vehicle</th><th>Fuel</th><th>Qty</th><th>Amount</th><th>Time</th><th>Staff</th></tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id}>
                  <td className="font-semibold text-orange-600">{t.id}</td>
                  <td><span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{t.vehicle}</span></td>
                  <td><span className={`badge ${t.fuel === "Petrol" ? "badge-orange" : t.fuel === "Diesel" ? "badge-blue" : "badge-green"}`}>{t.fuel}</span></td>
                  <td className="text-sm">{t.qty}</td>
                  <td className="font-bold">₹{t.amount.toLocaleString("en-IN")}</td>
                  <td className="text-xs text-gray-400 font-mono">{t.time}</td>
                  <td className="text-sm text-gray-600">{t.staff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
