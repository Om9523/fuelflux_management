'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Eye, Check, X, ShieldAlert, AlertTriangle, Landmark, FileImage, Download } from 'lucide-react';
import { useAdminStore } from '@/stores/admin.store';
import { Pump } from '@/lib/mock-db';
import { toast } from '@/components/feedback/Toast';

export default function AdminPendingApprovalsPage() {
  const router = useRouter();
  const { pumps, fetchPumps, updatePumpStatus, isLoading } = useAdminStore();
  const [selectedPumpId, setSelectedPumpId] = useState<string | null>(null);

  useEffect(() => {
    fetchPumps();
  }, []);

  const pendingPumps = pumps.filter((p) => p.status === 'pending' || p.status === 'under_review' || p.status === 'rejected');

  // Set default selected pump if none selected
  useEffect(() => {
    if (pendingPumps.length > 0 && !selectedPumpId) {
      setSelectedPumpId(pendingPumps[0].id);
    }
  }, [pendingPumps, selectedPumpId]);

  const activePump = pumps.find((p) => p.id === selectedPumpId);

  const handleDecision = async (id: string, decision: Pump['status'], message: string) => {
    try {
      await updatePumpStatus(id, decision);
      toast.success(message);
      fetchPumps();
      
      // Auto-select another pending pump
      const remaining = pendingPumps.filter((p) => p.id !== id);
      if (remaining.length > 0) {
        setSelectedPumpId(remaining[0].id);
      } else {
        setSelectedPumpId(null);
      }
    } catch (e) {
      toast.error('Failed to register action.');
    }
  };

  const getStatusBadge = (status: Pump['status']) => {
    const badges = {
      approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      pending: 'bg-amber-50 text-amber-600 border-amber-100',
      under_review: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      rejected: 'bg-rose-50 text-rose-600 border-rose-100',
      suspended: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return (
      <span className={`text-[9px] font-extrabold px-2.5 py-0.5 border rounded-full uppercase ${badges[status]}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Pump Registration Approvals
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Verify regulatory documents and activate stations into the FuelFlux grid.
        </p>
      </div>

      {pendingPumps.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-3">
          <Check className="h-10 w-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-extrabold text-slate-800">Verification Queue Empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            All pump registrations have been audited. No pending document verification checks remaining.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left panel: List */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
            <div className="p-4 bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Awaiting Audit ({pendingPumps.length})
            </div>
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {pendingPumps.map((pump) => (
                <button
                  key={pump.id}
                  onClick={() => setSelectedPumpId(pump.id)}
                  className={`w-full p-4 text-left hover:bg-slate-50 transition-colors flex justify-between items-start outline-none cursor-pointer
                    ${selectedPumpId === pump.id ? 'bg-orange-50/40 border-l-4 border-l-orange-500' : ''}
                  `}
                >
                  <div className="space-y-1.5 truncate pr-2">
                    <span className="text-xs font-extrabold text-slate-800 block truncate">
                      {pump.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold block">
                      {pump.city}, {pump.state}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      By {pump.ownerName}
                    </span>
                  </div>
                  {getStatusBadge(pump.status)}
                </button>
              ))}
            </div>
          </div>

          {/* Right panel: Review Viewer */}
          <div className="lg:col-span-8 space-y-6">
            {activePump ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
                {/* Upper summary */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-5">
                  <div className="space-y-1.5">
                    <div className="flex gap-2.5 items-center">
                      <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                        {activePump.name}
                      </h2>
                      {getStatusBadge(activePump.status)}
                    </div>
                    <p className="text-xs font-semibold text-slate-500">
                      {activePump.address}, {activePump.city}, {activePump.state}
                    </p>
                  </div>
                  <div className="text-right text-[10px] text-slate-400 font-bold">
                    Submitted: {new Date(activePump.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Registration Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border border-slate-200/50 p-4 rounded-xl text-xs font-semibold text-slate-600">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold block">PUMP OWNER</span>
                      <span className="text-slate-800 font-extrabold block">{activePump.ownerName}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold block">OWNER EMAIL</span>
                      <span className="text-slate-800 block">owner@fuelflux.com</span>
                    </div>
                    <div className="space-y-1 pt-2 md:pt-0">
                      <span className="text-[10px] text-slate-400 font-bold block">GST IDENTIFICATION (GSTIN)</span>
                      <span className="text-slate-800 font-mono font-bold block">{activePump.gstNumber}</span>
                    </div>
                    <div className="space-y-1 pt-2 md:pt-0">
                      <span className="text-[10px] text-slate-400 font-bold block">EXPLOSIVES FUEL LICENSE NUMBER</span>
                      <span className="text-slate-800 font-mono font-bold block">{activePump.licenseNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Uploaded Documents */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Uploaded Verification Documents (4)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-3.5 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                      <div className="flex gap-2.5 items-center">
                        <div className="p-2 bg-blue-50 text-blue-500 rounded-lg shrink-0">
                          <FileText className="h-4.5 w-4.5" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-xs font-extrabold text-slate-800 block">GST Certificate</span>
                          <span className="text-[10px] text-slate-400 font-mono">{activePump.documents.gstCertificate}</span>
                        </div>
                      </div>
                      <button className="p-1.5 hover:bg-slate-50 rounded-lg border border-slate-200 text-slate-500 outline-none cursor-pointer">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3.5 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                      <div className="flex gap-2.5 items-center">
                        <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg shrink-0">
                          <Landmark className="h-4.5 w-4.5" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-xs font-extrabold text-slate-800 block">Fuel NOC License</span>
                          <span className="text-[10px] text-slate-400 font-mono">{activePump.documents.fuelLicense}</span>
                        </div>
                      </div>
                      <button className="p-1.5 hover:bg-slate-50 rounded-lg border border-slate-200 text-slate-500 outline-none cursor-pointer">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3.5 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                      <div className="flex gap-2.5 items-center">
                        <div className="p-2 bg-amber-50 text-amber-500 rounded-lg shrink-0">
                          <FileText className="h-4.5 w-4.5" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-xs font-extrabold text-slate-800 block">Aadhaar Card</span>
                          <span className="text-[10px] text-slate-400 font-mono">{activePump.documents.aadhaar}</span>
                        </div>
                      </div>
                      <button className="p-1.5 hover:bg-slate-50 rounded-lg border border-slate-200 text-slate-500 outline-none cursor-pointer">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3.5 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                      <div className="flex gap-2.5 items-center">
                        <div className="p-2 bg-rose-50 text-rose-500 rounded-lg shrink-0">
                          <FileText className="h-4.5 w-4.5" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-xs font-extrabold text-slate-800 block">PAN Card copy</span>
                          <span className="text-[10px] text-slate-400 font-mono">{activePump.documents.pan}</span>
                        </div>
                      </div>
                      <button className="p-1.5 hover:bg-slate-50 rounded-lg border border-slate-200 text-slate-500 outline-none cursor-pointer">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Site Layout Photos (1)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {activePump.documents.pumpImages.map((img, idx) => (
                      <div key={idx} className="relative rounded-xl border border-slate-200 p-2 space-y-1.5 text-center bg-slate-50">
                        <div className="h-28 rounded-lg bg-slate-200/50 flex items-center justify-center text-slate-400">
                          <FileImage className="h-8 w-8" />
                        </div>
                        <span className="text-[9.5px] font-bold font-mono text-slate-500 block truncate">{img}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decisions Section */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
                  <button
                    onClick={() => handleDecision(activePump.id, 'approved', `Registration for "${activePump.name}" approved.`)}
                    className="flex-1 py-3 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl cursor-pointer transition-colors outline-none text-center shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
                  >
                    <Check className="h-4.5 w-4.5" />
                    Approve Station
                  </button>
                  <button
                    onClick={() => handleDecision(activePump.id, 'rejected', `Registration rejected.`)}
                    className="w-full sm:w-2/5 py-3 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl cursor-pointer transition-colors outline-none text-center flex items-center justify-center gap-2"
                  >
                    <X className="h-4.5 w-4.5" />
                    Reject Submission
                  </button>
                  <button
                    onClick={() => handleDecision(activePump.id, 'under_review', `Requested documentation reupload.`)}
                    className="w-full sm:w-1/4 py-3 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors outline-none text-center"
                  >
                    Request Re-upload
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center text-xs font-bold text-slate-400">
                Select a station from the queue to run compliance reviews.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
