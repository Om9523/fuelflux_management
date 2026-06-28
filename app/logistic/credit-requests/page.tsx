'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Loader2, Building2, AlertCircle, X,
  CheckCircle2, Search, MapPin, ChevronRight, Clock,
  IndianRupee, Shield, PenLine, Upload,
} from 'lucide-react';
import { useFleetStore } from '@/stores/fleet.store';
import {
  creditService, CreditRequest, CreditStatus,
  STATUS_LABELS, STATUS_COLORS, NEXT_ACTION,
} from '@/services/credit.service';
import { vehiclesService } from '@/services/vehicles.service';
import { LogisticVehicle } from '@/stores/fleet.store';
import backendApi from '@/lib/backendApi';
import { toast } from '@/components/feedback/Toast';

interface Pump {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  fuel_types: string[];
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: CreditStatus }) {
  const icons: Partial<Record<CreditStatus, React.ReactNode>> = {
    pending: <Clock className="h-3 w-3" />,
    approved: <CheckCircle2 className="h-3 w-3" />,
    rejected: <AlertCircle className="h-3 w-3" />,
    deposit_pending: <IndianRupee className="h-3 w-3" />,
    contract_generated: <FileText className="h-3 w-3" />,
    logistic_signed: <PenLine className="h-3 w-3" />,
    pump_signed: <PenLine className="h-3 w-3" />,
    active: <Shield className="h-3 w-3" />,
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${STATUS_COLORS[status]}`}>
      {icons[status]}
      {STATUS_LABELS[status]}
    </span>
  );
}

// ─── Action Required Badge ────────────────────────────────────────────────────

function ActionBadge({ status }: { status: CreditStatus }) {
  const action = NEXT_ACTION[status];
  if (!action) return null;

  const icons: Record<string, React.ReactNode> = {
    'Upload deposit proof': <Upload className="h-3 w-3" />,
    'Sign the contract': <PenLine className="h-3 w-3" />,
  };

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold">
      {icons[action] || null}
      {action}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CreditRequestsPage() {
  const router = useRouter();
  const { activeFleetId } = useFleetStore();
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicles, setVehicles] = useState<LogisticVehicle[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Pump selector
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [pumpSearch, setPumpSearch] = useState('');
  const [loadingPumps, setLoadingPumps] = useState(false);
  const [selectedPump, setSelectedPump] = useState<Pump | null>(null);

  // Form
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [limit, setLimit] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchRequests = async (pumpId?: string) => {
    setIsLoading(true);
    try {
      const data = await creditService.getLogisticRequests(pumpId);
      setRequests(data);
    } catch (err) {
      toast.error('Error', 'Failed to load credit requests');
    } finally {
      setIsLoading(false);
    }
  };

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

  // Fetch vehicles once on mount
  useEffect(() => {
    if (activeFleetId) {
      fetchVehicles();
    }
  }, [activeFleetId]);

  // Re-fetch credit requests whenever the selected pump changes
  useEffect(() => {
    if (activeFleetId) {
      const pumpId = selectedPump ? selectedPump.id : undefined;
      fetchRequests(pumpId);
    }
  }, [activeFleetId, selectedPump]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setSelectedPump(null);
    setPumpSearch('');
    setSelectedVehicleIds([]);
    setLimit('');
    setRemarks('');
    setError('');
    fetchPumps();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVehicleIds.length === 0) { setError('Please select at least one vehicle.'); return; }
    if (!selectedPump) { setError('Please select a pump station.'); return; }
    if (!limit) { setError('Please enter the requested credit limit.'); return; }

    setIsSubmitting(true);
    setError('');
    try {
      await creditService.createRequest({
        vehicle_ids: selectedVehicleIds,
        pump_id: String(selectedPump.id),
        requested_limit: parseFloat(limit),
        remarks,
      });
      toast.success('Request Sent', 'Pump owner will review your request');
      setIsModalOpen(false);
      await fetchRequests();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Derived stats
  const stats = {
    total: requests.length,
    active: requests.filter(r => r.status === 'active').length,
    pending: requests.filter(r => ['pending', 'deposit_pending', 'contract_generated', 'logistic_signed', 'pump_signed'].includes(r.status)).length,
    actionRequired: requests.filter(r => NEXT_ACTION[r.status as CreditStatus]).length,
  };

  const filtered = filterStatus === 'all'
    ? requests
    : requests.filter(r => r.status === filterStatus);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-primary flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Credit Agreements</h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Manage credit requests, deposits, and contracts with pump stations
            </p>
          </div>
        </div>
        <button onClick={handleOpenModal}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer">
          <Plus className="h-4 w-4" />
          New Credit Request
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Requests', value: stats.total, color: 'text-slate-800', bg: 'bg-slate-50 border-slate-100' },
          { label: 'Active Credits', value: stats.active, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'In Progress', value: stats.pending, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' },
          { label: 'Action Needed', value: stats.actionRequired, color: 'text-primary', bg: 'bg-orange-50 border-orange-100' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`p-4 rounded-2xl border ${bg}`}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
            <p className={`text-2xl font-black mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Action Required Banner */}
      {stats.actionRequired > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
          <AlertCircle className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-orange-800">
              {stats.actionRequired} request{stats.actionRequired > 1 ? 's' : ''} require your attention
            </p>
            <p className="text-xs text-orange-600 mt-0.5">
              Upload deposit proof or sign pending contracts to activate credit.
            </p>
          </div>
        </motion.div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'All' },
          { id: 'pending', label: 'Pending' },
          { id: 'deposit_pending', label: 'Deposit Required' },
          { id: 'contract_generated', label: 'To Sign' },
          { id: 'active', label: 'Active' },
          { id: 'rejected', label: 'Rejected' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setFilterStatus(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border
              ${filterStatus === tab.id
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FileText className="h-10 w-10 mb-3 opacity-20" />
            <p className="font-bold text-sm">No credit requests found</p>
            <button onClick={handleOpenModal}
              className="mt-4 text-sm text-primary font-bold hover:underline cursor-pointer">
              Create your first request →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-4">Request</th>
                  <th className="px-5 py-4">Vehicle</th>
                  <th className="px-5 py-4">Pump Station</th>
                  <th className="px-5 py-4">Limit</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Action</th>
                  <th className="px-5 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(req => (
                  <tr key={req.id}
                    onClick={() => router.push(`/logistic/credit-requests/${req.id}`)}
                    className="hover:bg-orange-50/30 transition-colors cursor-pointer group">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800 text-sm">REQ-{req.id}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{req.requested_at}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800 text-sm font-mono">{req.vehicle_plate}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
                        <p className="text-sm font-medium text-slate-600 truncate max-w-[160px]">{req.pump_name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800 text-sm">
                        ₹{(req.approved_limit || req.requested_limit).toLocaleString('en-IN')}
                      </p>
                      {req.approved_limit && req.approved_limit !== req.requested_limit && (
                        <p className="text-[10px] text-slate-400">
                          Req: ₹{req.requested_limit.toLocaleString('en-IN')}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={req.status as CreditStatus} />
                    </td>
                    <td className="px-5 py-4">
                      <ActionBadge status={req.status as CreditStatus} />
                    </td>
                    <td className="px-5 py-4">
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Request Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col z-10">

              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">New Credit Request</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Select pump → vehicle → credit amount</p>
                </div>
                <button onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-xs font-bold">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {/* Step 1 — Pump */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-2 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">1</span>
                    Select Pump Station
                  </label>

                  {selectedPump ? (
                    <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                      <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-orange-900 truncate">{selectedPump.name}</p>
                        <p className="text-xs text-orange-600 truncate">{selectedPump.address}{selectedPump.city ? `, ${selectedPump.city}` : ''}</p>
                      </div>
                      <button type="button" onClick={() => { setSelectedPump(null); fetchPumps(); }}
                        className="p-1 text-orange-400 hover:text-orange-700 cursor-pointer transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" value={pumpSearch}
                          onChange={e => { setPumpSearch(e.target.value); if (e.target.value.length >= 2) fetchPumps(e.target.value); else if (!e.target.value) fetchPumps(); }}
                          placeholder="Search pump name or city..."
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-primary/50 transition-colors" />
                      </div>
                      <div className="border border-slate-100 rounded-xl overflow-hidden max-h-36 overflow-y-auto">
                        {loadingPumps ? (
                          <div className="flex items-center justify-center py-4 text-slate-400 gap-2 text-xs">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading...
                          </div>
                        ) : pumps.length === 0 ? (
                          <p className="py-4 text-center text-slate-400 text-xs">No stations found</p>
                        ) : pumps.map(pump => (
                          <button key={pump.id} type="button" onClick={() => setSelectedPump(pump)}
                            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-orange-50 text-left transition-colors border-b border-slate-50 last:border-0">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{pump.name}</p>
                              <p className="text-[10px] text-slate-500 truncate">{pump.address}{pump.city ? `, ${pump.city}` : ''}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Step 2 — Vehicle */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-2 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">2</span>
                    Select Fleet Vehicles
                  </label>
                  {vehicles.length === 0 ? (
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading vehicles...
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2 bg-slate-50">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-1.5">
                        <button type="button" onClick={() => setSelectedVehicleIds(vehicles.map(v => String(v.id)))}
                          className="text-[10px] font-bold text-primary hover:underline cursor-pointer">
                          Select All
                        </button>
                        <button type="button" onClick={() => setSelectedVehicleIds([])}
                          className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer">
                          Clear All
                        </button>
                      </div>
                      {vehicles.map(v => {
                        const isChecked = selectedVehicleIds.includes(String(v.id));
                        return (
                          <label key={v.id} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                            <input type="checkbox" checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedVehicleIds(selectedVehicleIds.filter(id => id !== String(v.id)));
                                } else {
                                  setSelectedVehicleIds([...selectedVehicleIds, String(v.id)]);
                                }
                              }}
                              className="accent-primary h-4 w-4 rounded cursor-pointer" />
                            <span>{v.vehicleNumber || (v as any).vehicle_plate} — {v.make || (v as any).make_model}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Step 3 — Amount */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-2 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">3</span>
                    Requested Credit Limit (₹)
                  </label>
                  <input type="number" min="1" value={limit}
                    onChange={e => setLimit(e.target.value)}
                    placeholder="e.g. 500000"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-primary/50 transition-colors" />
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-2">
                    Message for Pump Owner (Optional)
                  </label>
                  <textarea value={remarks} onChange={e => setRemarks(e.target.value)}
                    placeholder="e.g. Our fleet fuels here daily. We need monthly credit..."
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-primary/50 transition-colors resize-none" />
                </div>

                {/* Info box */}
                <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500">
                  <AlertCircle className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <p>Pump owner will review your request. If approved with security deposit, you'll need to pay and upload proof before the contract is generated.</p>
                </div>

                <button type="submit" disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                  {isSubmitting
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                    : 'Submit Credit Request'
                  }
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}