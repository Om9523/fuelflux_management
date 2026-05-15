"use client";
import { useState } from "react";
import { Download, Plus, CheckCircle, Clock, AlertCircle } from "lucide-react";

const payables = [
  { id: "BILL-001", vendor: "Hindustan Petroleum (HPCL)", desc: "Diesel Bulk Order (10k L)", amount: 890000, dueDate: "Jan 20, 2024", status: "pending" },
  { id: "BILL-002", vendor: "Reliance Industries", desc: "Petrol Supply (5k L)", amount: 480000, dueDate: "Jan 18, 2024", status: "overdue" },
  { id: "BILL-003", vendor: "State Electricity Board", desc: "Station Utility Bill", amount: 45000, dueDate: "Jan 25, 2024", status: "pending" },
  { id: "BILL-004", vendor: "TechCorp Maintenance", desc: "CCTV & IT Servicing", amount: 15000, dueDate: "Jan 10, 2024", status: "paid" },
  { id: "BILL-005", vendor: "City Water Dept", desc: "Water Supply", amount: 8500, dueDate: "Jan 30, 2024", status: "pending" },
];

export default function PayablesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Accounts Payable</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage vendor bills, fuel purchases, and outstanding payments</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button className="btn-primary flex items-center gap-2" style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
            <Plus className="w-4 h-4" /> Add Bill
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 border-l-4 border-l-indigo-500">
          <p className="text-sm font-semibold text-gray-500">Total Outstanding Payables</p>
          <p className="text-2xl font-black text-gray-900 mt-1">₹14.15 L</p>
        </div>
        <div className="card p-5 border-l-4 border-l-red-500">
          <p className="text-sm font-semibold text-gray-500">Overdue Payments</p>
          <p className="text-2xl font-black text-red-600 mt-1">₹4.80 L</p>
        </div>
        <div className="card p-5 border-l-4 border-l-green-500">
          <p className="text-sm font-semibold text-gray-500">Paid this Month</p>
          <p className="text-2xl font-black text-green-600 mt-1">₹12.50 L</p>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Vendor Bills</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Vendor</th>
                <th>Description</th>
                <th>Due Date</th>
                <th>Status</th>
                <th className="text-right">Amount</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {payables.map((bill) => (
                <tr key={bill.id}>
                  <td className="font-mono text-xs font-bold text-gray-500">{bill.id}</td>
                  <td className="text-sm font-semibold text-gray-900">{bill.vendor}</td>
                  <td className="text-sm text-gray-500">{bill.desc}</td>
                  <td className="text-sm text-gray-600">{bill.dueDate}</td>
                  <td>
                    {bill.status === "paid" && <span className="badge badge-green"><CheckCircle className="w-3 h-3" /> Paid</span>}
                    {bill.status === "pending" && <span className="badge badge-yellow"><Clock className="w-3 h-3" /> Pending</span>}
                    {bill.status === "overdue" && <span className="badge badge-red"><AlertCircle className="w-3 h-3" /> Overdue</span>}
                  </td>
                  <td className="text-right font-bold text-sm text-gray-900">₹{bill.amount.toLocaleString()}</td>
                  <td className="text-center">
                    {bill.status !== "paid" ? (
                      <button className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">Pay Now</button>
                    ) : (
                      <button className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">Receipt</button>
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
