'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users, Car, Plus, Search, Trash2, ChevronRight,
    AlertCircle, Loader2, RefreshCw, Shield, ShieldCheck,
    ShieldX, Building2, User, Phone, FileText, X, CheckCircle,
    Fuel, Calendar, Hash,
} from 'lucide-react';
import { toast } from '@/components/feedback/Toast';
import { usePumpStore } from '@/stores/pumps.store';
import {
    fetchCustomers, createCustomer, deleteCustomer,
    fetchVehicles, createVehicle, deleteVehicle,
    CustomerListItem, UdhaarVehicle, CustomerType,
} from '@/services/udhaar.service';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function KYCBadge({ status }: { status: string }) {
    if (status === 'accepted') return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold">
            <ShieldCheck className="h-3 w-3" /> Verified
        </span>
    );
    if (status === 'rejected') return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-50 border border-red-100 text-red-500 text-[10px] font-bold">
            <ShieldX className="h-3 w-3" /> Rejected
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-500 text-[10px] font-bold">
            <Shield className="h-3 w-3" /> Pending
        </span>
    );
}

function TypeBadge({ type }: { type: string }) {
    return type === 'commercial'
        ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold"><Building2 className="h-3 w-3" /> Commercial</span>
        : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-violet-50 border border-violet-100 text-violet-600 text-[10px] font-bold"><User className="h-3 w-3" /> Private</span>;
}

// ─── Add Customer Modal ───────────────────────────────────────────────────────

