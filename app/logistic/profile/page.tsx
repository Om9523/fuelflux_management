'use client';

import React, { useEffect, useState } from 'react';
import {
  Building,
  ShieldCheck,
  FileText,
  Save,
  CheckCircle2,
  Key,
  ShieldAlert,
  XCircle,
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import { useFleetStore } from '@/stores/fleet.store';
import { logisticService, BackendProfile, KycDocument } from '@/services/logistic.service';
import { toast } from '@/components/feedback/Toast';
import { FileUpload } from '@/components/ui/FileUpload';

export default function ProfilePage() {
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // KYC and Verification States
  const [documents, setDocuments] = useState<KycDocument[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');
  const [verificationNotes, setVerificationNotes] = useState<string>('');

  // Policy Settings
  const [pinRequired, setPinRequired] = useState(true);
  const [restrictNightFill, setRestrictNightFill] = useState(false);
  const [allowCng, setAllowCng] = useState(true);

  // Load corporate profile from backend on mount
  const fetchProfile = async () => {
    try {
      const data = await logisticService.getProfile();
      if (data) {
        setCompanyName(data.company_name || '');
        setGstin(data.gstin || '');
        setBillingAddress(data.billing_address || '');
        setDocuments(data.kyc_documents || []);
        setVerificationStatus(data.verification_status || 'pending');
        setVerificationNotes(data.verification_notes || '');
      }
    } catch (err) {
      toast.error('Failed to load corporate profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);


  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !gstin || !billingAddress) {
      toast.error('Please fill in all company information.');
      return;
    }

    setSaving(true);
    try {
      await logisticService.updateProfile({
        company_name: companyName,
        gstin,
        billing_address: billingAddress,
      });
      toast.success('Corporate configuration saved successfully.');
      setSaving(false);
    } catch (_err) {
      toast.error('Failed to update company profile.');
      setSaving(false);
    }
  };

  const handleDocUpload = async (docType: string, file: File) => {
    try {
      const res = await logisticService.uploadDocument(docType, file);
      if (res.success) {
        toast.success(`Uploaded ${docType.replace(/_/g, ' ').toUpperCase()} successfully.`);
        const updatedProfile = await logisticService.getProfile();
        if (updatedProfile) {
          setDocuments(updatedProfile.kyc_documents || []);
          setVerificationStatus(updatedProfile.verification_status || 'pending');
          setVerificationNotes(updatedProfile.verification_notes || '');
        }
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.detail || 'Failed to upload document.';
      toast.error(errMsg);
      throw new Error(errMsg);
    }
  };

  const handleDocRemove = async (docType: string) => {
    try {
      const res = await logisticService.deleteDocument(docType);
      if (res.success) {
        toast.success(`Removed document successfully.`);
        const updatedProfile = await logisticService.getProfile();
        if (updatedProfile) {
          setDocuments(updatedProfile.kyc_documents || []);
          setVerificationStatus(updatedProfile.verification_status || 'pending');
          setVerificationNotes(updatedProfile.verification_notes || '');
        }
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.detail || 'Failed to remove document.';
      toast.error(errMsg);
      throw new Error(errMsg);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Company Settings
          </h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">
            Configure billing profiles, GST parameters, and dispenser authorization policies
          </p>
        </div>
      </div>

      {/* Verification Status Banner */}
      {verificationStatus === 'pending' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 shadow-sm">
          <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide">Awaiting KYC Verification Approval</h4>
            <p className="text-[11px] text-amber-700 font-semibold mt-1 leading-relaxed">
              Your profile is currently under review by our administration team. You can still manage your vehicles and configurations, but you will not be able to generate fuel vouchers until approved.
            </p>
          </div>
        </div>
      )}
      {verificationStatus === 'rejected' && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-start gap-3 shadow-sm">
          <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-black text-rose-900 uppercase tracking-wide">KYC Verification Rejected</h4>
            {verificationNotes && (
              <p className="text-[11px] text-rose-700 font-bold mt-1">
                Reason: &ldquo;{verificationNotes}&rdquo;
              </p>
            )}
            <p className="text-[11px] text-rose-600 font-semibold mt-1 leading-relaxed">
              Please check your uploaded documents below, replace any incorrect or expired files, and click save to re-submit for approval.
            </p>
          </div>
        </div>
      )}
      {verificationStatus === 'verified' && (
        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex items-start gap-3 shadow-sm">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wide">KYC Verified & Approved</h4>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1 leading-relaxed">
              Your account has been fully verified. You can now purchase/request fuel vouchers, link bank accounts, and process transactions.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Settings Form (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleUpdateProfileSubmit} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Corporate Billing Profile</h3>
              <span className="text-[10px] font-black bg-orange-50 text-orange-600 border border-orange-100/50 px-2 py-0.5 rounded-md uppercase">
                GST Registered
              </span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Registered Company Name *</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Corporate GSTIN Number *</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Registered Billing Address *</label>
                <textarea
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-orange-500 h-24 resize-none"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/10 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Company Details'}
              </button>
            </div>
          </form>

          {/* KYC Verification Documents */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">KYC Verification Documents</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Required to activate fuel voucher requests
                </p>
              </div>
              <span className={`text-[9px] font-black border px-2 py-0.5 rounded-md uppercase ${
                verificationStatus === 'verified'
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50'
                  : verificationStatus === 'rejected'
                  ? 'bg-rose-50 text-rose-600 border-rose-100/50'
                  : 'bg-amber-50 text-amber-600 border-amber-100/50'
              }`}>
                {verificationStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* GSTIN Certificate */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">GSTIN Certificate *</label>
                <FileUpload
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onUpload={(file) => handleDocUpload('gstin_certificate', file)}
                  onRemove={() => handleDocRemove('gstin_certificate')}
                  currentFile={
                    (() => {
                      const doc = documents.find((d) => d.doc_type === 'gstin_certificate');
                      return doc ? { name: doc.original_name, url: doc.file_url, uploadedAt: doc.uploaded_at } : null;
                    })()
                  }
                  label="Upload GSTIN PDF/Image"
                  compact
                />
              </div>

              {/* PAN Card */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Company PAN Card *</label>
                <FileUpload
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onUpload={(file) => handleDocUpload('pan_card', file)}
                  onRemove={() => handleDocRemove('pan_card')}
                  currentFile={
                    (() => {
                      const doc = documents.find((d) => d.doc_type === 'pan_card');
                      return doc ? { name: doc.original_name, url: doc.file_url, uploadedAt: doc.uploaded_at } : null;
                    })()
                  }
                  label="Upload PAN PDF/Image"
                  compact
                />
              </div>

              {/* Company Registration */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Company Registration Certificate *</label>
                <FileUpload
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onUpload={(file) => handleDocUpload('company_registration', file)}
                  onRemove={() => handleDocRemove('company_registration')}
                  currentFile={
                    (() => {
                      const doc = documents.find((d) => d.doc_type === 'company_registration');
                      return doc ? { name: doc.original_name, url: doc.file_url, uploadedAt: doc.uploaded_at } : null;
                    })()
                  }
                  label="Upload Registration PDF/Image"
                  compact
                />
              </div>

              {/* Transport License */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Transport License / Permit *</label>
                <FileUpload
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onUpload={(file) => handleDocUpload('transport_license', file)}
                  onRemove={() => handleDocRemove('transport_license')}
                  currentFile={
                    (() => {
                      const doc = documents.find((d) => d.doc_type === 'transport_license');
                      return doc ? { name: doc.original_name, url: doc.file_url, uploadedAt: doc.uploaded_at } : null;
                    })()
                  }
                  label="Upload License PDF/Image"
                  compact
                />
              </div>
            </div>
          </div>

          {/* Refueling Authorization Policy */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Refueling Authorization Policy</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Require Driver OTP PIN Verification</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Dispenser locks until driver enters SMS OTP PIN code at pump terminal.</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pinRequired}
                    onChange={(e) => setPinRequired(e.target.checked)}
                    className="sr-only peer"
                    id="pinVerificationToggle"
                  />
                  <label
                    htmlFor="pinVerificationToggle"
                    className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Restrict Night Fueling</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Refuse dispenser releases between 10:00 PM and 6:00 AM.</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={restrictNightFill}
                    onChange={(e) => setRestrictNightFill(e.target.checked)}
                    className="sr-only peer"
                    id="restrictNightToggle"
                  />
                  <label
                    htmlFor="restrictNightToggle"
                    className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Allow CNG fueling limits</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Enables vehicles registered for CNG to request vouchers or credit.</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowCng}
                    onChange={(e) => setAllowCng(e.target.checked)}
                    className="sr-only peer"
                    id="allowCngToggle"
                  />
                  <label
                    htmlFor="allowCngToggle"
                    className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Account Credentials (1/3 width) */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Security Keys</h3>
            
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2.5 text-xs">
                <Key className="h-4.5 w-4.5 text-slate-400" />
                <div>
                  <p className="font-bold text-slate-700">API Access Token</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Token: ff_sec_key_44322</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 border-t border-slate-200/60 pt-3">
                <span>Created 2026-05-01</span>
                <button className="text-orange-500 hover:underline cursor-pointer">Rotate Key</button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Operational Compliance</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-xs">
                <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800">GSTIN Audited</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">GST filings and input tax credit accounts successfully matched.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-slate-100 pt-3 text-xs">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800">KYC Compliant</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Logistics carrier business license verified under Central motor authority rules.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
