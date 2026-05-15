"use client";
import { TrendingUp, Info } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const roiHistory = [
  { quarter: "Q1 FY23", roi: 12.4, benchmark: 10 },
  { quarter: "Q2 FY23", roi: 15.8, benchmark: 10 },
  { quarter: "Q3 FY23", roi: 14.2, benchmark: 10 },
  { quarter: "Q4 FY23", roi: 18.6, benchmark: 10 },
  { quarter: "Q1 FY24", roi: 21.3, benchmark: 10 },
  { quarter: "Q2 FY24", roi: 24.7, benchmark: 10 },
];

const roiByPlan = [
  { plan: "Diamond", roi: 31.2, pumps: 25 },
  { plan: "Gold", roi: 22.8, pumps: 42 },
  { plan: "Free", roi: 8.4, pumps: 22 },
];

const projections = [
  { quarter: "Q3 FY24", projected: 27.2 },
  { quarter: "Q4 FY24", projected: 30.1 },
  { quarter: "Q1 FY25", projected: 33.5 },
  { quarter: "Q2 FY25", projected: 36.8 },
];

export default function ROIPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2" style={{ fontWeight: 800 }}>
            <TrendingUp className="w-6 h-6 text-indigo-500" /> ROI Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Return on investment tracking and AI-powered projections</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2 text-xs text-indigo-700 font-semibold">
          👁 View-Only Access
        </div>
      </div>

      {/* ROI KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Current Quarter ROI", value: "24.7%", change: "+3.4% QoQ", bg: "bg-indigo-50 border-indigo-100", text: "text-indigo-600" },
          { label: "Best Quarter ROI", value: "24.7%", change: "Q2 FY24 — All-time high", bg: "bg-green-50 border-green-100", text: "text-green-600" },
          { label: "Annual Average ROI", value: "19.5%", change: "FY2024 YTD", bg: "bg-orange-50 border-orange-100", text: "text-orange-600" },
          { label: "ROI vs Benchmark", value: "+14.7%", change: "vs 10% industry avg", bg: "bg-purple-50 border-purple-100", text: "text-purple-600" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-xl p-4`}>
            <p className={`text-xl font-black ${s.text}`}>{s.value}</p>
            <p className="text-xs font-semibold text-gray-700 mt-1">{s.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historical ROI */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Historical ROI (%)</h2>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span className="w-6 h-px border-t-2 border-dashed border-gray-300 inline-block" /> Industry Avg (10%)
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={roiHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} unit="%" domain={[0, 30]} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                formatter={(v: number) => `${v}%`} />
              <ReferenceLine y={10} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: "Benchmark", position: "right", fontSize: 10, fill: "#94a3b8" }} />
              <Bar dataKey="roi" name="ROI %" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Projections */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-bold text-gray-900">AI ROI Projections (Next 4 Quarters)</h2>
          </div>
          <div className="flex items-center gap-1 text-xs text-indigo-600 mb-3 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
            <Info className="w-3.5 h-3.5 flex-shrink-0" /> AI model confidence: 87.4% — based on growth trajectory & subscription expansion
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={projections}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} unit="%" domain={[20, 45]} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                formatter={(v: number) => `${v}%`} />
              <Line type="monotone" dataKey="projected" name="Projected ROI" stroke="#6366f1" strokeWidth={2.5} strokeDasharray="6 3"
                dot={{ fill: "#6366f1", r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
            {projections.map(p => (
              <div key={p.quarter} className="bg-indigo-50 rounded-xl p-3 text-center">
                <p className="text-sm font-black text-indigo-600">{p.projected}%</p>
                <p className="text-xs text-gray-500 mt-0.5">{p.quarter}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROI by Plan */}
      <div className="card p-5">
        <h2 className="text-sm font-bold text-gray-900 mb-4">ROI by Subscription Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roiByPlan.map(p => (
            <div key={p.plan} className={`rounded-xl p-5 border ${p.plan === "Diamond" ? "bg-gradient-to-br from-indigo-900 to-purple-900 border-indigo-800" : p.plan === "Gold" ? "bg-orange-50 border-orange-100" : "bg-gray-50 border-gray-100"}`}>
              <p className={`text-3xl font-black ${p.plan === "Diamond" ? "text-white" : p.plan === "Gold" ? "text-orange-600" : "text-gray-500"}`}>
                {p.roi}%
              </p>
              <p className={`text-sm font-bold mt-1 ${p.plan === "Diamond" ? "text-indigo-200" : "text-gray-700"}`}>
                {p.plan === "Diamond" ? "💎" : p.plan === "Gold" ? "🥇" : "⚪"} {p.plan} Plan ROI
              </p>
              <p className={`text-xs mt-1 ${p.plan === "Diamond" ? "text-indigo-300" : "text-gray-500"}`}>
                {p.pumps} active pump{p.pumps > 1 ? "s" : ""}
              </p>
              <div className={`mt-3 w-full rounded-full h-1.5 ${p.plan === "Diamond" ? "bg-indigo-800" : "bg-gray-200"}`}>
                <div className="h-1.5 rounded-full" style={{
                  width: `${(p.roi / 40) * 100}%`,
                  background: p.plan === "Diamond" ? "#818cf8" : p.plan === "Gold" ? "#f97316" : "#94a3b8"
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