function AddCustomerModal({ pumpId, onClose, onSuccess }: {
    pumpId: number; onClose: () => void; onSuccess: () => void;
}) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        customer_type: 'commercial' as CustomerType,
        name: '',
        contact_name: '',
        contact_phone: '',
        contact_email: '',
    });

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async () => {
        if (!form.name.trim()) { toast.error('Required', 'Customer name is required'); return; }
        setLoading(true);
        try {
            await createCustomer(pumpId, form);
            toast.success('Customer Added', `${form.name} has been added to directory`);
            onSuccess();
            onClose();
        } catch (e: any) {
            toast.error('Failed', e?.response?.data?.detail || 'Could not add customer');
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100">
                <button onClick={onClose} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                    <X className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-2.5 mb-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 border border-orange-200 text-primary">
                        <Users className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-base font-extrabold text-slate-900">New Credit Customer</h2>
                        <p className="text-[10px] text-slate-400">Step {step} of 2</p>
                    </div>
                </div>

                {/* Step indicator */}
                <div className="flex gap-2 mb-5">
                    {[1, 2].map(s => (
                        <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-primary' : 'bg-slate-100'}`} />
                    ))}
                </div>

                {step === 1 && (
                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">Customer Type</label>
                            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200/50">
                                {(['commercial', 'private'] as CustomerType[]).map(t => (
                                    <button key={t} type="button" onClick={() => set('customer_type', t)}
                                        className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer capitalize flex items-center justify-center gap-1.5
                      ${form.customer_type === t ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                                        {t === 'commercial' ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Entity / Customer Name *</label>
                            <input value={form.name} onChange={e => set('name', e.target.value)}
                                placeholder={form.customer_type === 'commercial' ? 'e.g. Sharma Transport Co.' : 'e.g. Ramesh Kumar'}
                                className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors" />
                        </div>
                        <button onClick={() => { if (!form.name.trim()) { toast.error('Required', 'Name is required'); return; } setStep(2); }}
                            className="w-full py-2.5 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary/90 transition-all cursor-pointer mt-1">
                            Continue →
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Contact Person</label>
                            <input value={form.contact_name} onChange={e => set('contact_name', e.target.value)}
                                placeholder="Contact person name"
                                className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Phone</label>
                                <input value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)}
                                    placeholder="9876543210" type="tel"
                                    className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                                <input value={form.contact_email} onChange={e => set('contact_email', e.target.value)}
                                    placeholder="email@company.com" type="email"
                                    className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors" />
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-400 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                            Party account will be auto-created when a contract is assigned.
                        </p>
                        <div className="flex gap-3 mt-1">
                            <button onClick={() => setStep(1)} className="flex-1 py-2.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                                ← Back
                            </button>
                            <button onClick={handleSubmit} disabled={loading}
                                className="flex-1 py-2.5 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Customer'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Add Vehicle Modal ────────────────────────────────────────────────────────

function AddVehicleModal({ pumpId, customers, onClose, onSuccess }: {
    pumpId: number;
    customers: CustomerListItem[];
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        customer_id: customers[0]?.id?.toString() || '',
        number_plate: '',
        registration_type: 'commercial' as 'private' | 'commercial',
        make: '', model: '', variant: '',
        fuel_types: [] as string[],
        emission_standard: '',
        engine_number: '',
        chassis_number: '',
    });

    const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

    const toggleFuel = (fuel: string) => {
        setForm(f => ({
            ...f,
            fuel_types: f.fuel_types.includes(fuel)
                ? f.fuel_types.filter(x => x !== fuel)
                : [...f.fuel_types, fuel],
        }));
    };

    const handleSubmit = async () => {
        if (!form.number_plate.trim() || !form.customer_id) {
            toast.error('Required', 'Number plate and customer are required');
            return;
        }
        setLoading(true);
        try {
            await createVehicle(pumpId, {
                ...form,
                customer_id: Number(form.customer_id),
                number_plate: form.number_plate.toUpperCase().trim(),
            });
            toast.success('Vehicle Added', `${form.number_plate.toUpperCase()} registered`);
            onSuccess();
            onClose();
        } catch (e: any) {
            toast.error('Failed', e?.response?.data?.detail || 'Could not add vehicle');
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100">
                <button onClick={onClose} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 cursor-pointer transition-colors">
                    <X className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2.5 mb-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
                        <Car className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-base font-extrabold text-slate-900">Register Vehicle</h2>
                        <p className="text-[10px] text-slate-400">Step {step} of 2</p>
                    </div>
                </div>

                <div className="flex gap-2 mb-5">
                    {[1, 2].map(s => (
                        <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-blue-500' : 'bg-slate-100'}`} />
                    ))}
                </div>

                {step === 1 && (
                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Link to Customer *</label>
                            <select value={form.customer_id} onChange={e => set('customer_id', e.target.value)}
                                className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 bg-white cursor-pointer">
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Number Plate *</label>
                            <input value={form.number_plate} onChange={e => set('number_plate', e.target.value.toUpperCase())}
                                placeholder="MH12AB1234" className="w-full px-3 py-2.5 text-xs font-bold border border-slate-200 rounded-xl outline-none focus:border-primary/50 uppercase tracking-widest transition-colors" />
                        </div>
                        <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">Registration Type</label>
                            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200/50">
                                {['commercial', 'private'].map(t => (
                                    <button key={t} type="button" onClick={() => set('registration_type', t)}
                                        className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer capitalize
                      ${form.registration_type === t ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {['make', 'model', 'variant'].map(field => (
                                <div key={field}>
                                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5 capitalize">{field}</label>
                                    <input value={(form as any)[field]} onChange={e => set(field, e.target.value)}
                                        placeholder={field === 'make' ? 'Tata' : field === 'model' ? 'Prima' : '3525'}
                                        className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors" />
                                </div>
                            ))}
                        </div>
                        <button onClick={() => { if (!form.number_plate.trim() || !form.customer_id) { toast.error('Required', 'Fill required fields'); return; } setStep(2); }}
                            className="w-full py-2.5 text-xs font-bold bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all cursor-pointer mt-1">
                            Continue →
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">Fuel Types</label>
                            <div className="flex gap-2">
                                {['petrol', 'diesel', 'cng'].map(fuel => (
                                    <button key={fuel} type="button" onClick={() => toggleFuel(fuel)}
                                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer capitalize
                      ${form.fuel_types.includes(fuel) ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-orange-300'}`}>
                                        {fuel}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Emission Std</label>
                                <select value={form.emission_standard} onChange={e => set('emission_standard', e.target.value)}
                                    className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl outline-none bg-white cursor-pointer">
                                    <option value="">Select</option>
                                    {['BS4', 'BS6', 'BS3', 'Euro 6'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Engine No.</label>
                                <input value={form.engine_number} onChange={e => set('engine_number', e.target.value)}
                                    placeholder="Optional"
                                    className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Chassis No.</label>
                            <input value={form.chassis_number} onChange={e => set('chassis_number', e.target.value)}
                                placeholder="Optional"
                                className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors" />
                        </div>
                        <div className="flex gap-3 mt-1">
                            <button onClick={() => setStep(1)} className="flex-1 py-2.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                                ← Back
                            </button>
                            <button onClick={handleSubmit} disabled={loading}
                                className="flex-1 py-2.5 text-xs font-bold bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Vehicle'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UdhaarDirectoryPage() {
    const router = useRouter();
    const { selectedPump } = usePumpStore();
    const pumpId = selectedPump?.id ? Number(selectedPump.id) : null;

    const [activeTab, setActiveTab] = useState<'customers' | 'vehicles'>('customers');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<CustomerListItem[]>([]);
    const [vehicles, setVehicles] = useState<UdhaarVehicle[]>([]);
    const [showAddCustomer, setShowAddCustomer] = useState(false);
    const [showAddVehicle, setShowAddVehicle] = useState(false);

    const loadCustomers = useCallback(async () => {
        if (!pumpId) return;
        setLoading(true);
        try {
            const data = await fetchCustomers(pumpId);
            setCustomers(data);
        } catch (e: any) {
            toast.error('Error', e?.response?.data?.detail || 'Failed to load customers');
        } finally { setLoading(false); }
    }, [pumpId]);

    const loadVehicles = useCallback(async () => {
        if (!pumpId) return;
        setLoading(true);
        try {
            const data = await fetchVehicles(pumpId);
            setVehicles(data);
        } catch (e: any) {
            toast.error('Error', e?.response?.data?.detail || 'Failed to load vehicles');
        } finally { setLoading(false); }
    }, [pumpId]);

    useEffect(() => {
        if (activeTab === 'customers') loadCustomers();
        else loadVehicles();
    }, [activeTab, loadCustomers, loadVehicles]);

    const handleDeleteCustomer = async (id: number, name: string) => {
        if (!pumpId || !confirm(`Delete ${name}? This cannot be undone.`)) return;
        try {
            await deleteCustomer(pumpId, id);
            toast.success('Deleted', `${name} removed`);
            loadCustomers();
        } catch (e: any) {
            toast.error('Error', e?.response?.data?.detail || 'Delete failed');
        }
    };

    const handleDeleteVehicle = async (id: number, plate: string) => {
        if (!pumpId || !confirm(`Remove vehicle ${plate}?`)) return;
        try {
            await deleteVehicle(pumpId, id);
            toast.success('Deleted', `Vehicle ${plate} removed`);
            loadVehicles();
        } catch (e: any) {
            toast.error('Error', e?.response?.data?.detail || 'Delete failed');
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.contact_phone || '').includes(search)
    );

    const filteredVehicles = vehicles.filter(v =>
        v.number_plate.toLowerCase().includes(search.toLowerCase()) ||
        (v.make || '').toLowerCase().includes(search.toLowerCase()) ||
        (v.model || '').toLowerCase().includes(search.toLowerCase())
    );

    if (!pumpId) return (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <AlertCircle className="h-10 w-10 mb-3 opacity-30" />
            <p className="font-bold text-sm">No pump selected</p>
            <p className="text-xs mt-1">Select a pump to manage credit customers.</p>
        </div>
    );

    return (
        <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 rounded-2xl p-6 shadow-xs gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 border border-orange-200 text-primary">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">Credit Directory</h1>
                        <p className="text-xs text-slate-400">Manage credit customers and their vehicles</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => activeTab === 'customers' ? setShowAddCustomer(true) : setShowAddVehicle(true)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-sm cursor-pointer">
                        <Plus className="h-3.5 w-3.5" />
                        {activeTab === 'customers' ? 'Add Customer' : 'Add Vehicle'}
                    </button>
                    <button onClick={() => activeTab === 'customers' ? loadCustomers() : loadVehicles()} disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all cursor-pointer disabled:opacity-50">
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-white p-1 rounded-2xl border border-slate-200/60 shadow-xs max-w-xs select-none">
                {[
                    { id: 'customers', label: 'Customers', icon: <Users className="h-3.5 w-3.5" />, count: customers.length },
                    { id: 'vehicles', label: 'Vehicles', icon: <Car className="h-3.5 w-3.5" />, count: vehicles.length },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex justify-center items-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer
              ${activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
                        {tab.icon} {tab.label}
                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100'}`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" placeholder={activeTab === 'customers' ? 'Search customers...' : 'Search by plate, make...'}
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-xs font-medium bg-white border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors" />
            </div>

            {/* Content */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {loading && (
                    <div className="flex items-center justify-center gap-2 py-8 text-slate-400 text-xs">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                    </div>
                )}

                {/* ── CUSTOMERS TAB ── */}
                {!loading && activeTab === 'customers' && (
                    filteredCustomers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <Users className="h-10 w-10 mb-3 opacity-20" />
                            <p className="font-bold text-sm">No customers yet</p>
                            <p className="text-xs mt-1">Add your first credit customer to get started.</p>
                            <button onClick={() => setShowAddCustomer(true)}
                                className="mt-4 flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-primary text-white rounded-xl cursor-pointer hover:bg-primary/90 transition-all">
                                <Plus className="h-3.5 w-3.5" /> Add Customer
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider">
                                        <th className="p-4">Customer</th>
                                        <th className="p-4">Type</th>
                                        <th className="p-4">Contact</th>
                                        <th className="p-4">KYC</th>
                                        <th className="p-4">Vehicles</th>
                                        <th className="p-4">Contract</th>
                                        <th className="p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredCustomers.map(c => (
                                        <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                            onClick={() => router.push(`/dashboard/udhaar/${c.id}`)}>
                                            <td className="p-4">
                                                <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">{c.name}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">ID #{c.id}</p>
                                            </td>
                                            <td className="p-4"><TypeBadge type={c.customer_type} /></td>
                                            <td className="p-4">
                                                {c.contact_phone
                                                    ? <span className="flex items-center gap-1 text-slate-600"><Phone className="h-3 w-3 text-slate-300" />{c.contact_phone}</span>
                                                    : <span className="text-slate-300">—</span>}
                                            </td>
                                            <td className="p-4"><KYCBadge status={c.kyc_status} /></td>
                                            <td className="p-4">
                                                <span className="flex items-center gap-1 font-bold text-slate-700">
                                                    <Car className="h-3.5 w-3.5 text-slate-300" />{c.vehicle_count}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {c.has_active_contract
                                                    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold"><CheckCircle className="h-3 w-3" /> Active</span>
                                                    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 text-[10px] font-bold">No Contract</span>}
                                            </td>
                                            <td className="p-4" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => router.push(`/dashboard/udhaar/${c.id}`)}
                                                        className="p-1.5 hover:bg-orange-50 text-slate-400 hover:text-primary rounded-lg transition-colors cursor-pointer">
                                                        <ChevronRight className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteCustomer(c.id, c.name)}
                                                        className="p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors cursor-pointer">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}

                {/* ── VEHICLES TAB ── */}
                {!loading && activeTab === 'vehicles' && (
                    filteredVehicles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <Car className="h-10 w-10 mb-3 opacity-20" />
                            <p className="font-bold text-sm">No vehicles registered</p>
                            <p className="text-xs mt-1">Add vehicles and link them to credit customers.</p>
                            <button onClick={() => setShowAddVehicle(true)}
                                className="mt-4 flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-500 text-white rounded-xl cursor-pointer hover:bg-blue-600 transition-all">
                                <Plus className="h-3.5 w-3.5" /> Add Vehicle
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider">
                                        <th className="p-4">Plate</th>
                                        <th className="p-4">Make / Model</th>
                                        <th className="p-4">Fuel</th>
                                        <th className="p-4">Emission</th>
                                        <th className="p-4">Type</th>
                                        <th className="p-4">Added</th>
                                        <th className="p-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredVehicles.map(v => (
                                        <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4">
                                                <span className="font-bold font-mono text-slate-900 tracking-wider text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                                                    {v.number_plate}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-bold text-slate-800">{[v.make, v.model].filter(Boolean).join(' ') || '—'}</p>
                                                {v.variant && <p className="text-[10px] text-slate-400">{v.variant}</p>}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-1 flex-wrap">
                                                    {(v.fuel_types || []).map(f => (
                                                        <span key={f} className="px-1.5 py-0.5 rounded-md bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-bold capitalize">
                                                            {f}
                                                        </span>
                                                    ))}
                                                    {(!v.fuel_types || v.fuel_types.length === 0) && <span className="text-slate-300">—</span>}
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-500 font-medium">{v.emission_standard || '—'}</td>
                                            <td className="p-4 capitalize text-slate-500">{v.registration_type}</td>
                                            <td className="p-4 text-slate-400">
                                                {new Date(v.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="p-4">
                                                <button onClick={() => handleDeleteVehicle(v.id, v.number_plate)}
                                                    className="p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors cursor-pointer">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </div>

            {/* Modals */}
            {showAddCustomer && (
                <AddCustomerModal pumpId={pumpId} onClose={() => setShowAddCustomer(false)} onSuccess={loadCustomers} />
            )}
            {showAddVehicle && (
                <AddVehicleModal pumpId={pumpId} customers={customers} onClose={() => setShowAddVehicle(false)} onSuccess={loadVehicles} />
            )}
        </div>
    );
}