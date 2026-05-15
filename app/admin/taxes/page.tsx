"use client";
import { useState } from "react";
import { Download, Calculator, CheckCircle, FileText } from "lucide-react";

export default function TaxesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Tax & Compliance</h1>
          <p className="text-sm text-gray-500 mt-0.5">GST filings, TDS tracking, and automated tax reports</p>
        </div>
        <button className="btn-primary flex items-center gap-2" style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}>
          <Calculator className="w-4 h-4" /> Calculate Liabilities
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GST Panel */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Current GST Liability (Jan)</h2>
            <span className="badge badge-orange bg-indigo-50 text-indigo-600">GSTR-3B Pending</span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-sm font-semibold text-gray-700">Total Taxable Sales</span>
              <span className="font-bold text-gray-900">₹82,00,000</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border-l-4 border-l-blue-500">
              <span className="text-sm font-semibold text-gray-700">CGST (9%)</span>
              <span className="font-bold text-gray-900">₹7,38,000</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border-l-4 border-l-blue-500">
              <span className="text-sm font-semibold text-gray-700">SGST (9%)</span>
              <span className="font-bold text-gray-900">₹7,38,000</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 text-green-800 rounded-xl">
              <span className="text-sm font-semibold">Less: Input Tax Credit (ITC)</span>
              <span className="font-bold">-₹11,50,000</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-900 text-white rounded-xl mt-4">
              <span className="font-bold">Net GST Payable</span>
              <span className="text-xl font-black text-indigo-400">₹3,26,000</span>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button className="flex-1 btn-secondary text-center">Preview GSTR-1</button>
            <button className="flex-1 btn-primary bg-indigo-600 text-center">File Return</button>
          </div>
        </div>

        {/* TDS & Other Taxes */}
        <div className="space-y-6">
          <div className="card p-6 border-t-4 border-t-orange-500">
            <h2 className="text-md font-bold text-gray-900 mb-4">TDS tracking</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">TDS Collected (from Corporates)</span>
                <span className="font-bold text-gray-900">₹45,200</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">TDS Deducted (Vendor Payments)</span>
                <span className="font-bold text-gray-900">₹12,400</span>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <h2 className="text-md font-bold text-gray-900 mb-4">Filing History</h2>
            <div className="space-y-3">
              {[
                { period: "Dec 2023", type: "GSTR-3B", date: "Jan 15, 2024", status: "Filed" },
                { period: "Dec 2023", type: "GSTR-1", date: "Jan 10, 2024", status: "Filed" },
                { period: "Nov 2023", type: "GSTR-3B", date: "Dec 18, 2023", status: "Filed" },
              ].map(file => (
                <div key={file.type+file.period} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{file.type} <span className="text-xs text-gray-500 font-normal ml-2">{file.period}</span></p>
                    <p className="text-xs text-gray-400 mt-0.5">Filed on {file.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-green"><CheckCircle className="w-3 h-3"/> {file.status}</span>
                    <button className="text-gray-400 hover:text-indigo-600 transition-colors"><Download className="w-4 h-4"/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
