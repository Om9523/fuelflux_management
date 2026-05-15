"use client";
import { useState } from "react";
import { CreditCard, Check, X, Loader2, Eye } from "lucide-react";

const SUBS = [
  { id: "S001", pump: "Mehta Petroleum", owner: "Sunil Mehta", plan: "Diamond", amount: 9999, date: "Jan 15", status: "pending" },
  { id: "S002", pump: "New Star Fuels", owner: "Radha Krishna", plan: "Gold", amount: 4999, date: "Jan 14", status: "pending" },
  { id: "S003", pump: "Sharma Fuel Station", owner: "Rajesh Sharma", plan: "Gold", amount: 4999, date: "Jan 10", status: "approved" },
  { id: "S004", pump: "City Petrol Hub", owner: "Aarav Joshi", plan: "Diamond", amount: 9999, date: "Jan 08", status: "approved" },
];

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState(SUBS);
  const [selected, setSelected] = useState<typeof SUBS[0] | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    setLoading(id);
    await new Promise(r => setTimeout(r, 1200));
    setSubs(prev => prev.map(s => s.id === id ? { ...s, status: action } : s));
    setSelected(null);
    setLoading(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-800 text-gray-900 flex items-center gap-2" style={{ fontWeight: 800 }}>
          <CreditCard className="w-6 h-6 text-purple-500" /> Approve Subscriptions
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Review subscription payments and activate plans</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card text-center"><p className="text-3xl font-800 text-amber-500" style={{ fontWeight: 800 }}>{subs.filter(s => s.status === "pending").length}</p><p className="text-xs text-gray-500 mt-1">Pending</p></div>
        <div className="stat-card text-center"><p className="text-3xl font-800 text-green-500" style={{ fontWeight: 800 }}>{subs.filter(s => s.status === "approved").length}</p><p className="text-xs text-gray-500 mt-1">Approved</p></div>
        <div className="stat-card text-center"><p className="text-3xl font-800 text-purple-500" style={{ fontWeight: 800 }}>₹{subs.filter(s => s.status === "approved").reduce((s, t) => s + t.amount, 0).toLocaleString()}</p><p className="text-xs text-gray-500 mt-1">Revenue Collected</p></div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead><tr><th>Pump</th><th>Plan</th><th>Amount</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {subs.map(s => (
                <tr key={s.id}>
                  <td><div><p className="font-600 text-sm" style={{ fontWeight: 600 }}>{s.pump}</p><p className="text-xs text-gray-400">{s.owner}</p></div></td>
                  <td><span className={`badge ${s.plan === "Diamond" ? "badge-blue" : "badge-orange"}`}>{s.plan === "Diamond" ? "💎" : "🥇"} {s.plan}</span></td>
                  <td className="font-700" style={{ fontWeight: 700 }}>₹{s.amount.toLocaleString()}</td>
                  <td className="text-xs text-gray-500">{s.date}</td>
                  <td><span className={`badge ${s.status === "approved" ? "badge-green" : "badge-yellow"}`}>{s.status}</span></td>
                  <td>
                    {s.status === "pending" ? (
                      <div className="flex gap-2">
                        <button onClick={() => setSelected(s)} className="text-xs text-purple-600 font-600 border border-purple-200 rounded-lg px-2 py-1 hover:bg-purple-50" style={{ fontWeight: 600 }}>
                          <Eye className="w-3 h-3 inline mr-1" />Review
                        </button>
                        <button onClick={() => handleAction(s.id, "approved")} disabled={loading === s.id} className="text-xs text-green-600 font-600 border border-green-200 rounded-lg px-2 py-1 hover:bg-green-50" style={{ fontWeight: 600 }}>
                          {loading === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "✓ Approve"}
                        </button>
                      </div>
                    ) : <span className="text-xs text-gray-400">Processed</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="modal-box max-w-sm w-full mx-4">
            <div className="flex justify-between mb-6"><h2 className="text-lg font-700" style={{ fontWeight: 700 }}>Review Subscription</h2><button onClick={() => setSelected(null)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
              {[["Pump", selected.pump], ["Owner", selected.owner], ["Plan", selected.plan], ["Amount", `₹${selected.amount.toLocaleString()}`]].map(([k, v]) => (
                <div key={k} className="flex justify-between"><span className="text-gray-500">{k}</span><span className="font-600" style={{ fontWeight: 600 }}>{v}</span></div>
              ))}
            </div>
            <div className="bg-gray-100 rounded-xl h-24 flex items-center justify-center mb-4">
              <p className="text-xs text-gray-400">📎 Payment screenshot · 📄 Signed document</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleAction(selected.id, "rejected")} className="flex-1 py-2.5 rounded-xl text-sm font-600 text-red-600 bg-red-50 border border-red-200 flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
                <X className="w-4 h-4" /> Reject
              </button>
              <button onClick={() => handleAction(selected.id, "approved")} className="flex-1 py-2.5 rounded-xl text-sm font-600 text-white bg-green-500 flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
                <Check className="w-4 h-4" /> Activate Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
