"use client";
import { useState } from "react";
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, TrendingUp, X, Loader2, Check, QrCode } from "lucide-react";

const txns = [
  { id: "T001", type: "credit", desc: "Logistics Fund Transfer", amount: 25000, date: "2024-01-15", time: "10:32 AM", status: "verified", from: "Speedy Logistics" },
  { id: "T002", type: "debit", desc: "Billing Settlement", amount: 1320, date: "2024-01-15", time: "09:42 AM", status: "settled", to: "Petrol Sale - MH12AB1234" },
  { id: "T003", type: "credit", desc: "Logistics Fund Transfer", amount: 50000, date: "2024-01-14", time: "03:15 PM", status: "verified", from: "FleetPro Logistics" },
  { id: "T004", type: "debit", desc: "Billing Settlement", amount: 3640, date: "2024-01-14", time: "11:28 AM", status: "settled", to: "Diesel Sale - TN07EF3456" },
  { id: "T005", type: "debit", desc: "Subscription Payment", amount: 4999, date: "2024-01-13", time: "02:00 PM", status: "settled", to: "Gold Plan - Jan 2024" },
  { id: "T006", type: "credit", desc: "Logistics Fund Transfer", amount: 30000, date: "2024-01-12", time: "11:05 AM", status: "verified", from: "QuickFuel Co." },
];

export default function WalletPage() {
  const [showFund, setShowFund] = useState(false);
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const balance = 48250;
  const totalIn = txns.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalOut = txns.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0);

  const handleAddFunds = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    setDone(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-800 text-gray-900" style={{ fontWeight: 800 }}>Wallet</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your fuel station wallet</p>
        </div>
        <button onClick={() => { setShowFund(true); setStep(1); setDone(false); setAmount(""); setScreenshot(null); }}
          className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Funds
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-brand">
          <div className="flex items-center gap-2 mb-4 opacity-80">
            <Wallet className="w-4 h-4" />
            <span className="text-sm font-500" style={{ fontWeight: 500 }}>Current Balance</span>
          </div>
          <p className="text-4xl font-800 mb-1" style={{ fontWeight: 800 }}>₹{balance.toLocaleString("en-IN")}</p>
          <p className="text-xs opacity-70">Last updated: Today, 11:28 AM</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-xs font-600 text-gray-500" style={{ fontWeight: 600 }}>Total Credited</span>
          </div>
          <p className="text-2xl font-800 text-green-600" style={{ fontWeight: 800 }}>₹{totalIn.toLocaleString("en-IN")}</p>
          <p className="text-xs text-gray-400 mt-1">From logistics partners</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-red-600" />
            </div>
            <span className="text-xs font-600 text-gray-500" style={{ fontWeight: 600 }}>Total Debited</span>
          </div>
          <p className="text-2xl font-800 text-red-600" style={{ fontWeight: 800 }}>₹{totalOut.toLocaleString("en-IN")}</p>
          <p className="text-xs text-gray-400 mt-1">Bills + subscriptions</p>
        </div>
      </div>

      {/* Transactions */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-700 text-gray-900" style={{ fontWeight: 700 }}>Transaction Ledger</h2>
          <div className="flex gap-2">
            {["All", "Credit", "Debit"].map(f => (
              <button key={f} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600 font-500 transition-colors" style={{ fontWeight: 500 }}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {txns.map(txn => (
            <div key={txn.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${txn.type === "credit" ? "bg-green-100" : "bg-red-100"}`}>
                {txn.type === "credit" ? <ArrowDownLeft className="w-5 h-5 text-green-600" /> : <ArrowUpRight className="w-5 h-5 text-red-600" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-600 text-gray-900" style={{ fontWeight: 600 }}>{txn.desc}</p>
                <p className="text-xs text-gray-400">{txn.type === "credit" ? `From: ${txn.from}` : `To: ${txn.to}`}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-700 ${txn.type === "credit" ? "text-green-600" : "text-red-600"}`} style={{ fontWeight: 700 }}>
                  {txn.type === "credit" ? "+" : "-"}₹{txn.amount.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-gray-400">{txn.date} · {txn.time}</p>
              </div>
              <span className={`badge ${txn.status === "verified" || txn.status === "settled" ? "badge-green" : "badge-yellow"}`}>
                {txn.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Funds Modal */}
      {showFund && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowFund(false); }}>
          <div className="modal-box max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-700" style={{ fontWeight: 700 }}>{done ? "Submitted!" : "Add Funds"}</h2>
              <button onClick={() => setShowFund(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            {!done ? (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-600 text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Amount (₹)</label>
                    <input className="input-base text-lg font-700" type="number" placeholder="0.00" value={amount}
                      onChange={e => setAmount(e.target.value)} style={{ fontWeight: 700 }} />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {[5000, 10000, 25000, 50000].map(a => (
                      <button key={a} onClick={() => setAmount(String(a))} className="px-3 py-1.5 text-xs rounded-lg border border-orange-200 text-orange-600 hover:bg-orange-50 font-600" style={{ fontWeight: 600 }}>
                        ₹{a.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <label className={`upload-zone block cursor-pointer ${screenshot ? "border-green-400 bg-green-50" : ""}`}>
                    <input type="file" accept="image/*" className="hidden" onChange={e => setScreenshot(e.target.files?.[0] || null)} />
                    <div className="flex items-center gap-3">
                      <QrCode className="w-5 h-5 text-orange-400" />
                      <div>
                        <p className="text-sm font-500 text-gray-700" style={{ fontWeight: 500 }}>
                          {screenshot ? screenshot.name : "Upload payment screenshot"}
                        </p>
                        <p className="text-xs text-gray-400">After paying via UPI/bank transfer</p>
                      </div>
                    </div>
                  </label>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowFund(false)} className="btn-ghost flex-1">Cancel</button>
                  <button onClick={handleAddFunds} disabled={!amount || !screenshot || loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : "Submit Request"}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <p className="font-600 text-gray-900 mb-2" style={{ fontWeight: 600 }}>Fund Request Submitted!</p>
                <p className="text-sm text-gray-500 mb-4">Admin will verify and credit ₹{Number(amount).toLocaleString("en-IN")} to your wallet.</p>
                <button onClick={() => setShowFund(false)} className="btn-primary w-full">Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
