"use client";
import { useState } from "react";
import { DollarSign, Check, X, Loader2, Eye } from "lucide-react";

const PAYMENTS = [
  { id: "P001", from: "Speedy Logistics", to: "City Petrol Hub", amount: 50000, date: "Jan 14", ref: "UPI202401141515", status: "pending" },
  { id: "P002", from: "FleetPro Logistics", to: "Sharma Fuel Station", amount: 25000, date: "Jan 15", ref: "UPI202401151032", status: "pending" },
  { id: "P003", from: "QuickFuel Co.", to: "Green Valley Fuel", amount: 75000, date: "Jan 12", ref: "UPI202401121105", status: "verified" },
  { id: "P004", from: "Speedy Logistics", to: "Metro Fuels", amount: 30000, date: "Jan 10", ref: "UPI202401100920", status: "verified" },
];

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState(PAYMENTS);
  const [loading, setLoading] = useState<string | null>(null);
  const [selected, setSelected] = useState<typeof PAYMENTS[0] | null>(null);

  const verify = async (id: string) => {
    setLoading(id);
    await new Promise(r => setTimeout(r, 1200));
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: "verified" } : p));
    setSelected(null);
    setLoading(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-800 text-gray-900 flex items-center gap-2" style={{ fontWeight: 800 }}>
          <DollarSign className="w-6 h-6 text-purple-500" /> Verify Payments
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Verify logistics-to-pump wallet transfers</p>
      </div>
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead><tr><th>ID</th><th>From (Logistics)</th><th>To (Pump)</th><th>Amount</th><th>Date</th><th>Reference</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id}>
                  <td className="font-mono text-xs text-purple-600 font-600" style={{ fontWeight: 600 }}>{p.id}</td>
                  <td className="text-sm font-500" style={{ fontWeight: 500 }}>{p.from}</td>
                  <td className="text-sm font-500" style={{ fontWeight: 500 }}>{p.to}</td>
                  <td className="font-700" style={{ fontWeight: 700 }}>₹{p.amount.toLocaleString()}</td>
                  <td className="text-xs text-gray-500">{p.date}</td>
                  <td className="font-mono text-xs text-gray-400">{p.ref}</td>
                  <td><span className={`badge ${p.status === "verified" ? "badge-green" : "badge-yellow"}`}>{p.status}</span></td>
                  <td>
                    {p.status === "pending" ? (
                      <div className="flex gap-2">
                        <button onClick={() => setSelected(p)} className="text-xs text-purple-600 font-600 border border-purple-200 rounded-lg px-2 py-1 hover:bg-purple-50" style={{ fontWeight: 600 }}>
                          <Eye className="w-3 h-3 inline mr-1" />View
                        </button>
                        <button onClick={() => verify(p.id)} disabled={loading === p.id}
                          className="text-xs text-green-600 font-600 border border-green-200 rounded-lg px-2 py-1 hover:bg-green-50" style={{ fontWeight: 600 }}>
                          {loading === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "✓ Verify"}
                        </button>
                      </div>
                    ) : <span className="text-xs text-gray-400">✓ Processed</span>}
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
            <div className="flex justify-between mb-4"><h2 className="text-lg font-700" style={{ fontWeight: 700 }}>Payment Proof</h2><button onClick={() => setSelected(null)}><X className="w-5 h-5 text-gray-400" /></button></div>
            <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm space-y-2">
              {[["From", selected.from], ["To", selected.to], ["Amount", `₹${selected.amount.toLocaleString()}`], ["Ref", selected.ref]].map(([k, v]) => (
                <div key={k} className="flex justify-between"><span className="text-gray-500">{k}</span><span className="font-600 text-xs" style={{ fontWeight: 600 }}>{v}</span></div>
              ))}
            </div>
            <div className="bg-gray-100 rounded-xl h-28 flex items-center justify-center mb-4"><p className="text-xs text-gray-400">📸 Payment Screenshot</p></div>
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 btn-ghost text-sm">Close</button>
              <button onClick={() => verify(selected.id)} className="flex-1 py-2.5 rounded-xl text-sm font-600 text-white bg-green-500 flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
                <Check className="w-4 h-4" /> Verify & Credit Wallet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
