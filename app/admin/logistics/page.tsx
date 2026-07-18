'use client';

import React, { useEffect, useState } from 'react';
import {
  Truck,
  Mail,
  Phone,
  RefreshCw,
  Check,
  X,
  Clock,
  AlertTriangle,
  Building,
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  User,
  ShieldAlert,
} from 'lucide-react';
import { toast } from '@/components/feedback/Toast';
import backendApi from '@/lib/backendApi';

interface LogisticsPartner {
  id: string;
  name: string;
  email: string;
  phone: string;
  company_name: string;
  gstin: string;
  fleet_size: number | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_notes: string | null;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string | null;
  kyc_documents?: {
    doc_type: string;
    file_url: string;
    original_name: string;
    uploaded_at: string;
  }[];
}

interface Counts {
  pending: number;
  verified: number;
  rejected: number;
}

export default function AdminLogisticsPage() {
  const [partners, setPartners] = useState<LogisticsPartner[]>([]);
  const [counts, setCounts] = useState<Counts>({ pending: 0, verified: 0, rejected: 0 });
  const [activeTab, setActiveTab] = useState<'pending' | 'verified' | 'rejected'>('pending');
  const [isLoading, setLoading] = useState(false);
  const [rejectingPartner, setRejectingPartner] = useState<LogisticsPartner | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmittingAction, setSubmittingAction] = useState(false);

  const fetchLogistics = async (status: string) => {
    setLoading(true);
    try {
      const res = await backendApi.get(`/admin/logistics?status=${status}`);
      if (res.data.success) {
        setPartners(res.data.data?.logistics || []);
        setCounts(res.data.data?.counts || { pending: 0, verified: 0, rejected: 0 });
      }
    } catch {
      toast.error('Failed to load logistics partners.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogistics(activeTab);
  }, [activeTab]);

  const handleApprove = async (partnerId: string, name: string) => {
    if (isSubmittingAction) return;
    setSubmittingAction(true);
    try {
      const res = await backendApi.post(`/admin/logistics/${partnerId}/approve`);
      if (res.data.success) {
        toast.success(`Approved!`, `Logistic partner "${name}" has been verified.`);
        fetchLogistics(activeTab);
      }
    } catch (err: any) {
      toast.error('Approval failed', err?.response?.data?.detail || 'Something went wrong.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingPartner || !rejectReason.trim() || isSubmittingAction) return;
    setSubmittingAction(true);
    try {
      const res = await backendApi.post(`/admin/logistics/${rejectingPartner.id}/reject`, {
        reason: rejectReason.trim(),
      });
      if (res.data.success) {
        toast.success(`Rejected!`, `Logistic partner "${rejectingPartner.name}" has been rejected.`);
        setRejectingPartner(null);
        setRejectReason('');
        fetchLogistics(activeTab);
      }
    } catch (err: any) {
      toast.error('Rejection failed', err?.response?.data?.detail || 'Something went wrong.');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Logistics Partner Verification</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Approve or reject logistics fleet companies to grant portal access.</p>
        </div>
        <button
          onClick={() => fetchLogistics(activeTab)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-600 outline-none cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Tabs / Badges */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
        {(['pending', 'verified', 'rejected'] as const).map((tab) => {
          const isActive = activeTab === tab;
          const count = counts[tab] || 0;
          const labels = {
            pending: 'Pending Verification',
            verified: 'Verified Partners',
            rejected: 'Rejected List',
          };
          const colors = {
            pending: isActive ? 'text-amber-500 border-amber-500' : 'text-slate-400 hover:text-slate-600',
            verified: isActive ? 'text-emerald-500 border-emerald-500' : 'text-slate-400 hover:text-slate-600',
            rejected: isActive ? 'text-rose-500 border-rose-500' : 'text-slate-400 hover:text-slate-600',
          };
          const badgeColors = {
            pending: 'bg-amber-50 text-amber-600 border-amber-100',
            verified: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            rejected: 'bg-rose-50 text-rose-600 border-rose-100',
          };

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 pb-3 border-b-2 capitalize transition-all cursor-pointer ${colors[tab]}`}
            >
              {labels[tab]}
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${badgeColors[tab]}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cards List or Table */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl flex items-center justify-center py-20 text-slate-400 gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-orange-500" />
            <span className="text-sm font-semibold">Loading fleet partners...</span>
          </div>
        ) : partners.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
              <Truck className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-sm font-bold">No partners found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                {/* Partner Details */}
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-3 items-center">
                      <div className="h-10 w-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shrink-0 shadow-sm">
                        <Building className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                          {partner.company_name || 'N/A'}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                          Owner: {partner.name || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    {partner.verification_status === 'verified' && (
                      <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md uppercase">
                        <CheckCircle className="h-3 w-3" /> Verified
                      </span>
                    )}
                    {partner.verification_status === 'rejected' && (
                      <span className="flex items-center gap-1 text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md uppercase">
                        <XCircle className="h-3 w-3" /> Rejected
                      </span>
                    )}
                    {partner.verification_status === 'pending' && (
                      <span className="flex items-center gap-1 text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md uppercase animate-pulse">
                        <Clock className="h-3 w-3" /> Pending
                      </span>
                    )}
                  </div>

                  {/* Metadata fields */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50/50 border border-slate-100 rounded-xl p-3 text-xs font-semibold text-slate-600">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase block tracking-wider">GSTIN Number</span>
                      <span className="font-mono text-slate-800">{partner.gstin || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase block tracking-wider">Fleet Size</span>
                      <span className="text-slate-800">
                        {partner.fleet_size !== null ? `${partner.fleet_size} Trucks` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Uploaded KYC Documents */}
                  {partner.kyc_documents && partner.kyc_documents.length > 0 && (
                    <div className="border border-orange-100 bg-orange-50/15 rounded-xl p-3 space-y-2">
                      <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">
                        Uploaded KYC Documents ({partner.kyc_documents.length})
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {partner.kyc_documents.map((doc) => {
                          const docLabel = doc.doc_type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
                          return (
                            <a
                              key={doc.doc_type}
                              href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://127.0.0.1:8000'}${doc.file_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 p-1.5 bg-white border border-slate-200 hover:border-orange-300 hover:bg-orange-50/20 rounded-lg text-[10px] font-bold text-slate-700 hover:text-orange-500 transition-colors"
                            >
                              <FileText className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                              <span className="truncate">{docLabel}</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}


                  {/* Contacts */}
                  <div className="space-y-1.5 text-xs text-slate-500 font-semibold border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{partner.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{partner.phone ? `+91 ${partner.phone}` : '—'}</span>
                    </div>
                    {partner.created_at && (
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <Calendar className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                        <span>Registered on {new Date(partner.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                    )}
                  </div>

                  {/* Rejection Notes */}
                  {partner.verification_status === 'rejected' && partner.verification_notes && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs">
                      <span className="text-[9px] font-black text-rose-500 uppercase block mb-0.5 tracking-wider">Rejection Reason</span>
                      <p className="text-rose-700 italic font-medium">"{partner.verification_notes}"</p>
                    </div>
                  )}

                  {/* Verification metadata */}
                  {partner.verification_status !== 'pending' && partner.verified_at && (
                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex justify-between border-t border-slate-100/60 pt-2">
                      <span>Verified at: {new Date(partner.verified_at).toLocaleDateString('en-IN')}</span>
                      <span>By: {partner.verified_by || 'Admin'}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {partner.verification_status === 'pending' && (
                  <div className="flex gap-2 border-t border-slate-100 pt-3 mt-1">
                    <button
                      onClick={() => handleApprove(partner.id, partner.company_name || partner.name)}
                      disabled={isSubmittingAction}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-xs font-bold hover:shadow-md hover:shadow-emerald-500/10 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" /> Approve Partner
                    </button>
                    <button
                      onClick={() => setRejectingPartner(partner)}
                      disabled={isSubmittingAction}
                      className="px-4 py-2.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <X className="h-4 w-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-md shadow-2xl p-6 relative z-10 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Reject Application</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{rejectingPartner.company_name}</p>
                </div>
              </div>
              <button
                onClick={() => setRejectingPartner(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  Rejection Reason *
                </label>
                <textarea
                  placeholder="Explain why this logistics partner is being rejected (e.g. Invalid GSTIN registration, Fleet documents mismatch)."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-rose-500 h-24 resize-none transition-all"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setRejectingPartner(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAction || !rejectReason.trim()}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/10 cursor-pointer disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}