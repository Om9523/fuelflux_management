"use client";
import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, FileText, Download } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const cashFlowData = [
  { month: "Aug", inflow: 4500000, outflow: 3800000 },
  { month: "Sep", inflow: 5200000, outflow: 4100000 },
  { month: "Oct", inflow: 4800000, outflow: 3900000 },
  { month: "Nov", inflow: 6100000, outflow: 4800000 },
  { month: "Dec", inflow: 7500000, outflow: 5200000 },
  { month: "Jan", inflow: 8200000, outflow: 5900000 },
];

const expensesData = [
  { name: "Fuel Purchases", value: 65 },
  { name: "Logistics & Freight", value: 15 },
  { name: "Salaries", value: 10 },
  { name: "Maintenance", value: 5 },
  { name: "Taxes & Duties", value: 5 },
];
const COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#f43f5e"];

const recentTransactions = [
  { id: "JRN-8921", date: "Jan 15, 2024", account: "Accounts Receivable", desc: "Invoice #INV-2041 Paid", type: "credit", amount: 450000 },
  { id: "JRN-8922", date: "Jan 14, 2024", account: "Accounts Payable", desc: "Vendor Payment (HPCL)", type: "debit", amount: 1250000 },
  { id: "JRN-8923", date: "Jan 14, 2024", account: "Cash - Operating", desc: "Daily Station Sales Transfer", type: "credit", amount: 890000 },
  { id: "JRN-8924", date: "Jan 13, 2024", account: "Tax Payable (GST)", desc: "December GST Remittance", type: "debit", amount: 345000 },
];

export default function AccountantDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">ERP Accounting Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Enterprise financial overview and cash flow management</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" /> Trial Balance
          </button>
          <button className="btn-primary flex items-center gap-2" style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
            <FileText className="w-4 h-4" /> Gen. Ledger
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 border-l-4 border-l-indigo-500">
          <p className="text-sm font-semibold text-gray-500">Total Revenue (YTD)</p>
          <p className="text-2xl font-black text-gray-900 mt-1">₹3.63 Cr</p>
          <p className="text-xs text-green-600 mt-2 font-semibold flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +12.5% vs last year</p>
        </div>
        <div className="card p-5 border-l-4 border-l-green-500">
          <p className="text-sm font-semibold text-gray-500">Net Profit (YTD)</p>
          <p className="text-2xl font-black text-gray-900 mt-1">₹84.5 L</p>
          <p className="text-xs text-green-600 mt-2 font-semibold flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +8.2% margin</p>
        </div>
        <div className="card p-5 border-l-4 border-l-red-500">
          <p className="text-sm font-semibold text-gray-500">Accounts Payable</p>
          <p className="text-2xl font-black text-gray-900 mt-1">₹42.1 L</p>
          <p className="text-xs text-gray-500 mt-2 font-medium">12 invoices pending</p>
        </div>
        <div className="card p-5 border-l-4 border-l-blue-500">
          <p className="text-sm font-semibold text-gray-500">Accounts Receivable</p>
          <p className="text-2xl font-black text-gray-900 mt-1">₹18.4 L</p>
          <p className="text-xs text-gray-500 mt-2 font-medium">From corporate clients</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Chart */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Cash Flow Analysis (Inflow vs Outflow)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={cashFlowData}>
              <defs>
                <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} tickFormatter={(val) => `₹${val/100000}L`} />
              <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
              <Area type="monotone" dataKey="inflow" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorInflow)" name="Cash Inflow" />
              <Area type="monotone" dataKey="outflow" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorOutflow)" name="Cash Outflow" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Breakdown */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Expense Breakdown</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={expensesData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {expensesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => `${val}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {expensesData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-gray-600 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Journal Entries */}
      <div className="card">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Recent Journal Entries</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Date</th>
                <th>Entry ID</th>
                <th>Account</th>
                <th>Description</th>
                <th className="text-right">Debit</th>
                <th className="text-right">Credit</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((t) => (
                <tr key={t.id}>
                  <td className="text-sm text-gray-600">{t.date}</td>
                  <td className="font-mono text-xs font-bold text-indigo-600">{t.id}</td>
                  <td className="text-sm font-semibold text-gray-900">{t.account}</td>
                  <td className="text-sm text-gray-500">{t.desc}</td>
                  <td className="text-right font-bold text-sm text-gray-900">
                    {t.type === 'debit' ? `₹${t.amount.toLocaleString()}` : '-'}
                  </td>
                  <td className="text-right font-bold text-sm text-gray-900">
                    {t.type === 'credit' ? `₹${t.amount.toLocaleString()}` : '-'}
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
