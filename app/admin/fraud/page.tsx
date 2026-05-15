"use client";
import { useState } from "react";
import { AlertTriangle, ShieldAlert, Eye, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const fraudAlerts = [
  { id: "FRD001", type: "Duplicate Transaction", pump: "City Petrol Hub", amount: "₹50,000", time: "Jan 15, 10:23 AM", severity: "high", status: "open" },
  { id: "FRD002", type: "Suspicious Login", pump: "Admin Account", amount: "—", time: "Jan 14, 11:47 PM", severity: "critical", status: "investigating" },
  { id: "FRD003", type: "Abnormal Fuel Drain", pump: "Sharma Fuel Station", amount: "₹12,400", time: "Jan 14, 03:12 PM", severity: "medium", status: "resolved" },
  { id: "FRD004", type: "Fake Document Upload", pump: "Metro Fuels", amount: "—", time: "Jan 13, 09:55 AM", severity: "high", status: "open" },
  { id: "FRD005", type: "Wallet Overdraft Attempt", pump: "Speedy Logistics", amount: "₹2,00,000", time: "Jan 12, 04:31 PM", severity: "medium", status: "resolved" },
];

const weekData = [
  { day: "Mon", alerts: 2 }, { day: "Tue", alerts: 1 }, { day: "Wed", alerts: 3 },
  { day: "Thu", alerts: 0 }, { day: "Fri", alerts: 4 }, { day: "Sat", alerts: 1 }, { day: "Sun", alerts: 2 },
];

export default function FraudPage() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? fraudAlerts : fraudAlerts.filter(f => f.status === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2" style={{ fontWeight: 800 }}>
            <ShieldAlert className="w-6 h-6 text-red-500" /> Fraud Detection
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">AI-powered anomaly detection and security alerts</p>
        </div>
        <span className="badge badge-red flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> 2 Open Alerts</span>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-bold text-red-800">Critical Alert — Suspicious Admin Login Detected</p>
          <p className="text-xs text-red-600 mt-0.5">Login attempt from unrecognized IP (203.45.67.89) at 11:47 PM. MFA blocked access. Session terminated.</p>
        </div>
        <button className="text-xs font-bold text-red-700 border border-red-300 rounded-lg px-3 py-1.5 hover:bg-red-100 whitespace-nowrap">Investigate</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Alerts (30d)", value: "13", bg: "bg-red-50 border-red-100", text: "text-red-600" },
          { label: "Resolved", value: "10", bg: "bg-green-50 border-green-100", text: "text-green-600" },
          { label: "Investigating", value: "1", bg: "bg-blue-50 border-blue-100", text: "text-blue-600" },
          { label: "Open", value: "2", bg: "bg-amber-50 border-amber-100", text: "text-amber-600" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-xl p-4`}>
            <p className={`text-2xl font-black ${s.text}`}>{s.value}</p>
            <p className="text-xs font-semibold text-gray-600 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Alerts This Week</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} />
              <Bar dataKey="alerts" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Alert Types</h2>
          <div className="space-y-3">
            {[
              { type: "Duplicate Transaction", count: 4, pct: 31, color: "#f97316" },
              { type: "Suspicious Login", count: 3, pct: 23, color: "#ef4444" },
              { type: "Abnormal Fuel Drain", count: 3, pct: 23, color: "#eab308" },
              { type: "Failed Auth", count: 3, pct: 23, color: "#94a3b8" },
            ].map(t => (
              <div key={t.type}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{t.type}</span>
                  <span className="font-bold">{t.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full" style={{ width: `${t.pct}%`, background: t.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">AI Fraud Model</h2>
          <div className="space-y-3">
            {[
              { label: "Model Version", value: "FraudNet v3.1" },
              { label: "Detection Rate", value: "98.2%" },
              { label: "False Positive Rate", value: "1.8%" },
              { label: "Last Trained", value: "Jan 10, 2024" },
              { label: "Transactions Analyzed", value: "2,847" },
            ].map(s => (
              <div key={s.label} className="flex justify-between">
                <span className="text-xs text-gray-500">{s.label}</span>
                <span className="text-xs font-bold text-gray-900">{s.value}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-100">
              <span className="badge badge-green text-xs">● Model Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">Fraud Alert Log</h2>
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
              {["all", "open", "investigating", "resolved"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold capitalize transition-all ${filter === f ? "bg-white shadow text-orange-600" : "text-gray-500"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead><tr><th>Alert ID</th><th>Type</th><th>Entity</th><th>Amount</th><th>Time</th><th>Severity</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id}>
                  <td className="font-mono text-xs font-bold">{a.id}</td>
                  <td className="text-sm">{a.type}</td>
                  <td className="text-sm text-gray-600">{a.pump}</td>
                  <td className="font-semibold text-sm">{a.amount}</td>
                  <td className="text-xs text-gray-400">{a.time}</td>
                  <td><span className={`badge text-xs ${a.severity === "critical" || a.severity === "high" ? "badge-red" : a.severity === "medium" ? "badge-yellow" : "badge-gray"}`}>{a.severity}</span></td>
                  <td><span className={`badge text-xs ${a.status === "resolved" ? "badge-green" : a.status === "investigating" ? "badge-blue" : "badge-red"}`}>{a.status}</span></td>
                  <td><button className="text-xs font-semibold text-orange-500 hover:text-orange-700 flex items-center gap-1"><Eye className="w-3 h-3" />View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
