"use client";
import { useState } from "react";
import { Search, Filter, Download, Plus } from "lucide-react";

const ledgerEntries = [
  { id: "JRN-8921", date: "Jan 15, 2024", account: "Accounts Receivable", desc: "Invoice #INV-2041 Paid by TechCorp", debit: 0, credit: 450000, balance: 1250000 },
  { id: "JRN-8922", date: "Jan 14, 2024", account: "Accounts Payable", desc: "HPCL Fuel Stock Purchase", debit: 1250000, credit: 0, balance: -800000 },
  { id: "JRN-8923", date: "Jan 14, 2024", account: "Cash - Operating", desc: "Daily Station Sales Transfer (Station A)", debit: 890000, credit: 0, balance: 2140000 },
  { id: "JRN-8924", date: "Jan 13, 2024", account: "Tax Payable (GST)", desc: "December GST Remittance", debit: 345000, credit: 0, balance: 0 },
  { id: "JRN-8925", date: "Jan 12, 2024", account: "Salary Expense", desc: "Staff Payroll - Jan Advance", debit: 125000, credit: 0, balance: 2015000 },
  { id: "JRN-8926", date: "Jan 10, 2024", account: "Maintenance Expense", desc: "Pump #4 Repairs", debit: 18000, credit: 0, balance: 1997000 },
  { id: "JRN-8927", date: "Jan 09, 2024", account: "Accounts Receivable", desc: "Logistics Wallet Top-up (FastTrack Ltd)", debit: 0, credit: 150000, balance: 2147000 },
];

export default function GeneralLedgerPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">General Ledger</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track all debits, credits, and account balances across the platform</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button className="btn-primary flex items-center gap-2" style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
            <Plus className="w-4 h-4" /> Add Journal Entry
          </button>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 rounded-t-2xl">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by ID, Account, or Desc..." 
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4 text-sm font-semibold">
            <div className="text-gray-500">Total Debit: <span className="text-red-600">₹26,28,000</span></div>
            <div className="text-gray-500">Total Credit: <span className="text-green-600">₹6,00,000</span></div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Date</th>
                <th>Journal ID</th>
                <th>Account</th>
                <th>Description</th>
                <th className="text-right">Debit (Dr)</th>
                <th className="text-right">Credit (Cr)</th>
                <th className="text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {ledgerEntries.map((entry) => (
                <tr key={entry.id}>
                  <td className="text-sm text-gray-600">{entry.date}</td>
                  <td className="font-mono text-xs font-bold text-indigo-600">{entry.id}</td>
                  <td className="text-sm font-semibold text-gray-900">{entry.account}</td>
                  <td className="text-sm text-gray-500">{entry.desc}</td>
                  <td className="text-right font-bold text-sm text-red-600">
                    {entry.debit > 0 ? `₹${entry.debit.toLocaleString()}` : "-"}
                  </td>
                  <td className="text-right font-bold text-sm text-green-600">
                    {entry.credit > 0 ? `₹${entry.credit.toLocaleString()}` : "-"}
                  </td>
                  <td className="text-right font-bold text-sm text-gray-900">
                    ₹{entry.balance.toLocaleString()}
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
