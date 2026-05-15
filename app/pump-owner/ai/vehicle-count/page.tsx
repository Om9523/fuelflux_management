"use client";
import { useState, useEffect } from "react";
import { Car, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const hourlyData = [
  { hour: "6AM", count: 12 }, { hour: "7AM", count: 28 }, { hour: "8AM", count: 54 },
  { hour: "9AM", count: 67 }, { hour: "10AM", count: 48 }, { hour: "11AM", count: 35 },
  { hour: "12PM", count: 42 }, { hour: "1PM", count: 39 }, { hour: "2PM", count: 31 },
  { hour: "3PM", count: 27 }, { hour: "4PM", count: 45 }, { hour: "5PM", count: 71 },
  { hour: "6PM", count: 83 }, { hour: "7PM", count: 62 }, { hour: "8PM", count: 38 },
];

const vehicleTypes = [
  { type: "Cars", count: 89, pct: 62, icon: "🚗", color: "#f97316" },
  { type: "Trucks", count: 24, pct: 17, icon: "🚛", color: "#3b82f6" },
  { type: "Bikes", count: 18, pct: 13, icon: "🏍️", color: "#22c55e" },
  { type: "Buses", count: 11, pct: 8, icon: "🚌", color: "#a855f7" },
];

const recentVehicles = [
  { plate: "MH12AB1234", type: "Car", fuel: "Petrol", entryTime: "10:42 AM", exitTime: "10:51 AM", duration: "9 min" },
  { plate: "DL4C5678XX", type: "Truck", fuel: "Diesel", entryTime: "10:35 AM", exitTime: "10:58 AM", duration: "23 min" },
  { plate: "KA03CD9012", type: "Car", fuel: "Petrol", entryTime: "10:28 AM", exitTime: "10:34 AM", duration: "6 min" },
  { plate: "TN07EF3456", type: "Bus", fuel: "Diesel", entryTime: "10:15 AM", exitTime: "10:38 AM", duration: "23 min" },
  { plate: "GJ05GH7890", type: "Car", fuel: "CNG", entryTime: "10:08 AM", exitTime: "10:14 AM", duration: "6 min" },
];

export default function VehicleCountPage() {
  const [liveCount, setLiveCount] = useState(142);
  const [currentInside, setCurrentInside] = useState(4);

  useEffect(() => {
    const t = setInterval(() => {
      setLiveCount(c => c + Math.floor(Math.random() * 2));
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2" style={{ fontWeight: 800 }}>
            <Car className="w-6 h-6 text-orange-500" /> Vehicle Count
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">AI-powered entry/exit vehicle tracking via CCTV</p>
        </div>
        <div className="live-badge"><span className="live-dot" />LIVE COUNTING</div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Today", value: liveCount, icon: "🚗", bg: "bg-orange-50 border-orange-100", text: "text-orange-600" },
          { label: "Currently Inside", value: currentInside, icon: "📍", bg: "bg-blue-50 border-blue-100", text: "text-blue-600" },
          { label: "Peak Hour Count", value: 83, icon: "📈", bg: "bg-purple-50 border-purple-100", text: "text-purple-600" },
          { label: "Avg. Dwell Time", value: "11 min", icon: "⏱️", bg: "bg-green-50 border-green-100", text: "text-green-600" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{s.icon}</span>
              <p className={`text-2xl font-black ${s.text}`}>{s.value}</p>
            </div>
            <p className="text-xs font-semibold text-gray-600">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly chart */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Hourly Vehicle Flow — Today</h2>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="vehicleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                formatter={(v: number) => [`${v} vehicles`, "Count"]} />
              <Area type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2.5} fill="url(#vehicleGrad)" dot={false} activeDot={{ r: 5, fill: "#f97316" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Vehicle Type Breakdown */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Vehicle Type Split</h2>
          <div className="space-y-4">
            {vehicleTypes.map(v => (
              <div key={v.type}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span>{v.icon}</span>
                    <span className="text-xs font-semibold text-gray-700">{v.type}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900">{v.count} ({v.pct}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${v.pct}%`, background: v.color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-700 mb-3">Peak Insights</h3>
            <div className="space-y-2">
              {[
                { icon: TrendingUp, label: "Busiest Hour", value: "6–7 PM" },
                { icon: Clock, label: "Avg. Service Time", value: "11.2 min" },
                { icon: AlertCircle, label: "Queue Alerts", value: "2 today" },
              ].map(i => (
                <div key={i.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <i.icon className="w-3 h-3" /> {i.label}
                  </div>
                  <span className="font-bold text-gray-900">{i.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Vehicles Table */}
      <div className="card">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Recent Vehicles</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr><th>Plate No.</th><th>Type</th><th>Fuel</th><th>Entry</th><th>Exit</th><th>Duration</th></tr>
            </thead>
            <tbody>
              {recentVehicles.map((v, i) => (
                <tr key={i}>
                  <td><span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-lg text-sm">{v.plate}</span></td>
                  <td className="text-sm text-gray-600">{v.type}</td>
                  <td><span className={`badge text-xs ${v.fuel === "Petrol" ? "badge-orange" : v.fuel === "Diesel" ? "badge-blue" : "badge-green"}`}>{v.fuel}</span></td>
                  <td className="text-xs font-mono text-gray-500">{v.entryTime}</td>
                  <td className="text-xs font-mono text-gray-500">{v.exitTime}</td>
                  <td className="text-xs font-semibold text-gray-700">{v.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
