"use client";
import { DollarSign, TrendingUp, Download } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const monthlyRevenue = [
  { month: "Jul", revenue: 1850000, expenses: 620000 },
  { month: "Aug", revenue: 2100000, expenses: 710000 },
  { month: "Sep", revenue: 1950000, expenses: 680000 },
  { month: "Oct", revenue: 2400000, expenses: 820000 },
  { month: "Nov", revenue: 2750000, expenses: 940000 },
  { month: "Dec", revenue: 3100000, expenses: 1050000 },
  { month: "Jan", revenue: 2850000, expenses: 980000 },
];

const revenueStreams = [
  { stream: "Subscription Fees", amount: 12400000, pct: 44, color: "#6366f1" },
  { stream: "Transaction Commissions", amount: 9200000, pct: 33, color: "#f97316" },
  { stream: "Wallet Funding Fees", amount: 4100000, pct: 15, color: "#22c55e" },
  { stream: "AI Feature Premium", amount: 2300000, pct: 8, color: "#a855f7" },
];

const topStations = [
  { name: "City Petrol Hub", plan: "Diamond", revenue: "₹4.2L", growth: "+18%", pct: 100 },
  { name: "Sharma Fuel Station", plan: "Gold", revenue: "₹3.8L", growth: "+12%", pct: 90 },
  { name: "Metro Fuels", plan: "Diamond", revenue: "₹2.9L", growth: "+8%", pct: 69 },
  { name: "Green Valley Fuel", plan: "Gold", revenue: "₹2.1L", growth: "+22%", pct: 50 },
  { name: "Sunrise Fuels", plan: "Gold", revenue: "₹1.8L", growth: "+6%", pct: 43 },
];

export default function RevenueInsightsPage() {
  const totalRevenue = monthlyRevenue.reduce((a, b) => a + b.revenue, 0);
  const totalExpenses = monthlyRevenue.reduce((a, b) => a + b.expenses, 0);
  const netProfit = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2" style={{ fontWeight: 800 }}>
            <DollarSign className="w-6 h-6 text-indigo-500" /> Revenue Insights
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform-wide revenue streams and profitability analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2 text-xs text-indigo-700 font-semibold">👁 View-Only</div>
          <button className="btn-secondary flex items-center gap-2 py-2 px-3 text-xs">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5" style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
          <p className="text-indigo-200 text-xs font-semibold mb-1">Total Revenue (7M)</p>
          <p className="text-3xl font-black text-white">₹{(totalRevenue / 10000000).toFixed(2)}Cr</p>
          <p className="text-indigo-200 text-xs mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +22.4% YoY</p>
        </div>
        <div className="card p-5">
          <p className="text-gray-500 text-xs font-semibold mb-1">Total Operating Expenses</p>
          <p className="text-3xl font-black text-gray-900">₹{(totalExpenses / 10000000).toFixed(2)}Cr</p>
          <p className="text-red-500 text-xs mt-1">34.2% of revenue</p>
        </div>
        <div className="card p-5" style={{ background: "linear-gradient(135deg, #059669, #047857)" }}>
          <p className="text-green-200 text-xs font-semibold mb-1">Net Profit (7M)</p>
          <p className="text-3xl font-black text-white">₹{(netProfit / 10000000).toFixed(2)}Cr</p>
          <p className="text-green-200 text-xs mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> 65.8% margin</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expenses */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Revenue vs Expenses — Monthly (₹)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyRevenue} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                formatter={(v: number) => `₹${(v / 100000).toFixed(2)}L`} />
              <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Streams */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Revenue Streams</h2>
          <div className="space-y-4">
            {revenueStreams.map(s => (
              <div key={s.stream}>
                <div className="flex justify-between mb-1.5 text-xs">
                  <span className="text-gray-600">{s.stream}</span>
                  <span className="font-bold text-gray-900">₹{(s.amount / 10000000).toFixed(2)}Cr ({s.pct}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Net Profit Area Chart */}
      <div className="card p-5">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Net Profit Trend (₹)</h2>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={monthlyRevenue.map(m => ({ ...m, profit: m.revenue - m.expenses }))}>
            <defs>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
              tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
              formatter={(v: number) => `₹${(v / 100000).toFixed(2)}L`} />
            <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#059669" strokeWidth={2.5} fill="url(#profitGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top Stations */}
      <div className="card">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Top Revenue-Generating Stations</h2>
        </div>
        <div className="p-5 space-y-4">
          {topStations.map((s, i) => (
            <div key={s.name} className="flex items-center gap-4">
              <div className="w-7 h-7 bg-indigo-50 rounded-full flex items-center justify-center text-xs font-black text-indigo-600">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{s.name}</p>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="text-xs font-black text-gray-900">{s.revenue}</span>
                    <span className="text-xs font-semibold text-green-600">{s.growth}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-indigo-500 transition-all" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
              <span className={`badge text-xs flex-shrink-0 ${s.plan === "Diamond" ? "badge-blue" : "badge-orange"}`}>
                {s.plan === "Diamond" ? "💎" : "🥇"} {s.plan}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
