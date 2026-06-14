'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Loader2, Building2, AlertCircle, X, CheckCircle2, Search, MapPin } from 'lucide-react';
import { useFleetStore } from '@/stores/fleet.store';
import { creditService, CreditRequest } from '@/services/credit.service';
import { vehiclesService } from '@/services/vehicles.service';
import { LogisticVehicle } from '@/stores/fleet.store';
import backendApi from '@/lib/backendApi';

interface Pump {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  fuel_types: string[];
  owner_name: string;
  contact_number: string;
}

export default function CreditRequestsPage() {
  const { activeFleetId } = useFleetStore();
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicles, setVehicles] = useState<LogisticVehicle[]>([]);

  // Pump selector state
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [pumpSearch, setPumpSearch] = useState('');
  const [loadingPumps, setLoadingPumps] = useState(false);
  const [selectedPump, setSelectedPump] = useState<Pump | null>(null);

  // Form State
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [limit, setLimit] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await creditService.getLogisticRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch vehicles from backend and store in local state
  const fetchVehicles = async () => {
    try {
      const data = await vehiclesService.getVehicles();
      setVehicles(data);
    } catch (err) {
      console.error('[CreditRequests] Failed to fetch vehicles:', err);
    }
  };

  const fetchPumps = async (search?: string) => {
    setLoadingPumps(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const { data } = await backendApi.get(`/pumps/${params}`);
      setPumps(data);
    } catch (err) {
      console.error('[CreditRequests] Failed to fetch pumps:', err);
    } finally {
      setLoadingPumps(false);
    }
  };

  useEffect(() => {
    if (activeFleetId) {
      fetchRequests();
      fetchVehicles();
    }
  }, [activeFleetId]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setSelectedPump(null);
    setPumpSearch('');
    setSelectedVehicleId('');
    setLimit('');
    setRemarks('');
    setError('');
    fetchPumps();
  };

  const handlePumpSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPumpSearch(val);
    if (val.length >= 2) fetchPumps(val);
    else if (val.length === 0) fetchPumps();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId) { setError('Please select a vehicle.'); return; }
    if (!selectedPump) { setError('Please select a pump station.'); return; }
    if (!limit) { setError('Please enter the requested credit limit.'); return; }

    setIsSubmitting(true);
    setError('');
    try {
      await creditService.createRequest({
        vehicle_id: parseInt(selectedVehicleId),
        pump_id: selectedPump.id,
        requested_limit: parseFloat(limit),
        remarks: remarks,
      });
      setIsModalOpen(false);
      setSelectedVehicleId('');
      setLimit('');
      setRemarks('');
      setSelectedPump(null);
      await fetchRequests();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    if (status === 'approved') return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" /> Approved
      </span>
    );
    if (status === 'rejected') return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
        <AlertCircle className="h-3.5 w-3.5" /> Rejected
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Pending
      </span>
    );
  };

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            Credit Requests
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Request credit limits at pump stations where your fleet fuels
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-orange-500/20 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Request Credit
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm min-h-[400px] overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-sm font-medium">Loading credit requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
              <FileText className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-sm font-medium">No credit requests yet.</p>
            <button onClick={handleOpenModal} className="mt-2 text-sm text-orange-600 font-semibold hover:text-orange-700">
              Create your first request →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                  <th className="px-6 py-4">Request ID</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Requested Limit</th>
                  <th className="px-6 py-4">Pump Station</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800 text-sm">REQ-{req.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800 text-sm">{req.vehicle_plate}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800 text-sm">₹{req.requested_limit.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-600">{req.pump_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{statusBadge(req.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm text-slate-500 font-medium">{req.requested_at}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Request Credit Limit</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Select pump station → vehicle → amount</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-600 text-sm font-medium">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {/* Step 1: Pump Station */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-black mr-1.5">1</span>
                    Select Pump Station
                  </label>

                  {selectedPump ? (
                    <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                      <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
                        <Building2 className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-orange-900 truncate">{selectedPump.name}</p>
                        <p className="text-xs text-orange-600 truncate">{selectedPump.address}{selectedPump.city ? `, ${selectedPump.city}` : ''}</p>
                        {selectedPump.fuel_types?.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {selectedPump.fuel_types.map((ft) => (
                              <span key={ft} className="text-[10px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">{ft.trim()}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button type="button" onClick={() => { setSelectedPump(null); fetchPumps(); }} className="shrink-0 p-1 text-orange-400 hover:text-orange-700 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={pumpSearch}
                          onChange={handlePumpSearch}
                          placeholder="Search by pump name or city..."
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 transition-all"
                        />
                      </div>
                      <div className="border border-slate-200 rounded-xl overflow-hidden max-h-40 overflow-y-auto divide-y divide-slate-100">
                        {loadingPumps ? (
                          <div className="flex items-center justify-center py-5 text-slate-400 gap-2 text-sm">
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading stations...
                          </div>
                        ) : pumps.length === 0 ? (
                          <div className="py-5 text-center text-slate-400 text-sm">No pump stations found</div>
                        ) : pumps.map(pump => (
                          <button
                            key={pump.id} type="button"
                            onClick={() => setSelectedPump(pump)}
                            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-orange-50 text-left transition-colors"
                          >
                            <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate">{pump.name}</p>
                              <p className="text-xs text-slate-500 truncate">{pump.address}{pump.city ? `, ${pump.city}` : ''}</p>
                              {pump.fuel_types?.length > 0 && (
                                <div className="flex gap-1 mt-0.5">
                                  {pump.fuel_types.map((ft) => (
                                    <span key={ft} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{ft.trim()}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Step 2: Vehicle — uses LogisticVehicle shape (vehicleNumber, make, model) */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-black mr-1.5">2</span>
                    Select Vehicle
                  </label>
                  {vehicles.length === 0 ? (
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading vehicles...
                    </div>
                  ) : (
                    <select
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 transition-all"
                    >
                      <option value="">Choose a vehicle</option>
                      {vehicles.map((v) => (
                        // v.id is the backend numeric id as string, vehicleNumber and make/model are frontend shape
                        <option key={v.id} value={v.id}>
                          {v.vehicleNumber} — {v.make} {v.model}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Step 3: Credit Limit */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-black mr-1.5">3</span>
                    Requested Credit Limit (₹)
                  </label>
                  <input
                    type="number" min="1" value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 transition-all"
                  />
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Message for Pump Owner (Optional)</label>
                  <textarea
                    value={remarks} onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g. Our trucks fuel here daily, requesting monthly credit limit..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 transition-all resize-none h-20"
                  />
                </div>

                <button
                  type="submit" disabled={isSubmitting}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm shadow-orange-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Submitting...</> : 'Submit Credit Request'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}