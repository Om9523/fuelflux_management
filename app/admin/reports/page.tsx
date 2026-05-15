"use client";
import { Download, FileText, BarChart2, CheckCircle } from "lucide-react";

export default function ReportsPage() {
  const reports = [
    { title: "Profit & Loss Statement", desc: "Comprehensive view of revenues, costs, and expenses", frequency: "Monthly", type: "Financial", icon: <BarChart2 className="w-5 h-5" /> },
    { title: "Balance Sheet", desc: "Snapshot of assets, liabilities, and equity", frequency: "Quarterly", type: "Financial", icon: <FileText className="w-5 h-5" /> },
    { title: "Trial Balance", desc: "List of all general ledger accounts with their balances", frequency: "Weekly", type: "Ledger", icon: <FileText className="w-5 h-5" /> },
    { title: "Cash Flow Statement", desc: "Summary of cash entering and leaving the company", frequency: "Monthly", type: "Financial", icon: <BarChart2 className="w-5 h-5" /> },
    { title: "Accounts Aging Report", desc: "Breakdown of AP/AR by age (30/60/90+ days)", frequency: "Weekly", type: "Ledger", icon: <FileText className="w-5 h-5" /> },
    { title: "GST Input/Output Report", desc: "Detailed tax collected and ITC available", frequency: "Monthly", type: "Tax", icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Financial Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Generate, view, and export enterprise financial statements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reports.map((r, i) => (
          <div key={i} className="card p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between hover:border-indigo-200 transition-colors group cursor-pointer">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                {r.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-gray-900">{r.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${r.type === 'Financial' ? 'bg-blue-50 text-blue-600' : r.type === 'Tax' ? 'bg-orange-50 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>{r.type}</span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{r.desc}</p>
                <p className="text-xs font-semibold text-gray-400">Generation: {r.frequency}</p>
              </div>
            </div>
            <button className="btn-secondary w-full sm:w-auto text-indigo-600 border-indigo-200 hover:bg-indigo-50 px-4 py-2 flex items-center justify-center gap-2 flex-shrink-0">
              <Download className="w-4 h-4" /> Generate
            </button>
          </div>
        ))}
      </div>

      <div className="card p-6 border-t-4 border-t-green-500 mt-8 bg-green-50/50">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h2 className="text-md font-bold text-gray-900">End of Year (EOY) Automated Closing</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">The ERP system is ready to perform automated EOY closing entries. This will freeze the ledger for FY2023-2024 and roll over the balances.</p>
        <button className="btn-primary bg-green-600 hover:bg-green-700 px-6 py-2.5">
          Start EOY Closing Process
        </button>
      </div>
    </div>
  );
}
