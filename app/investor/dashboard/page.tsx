"use client";
import { TrendingUp, DollarSign, Percent, BarChart2 } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const revenueData = [
  { month: "Jul", revenue: 1850000, pumps: 62 },
  { month: "Aug", revenue: 2100000, pumps: 68 },
  { month: "Sep", revenue: 1950000, pumps: 71 },
  { month: "Oct", revenue: 2400000, pumps: 75 },
  { month: "Nov", revenue: 2750000, pumps: 80 },
  { month: "Dec", revenue: 3100000, pumps: 84 },
  { month: "Jan", revenue: 2850000, pumps: 89 },
];

const roiData = [
  { quarter: "Q1 FY23", roi: 12.4 },
  { quarter: "Q2 FY23", roi: 15.8 },
  { quarter: "Q3 FY23", roi: 14.2 },
  { quarter: "Q4 FY23", roi: 18.6 },
  { quarter: "Q1 FY24", roi: 21.3 },
  { quarter: "Q2 FY24", roi: 24.7 },
];

const pumpPerf = [
  { name: "Diamond Plan", value: 25, color: "#6366f1" },
  { name: "Gold Plan", value: 42, color: "#f97316" },
  { name: "Free Plan", value: 22, color: "#94a3b8" },
];

const topPumps = [
  { name: "City Petrol Hub", revenue: "₹4.2L", growth: "+18%", plan: "Diamond" },
  { name: "Sharma Fuel Station", revenue: "₹3.8L", growth: "+12%", plan: "Gold" },
  { name: "Metro Fuels", revenue: "₹2.9L", growth: "+8%", plan: "Diamond" },
  { name: "Green Valley Fuel", revenue: "₹2.1L", growth: "+22%", plan: "Gold" },
];

export default function InvestorDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-800 text-gray-900" style={{ fontWeight: 800 }}>Investor Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Read-only platform analytics & ROI overview</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2 text-xs text-indigo-700 font-500" style={{ fontWeight: 500 }}>
          👁 View-Only Access
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue (Jan)", value: "₹28.5L", change: "+15.3%", icon: DollarSign, color: "bg-indigo-100 text-indigo-600" },
          { label: "Active Pumps", value: "89", change: "+7 this month", icon: TrendingUp, color: "bg-green-100 text-green-600" },
          { label: "Avg. ROI", value: "24.7%", change: "+3.4% QoQ", icon: Percent, color: "bg-orange-100 text-orange-600" },
          { label: "Platform AUM", value: "₹1.83Cr", change: "Wallet funds", icon: BarChart2, color: "bg-purple-100 text-purple-600" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-card-icon ${s.color} mb-3`}><s.icon className="w-5 h-5" /></div>
            <p className="text-2xl font-800 text-gray-900" style={{ fontWeight: 800 }}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            <p className="text-xs text-green-600 font-500 mt-0.5" style={{ fontWeight: 500 }}>{s.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="text-sm font-700 text-gray-900 mb-4" style={{ fontWeight: 700 }}>Monthly Revenue (₹)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                formatter={(v: number) => `₹${(v / 100000).toFixed(2)}L`} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Plan Distribution */}
        <div className="card p-5">
          <h2 className="text-sm font-700 text-gray-900 mb-4" style={{ fontWeight: 700 }}>Subscription Distribution</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pumpPerf} cx="50%" cy="50%" outerRadius={70} dataKey="value" paddingAngle={3}>
                {pumpPerf.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pumpPerf.map(p => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ background: p.color }} />
                  <span className="text-xs text-gray-600">{p.name}</span>
                </div>
                <span className="text-xs font-600 text-gray-900" style={{ fontWeight: 600 }}>{p.value} pumps</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROI Chart */}
      <div className="card p-5">
        <h2 className="text-sm font-700 text-gray-900 mb-4" style={{ fontWeight: 700 }}>Quarterly ROI (%)</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={roiData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
              formatter={(v: number) => `${v}%`} />
            <Bar dataKey="roi" name="ROI" fill="#6366f1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Pumps */}
      <div className="card">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-sm font-700 text-gray-900" style={{ fontWeight: 700 }}>Top Performing Pumps</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead><tr><th>Pump</th><th>Monthly Revenue</th><th>Growth</th><th>Plan</th></tr></thead>
            <tbody>
              {topPumps.map((p, i) => (
                <tr key={i}>
                  <td><div className="flex items-center gap-2"><span className="w-5 h-5 bg-indigo-100 rounded-full text-xs flex items-center justify-center text-indigo-600 font-700" style={{ fontWeight: 700 }}>{i + 1}</span><span className="font-600 text-sm" style={{ fontWeight: 600 }}>{p.name}</span></div></td>
                  <td className="font-700 text-gray-900" style={{ fontWeight: 700 }}>{p.revenue}</td>
                  <td className="text-green-600 font-600 text-sm" style={{ fontWeight: 600 }}>{p.growth}</td>
                  <td><span className={`badge ${p.plan === "Diamond" ? "badge-blue" : "badge-orange"}`}>{p.plan === "Diamond" ? "💎" : "🥇"} {p.plan}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
