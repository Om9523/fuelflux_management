"use client";
import { useState } from "react";
import { Calculator, Download, Plus, TrendingUp, TrendingDown, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ledger = [
  { id: "TXN-001", date: "Jan 15, 2024", desc: "Fuel Sales (Petrol)", type: "credit", amount: 145000, balance: 845000 },
  { id: "TXN-002", date: "Jan 15, 2024", desc: "Logistics Wallet Funding", type: "credit", amount: 50000, balance: 895000 },
  { id: "TXN-003", date: "Jan 14, 2024", desc: "HPCL Stock Refill", type: "debit", amount: 450000, balance: 445000 },
  { id: "TXN-004", date: "Jan 14, 2024", desc: "Fuel Sales (Diesel)", type: "credit", amount: 95000, balance: 540000 },
  { id: "TXN-005", date: "Jan 13, 2024", desc: "Electricity Bill", type: "debit", amount: 12000, balance: 445000 },
  { id: "TXN-006", date: "Jan 13, 2024", desc: "Staff Salaries Advance", type: "debit", amount: 25000, balance: 457000 },
];

const monthlyData = [
  { month: "Aug", revenue: 1850000, expense: 1600000 },
  { month: "Sep", revenue: 2100000, expense: 1750000 },
  { month: "Oct", revenue: 1950000, expense: 1680000 },
  { month: "Nov", revenue: 2400000, expense: 1900000 },
  { month: "Dec", revenue: 2750000, expense: 2100000 },
  { month: "Jan", revenue: 1450000, expense: 1100000 }, // partial month
];

const taxData = [
  { type: "Central GST (CGST)", rate: "9%", amount: "₹1,24,500" },
  { type: "State GST (SGST)", rate: "9%", amount: "₹1,24,500" },
  { type: "TDS Collected", rate: "1%", amount: "₹15,200" },
];

export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState("ledger");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2" style={{ fontWeight: 800 }}>
            <Calculator className="w-6 h-6 text-orange-500" /> Accounting & Finance
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage P&L, daily ledgers, expenses, and GST tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm">
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 border-l-4 border-l-green-500">
          <p className="text-sm font-semibold text-gray-600 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-500"/> Total Income (MTD)</p>
          <p className="text-2xl font-black text-gray-900 mt-2">₹14.50 L</p>
        </div>
        <div className="card p-5 border-l-4 border-l-red-500">
          <p className="text-sm font-semibold text-gray-600 flex items-center gap-2"><TrendingDown className="w-4 h-4 text-red-500"/> Total Expenses (MTD)</p>
          <p className="text-2xl font-black text-gray-900 mt-2">₹11.00 L</p>
        </div>
        <div className="card p-5 border-l-4 border-l-blue-500">
          <p className="text-sm font-semibold text-gray-600 flex items-center gap-2"><Calculator className="w-4 h-4 text-blue-500"/> Net Profit (MTD)</p>
          <p className="text-2xl font-black text-gray-900 mt-2">₹3.50 L</p>
        </div>
        <div className="card p-5 border-l-4 border-l-purple-500">
          <p className="text-sm font-semibold text-gray-600 flex items-center gap-2"><FileText className="w-4 h-4 text-purple-500"/> Est. GST Liability</p>
          <p className="text-2xl font-black text-gray-900 mt-2">₹2.49 L</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Income vs Expenses (6 Months)</h2>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1 text-gray-600"><span className="w-3 h-3 rounded-sm bg-green-500" /> Income</span>
              <span className="flex items-center gap-1 text-gray-600"><span className="w-3 h-3 rounded-sm bg-red-400" /> Expense</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }} formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
              <Bar dataKey="revenue" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="expense" name="Expense" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tax Block */}
        <div className="card p-5 flex flex-col">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Tax & Compliance (Jan)</h2>
          <div className="space-y-3 flex-1">
            {taxData.map(t => (
              <div key={t.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.type}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Rate: {t.rate}</p>
                </div>
                <p className="font-bold text-gray-900">{t.amount}</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 bg-orange-50 text-orange-600 font-bold text-sm py-2.5 rounded-xl border border-orange-100 hover:bg-orange-100 transition-colors">
            Generate Tax Report
          </button>
        </div>
      </div>

      {/* Ledger Section */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">General Ledger</h2>
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            {["ledger", "expenses", "income"].map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${activeTab === t ? "bg-white shadow text-orange-600" : "text-gray-500 hover:text-gray-900"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr><th>Date</th><th>Txn ID</th><th>Description</th><th>Type</th><th className="text-right">Amount</th><th className="text-right">Balance</th></tr>
            </thead>
            <tbody>
              {ledger.filter(l => activeTab === "ledger" ? true : activeTab === "expenses" ? l.type === "debit" : l.type === "credit").map(l => (
                <tr key={l.id}>
                  <td className="text-sm text-gray-600 whitespace-nowrap">{l.date}</td>
                  <td className="font-mono text-xs font-bold text-gray-500">{l.id}</td>
                  <td className="text-sm font-semibold text-gray-900">{l.desc}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${l.type === 'credit' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {l.type.toUpperCase()}
                    </span>
                  </td>
                  <td className={`text-right font-bold text-sm ${l.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {l.type === 'credit' ? '+' : '-'} ₹{l.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="text-right font-bold text-sm text-gray-900">₹{l.balance.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
