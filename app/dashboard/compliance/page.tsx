'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText, ShieldCheck, AlertTriangle, Plus, RefreshCw,
  Search, Eye, Trash2, Calendar, FileDown, Settings, AlertOctagon, HelpCircle
} from 'lucide-react';
import { usePumpStore } from '@/stores/pumps.store';
import { complianceService } from '@/services/complianceService';
import { ComplianceDocument, ComplianceStats, DocumentTypeConfig } from '@/types/compliance';
import { StatsCards } from '@/components/compliance/StatsCards';
import { CompliancePieChart } from '@/components/compliance/CompliancePieChart';
import { UploadDocumentModal } from '@/components/compliance/UploadDocumentModal';
import { toast } from '@/components/feedback/Toast';

export default function ComplianceDashboardPage() {
  const router = useRouter();
  const { selectedPump } = usePumpStore();
  const pumpId = selectedPump?.id || null;

  const [stats, setStats] = useState<ComplianceStats>({ total: 0, active: 0, expiringSoon: 0, expired: 0 });
  const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeConfig[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [documentToRenew, setDocumentToRenew] = useState<ComplianceDocument | null>(null);

  const loadData = useCallback(async () => {
    if (!pumpId) return;
    setIsLoading(true);
    try {
      const [s, docs, types] = await Promise.all([
        complianceService.fetchComplianceStats(pumpId),
        complianceService.fetchDocuments(pumpId),
        complianceService.fetchSettings(pumpId),
      ]);
      setStats(s);
      setDocuments(docs);
      setDocumentTypes(types);
    } catch (e: any) {
      toast.error('Failed to load compliance data', e.message);
    } finally {
      setIsLoading(false);
    }
  }, [pumpId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (docId: string, name: string) => {
    if (!pumpId || !confirm(`Are you sure you want to delete "${name}"? This action is permanent.`)) return;
    try {
      await complianceService.deleteDocument(pumpId, docId);
      toast.success('Document Deleted', `"${name}" removed successfully.`);
      loadData();
    } catch (e: any) {
      toast.error('Delete failed', e.message);
    }
  };

  const handleRenewClick = (doc: ComplianceDocument) => {
    setDocumentToRenew(doc);
  };

  const getStatusBadge = (status: ComplianceDocument['status']) => {
    const badges = {
      active: (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
          Active
        </span>
      ),
      expiring_soon: (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-100/50 border border-orange-200 text-orange-700 text-[10px] font-bold animate-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-ping" />
          Expiring Soon
        </span>
      ),
      expired: (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-950/10 border border-orange-950/20 text-orange-900 text-[10px] font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-700" />
          Expired
        </span>
      ),
      pending_upload: (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          Pending File
        </span>
      ),
    };
    return badges[status];
  };

  // Filter documents expiring in less than 30 days
  const expiringSoonDocs = documents.filter(d => d.status === 'expiring_soon' || d.status === 'expired');

  const filteredDocuments = documents
    .filter(
      d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 5); // display only top 5 in dashboard view

  if (!pumpId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <AlertTriangle className="h-10 w-10 mb-3 opacity-30 text-amber-500" />
        <p className="font-bold text-sm">No Pump Selected</p>
        <p className="text-xs mt-1">Please select an operational fuel station to view compliance details.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800">
      {/* 1. Header panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-white border border-slate-100 rounded-2xl shadow-xs gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-orange-50 border border-orange-200/50 rounded-xl flex items-center justify-center text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-text-primary tracking-tight">Compliance & Licenses</h1>
            <p className="text-xs text-text-secondary">Track explosives licensing, weight checks, pollution NOCs, and municipal certificates</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-hover text-xs font-bold text-white rounded-xl transition-all shadow-sm cursor-pointer border-transparent outline-none"
          >
            <Plus className="h-4 w-4" /> Upload Document
          </button>
          <button
            onClick={() => router.push('/dashboard/compliance/documents')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-text-primary rounded-xl transition-all cursor-pointer outline-none"
          >
            <FileText className="h-4 w-4 text-slate-500" /> Browse Library
          </button>
          <button
            onClick={() => router.push('/dashboard/compliance/settings')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-text-primary rounded-xl transition-all cursor-pointer outline-none"
          >
            <Settings className="h-4 w-4 text-slate-500" /> Threshold Rules
          </button>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-text-primary rounded-xl transition-all cursor-pointer outline-none disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <StatsCards stats={stats} isLoading={isLoading} />

      {/* 3. Center panel layout: Pie chart + Critical alert notifications */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Pie breakdown */}
        <div className="lg:col-span-4">
          <CompliancePieChart stats={stats} isLoading={isLoading} />
        </div>

        {/* Expiry alerts cards */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4 text-left min-h-[300px]">
          <h3 className="text-xs font-extrabold text-text-primary uppercase tracking-wider border-b border-slate-50 pb-3">
            Critical Alerts & Expirations
          </h3>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              <div className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
              <div className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
            </div>
          ) : expiringSoonDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <ShieldCheck className="h-9 w-9 mb-2 text-primary opacity-60" />
              <p className="font-bold text-xs">All Documents Compliant</p>
              <p className="text-[10px] mt-0.5">No expired or expiring certificates found on record.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3.5 max-h-[220px] overflow-y-auto pr-1">
              {expiringSoonDocs.map((doc) => {
                const isExpired = doc.status === 'expired';
                return (
                  <div
                    key={doc.id}
                    className={`p-3.5 rounded-2xl border flex gap-3 text-xs leading-relaxed transition-all hover:shadow-xs relative ${
                      isExpired
                        ? 'bg-orange-950/5 border-orange-950/10 text-orange-950'
                        : 'bg-orange-50/50 border-orange-100/50 text-orange-800'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isExpired ? (
                        <AlertOctagon className="h-4.5 w-4.5 text-orange-700 shrink-0" />
                      ) : (
                        <AlertTriangle className="h-4.5 w-4.5 text-orange-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-bold text-slate-900 truncate">{doc.name}</p>
                      <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
                        Expires {new Date(doc.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                      <button
                        onClick={() => handleRenewClick(doc)}
                        className={`mt-2 font-bold px-2.5 py-1 rounded-lg text-[9px] uppercase tracking-wider transition-all cursor-pointer ${
                          isExpired
                            ? 'bg-orange-600 text-white hover:bg-orange-700'
                            : 'bg-primary text-white hover:bg-primary-hover'
                        }`}
                      >
                        Renew Document
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 4. Documents Preview Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-left flex flex-col gap-4 p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Certificates</h3>
            <p className="text-[10px] text-slate-400">Quick view of compliance register</p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-all bg-slate-50/50"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center text-xs text-slate-400 font-semibold gap-2 items-center">
            <RefreshCw className="h-4 w-4 animate-spin text-primary" /> Loading documents...
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
            <FileText className="h-10 w-10 mb-2 opacity-20" />
            <p className="font-bold text-sm">No Documents Found</p>
            <p className="text-xs mt-0.5">Try searching for a different name or upload a new certificate.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Document / Category</th>
                  <th className="p-4">Certificate Number</th>
                  <th className="p-4">Authority</th>
                  <th className="p-4">Validity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-900">{doc.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{doc.type}</p>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-600">{doc.certificateNumber}</td>
                    <td className="p-4 text-slate-500">{doc.issuingAuthority}</td>
                    <td className="p-4">
                      <div>
                        <p className="text-slate-600 font-bold">
                          Exp: {new Date(doc.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Issued: {new Date(doc.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">{getStatusBadge(doc.status)}</td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {doc.fileUrl ? (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-orange-50 text-slate-400 hover:text-primary rounded-lg transition-colors cursor-pointer"
                            title="View File"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                        ) : (
                          <button
                            disabled
                            className="p-1.5 text-slate-200 rounded-lg cursor-not-allowed"
                            title="No file uploaded"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleRenewClick(doc)}
                          className="p-1.5 hover:bg-orange-50 text-slate-400 hover:text-primary rounded-lg transition-colors cursor-pointer"
                          title="Renew Certificate"
                        >
                          <Calendar className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.name)}
                          className="p-1.5 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            onClick={() => router.push('/dashboard/compliance/documents')}
            className="text-[11px] font-bold text-primary hover:text-primary-hover flex items-center gap-1 cursor-pointer"
          >
            View All Documents Library &rarr;
          </button>
        </div>
      </div>

      {/* Upload/Renew Document Modal */}
      <UploadDocumentModal
        isOpen={isUploadOpen || !!documentToRenew}
        onClose={() => {
          setIsUploadOpen(false);
          setDocumentToRenew(null);
        }}
        onSuccess={loadData}
        pumpId={pumpId}
        documentTypes={documentTypes}
        documentToRenew={documentToRenew}
      />
    </div>
  );
}
