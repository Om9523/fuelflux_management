'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Plus,
  Search,
  Filter,
  Calendar,
  Truck,
  Printer,
  ChevronRight,
  Info,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  Copy,
  ChevronDown
} from 'lucide-react';
import { useFleetStore, QRVoucher, FuelType } from '@/stores/fleet.store';
import { vouchersService } from '@/services/vouchers.service';
import { toast } from '@/components/feedback/Toast';

export default function VouchersPage() {
  const { activeFleetId, vouchers, vehicles, requestVoucher } = useFleetStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [amount, setAmount] = useState<number>(5000);
  const [fuelType, setFuelType] = useState<FuelType>('diesel');
  const [notes, setNotes] = useState('');
  const [requesting, setRequesting] = useState(false);

  // Focus View State (QR Detail Card)
  const [focusedVoucher, setFocusedVoucher] = useState<QRVoucher | null>(null);

  const fleetVouchers = vouchers[activeFleetId] || [];
  const activeVehicles = (vehicles[activeFleetId] || []).filter(v => v.status === 'active');

  // Filter vouchers
  const filteredVouchers = fleetVouchers.filter((v) => {
    const matchesSearch =
      v.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || v.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleRequestVoucherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId || amount <= 0) {
      toast.error('Please enter a valid vehicle selection and amount.');
      return;
    }

    const matchedVehicle = activeVehicles.find((v) => v.id === selectedVehicleId);
    if (!matchedVehicle) {
      toast.error('Selected vehicle not found.');
      return;
    }

    setRequesting(true);
    try {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 5); // 5 days validity

      await vouchersService.requestVoucher({
        vehicleId: matchedVehicle.id,
        vehicleNumber: matchedVehicle.vehicleNumber,
        amount,
        fuelType,
        expiryDate: expiry.toISOString().split('T')[0],
        notes
      });

      toast.success('Digital QR voucher requested. Pushed to CRM for audit approval.');
      setIsModalOpen(false);

      // Reset
      setSelectedVehicleId('');
      setAmount(5000);
      setNotes('');
      setRequesting(false);
    } catch (err) {
      toast.error('Request failed.');
      setRequesting(false);
    }
  };

  const handleCopyQRString = (qrString: string) => {
    navigator.clipboard.writeText(qrString);
    toast.success('QR Code validation token copied to clipboard.');
  };

  const handlePrintVoucher = (voucher: QRVoucher) => {
    toast.success(`Printing queue initialized for Digital Voucher: ${voucher.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Digital Vouchers
          </h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">
            Issue cashless QR-based fueling limits directly to driver SMS terminals
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-orange-500/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          Request Voucher
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search vehicle number or voucher ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-full md:w-auto">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none cursor-pointer w-full"
          >
            <option value="all">All Vouchers</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="used">Used / Redeemed</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Grid Layout (List on Left, Focused QR Details on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Vouchers List (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Vouchers Ledger</h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Authorization tokens matched to specific vehicle fuel caps</p>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredVouchers.map((voucher) => {
                const isFocused = focusedVoucher?.id === voucher.id;
                
                const statusStyles = {
                  pending: 'bg-amber-50 text-amber-600 border border-amber-100',
                  approved: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
                  used: 'bg-slate-50 text-slate-500 border border-slate-100',
                  expired: 'bg-rose-50 text-rose-500 border border-rose-100',
                  rejected: 'bg-rose-50 text-rose-500 border border-rose-100'
                };

                return (
                  <div
                    key={voucher.id}
                    onClick={() => setFocusedVoucher(voucher)}
                    className={`flex items-center justify-between p-4.5 cursor-pointer transition-all hover:bg-slate-50/50 ${
                      isFocused ? 'bg-orange-50/30' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        voucher.status === 'approved' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <QrCode className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">
                          {voucher.vehicleNumber} ({voucher.fuelType.toUpperCase()})
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <span>Ref: {voucher.id}</span>
                          <span>•</span>
                          <span>Expires: {voucher.expiryDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">₹{voucher.amount.toLocaleString()}</p>
                        <span className={`inline-block px-2 py-0.5 mt-1 rounded-md text-[9px] font-black uppercase ${statusStyles[voucher.status]}`}>
                          {voucher.status}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                );
              })}

              {filteredVouchers.length === 0 && (
                <div className="py-12 text-center">
                  <QrCode className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-slate-800">No vouchers found</h4>
                  <p className="text-xs text-slate-400 mt-1">Try refining search parameters or requesting a new QR token.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: QR Token Focus Drawer/Box */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {focusedVoucher ? (
              <motion.div
                key={focusedVoucher.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-5"
              >
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">QR Authorization Sheet</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Voucher Reference: {focusedVoucher.id}</p>
                  </div>
                  <button 
                    onClick={() => setFocusedVoucher(null)}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Simulated QR Box Card */}
                {focusedVoucher.status === 'approved' ? (
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
                    
                    {/* Simulated visual QR box */}
                    <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm relative group">
                      <div className="w-36 h-36 border-4 border-slate-800 p-1 rounded-lg flex flex-wrap gap-[2px] items-center justify-center bg-slate-900 relative">
                        {/* Custom Mock QR Matrix structure */}
                        <div className="absolute inset-2 border-2 border-dashed border-white/20 flex items-center justify-center text-white/50 text-[10px] font-mono leading-none">
                          FF_QR_{focusedVoucher.id}
                        </div>
                        {/* Position finders */}
                        <div className="absolute top-1 left-1 w-6 h-6 border-2 border-white bg-slate-900" />
                        <div className="absolute top-1 right-1 w-6 h-6 border-2 border-white bg-slate-900" />
                        <div className="absolute bottom-1 left-1 w-6 h-6 border-2 border-white bg-slate-900" />
                      </div>
                    </div>

                    <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-wider">SMS Token String</p>
                    <div className="mt-1 flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 max-w-[200px] w-full justify-between">
                      <span className="text-[10px] font-black text-slate-800 font-mono truncate">{focusedVoucher.qrCode}</span>
                      <button
                        onClick={() => handleCopyQRString(focusedVoucher.qrCode)}
                        className="text-slate-400 hover:text-orange-500 shrink-0 cursor-pointer"
                        title="Copy QR token"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mt-4 flex gap-2 w-full">
                      <button
                        onClick={() => handlePrintVoucher(focusedVoucher)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/10 cursor-pointer"
                      >
                        <Printer className="h-4 w-4" /> Print Sheet
                      </button>
                    </div>
                  </div>
                ) : focusedVoucher.status === 'pending' ? (
                  <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-6 text-center">
                    <Clock className="h-10 w-10 text-amber-500 mx-auto mb-3 animate-pulse" />
                    <h4 className="text-xs font-extrabold text-amber-800">Awaiting Owner Approval</h4>
                    <p className="text-[11px] text-slate-500 font-semibold mt-1">This voucher has been dispatched to the Pump Owner ERP for authorization verification.</p>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center text-slate-400">
                    <Info className="h-10 w-10 mx-auto mb-3" />
                    <h4 className="text-xs font-extrabold capitalize">Voucher Status: {focusedVoucher.status}</h4>
                    <p className="text-[11px] font-semibold mt-1">This token can no longer be used for dispensing fuel at stations.</p>
                  </div>
                )}

                {/* Details list */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Target Vehicle</span>
                    <span className="font-extrabold text-slate-800">{focusedVoucher.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Voucher Amount</span>
                    <span className="font-extrabold text-slate-800">₹{focusedVoucher.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Fuel Authorized</span>
                    <span className="font-extrabold text-slate-800 uppercase">{focusedVoucher.fuelType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Issue Date</span>
                    <span className="font-extrabold text-slate-800">{focusedVoucher.createdDate}</span>
                  </div>
                  {focusedVoucher.notes && (
                    <div className="border-t border-slate-200/60 pt-2 text-[10px] text-slate-400">
                      <span className="block font-bold uppercase tracking-wide">Purpose Notes</span>
                      <p className="mt-0.5 leading-relaxed italic text-slate-600 font-semibold">"{focusedVoucher.notes}"</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center text-slate-400">
                <QrCode className="h-8 w-8 mx-auto mb-3 text-slate-300" />
                <h4 className="text-xs font-bold text-slate-800">No Voucher Selected</h4>
                <p className="text-xs font-semibold text-slate-400 mt-1">Click on a row in the ledger list to view QR verification sheets or print slips.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Request Voucher Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden z-10 p-6"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Request Fueling QR Voucher</h3>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">Creates a digital OTP token for driver dispenser releases</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleRequestVoucherSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Select Target Fleet Vehicle *</label>
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => {
                      setSelectedVehicleId(e.target.value);
                      const matched = activeVehicles.find(v => v.id === e.target.value);
                      if (matched) {
                        setFuelType(matched.fuelType);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-orange-500 cursor-pointer"
                    required
                  >
                    <option value="">-- Choose active Vehicle --</option>
                    {activeVehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.vehicleNumber} ({v.driverName} - {v.make})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Voucher Amount (INR) *</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-orange-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Fuel Authorized</label>
                    <input
                      type="text"
                      value={fuelType.toUpperCase()}
                      className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-black text-slate-500 capitalize focus:outline-none"
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Consignment / Trip Notes</label>
                  <textarea
                    placeholder="e.g. Bangalore-Goa cargo transport fuel allocation."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-orange-500 h-20 resize-none"
                  />
                </div>

                <div className="flex gap-3 justify-end border-t border-slate-100 pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={requesting}
                    className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-orange-500/20 transition-all cursor-pointer"
                  >
                    {requesting ? 'Issuing...' : 'Issue Voucher'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
