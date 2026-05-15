"use client";
import { Download, FileText, Calendar, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const quarterlyData = [
  { quarter: "Q1 FY23", revenue: 6200000, pumps: 62, roi: 12.4 },
  { quarter: "Q2 FY23", revenue: 7400000, pumps: 68, roi: 15.8 },
  { quarter: "Q3 FY23", revenue: 7100000, pumps: 71, roi: 14.2 },
  { quarter: "Q4 FY23", revenue: 8900000, pumps: 75, roi: 18.6 },
  { quarter: "Q1 FY24", revenue: 10200000, pumps: 80, roi: 21.3 },
  { quarter: "Q2 FY24", revenue: 11800000, pumps: 89, roi: 24.7 },
];

const revenueByPlan = [
  { name: "Diamond Plan", value: 42, color: "#6366f1" },
  { name: "Gold Plan", value: 38, color: "#f97316" },
  { name: "Free Plan", value: 20, color: "#e5e7eb" },
];

const reports = [
  { title: "Q2 FY2024 Investor Report", date: "Jan 15, 2024", type: "Quarterly", size: "2.4 MB", format: "PDF" },
  { title: "Annual Revenue Analysis FY2023", date: "Apr 2, 2023", type: "Annual", size: "5.1 MB", format: "PDF" },
  { title: "Platform Growth Metrics — Dec 2023", date: "Jan 3, 2024", type: "Monthly", size: "1.2 MB", format: "PDF" },
  { title: "ROI Breakdown — Q1 FY24", date: "Oct 5, 2023", type: "Quarterly", size: "1.8 MB", format: "PDF" },
  { title: "AI Analytics & Fraud Report — 2023", date: "Jan 10, 2024", type: "Special", size: "3.2 MB", format: "PDF" },
];

export default function InvestorReportsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900" style={{ fontWeight: 800 }}>Investor Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">AI-generated quarterly & annual performance reports</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2 text-xs text-indigo-700 font-semibold">
          👁 View-Only Access
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue FY24", value: "₹2.2Cr", change: "+28.4% YoY", bg: "bg-indigo-50 border-indigo-100", text: "text-indigo-600" },
          { label: "Active Pump Partners", value: "89", change: "+27 this FY", bg: "bg-orange-50 border-orange-100", text: "text-orange-600" },
          { label: "Avg. Quarterly ROI", value: "23.0%", change: "+5.8% vs FY23", bg: "bg-green-50 border-green-100", text: "text-green-600" },
          { label: "Platform AUM", value: "₹1.83Cr", change: "Wallet funds managed", bg: "bg-purple-50 border-purple-100", text: "text-purple-600" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-xl p-4`}>
            <p className={`text-xl font-black ${s.text}`}>{s.value}</p>
            <p className="text-xs font-semibold text-gray-700 mt-1">{s.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Quarterly Revenue & ROI Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={quarterlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
              <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.9} />
              <Bar yAxisId="right" dataKey="roi" name="ROI %" fill="#f97316" radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Plan */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Revenue by Subscription Plan</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={revenueByPlan} cx="50%" cy="50%" outerRadius={65} dataKey="value" paddingAngle={3}>
                {revenueByPlan.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                formatter={(v: number) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {revenueByPlan.map(p => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ background: p.color }} />
                  <span className="text-xs text-gray-600">{p.name}</span>
                </div>
                <span className="text-xs font-bold text-gray-900">{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Downloads */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-500" /> Available Reports
          </h2>
          <span className="text-xs text-gray-400">{reports.length} reports available</span>
        </div>
        <div className="divide-y divide-gray-50">
          {reports.map((r, i) => (
            <div key={i} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{r.title}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{r.date}</span>
                  <span className={`badge text-xs ${r.type === "Annual" ? "badge-indigo" : r.type === "Quarterly" ? "badge-blue" : r.type === "Special" ? "badge-purple" : "badge-gray"}`} style={r.type === "Annual" ? { background: "#eef2ff", color: "#4338ca" } : {}}>
                    {r.type}
                  </span>
                  <span className="text-xs text-gray-400">{r.size}</span>
                </div>
              </div>
              <button className="btn-secondary flex items-center gap-1.5 py-1.5 px-3 text-xs">
                <Download className="w-3.5 h-3.5" /> {r.format}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
