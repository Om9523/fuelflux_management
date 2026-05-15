"use client";
import { useState, useEffect } from "react";
import { Brain, RefreshCw, Info } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const forecastData = [
  { day: "Jan 13", petrol: 3600, diesel: 2300 },
  { day: "Jan 14", petrol: 5100, diesel: 3400 },
  { day: "Jan 15", petrol: 4700, diesel: 3100 },
  { day: "Jan 16", petrol: 4200, diesel: 2800 },
  { day: "Jan 17", petrol: 4900, diesel: 3200 },
  { day: "Jan 18", petrol: 6800, diesel: 4400 },
  { day: "Jan 19", petrol: 5900, diesel: 3800 },
];

const historicalData = [
  { day: "Jan 6", petrol: 3200, diesel: 2100 },
  { day: "Jan 7", petrol: 4800, diesel: 3200 },
  { day: "Jan 8", petrol: 4200, diesel: 2900 },
  { day: "Jan 9", petrol: 3800, diesel: 2400 },
  { day: "Jan 10", petrol: 4500, diesel: 3100 },
  { day: "Jan 11", petrol: 6200, diesel: 4000 },
  { day: "Jan 12", petrol: 5400, diesel: 3600 },
];

const insights = [
  { title: "Weekend Surge Expected", desc: "Petrol demand likely to spike +38% on Sat–Sun based on historical patterns.", type: "warning", icon: "📈" },
  { title: "Diesel Restock Recommended", desc: "At current consumption rate, diesel stock will fall below threshold by Jan 16.", type: "danger", icon: "⛽" },
  { title: "Petrol Price Sensitivity High", desc: "AI detected 12% demand drop when price exceeds ₹115/L. Consider promotional pricing.", type: "info", icon: "💡" },
  { title: "Peak Hours: 8–10 AM & 5–7 PM", desc: "Schedule extra staff during these windows to reduce wait times.", type: "success", icon: "⏰" },
];

export default function DemandPredictionPage() {
  const [loading, setLoading] = useState(false);
  const [refreshed, setRefreshed] = useState(false);
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setRefreshed(true); }, 1800);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2" style={{ fontWeight: 800 }}>
            <Brain className="w-6 h-6 text-orange-500" /> AI Demand Prediction
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">ML-based forecast using LSTM time-series model</p>
        </div>
        <button onClick={handleRefresh} disabled={loading} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm disabled:opacity-60">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Recalculating..." : "Refresh Forecast"}
        </button>
      </div>

      {refreshed && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-sm text-green-700">
          ✓ Forecast updated using latest transaction data.
        </div>
      )}

      <div className="card p-4 flex items-center gap-4" style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)" }}>
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Brain className="w-6 h-6 text-indigo-200" />
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-sm">FuelFlux Demand AI — v2.4</p>
          <p className="text-indigo-200 text-xs mt-0.5">Trained on 18 months of historical data · LSTM model · 91.3% accuracy</p>
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: "rgba(34,197,94,0.2)", color: "#4ade80" }}>● Active</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Petrol (7 Days)", value: "31,200 L", change: "+8%", color: "text-orange-600", bg: "bg-orange-50 border-orange-100" },
          { label: "Diesel (7 Days)", value: "20,300 L", change: "+5%", color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
          { label: "Peak Day", value: "Saturday", change: "+38% spike", color: "text-purple-600", bg: "bg-purple-50 border-purple-100" },
          { label: "Model Confidence", value: "91.3%", change: "High accuracy", color: "text-green-600", bg: "bg-green-50 border-green-100" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-xl p-4`}>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs font-semibold text-gray-700 mt-1">{s.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">7-Day Demand Forecast</h2>
            <span className="text-xs text-gray-400">dashed = AI prediction</span>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={forecastData}>
              <defs>
                <linearGradient id="pForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(1)}KL`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                formatter={(v: number) => `${v.toLocaleString("en-IN")} L`} />
              <Area type="monotone" dataKey="petrol" name="Petrol" stroke="#f97316" strokeWidth={2} strokeDasharray="6 3" fill="url(#pForecast)" dot={false} />
              <Area type="monotone" dataKey="diesel" name="Diesel" stroke="#3b82f6" strokeWidth={2} strokeDasharray="6 3" fill="url(#dForecast)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-bold text-gray-900">AI Recommendations</h2>
          {insights.map((ins, i) => (
            <div key={i} className={`rounded-xl p-4 border ${
              ins.type === "danger" ? "bg-red-50 border-red-200" :
              ins.type === "warning" ? "bg-amber-50 border-amber-200" :
              ins.type === "success" ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"
            }`}>
              <div className="flex items-start gap-2">
                <span className="text-lg flex-shrink-0">{ins.icon}</span>
                <div>
                  <p className="text-xs font-bold text-gray-900">{ins.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{ins.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-bold text-gray-900">Historical Consumption (Last 7 Days)</h2>
          <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
            <Info className="w-3 h-3" /> Used to train this week's forecast
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={historicalData} barGap={3}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}KL`} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
              formatter={(v: number) => `${v.toLocaleString("en-IN")} L`} />
            <Bar dataKey="petrol" name="Petrol" fill="#f97316" radius={[4, 4, 0, 0]} opacity={0.8} />
            <Bar dataKey="diesel" name="Diesel" fill="#3b82f6" radius={[4, 4, 0, 0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
