"use client";
import { useState } from "react";
import { CreditCard, Receipt, Download, Search, CheckCircle2, FileText, ArrowUpRight } from "lucide-react";
import { useBookingStore } from "@/stores/useBookingStore";

export default function PaymentsPage() {
  const { bookings } = useBookingStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTransactions = bookings.filter(b => 
    b.stationName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
            <CreditCard className="w-32 h-32" />
          </div>
          <p className="text-orange-100 text-sm font-semibold mb-1">Total Spent</p>
          <p className="text-3xl font-black mb-4">₹{bookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString('en-IN')}</p>
          <div className="flex items-center gap-2 text-xs font-medium bg-white/20 w-fit px-3 py-1.5 rounded-lg backdrop-blur-sm">
            <ArrowUpRight className="w-3 h-3" /> +12% this month
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Total Transactions</p>
              <p className="text-xl font-bold text-gray-900">{bookings.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
           <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Pending Invoices</p>
              <p className="text-xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
            <p className="text-sm text-gray-500 mt-1">View and download your past fuel receipts.</p>
          </div>
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search station or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-colors w-full md:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">Transaction Details</th>
                <th className="p-4">Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 text-sm">{booking.stationName}</span>
                      <span className="text-xs text-gray-500 font-medium">Ref: {booking.id} • {booking.fuelType} ({booking.quantity}L)</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-semibold text-gray-600">
                      {new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-black text-gray-900">₹{booking.amount.toFixed(2)}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 bg-green-50 text-green-600 px-2.5 py-1 rounded-md w-fit text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Success
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-orange-500 hover:text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 ml-auto transition-colors">
                      <Download className="w-4 h-4" /> PDF
                    </button>
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-medium">No transactions found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
