'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Check, X, RefreshCw, MessageSquare } from 'lucide-react';
import { toast } from '@/components/feedback/Toast';
import backendApi from '@/lib/backendApi';

interface PendingPump {
  id: string;
  pump_name: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  submitted_date: string;
  status: string;
  address: string | null;
  city: string | null;
}

export default function AdminPendingApprovalsPage() {
  const [pumps, setPumps] = useState<PendingPump[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [showInfoReq, setShowInfoReq] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPending = async () => {
    setIsLoading(true);
    try {
      const res = await backendApi.get('/admin/pending-registrations');
      const data = res.data.data?.registrations || [];
      setPumps(data);
      if (data.length > 0) setSelectedId(data[0].id);
    } catch {
      toast.error('Failed to load pending registrations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const activePump = pumps.find((p) => p.id === selectedId) || null;

  const handleApprove = async () => {
    if (!activePump) return;
    setActionLoading(true);
    try {
      await backendApi.post(`/admin/registrations/${activePump.id}/approve`);
      toast.success(`"${activePump.pump_name}" approved and activated.`);
      await fetchPending();
    } catch (e: any) {
      toast.error(e.message || 'Failed to approve.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!activePump || !rejectReason.trim()) {
      toast.error('Please enter a rejection reason.');
      return;
    }
    setActionLoading(true);
    try {
      await backendApi.post(`/admin/registrations/${activePump.id}/reject`, { reason: rejectReason });
      toast.success('Registration rejected.');
      setShowReject(false);
      setRejectReason('');
      await fetchPending();
    } catch (e: any) {
      toast.error(e.message || 'Failed to reject.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!activePump || !infoMessage.trim()) {
      toast.error('Please enter a message.');
      return;
    }
    setActionLoading(true);
    try {
      await backendApi.post(`/admin/registrations/${activePump.id}/request-info`, { message: infoMessage });
      toast.success('Information request sent to owner.');
      setShowInfoReq(false);
      setInfoMessage('');
    } catch (e: any) {
      toast.error(e.message || 'Failed to send.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      pending: 'bg-amber-50 text-amber-600 border-amber-100',
      under_review: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      rejected: 'bg-rose-50 text-rose-600 border-rose-100',
    };
    return (
      <span className={`text-[9px] font-extrabold px-2.5 py-0.5 border rounded-full uppercase ${map[status] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Pump Registration Approvals
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Verify documents and activate stations into the FuelFlux grid.
          </p>
        </div>
        <button
          onClick={fetchPending}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors outline-none cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-xs font-bold text-slate-400">
          Loading pending registrations...
        </div>
      )}

      {/* Empty */}
      {!isLoading && pumps.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-3">
          <Check className="h-10 w-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-extrabold text-slate-800">Verification Queue Empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            All pump registrations have been audited. No pending checks remaining.
          </p>
        </div>
      )}

      {/* Main Grid */}
      {!isLoading && pumps.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left: Queue List */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Awaiting Audit ({pumps.length})
            </div>
            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
              {pumps.map((pump) => (
                <button
                  key={pump.id}
                  onClick={() => { setSelectedId(pump.id); setShowReject(false); setShowInfoReq(false); }}
                  className={`w-full p-4 text-left hover:bg-slate-50 transition-colors flex justify-between items-start outline-none cursor-pointer ${selectedId === pump.id ? 'bg-orange-50/40 border-l-4 border-l-orange-500' : ''
                    }`}
                >
                  <div className="space-y-1.5 truncate pr-2">
                    <span className="text-xs font-extrabold text-slate-800 block truncate">{pump.pump_name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold block">{pump.city || 'N/A'}</span>
                    <span className="text-[10px] text-slate-500 block truncate">By {pump.owner_name}</span>
                  </div>
                  {getStatusBadge(pump.status)}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Detail Panel */}
          <div className="lg:col-span-8">
            {activePump ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">

                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-5">
                  <div className="space-y-1.5">
                    <div className="flex gap-2.5 items-center flex-wrap">
                      <h2 className="text-base font-extrabold text-slate-900">{activePump.pump_name}</h2>
                      {getStatusBadge(activePump.status)}
                    </div>
                    <p className="text-xs font-semibold text-slate-500">
                      {[activePump.address, activePump.city].filter(Boolean).join(', ') || 'Address not provided'}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold shrink-0">
                    Submitted: {activePump.submitted_date
                      ? new Date(activePump.submitted_date).toLocaleDateString('en-IN')
                      : 'N/A'}
                  </span>
                </div>

                {/* Owner Info Grid */}
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Owner Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border border-slate-200/50 p-4 rounded-xl">
                    {[
                      { label: 'PUMP OWNER', value: activePump.owner_name, bold: true },
                      { label: 'EMAIL', value: activePump.owner_email },
                      { label: 'PHONE', value: activePump.owner_phone || 'N/A', mono: true },
                      { label: 'PUMP ID', value: `#${activePump.id}`, mono: true },
                    ].map(({ label, value, bold, mono }) => (
                      <div key={label} className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold block">{label}</span>
                        <span className={`text-xs text-slate-800 block ${bold ? 'font-extrabold' : 'font-semibold'} ${mono ? 'font-mono' : ''}`}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documents placeholder */}
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Verification Documents</h3>
                  <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400 font-semibold space-y-1">
                    <FileText className="h-6 w-6 mx-auto text-slate-300" />
                    <p>Document storage integration — connect when file upload is ready.</p>
                  </div>
                </div>

                {/* Reject Modal Inline */}
                {showReject && (
                  <div className="space-y-3 p-4 bg-rose-50/50 border border-rose-100 rounded-xl">
                    <h3 className="text-xs font-extrabold text-rose-700 uppercase tracking-wider">Rejection Reason (Required)</h3>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="e.g. GST certificate expired, license number mismatch..."
                      rows={3}
                      className="w-full text-xs font-semibold text-slate-700 bg-white border border-rose-200 rounded-xl px-4 py-3 outline-none focus:border-rose-400 resize-none placeholder:text-slate-300"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleReject}
                        disabled={actionLoading || !rejectReason.trim()}
                        className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl cursor-pointer transition-colors outline-none disabled:opacity-50"
                      >
                        {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                      </button>
                      <button
                        onClick={() => { setShowReject(false); setRejectReason(''); }}
                        className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl cursor-pointer outline-none"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Request Info Modal Inline */}
                {showInfoReq && (
                  <div className="space-y-3 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                    <h3 className="text-xs font-extrabold text-blue-700 uppercase tracking-wider">Message to Owner</h3>
                    <textarea
                      value={infoMessage}
                      onChange={(e) => setInfoMessage(e.target.value)}
                      placeholder="e.g. Please reupload your fuel license — uploaded copy is blurred..."
                      rows={3}
                      className="w-full text-xs font-semibold text-slate-700 bg-white border border-blue-200 rounded-xl px-4 py-3 outline-none focus:border-blue-400 resize-none placeholder:text-slate-300"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleRequestInfo}
                        disabled={actionLoading || !infoMessage.trim()}
                        className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-xl cursor-pointer transition-colors outline-none disabled:opacity-50"
                      >
                        {actionLoading ? 'Sending...' : 'Send Request'}
                      </button>
                      <button
                        onClick={() => { setShowInfoReq(false); setInfoMessage(''); }}
                        className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl cursor-pointer outline-none"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {!showReject && !showInfoReq && (
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading || activePump.status === 'active'}
                      className="flex-1 py-3 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl cursor-pointer transition-colors outline-none shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="h-4 w-4" />
                      {actionLoading ? 'Processing...' : 'Approve Station'}
                    </button>
                    <button
                      onClick={() => { setShowReject(true); setShowInfoReq(false); }}
                      disabled={actionLoading}
                      className="w-full sm:w-2/5 py-3 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl cursor-pointer transition-colors outline-none flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => { setShowInfoReq(true); setShowReject(false); }}
                      disabled={actionLoading}
                      className="w-full sm:w-1/3 py-3 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors outline-none flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Request Info
                    </button>
                  </div>
                )}
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