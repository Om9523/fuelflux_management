'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText, ShieldCheck, AlertTriangle, Plus, RefreshCw,
  Search, Eye, Trash2, Calendar, FileDown, ArrowUpDown, ChevronLeft
} from 'lucide-react';
import { usePumpStore } from '@/stores/pumps.store';
import { complianceService } from '@/services/complianceService';
import { ComplianceDocument, DocumentTypeConfig } from '@/types/compliance';
import { UploadDocumentModal } from '@/components/compliance/UploadDocumentModal';
import { toast } from '@/components/feedback/Toast';

export default function DocumentsLibraryPage() {
  const router = useRouter();
  const { selectedPump } = usePumpStore();
  const pumpId = selectedPump?.id || null;

  const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'expiry_asc' | 'expiry_desc'>('expiry_asc');

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [documentToRenew, setDocumentToRenew] = useState<ComplianceDocument | null>(null);

  const loadData = useCallback(async () => {
    if (!pumpId) return;
    setIsLoading(true);
    try {
      const [docs, types] = await Promise.all([
        complianceService.fetchDocuments(pumpId, {
          search: search,
          status: statusFilter,
          type: typeFilter,
        }),
        complianceService.fetchSettings(pumpId),
      ]);
      setDocuments(docs);
      setDocumentTypes(types);
    } catch (e: any) {
      toast.error('Failed to load documents library', e.message);
    } finally {
      setIsLoading(false);
    }
  }, [pumpId, search, statusFilter, typeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (docId: string, name: string) => {
    if (!pumpId || !confirm(`Delete "${name}" permanently?`)) return;
    try {
      await complianceService.deleteDocument(pumpId, docId);
      toast.success('Document Deleted', `"${name}" removed successfully.`);
      loadData();
    } catch (e: any) {
      toast.error('Delete failed', e.message);
    }
  };

  const getStatusBadge = (status: ComplianceDocument['status']) => {
    const badges = {
      active: (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-bold">
          Active
        </span>
      ),
      expiring_soon: (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-orange-100/50 border border-orange-200 text-orange-600 text-[10px] font-bold animate-pulse">
          Expiring Soon
        </span>
      ),
      expired: (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-orange-950/10 border border-orange-950/20 text-orange-900 text-[10px] font-bold">
          Expired
        </span>
      ),
      pending_upload: (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-bold">
          Pending Upload
        </span>
      ),
    };
    return badges[status];
  };

  // Sort documents client-side
  const sortedDocuments = [...documents].sort((a, b) => {
    if (a.status === 'pending_upload') return 1;
    if (b.status === 'pending_upload') return -1;
    const dateA = new Date(a.expiryDate).getTime();
    const dateB = new Date(b.expiryDate).getTime();
    return sortBy === 'expiry_asc' ? dateA - dateB : dateB - dateA;
  });

  if (!pumpId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <AlertTriangle className="h-10 w-10 mb-3 opacity-30 text-amber-500" />
        <p className="font-bold text-sm">No Pump Selected</p>
        <p className="text-xs mt-1">Please select an operational fuel station to view documents.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-white border border-slate-100 rounded-2xl shadow-xs gap-4 text-left">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/compliance')}
            className="p-1.5 hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl cursor-pointer transition-colors outline-none"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-orange-50 border border-orange-200/50 rounded-xl flex items-center justify-center text-primary">
              <FileText className="h-4.5 w-4.5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-text-primary tracking-tight">Documents Library</h1>
              <p className="text-xs text-text-secondary">Search, sort, filter, and renew all compliance certificates</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer border-transparent outline-none transition-all"
          >
            <Plus className="h-4 w-4" /> Add Document
          </button>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-text-primary rounded-xl cursor-pointer transition-all outline-none"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-left flex flex-col gap-4">
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Search & Filters</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3.5">
          {/* Search text */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, category, number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-all bg-slate-50/50"
            />
          </div>

          {/* Status filter */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs font-bold border border-slate-200 rounded-xl outline-none bg-white cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="expired">Expired</option>
              <option value="pending_upload">Pending File</option>
            </select>
          </div>

          {/* Type filter */}
          <div className="md:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs font-bold border border-slate-200 rounded-xl outline-none bg-white cursor-pointer"
            >
              <option value="all">All Document Types</option>
              {documentTypes.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort trigger */}
          <div className="md:col-span-2">
            <button
              onClick={() => setSortBy(prev => prev === 'expiry_asc' ? 'expiry_desc' : 'expiry_asc')}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer bg-white"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
              <span>{sortBy === 'expiry_asc' ? 'Expiry (Asc)' : 'Expiry (Desc)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main documents table list */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-left flex flex-col">
        {isLoading ? (
          <div className="py-24 flex justify-center text-xs text-slate-400 font-semibold gap-2 items-center">
            <RefreshCw className="h-4 w-4 animate-spin text-primary" /> Loading documents registry...
          </div>
        ) : sortedDocuments.length === 0 ? (
          <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-1.5">
            <FileText className="h-12 w-12 mb-1 opacity-20" />
            <p className="font-bold text-sm">No Documents Found</p>
            <p className="text-xs">Adjust your search query or filters to browse the registry.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Document / Category</th>
                  <th className="p-4">Certificate Number</th>
                  <th className="p-4">Authority</th>
                  <th className="p-4">Issue Date</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-semibold text-slate-600">
                {sortedDocuments.map((doc) => {
                  const isExpired = doc.status === 'expired';
                  const isExpiring = doc.status === 'expiring_soon';
                  return (
                    <tr
                      key={doc.id}
                      className={`hover:bg-slate-50/40 transition-colors ${
                        isExpired ? 'bg-orange-950/5' : isExpiring ? 'bg-orange-50/30' : ''
                      }`}
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-bold text-slate-900">{doc.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{doc.type}</p>
                        </div>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-700">{doc.certificateNumber}</td>
                      <td className="p-4 text-slate-500">{doc.issuingAuthority}</td>
                      <td className="p-4 text-slate-500">
                        {new Date(doc.issueDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="p-4">
                        {doc.expiryDate ? (
                          <span
                            className={`font-bold ${
                              isExpired ? 'text-rose-600' : isExpiring ? 'text-amber-600' : 'text-slate-700'
                            }`}
                          >
                            {new Date(doc.expiryDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
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
                              title="View Document File"
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
                            onClick={() => setDocumentToRenew(doc)}
                            className="p-1.5 hover:bg-orange-50 text-slate-400 hover:text-primary rounded-lg transition-colors cursor-pointer"
                            title="Renew Certificate"
                          >
                            <Calendar className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id, doc.name)}
                            className="p-1.5 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg cursor-pointer transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload/Renew Modal */}
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
