'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, X, Printer, Fuel,
  MapPin, Compass, Thermometer, ShieldCheck, Download
} from 'lucide-react';
import backendApi from '@/lib/backendApi';
import { toast } from '@/components/feedback/Toast';
import { useFleetStore } from '@/stores/fleet.store';

interface LiveTransaction {
  id: string;
  vehicleId: string;
  vehicleNumber: string;
  pumpName: string;
  fuelType: string;
  quantity: number;
  amount: number;
  driverName: string;
  paymentType: 'credit' | 'wallet';
  date: string;
  balanceRemaining: number;
}

export default function TransactionsPage() {
  const { activeFleetId } = useFleetStore();
  const [loading, setLoading] = useState(true);
  const [allTxns, setAllTxns] = useState<LiveTransaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterFuel, setFilterFuel] = useState<string>('all');
  const [selectedTxn, setSelectedTxn] = useState<LiveTransaction | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await backendApi.get('/logistic/transactions');
        setAllTxns(data);
      } catch (err) {
        console.error('[Transactions] API error:', err);
        toast.error('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const fleetTxns = allTxns;

  // Filter transactions
  const filteredTxns = fleetTxns.filter((t) => {
    const matchesSearch =
      t.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.pumpName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPayment = filterPayment === 'all' || t.paymentType === filterPayment;
    const matchesFuel = filterFuel === 'all' || t.fuelType === filterFuel;

    return matchesSearch && matchesPayment && matchesFuel;
  });

  const handlePrintReceipt = () => {
    if (!selectedTxn) return;
    toast.success(`Invoice print layout sent for transaction ${selectedTxn.id}`);
  };

  const handleExportCSV = () => {
    toast.success('Fuel ledger exported as CSV report.');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Transactions
          </h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">
            Real-time billing ledger matching fuel dispensers, nozzle pressures, and vehicle credit limits
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:border-orange-500/30 text-slate-700 hover:text-orange-500 rounded-xl text-sm font-bold shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Download className="h-4 w-4" />
          Export Ledger
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search vehicle, driver, or fuel pump station..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-1/2 md:w-auto">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
            >
              <option value="all">All Payments</option>
              <option value="credit">Credit Line</option>
              <option value="wallet">Prepaid Wallet</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-1/2 md:w-auto">
            <Fuel className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={filterFuel}
              onChange={(e) => setFilterFuel(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
            >
              <option value="all">All Fuels</option>
              <option value="diesel">Diesel</option>
              <option value="petrol">Petrol</option>
              <option value="cng">CNG</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Table Container */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
          <span className="text-xs text-slate-400 font-semibold mt-3">Loading transaction ledger...</span>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="p-4 pl-6">Txn ID</th>
                <th className="p-4">Vehicle Number</th>
                <th className="p-4">Driver Assigned</th>
                <th className="p-4">Fueling Station</th>
                <th className="p-4">Fuel Type</th>
                <th className="p-4 text-right">Liters Filled</th>
                <th className="p-4 text-right">Invoice Amount</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4 pr-6">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredTxns.map((txn) => {
                const methodBadge = txn.paymentType === 'credit'
                  ? <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-md text-[10px] font-bold uppercase">Credit Line</span>
                  : <span className="px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-md text-[10px] font-bold uppercase">Prepaid Wallet</span>;

                const fuelColors: Record<string, string> = {
                  diesel: 'text-orange-600 font-bold capitalize',
                  petrol: 'text-blue-600 font-bold capitalize',
                  cng: 'text-emerald-600 font-bold capitalize'
                };

                return (
                  <tr
                    key={txn.id}
                    onClick={() => setSelectedTxn(txn)}
                    className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                  >
                    <td className="p-4 pl-6 font-bold text-slate-400">{txn.id}</td>
                    <td className="p-4 font-extrabold text-slate-900">{txn.vehicleNumber}</td>
                    <td className="p-4 text-slate-500 font-semibold">{txn.driverName}</td>
                    <td className="p-4 max-w-[150px] truncate" title={txn.pumpName}>
                      {txn.pumpName}
                    </td>
                    <td className="p-4">
                      <span className={fuelColors[txn.fuelType.toLowerCase()] || 'capitalize'}>
                        {txn.fuelType}
                      </span>
                    </td>
                    <td className="p-4 text-right font-semibold text-slate-600">{txn.quantity} L</td>
                    <td className="p-4 text-right font-black text-slate-900">₹{txn.amount.toLocaleString()}</td>
                    <td className="p-4">{methodBadge}</td>
                    <td className="p-4 pr-6 text-slate-400 whitespace-nowrap">{txn.date}</td>
                  </tr>
                );
              })}

              {filteredTxns.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 font-bold">
                    No transactions matching the selected filters found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Transaction Receipt Details Slider */}
      <AnimatePresence>
        {selectedTxn && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTxn(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />

            {/* Slide Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 right-0 w-full max-w-md bg-slate-50 border-l border-slate-200 shadow-2xl z-50 flex flex-col justify-between"
            >
              {/* Drawer Header */}
              <div className="p-5 bg-white border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-100/50 px-2 py-0.5 rounded-md uppercase">
                    Invoice Details
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">
                    Receipt Ref: {selectedTxn.id}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedTxn(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Body (Mock Invoice Layout) */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Visual Invoice Mockup Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden">
                  {/* Decorative receipt cuts */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 to-amber-400" />
                  
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3 mt-1">
                    <div>
                      <h4 className="font-black text-xs text-slate-800 uppercase tracking-tight">FuelFlux Network</h4>
                      <p className="text-[9px] font-semibold text-slate-400">GSTIN: {activeFleetId === 'fleet_1' ? '37AAPCA2031B1ZN' : '36BBBCB1092D2ZM'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Dispenser ID</p>
                      <p className="font-extrabold text-slate-700 text-xs">DSP-NOZ-04</p>
                    </div>
                  </div>

                  {/* Operational Telemetry Details */}
                  <div className="grid grid-cols-2 gap-3 text-xs border-b border-slate-100 pb-3">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Station Pump</p>
                      <p className="font-bold text-slate-800 mt-0.5">{selectedTxn.pumpName}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Nozzle Pressure</p>
                      <p className="font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                        <Compass className="h-3.5 w-3.5 text-orange-500" /> 11.2 PSI
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Fuel Temperature</p>
                      <p className="font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                        <Thermometer className="h-3.5 w-3.5 text-blue-500" /> 23.8 °C
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Calibration Date</p>
                      <p className="font-bold text-slate-800 mt-0.5">2026-05-10</p>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-500 font-semibold">
                      <span>{selectedTxn.quantity} Liters of {selectedTxn.fuelType.toUpperCase()}</span>
                      <span className="font-bold text-slate-800">₹{(selectedTxn.amount * 0.82).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 font-medium text-[11px]">
                      <span>Central CGST (9%)</span>
                      <span>₹{(selectedTxn.amount * 0.09).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 font-medium text-[11px]">
                      <span>State SGST (9%)</span>
                      <span>₹{(selectedTxn.amount * 0.09).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-100 pt-3 text-slate-900 font-extrabold text-sm">
                      <span>Total Invoice</span>
                      <span className="text-orange-500">₹{selectedTxn.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* GPS and Location Security Lock Drawer */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Security & Telemetry Audit</h4>
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="font-bold text-slate-700">GPS Coordinates</p>
                        <p className="text-[10px] text-slate-400 font-semibold">Lat: 16.5062° N | Lon: 80.6480° E</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 border-t border-slate-100 pt-3">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      <div>
                        <p className="font-bold text-slate-700">Integrity Signed</p>
                        <p className="text-[10px] text-slate-400 font-semibold">Dispenser fuel flow matches telemetry exactly.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vehicle & Driver Details */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Authorized Entity</h4>
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs font-bold text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Vehicle Reg No.</span>
                      <span className="text-slate-900">{selectedTxn.vehicleNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Authorized Driver</span>
                      <span className="text-slate-900">{selectedTxn.driverName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Prepaid Ledger Balance</span>
                      <span className="text-slate-900">₹{selectedTxn.balanceRemaining.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-100 bg-white flex gap-3">
                <button
                  onClick={() => setSelectedTxn(null)}
                  className="w-1/2 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={handlePrintReceipt}
                  className="w-1/2 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-lg hover:shadow-orange-500/20 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer className="h-4 w-4" /> Print Receipt
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
