'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Fuel, Truck, Car, TrendingDown,
  Building2, Calendar, Loader2, ChevronDown, Filter
} from 'lucide-react';
import backendApi from '@/lib/backendApi';
import { toast } from '@/components/feedback/Toast';

interface FuelEntry {
  id: number;
  vehicle_plate: string;
  vehicle_type: string;
  make_model: string;
  driver_name: string;
  fuel_type: string;
  pump_name: string;
  pump_address: string;
  pump_city: string;
  volume_litres: number;
  amount: number;
  payment_mode: string;
  timestamp: string;
}

export default function FuelHistoryPage() {
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterVehicle, setFilterVehicle] = useState('all');
  const [filterFuel, setFilterFuel] = useState('all');

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const { data } = await backendApi.get('/logistic/fuel-history');
      setEntries(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load fuel history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  // Derived stats
  const totalLiters = entries.reduce((acc, e) => acc + e.volume_litres, 0);
  const totalAmount = entries.reduce((acc, e) => acc + e.amount, 0);
  const uniquePlates = Array.from(new Set(entries.map(e => e.vehicle_plate)));
  const carbonKg = (totalLiters * 2.68).toFixed(0);

  // Filtered entries
  const filtered = entries.filter(e => {
    const matchVehicle = filterVehicle === 'all' || e.vehicle_plate === filterVehicle;
    const matchFuel = filterFuel === 'all' || e.fuel_type.toLowerCase() === filterFuel;
    return matchVehicle && matchFuel;
  });

  const vehicleIcon = (type: string) =>
    type === 'car' ? <Car className="h-4 w-4" /> : <Truck className="h-4 w-4" />;

  const paymentBadge = (mode: string) =>
    mode === 'credit'
      ? <span className="text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full uppercase">Credit</span>
      : <span className="text-[10px] font-black bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded-full uppercase">Wallet</span>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Activity className="h-5 w-5" />
            </div>
            Fuel History
          </h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">
            Complete fuel fill-up log for all fleet vehicles — sorted by latest first
          </p>
        </div>
      </div>

      {/* Stats Row */}
      {!isLoading && entries.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Fuel Filled', value: `${totalLiters.toFixed(0)} L`, icon: <Fuel className="h-5 w-5" />, color: 'orange' },
            { label: 'Total Spend', value: `₹${totalAmount.toLocaleString('en-IN')}`, icon: <TrendingDown className="h-5 w-5" />, color: 'rose' },
            { label: 'Active Vehicles', value: uniquePlates.length, icon: <Truck className="h-5 w-5" />, color: 'blue' },
            { label: 'CO₂ Footprint', value: `${carbonKg} kg`, icon: <Activity className="h-5 w-5" />, color: 'emerald' },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className={`w-9 h-9 rounded-xl bg-${stat.color}-100 text-${stat.color}-600 flex items-center justify-center mb-3`}>
                {stat.icon}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-black text-slate-900 mt-0.5">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={filterVehicle}
            onChange={e => setFilterVehicle(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
          >
            <option value="all">All Vehicles</option>
            {uniquePlates.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <Fuel className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={filterFuel}
            onChange={e => setFilterFuel(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none cursor-pointer"
          >
            <option value="all">All Fuels</option>
            <option value="diesel">Diesel</option>
            <option value="petrol">Petrol</option>
            <option value="cng">CNG</option>
          </select>
        </div>

        <span className="text-xs font-bold text-slate-400 ml-auto">{filtered.length} entries</span>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-sm font-semibold">Loading fuel history...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
              <Fuel className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-sm font-semibold">No fuel records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-4">Vehicle</th>
                  <th className="px-5 py-4">Driver</th>
                  <th className="px-5 py-4">Pump Station</th>
                  <th className="px-5 py-4">Fuel</th>
                  <th className="px-5 py-4 text-right">Litres</th>
                  <th className="px-5 py-4 text-right">Amount</th>
                  <th className="px-5 py-4">Mode</th>
                  <th className="px-5 py-4">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((entry, idx) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="hover:bg-orange-50/30 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                          {vehicleIcon(entry.vehicle_type)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{entry.vehicle_plate}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{entry.make_model}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-slate-600">{entry.driver_name}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{entry.pump_name}</p>
                          {entry.pump_city && <p className="text-[10px] text-slate-400">{entry.pump_city}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-sm font-black capitalize ${
                        entry.fuel_type === 'Diesel' ? 'text-orange-600' :
                        entry.fuel_type === 'CNG' ? 'text-emerald-600' : 'text-blue-600'
                      }`}>{entry.fuel_type}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm font-bold text-slate-700">{entry.volume_litres} L</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm font-black text-slate-900">₹{entry.amount.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-5 py-3.5">{paymentBadge(entry.payment_mode)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-xs font-semibold">{entry.timestamp}</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
