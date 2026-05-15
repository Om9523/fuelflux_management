"use client";
import { Bot, Activity, RefreshCw, Download, Clock } from "lucide-react";

const logs = [
  { id: "LOG001", model: "ANPR v2.4", event: "Vehicle Detected", detail: "Plate MH12AB1234 — 97% confidence", timestamp: "Jan 15, 10:42:18 AM", status: "success", pump: "Sunrise Fuels" },
  { id: "LOG002", model: "FraudNet v3.1", event: "Anomaly Detected", detail: "Duplicate transaction pattern flagged", timestamp: "Jan 15, 10:23:04 AM", status: "alert", pump: "City Petrol Hub" },
  { id: "LOG003", model: "DemandAI v2.0", event: "Forecast Generated", detail: "7-day petrol demand: 31,200 L (+8%)", timestamp: "Jan 15, 06:00:01 AM", status: "success", pump: "System" },
  { id: "LOG004", model: "FaceID v1.9", event: "Staff Check-in", detail: "Ramesh Kumar verified — 97% confidence", timestamp: "Jan 15, 05:58:11 AM", status: "success", pump: "Sharma Fuel Station" },
  { id: "LOG005", model: "ANPR v2.4", event: "Suspicious Vehicle", detail: "Plate DL4C5678XX matched alert list", timestamp: "Jan 14, 11:32:45 PM", status: "alert", pump: "Metro Fuels" },
  { id: "LOG006", model: "FraudNet v3.1", event: "Auth Anomaly", detail: "Admin login from unrecognized IP blocked", timestamp: "Jan 14, 11:47:02 PM", status: "critical", pump: "Admin" },
  { id: "LOG007", model: "DemandAI v2.0", event: "Model Retrained", detail: "Incorporated Jan 1–14 transaction data", timestamp: "Jan 14, 03:00:00 AM", status: "info", pump: "System" },
  { id: "LOG008", model: "FaceID v1.9", event: "Unknown Face", detail: "Unrecognized person at entrance CAM-02", timestamp: "Jan 13, 08:25:19 PM", status: "alert", pump: "Green Valley Fuel" },
];

const models = [
  { name: "ANPR v2.4", desc: "Number plate recognition", accuracy: "96.4%", calls: "1,284", status: "active", color: "text-orange-600 bg-orange-50" },
  { name: "FraudNet v3.1", desc: "Fraud & anomaly detection", accuracy: "98.2%", calls: "2,847", status: "active", color: "text-red-600 bg-red-50" },
  { name: "DemandAI v2.0", desc: "Fuel demand forecasting", accuracy: "91.3%", calls: "42", status: "active", color: "text-indigo-600 bg-indigo-50" },
  { name: "FaceID v1.9", desc: "Staff facial recognition", accuracy: "97.8%", calls: "328", status: "active", color: "text-green-600 bg-green-50" },
];

const statusStyles: Record<string, string> = {
  success: "badge-green", alert: "badge-yellow", critical: "badge-red", info: "badge-blue"
};

export default function AILogsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2" style={{ fontWeight: 800 }}>
            <Bot className="w-6 h-6 text-orange-500" /> AI Logs
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Complete log of all AI model inferences and events</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2 py-2 px-3 text-xs">
            <Download className="w-3.5 h-3.5" /> Export Logs
          </button>
          <button className="btn-primary flex items-center gap-2 py-2 px-3 text-xs">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Model Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {models.map(m => (
          <div key={m.name} className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${m.color}`}>
                🤖
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">{m.name}</p>
                <span className="badge badge-green text-xs">● Active</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-2">{m.desc}</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-400">Accuracy</p>
                <p className="text-sm font-bold text-gray-900">{m.accuracy}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-400">API Calls</p>
                <p className="text-sm font-bold text-gray-900">{m.calls}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total AI Events (24h)", value: "4,501", bg: "bg-indigo-50 border-indigo-100", text: "text-indigo-600" },
          { label: "Successful Inferences", value: "4,468", bg: "bg-green-50 border-green-100", text: "text-green-600" },
          { label: "Alerts Triggered", value: "13", bg: "bg-amber-50 border-amber-100", text: "text-amber-600" },
          { label: "Critical Events", value: "2", bg: "bg-red-50 border-red-100", text: "text-red-600" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-xl p-4`}>
            <p className={`text-2xl font-black ${s.text}`}>{s.value}</p>
            <p className="text-xs font-semibold text-gray-600 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Logs Table */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">Event Log</h2>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" /> Live updating
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr><th>Log ID</th><th>Model</th><th>Event</th><th>Details</th><th>Pump / Source</th><th>Timestamp</th><th>Status</th></tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id}>
                  <td className="font-mono text-xs font-bold text-gray-500">{l.id}</td>
                  <td>
                    <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{l.model}</span>
                  </td>
                  <td className="text-sm font-semibold text-gray-900">{l.event}</td>
                  <td className="text-xs text-gray-500 max-w-xs truncate">{l.detail}</td>
                  <td className="text-xs text-gray-600">{l.pump}</td>
                  <td className="text-xs font-mono text-gray-400 whitespace-nowrap">{l.timestamp}</td>
                  <td><span className={`badge text-xs ${statusStyles[l.status]}`}>{l.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
