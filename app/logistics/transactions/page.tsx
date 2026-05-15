"use client";
import { ArrowUpRight, Clock, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const ALL_TXNS = [
  { id: "LTX001", pump: "Sharma Fuel Station", amount: 25000, date: "2024-01-15", time: "10:32 AM", status: "verified", ref: "UPI202401151032" },
  { id: "LTX002", pump: "City Petrol Hub", amount: 50000, date: "2024-01-14", time: "03:15 PM", status: "pending", ref: "UPI202401141515" },
  { id: "LTX003", pump: "Sharma Fuel Station", amount: 30000, date: "2024-01-12", time: "11:05 AM", status: "verified", ref: "UPI202401121105" },
  { id: "LTX004", pump: "Green Energy Pump", amount: 75000, date: "2024-01-10", time: "09:20 AM", status: "verified", ref: "UPI202401100920" },
  { id: "LTX005", pump: "National Fuels", amount: 20000, date: "2024-01-08", time: "04:45 PM", status: "pending", ref: "UPI202401081645" },
  { id: "LTX006", pump: "City Petrol Hub", amount: 100000, date: "2024-01-05", time: "02:00 PM", status: "verified", ref: "UPI202401051400" },
];

export default function LogisticsTransactionsPage() {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? ALL_TXNS : ALL_TXNS.filter(t => t.status === filter.toLowerCase());
  const totalFunded = ALL_TXNS.reduce((s, t) => s + t.amount, 0);
  const pending = ALL_TXNS.filter(t => t.status === "pending").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-800 text-gray-900" style={{ fontWeight: 800 }}>Transactions</h1>
        <p className="text-sm text-gray-500 mt-0.5">All payment history and statuses</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-card-icon bg-orange-100 text-orange-600 mb-3"><ArrowUpRight className="w-5 h-5" /></div>
          <p className="text-2xl font-800 text-gray-900" style={{ fontWeight: 800 }}>₹{(totalFunded / 100000).toFixed(2)}L</p>
          <p className="text-xs text-gray-500 mt-1">Total Funded</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon bg-green-100 text-green-600 mb-3"><CheckCircle2 className="w-5 h-5" /></div>
          <p className="text-2xl font-800 text-gray-900" style={{ fontWeight: 800 }}>
            {ALL_TXNS.filter(t => t.status === "verified").length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Verified Transactions</p>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon bg-yellow-100 text-yellow-600 mb-3"><Clock className="w-5 h-5" /></div>
          <p className="text-2xl font-800 text-gray-900" style={{ fontWeight: 800 }}>₹{pending.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Pending Amount</p>
        </div>
      </div>

      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-700 text-gray-900" style={{ fontWeight: 700 }}>Payment History</h2>
          <div className="flex gap-2">
            {["All", "Verified", "Pending"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-lg font-500 transition-colors ${filter === f ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-orange-50"}`}
                style={{ fontWeight: 500 }}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Pump Owner</th>
                <th>Amount</th>
                <th>Date & Time</th>
                <th>Reference</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td className="font-mono text-xs font-600 text-orange-600" style={{ fontWeight: 600 }}>{t.id}</td>
                  <td className="font-500 text-gray-900 text-sm" style={{ fontWeight: 500 }}>{t.pump}</td>
                  <td className="font-700 text-gray-900" style={{ fontWeight: 700 }}>₹{t.amount.toLocaleString()}</td>
                  <td className="text-xs text-gray-500">{t.date} · {t.time}</td>
                  <td className="font-mono text-xs text-gray-400">{t.ref}</td>
                  <td>
                    <span className={`badge ${t.status === "verified" ? "badge-green" : "badge-yellow"}`}>
                      {t.status === "verified" ? "✓ Verified" : "⏳ Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
