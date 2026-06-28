'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, Users, Car, FileText, Receipt, TrendingUp,
    ShieldCheck, ShieldX, Shield, Plus, X, Loader2,
    CheckCircle, AlertTriangle, ChevronRight, Trash2,
    Building2, User, RefreshCw, AlertCircle, Edit2,
    IndianRupee, Fuel, Hash, Clock, Calendar, Zap,
} from 'lucide-react';
import { toast } from '@/components/feedback/Toast';
import { usePumpStore } from '@/stores/pumps.store';
import {
    fetchCustomerDetail, uploadKYC, verifyKYC,
    issueContract, amendContract, generateInvoice, markInvoicePaid,
    SingleCustomerView, UdhaarContract, UdhaarInvoice,
    BillingFrequency, BillingCycle, BillBy,
} from '@/services/udhaar.service';
import ContractWizardSplitScreen from '../components/ContractWizardSplitScreen';
import { fetchPumpProfile, PumpProfile } from '@/services/settings.service';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
    return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(s: string) {
    return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtDateTime(s: string) {
    return new Date(s).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
}

function KYCBadge({ status }: { status: string }) {
    if (status === 'accepted') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold"><ShieldCheck className="h-3 w-3" /> Verified</span>;
    if (status === 'rejected') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-50 border border-red-100 text-red-500 text-[10px] font-bold"><ShieldX className="h-3 w-3" /> Rejected</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-500 text-[10px] font-bold"><Shield className="h-3 w-3" /> Pending</span>;
}

function InvoiceStatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        paid: 'bg-emerald-50 border-emerald-100 text-emerald-600',
        unpaid: 'bg-amber-50 border-amber-100 text-amber-600',
        overdue: 'bg-red-50 border-red-100 text-red-600',
        disputed: 'bg-violet-50 border-violet-100 text-violet-600',
    };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-lg border text-[10px] font-bold capitalize ${map[status] || 'bg-slate-50 border-slate-100 text-slate-400'}`}>{status}</span>;
}

// ─── Credit Usage Bar ─────────────────────────────────────────────────────────

function CreditUsageBar({ contract, usage }: { contract: UdhaarContract; usage: any }) {
    const pct = Math.min(100, usage?.usage_percent || 0);
    const alert = usage?.alert;
    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Credit Utilisation</p>
                <span className={`text-xs font-black ${pct >= 90 ? 'text-red-500' : pct >= 70 ? 'text-amber-500' : 'text-emerald-600'}`}>
                    {pct.toFixed(1)}%
                </span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>Used: <span className="font-bold text-slate-800">{fmt(usage?.current_spend || 0)}</span></span>
                <span>Limit: <span className="font-bold text-slate-800">{fmt(contract.total_credit_limit)}</span></span>
            </div>
            {alert && (
                <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-xs font-bold text-red-600">
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                    Credit limit almost reached — review or amend contract
                </div>
            )}
        </div>
    );
}

// ─── KYC Upload Modal ─────────────────────────────────────────────────────────

function KYCModal({ pumpId, customerId, onClose, onSuccess }: {
    pumpId: string; customerId: string; onClose: () => void; onSuccess: () => void;
}) {
    const [docType, setDocType] = useState('aadhaar');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const DOC_TYPES = ['aadhaar', 'pan', 'gst', 'driving_license', 'passport', 'voter_id'];

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await uploadKYC(pumpId, customerId, { document_type: docType, image_url: imageUrl || undefined });
            toast.success('KYC Uploaded', 'Document submitted for verification');
            onSuccess(); onClose();
        } catch (e: any) {
            toast.error('Failed', e?.response?.data?.detail || 'Upload failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100">
                <button onClick={onClose} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 cursor-pointer transition-colors"><X className="h-4 w-4" /></button>
                <div className="flex items-center gap-2.5 mb-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
                        <Shield className="h-4 w-4" />
                    </div>
                    <h2 className="text-base font-extrabold text-slate-900">Upload KYC Document</h2>
                </div>
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Document Type</label>
                        <select value={docType} onChange={e => setDocType(e.target.value)}
                            className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl outline-none bg-white cursor-pointer capitalize">
                            {DOC_TYPES.map(d => <option key={d} value={d} className="capitalize">{d.replace('_', ' ')}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Document Image URL</label>
                        <input value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                            placeholder="https://storage.com/kyc/doc.jpg"
                            className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors" />
                    </div>
                    <div className="flex gap-3 mt-1">
                        <button onClick={onClose} className="flex-1 py-2.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">Cancel</button>
                        <button onClick={handleSubmit} disabled={loading}
                            className="flex-1 py-2.5 text-xs font-bold bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upload'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SingleCustomerPage() {
    const params = useParams();
    const router = useRouter();
    const { selectedPump } = usePumpStore();
    const pumpId = selectedPump?.id ? String(selectedPump.id) : null;
    const customerId = params.customerId ? String(params.customerId) : '';

    const [data, setData] = useState<SingleCustomerView | null>(null);
    const [loading, setLoading] = useState(true);
    const [pumpProfile, setPumpProfile] = useState<PumpProfile | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'vehicles' | 'transactions' | 'invoices'>('overview');
    const [showKYC, setShowKYC] = useState(false);
    const [showContractWizard, setShowContractWizard] = useState(false);
    const [generatingInvoice, setGeneratingInvoice] = useState(false);

    const load = useCallback(async () => {
        if (!pumpId || !customerId) return;
        setLoading(true);
        try {
            const [d, profiledata] = await Promise.all([fetchCustomerDetail(pumpId, customerId), fetchPumpProfile(pumpId),]);
            setData(d);
            setPumpProfile(profiledata);
        } catch (e: any) {
            toast.error('Error', e?.response?.data?.detail || 'Failed to load customer');
        } finally { setLoading(false); }
    }, [pumpId, customerId]);

    useEffect(() => { load(); }, [load]);

    const handleVerifyKYC = async (docId: string, status: 'accepted' | 'rejected') => {
        if (!pumpId) return;
        try {
            await verifyKYC(pumpId, customerId, docId, { status });
            toast.success('KYC Updated', `Document ${status}`);
            load();
        } catch (e: any) {
            toast.error('Failed', e?.response?.data?.detail || 'Verification failed');
        }
    };

    const handleGenerateInvoice = async () => {
        if (!pumpId || !data?.active_contract) return;
        setGeneratingInvoice(true);
        try {
            const res = await generateInvoice(pumpId, data.active_contract.id);
            if (res.result?.created_count > 0) {
                toast.success('Invoice Generated', `${res.result.created_count} invoice(s) created`);
            } else {
                toast.error('No Invoice', res.detail || 'No transactions found or already generated');
            }
            load();
        } catch (e: any) {
            toast.error('Failed', e?.response?.data?.detail || 'Invoice generation failed');
        } finally { setGeneratingInvoice(false); }
    };

    const handleMarkPaid = async (invoiceId: string) => {
        if (!pumpId) return;
        try {
            await markInvoicePaid(pumpId, invoiceId);
            toast.success('Invoice Paid', 'Marked as paid');
            load();
        } catch (e: any) {
            toast.error('Failed', e?.response?.data?.detail || 'Failed to mark paid');
        }
    };

    if (!pumpId) return (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <AlertCircle className="h-10 w-10 mb-3 opacity-30" />
            <p className="font-bold text-sm">No pump selected</p>
        </div>
    );

    if (loading) return (
        <div className="flex items-center justify-center py-24 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    if (!data) return (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <AlertCircle className="h-10 w-10 mb-3 opacity-30" />
            <p className="font-bold text-sm">Customer not found</p>
        </div>
    );

    const { customer, kyc_documents, vehicles, active_contract, contract_usage, recent_transactions, recent_invoices } = data;

    return (
        <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 rounded-2xl p-6 shadow-xs gap-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/dashboard/udhaar')}
                        className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${customer.customer_type === 'commercial' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-violet-50 border-violet-100 text-violet-600'}`}>
                        {customer.customer_type === 'commercial' ? <Building2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
                    </div>
                    <div>
                        <h1 className="text-lg font-extrabold text-slate-900">{customer.name}</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <KYCBadge status={customer.kyc_status} />
                            {customer.contact_phone && <span className="text-[11px] text-slate-400">{customer.contact_phone}</span>}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {!active_contract && (
                        <button onClick={() => setShowContractWizard(true)}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary/90 cursor-pointer shadow-sm transition-all">
                            <FileText className="h-3.5 w-3.5" /> Issue Contract
                        </button>
                    )}
                    {active_contract && (
                        <>
                            <button onClick={() => setShowContractWizard(true)}
                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-800 text-white rounded-xl hover:bg-slate-700 cursor-pointer shadow-sm transition-all">
                                <Edit2 className="h-3.5 w-3.5" /> Amend Contract
                            </button>
                            <button onClick={handleGenerateInvoice} disabled={generatingInvoice}
                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 cursor-pointer shadow-sm transition-all disabled:opacity-50">
                                {generatingInvoice ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Receipt className="h-3.5 w-3.5" />}
                                Generate Invoice
                            </button>
                        </>
                    )}
                    <button onClick={() => setShowKYC(true)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-amber-500 text-white rounded-xl hover:bg-amber-600 cursor-pointer shadow-sm transition-all">
                        <Shield className="h-3.5 w-3.5" /> Upload KYC
                    </button>
                    <button onClick={load} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors">
                        <RefreshCw className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Credit usage bar */}
            {active_contract && contract_usage && (
                <CreditUsageBar contract={active_contract} usage={contract_usage} />
            )}

            {/* Tabs */}
            <div className="flex bg-white p-1 rounded-2xl border border-slate-200/60 shadow-xs max-w-lg select-none">
                {[
                    { id: 'overview', label: 'Overview', icon: <TrendingUp className="h-3.5 w-3.5" /> },
                    { id: 'vehicles', label: `Vehicles (${vehicles.length})`, icon: <Car className="h-3.5 w-3.5" /> },
                    { id: 'transactions', label: 'Transactions', icon: <Zap className="h-3.5 w-3.5" /> },
                    { id: 'invoices', label: 'Invoices', icon: <Receipt className="h-3.5 w-3.5" /> },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex justify-center items-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer
              ${activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* KYC Documents */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">KYC Documents</p>
                            <button onClick={() => setShowKYC(true)} className="text-[11px] font-bold text-primary hover:underline cursor-pointer">+ Upload</button>
                        </div>
                        {kyc_documents.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                                No documents uploaded yet
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {kyc_documents.map(doc => (
                                    <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 capitalize">{doc.document_type.replace('_', ' ')}</p>
                                            <p className="text-[10px] text-slate-400">{fmtDate(doc.created_at)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <KYCBadge status={doc.status} />
                                            {doc.status === 'pending' && (
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleVerifyKYC(doc.id, 'accepted')}
                                                        className="px-2 py-1 text-[10px] font-bold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 cursor-pointer">Accept</button>
                                                    <button onClick={() => handleVerifyKYC(doc.id, 'rejected')}
                                                        className="px-2 py-1 text-[10px] font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer">Reject</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Active Contract Summary */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-5">
                        <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-4">Contract Details</p>
                        {!active_contract ? (
                            <div className="text-center py-8">
                                <FileText className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                                <p className="text-xs font-bold text-slate-400">No active contract</p>
                                <button onClick={() => setShowContractWizard(true)}
                                    className="mt-3 flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary/90 cursor-pointer mx-auto transition-all">
                                    <Plus className="h-3.5 w-3.5" /> Issue Contract
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 text-xs">
                                {[
                                    { label: 'Version', value: `v${active_contract.version}` },
                                    { label: 'Valid Until', value: fmtDate(active_contract.valid_to) },
                                    { label: 'Security Deposit', value: fmt(active_contract.security_deposit) },
                                    { label: 'Billing', value: `${active_contract.billing_frequency === 'recurring' ? active_contract.billing_cycle : 'One-time'} · By ${active_contract.bill_by}` },
                                    { label: 'Credit Limit', value: fmt(active_contract.total_credit_limit) },
                                    { label: 'Slips Used', value: `${active_contract.current_slips_used}${active_contract.max_spending_slips ? ` / ${active_contract.max_spending_slips}` : ''}` },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between py-1.5 border-b border-slate-50">
                                        <span className="text-slate-400 font-semibold">{label}</span>
                                        <span className="font-bold text-slate-800">{value}</span>
                                    </div>
                                ))}
                                {(active_contract.item_limits?.length ?? 0) > 0 && (
                                    <div className="mt-1">
                                        <p className="text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">Item Limits</p>
                                        {active_contract.item_limits.map(il => (
                                            <div key={il.id} className="flex justify-between py-1 text-[11px]">
                                                <span className="capitalize text-slate-500">{il.item_name}</span>
                                                <span className="text-slate-600 font-medium">
                                                    {[il.qty_per_fill && `${il.qty_per_fill}L/fill`, il.qty_per_day && `${il.qty_per_day}L/day`].filter(Boolean).join(' · ')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {(active_contract.custom_conditions?.length ?? 0) > 0 && (
                                    <div className="mt-1">
                                        <p className="text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">Condition Cards ({active_contract.custom_conditions.length})</p>
                                        {active_contract.custom_conditions.map(c => (
                                            <div key={c.id} className="px-2 py-1.5 bg-orange-50 border border-orange-100 rounded-lg text-[10px] text-orange-700 font-medium mb-1">
                                                {[c.vehicle_type, c.item_name].filter(Boolean).join(' + ')}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── VEHICLES TAB ── */}
            {activeTab === 'vehicles' && (
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                    {vehicles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <Car className="h-10 w-10 mb-3 opacity-20" />
                            <p className="font-bold text-sm">No vehicles linked</p>
                            <p className="text-xs mt-1">Add vehicles from the Directory tab.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider">
                                    <th className="p-4">Plate</th>
                                    <th className="p-4">Make / Model</th>
                                    <th className="p-4">Fuel</th>
                                    <th className="p-4">Emission</th>
                                    <th className="p-4">Registered</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {vehicles.map(v => (
                                    <tr key={v.id} className="hover:bg-slate-50/50">
                                        <td className="p-4"><span className="font-bold font-mono text-slate-900 tracking-wider bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">{v.number_plate}</span></td>
                                        <td className="p-4"><p className="font-bold">{[v.make, v.model].filter(Boolean).join(' ') || '—'}</p>{v.variant && <p className="text-[10px] text-slate-400">{v.variant}</p>}</td>
                                        <td className="p-4"><div className="flex gap-1 flex-wrap">{(v.fuel_types || []).map(f => <span key={f} className="px-1.5 py-0.5 rounded bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-bold capitalize">{f}</span>)}</div></td>
                                        <td className="p-4 text-slate-500">{v.emission_standard || '—'}</td>
                                        <td className="p-4 text-slate-400">{fmtDate(v.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ── TRANSACTIONS TAB ── */}
            {activeTab === 'transactions' && (
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                    {recent_transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <Zap className="h-10 w-10 mb-3 opacity-20" />
                            <p className="font-bold text-sm">No transactions yet</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider">
                                    <th className="p-4">ID</th>
                                    <th className="p-4">Item</th>
                                    <th className="p-4">Qty</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Slip</th>
                                    <th className="p-4">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recent_transactions.map(t => (
                                    <tr key={t.id} className="hover:bg-slate-50/50">
                                        <td className="p-4 font-mono font-bold text-primary">#{t.id}</td>
                                        <td className="p-4 capitalize font-medium">{t.item_name || '—'}</td>
                                        <td className="p-4 font-bold">{t.quantity}L</td>
                                        <td className="p-4 font-extrabold text-slate-900 font-mono">{fmt(t.amount)}</td>
                                        <td className="p-4 text-slate-400">{t.slip_number || '—'}</td>
                                        <td className="p-4 text-slate-400">{fmtDateTime(t.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ── INVOICES TAB ── */}
            {activeTab === 'invoices' && (
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                    {recent_invoices.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <Receipt className="h-10 w-10 mb-3 opacity-20" />
                            <p className="font-bold text-sm">No invoices yet</p>
                            <p className="text-xs mt-1">Generate an invoice once transactions are logged.</p>
                            {active_contract && (
                                <button onClick={handleGenerateInvoice} disabled={generatingInvoice}
                                    className="mt-4 flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 cursor-pointer disabled:opacity-50 transition-all">
                                    {generatingInvoice ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Receipt className="h-3.5 w-3.5" />}
                                    Generate Invoice
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider">
                                    <th className="p-4">Invoice #</th>
                                    <th className="p-4">Period</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Generated</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recent_invoices.map(inv => (
                                    <tr key={inv.id} className="hover:bg-slate-50/50">
                                        <td className="p-4 font-mono font-bold text-primary">#{inv.id}</td>
                                        <td className="p-4 text-slate-500">{fmtDate(inv.cycle_start)} — {fmtDate(inv.cycle_end)}</td>
                                        <td className="p-4 font-extrabold text-slate-900 font-mono">{fmt(inv.rounded_amount)}</td>
                                        <td className="p-4"><InvoiceStatusBadge status={inv.status} /></td>
                                        <td className="p-4 text-slate-400">{fmtDate(inv.generated_at)}</td>
                                        <td className="p-4">
                                            {inv.status === 'unpaid' && (
                                                <button onClick={() => handleMarkPaid(inv.id)}
                                                    className="px-2.5 py-1 text-[10px] font-bold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 cursor-pointer transition-all">
                                                    Mark Paid
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Modals */}
            {showKYC && pumpId && (
                <KYCModal pumpId={pumpId} customerId={customerId} onClose={() => setShowKYC(false)} onSuccess={load} />
            )}
            {showContractWizard && pumpId && (
                <ContractWizardSplitScreen
                    pumpId={pumpId}
                    customerId={customerId}
                    customerName={customer.name}            // ← actual name
                    existingContract={active_contract}
                    logoUrl={pumpProfile?.logo_url || null} // ← settings se logo
                    onClose={() => setShowContractWizard(false)}
                    onSuccess={load}
                />
            )}
        </div>
    );
}