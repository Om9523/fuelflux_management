"use client";
import { useState } from "react";
import { Download, Plus, CheckCircle, Clock, AlertCircle } from "lucide-react";

const receivables = [
  { id: "INV-2045", client: "FastTrack Logistics Ltd", desc: "Corporate Fuel Account (Dec)", amount: 550000, dueDate: "Jan 15, 2024", status: "overdue" },
  { id: "INV-2046", client: "City Transport Dept", desc: "Bus Fleet Refueling (Dec)", amount: 1200000, dueDate: "Jan 20, 2024", status: "pending" },
  { id: "INV-2047", client: "MegaCorp Industries", desc: "Generator Diesel Supply", amount: 350000, dueDate: "Jan 12, 2024", status: "paid" },
  { id: "INV-2048", client: "BlueDart Delivery", desc: "Weekly Van Fleet Refueling", amount: 85000, dueDate: "Jan 25, 2024", status: "pending" },
];

export default function ReceivablesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Accounts Receivable</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track incoming payments from corporate clients and logistics fleets</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button className="btn-primary flex items-center gap-2" style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
            <Plus className="w-4 h-4" /> Create Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 border-l-4 border-l-indigo-500">
          <p className="text-sm font-semibold text-gray-500">Total Outstanding Receivables</p>
          <p className="text-2xl font-black text-gray-900 mt-1">₹18.35 L</p>
        </div>
        <div className="card p-5 border-l-4 border-l-red-500">
          <p className="text-sm font-semibold text-gray-500">Overdue Invoices</p>
          <p className="text-2xl font-black text-red-600 mt-1">₹5.50 L</p>
        </div>
        <div className="card p-5 border-l-4 border-l-green-500">
          <p className="text-sm font-semibold text-gray-500">Received this Month</p>
          <p className="text-2xl font-black text-green-600 mt-1">₹24.80 L</p>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Client Invoices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Description</th>
                <th>Due Date</th>
                <th>Status</th>
                <th className="text-right">Amount</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {receivables.map((inv) => (
                <tr key={inv.id}>
                  <td className="font-mono text-xs font-bold text-gray-500">{inv.id}</td>
                  <td className="text-sm font-semibold text-gray-900">{inv.client}</td>
                  <td className="text-sm text-gray-500">{inv.desc}</td>
                  <td className="text-sm text-gray-600">{inv.dueDate}</td>
                  <td>
                    {inv.status === "paid" && <span className="badge badge-green"><CheckCircle className="w-3 h-3" /> Paid</span>}
                    {inv.status === "pending" && <span className="badge badge-yellow"><Clock className="w-3 h-3" /> Pending</span>}
                    {inv.status === "overdue" && <span className="badge badge-red"><AlertCircle className="w-3 h-3" /> Overdue</span>}
                  </td>
                  <td className="text-right font-bold text-sm text-gray-900">₹{inv.amount.toLocaleString()}</td>
                  <td className="text-center">
                    {inv.status !== "paid" ? (
                      <button className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">Send Reminder</button>
                    ) : (
                      <button className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">View Receipt</button>
                    )}
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
