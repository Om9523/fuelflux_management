'use client';

/**
 * FILE: app/dashboard/inventory/components/StockPurchasesTab.tsx
 * Stock Purchases tab — create multi-step purchase, view list, lock purchase.
 * Steps: 1. Invoice Header  2. Line Items  3. Fuel Sample  4. Logistics  5. Extra Charges
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus, X, Loader2, ShoppingCart, Lock, Trash2,
    AlertCircle, RefreshCw, ChevronRight, ChevronLeft,
    Package, Truck, FlaskConical, IndianRupee, FileText,
    CheckCircle, Clock,
} from 'lucide-react';
import { toast } from '@/components/feedback/Toast';
import { usePumpStore } from '@/stores/pumps.store';
import {
    fetchStockPurchases, fetchStockItems, createStockPurchase,
    lockStockPurchase, deleteStockPurchase,
    StockPurchase, StockItem, StockPurchaseCreate, PurchaseLineCreate,
} from '@/services/inventory.service';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number, d = 2) {
    return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
}
function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Empty line item ──────────────────────────────────────────────────────────

const emptyLine = (): PurchaseLineCreate => ({
    item_id: 0, quantity: 0, basic_rate: 0,
    rebate: 0, vat_amount: 0, surcharge_amount: 0,
    cess_amount: 0, license_fees: 0, dealer_commission: 0,
});

// ─── Step labels ──────────────────────────────────────────────────────────────

const STEPS = [
    { label: 'Invoice', icon: FileText },
    { label: 'Items', icon: Package },
    { label: 'Fuel Sample', icon: FlaskConical },
    { label: 'Logistics', icon: Truck },
    { label: 'Extra Costs', icon: IndianRupee },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function StockPurchasesTab() {
    const { selectedPump } = usePumpStore();
    const [loading, setLoading] = useState(false);
    const [purchases, setPurchases] = useState<StockPurchase[]>([]);
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [locking, setLocking] = useState<number | null>(null);

    // ── Form state ────────────────────────────────────────────────────────────

    // Step 1 — Invoice header
    const [supplierName, setSupplierName] = useState('');
    const [invoiceNo, setInvoiceNo] = useState('');
    const [invoiceDate, setInvoiceDate] = useState('');

    // Step 2 — Line items
    const [lines, setLines] = useState<PurchaseLineCreate[]>([emptyLine()]);

    // Step 3 — Fuel sample
    const [sampleRef, setSampleRef] = useState('');
    const [sampleQty, setSampleQty] = useState('');
    const [challanDensity, setChallanDensity] = useState('');
    const [observedDensity, setObservedDensity] = useState('');
    const [sealNumbers, setSealNumbers] = useState<string[]>(['']);

    // Step 4 — Logistics
    const [vehicleNo, setVehicleNo] = useState('');
    const [transporterName, setTransporterName] = useState('');
    const [transporterPhone, setTransporterPhone] = useState('');
    const [driverName, setDriverName] = useState('');
    const [driverLicense, setDriverLicense] = useState('');
    const [comments, setComments] = useState('');

    // Step 5 — Extra charges
    const [tollAmount, setTollAmount] = useState('');
    const [extraCharges, setExtraCharges] = useState('');
    const [extraNote, setExtraNote] = useState('');

    // ── Load data ─────────────────────────────────────────────────────────────

    const load = useCallback(async () => {
        if (!selectedPump?.id) return;
        setLoading(true);
        try {
            const [p, items] = await Promise.all([
                fetchStockPurchases(Number(selectedPump.id)),
                fetchStockItems(Number(selectedPump.id)),
            ]);
            setPurchases(p);
            setStockItems(items);
        } catch {
            toast.error('Failed to load purchases');
        } finally {
            setLoading(false);
        }
    }, [selectedPump?.id]);

    useEffect(() => { load(); }, [load]);

    // ── Reset form ────────────────────────────────────────────────────────────

    const resetForm = () => {
        setStep(0);
        setSupplierName(''); setInvoiceNo(''); setInvoiceDate('');
        setLines([emptyLine()]);
        setSampleRef(''); setSampleQty(''); setChallanDensity(''); setObservedDensity(''); setSealNumbers(['']);
        setVehicleNo(''); setTransporterName(''); setTransporterPhone('');
        setDriverName(''); setDriverLicense(''); setComments('');
        setTollAmount(''); setExtraCharges(''); setExtraNote('');
    };

    // ── Line item helpers ─────────────────────────────────────────────────────

    const updateLine = (i: number, field: keyof PurchaseLineCreate, val: any) => {
        setLines(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: val } : l));
    };

    const addLine = () => setLines(prev => [...prev, emptyLine()]);

    const removeLine = (i: number) => {
        if (lines.length === 1) return;
        setLines(prev => prev.filter((_, idx) => idx !== i));
    };

    const lineAfterTax = (line: PurchaseLineCreate) =>
        ((line.basic_rate - (line.rebate ?? 0) + (line.vat_amount ?? 0) + (line.surcharge_amount ?? 0) + (line.cess_amount ?? 0)) * line.quantity);

    // ── Seal number helpers ───────────────────────────────────────────────────

    const updateSeal = (i: number, val: string) =>
        setSealNumbers(prev => prev.map((s, idx) => idx === i ? val : s));
    const addSeal = () => setSealNumbers(prev => [...prev, '']);
    const removeSeal = (i: number) => setSealNumbers(prev => prev.filter((_, idx) => idx !== i));

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        if (!selectedPump?.id) return;
        if (!supplierName.trim()) { toast.error('Supplier name is required'); setStep(0); return; }
        if (lines.some(l => !l.item_id || l.quantity <= 0 || l.basic_rate <= 0)) {
            toast.error('All line items need Item, Quantity and Rate'); setStep(1); return;
        }

        setSubmitting(true);
        try {
            const payload: StockPurchaseCreate = {
                pump_id: Number(selectedPump.id),
                supplier_name: supplierName.trim(),
                invoice_number: invoiceNo || undefined,
                invoice_date: invoiceDate || undefined,
                sample_ref_number: sampleRef || undefined,
                sample_quantity: sampleQty ? Number(sampleQty) : undefined,
                challan_density_15c: challanDensity ? Number(challanDensity) : undefined,
                observed_density: observedDensity ? Number(observedDensity) : undefined,
                tanker_seal_numbers: sealNumbers.filter(Boolean).length ? sealNumbers.filter(Boolean) : undefined,
                vehicle_number: vehicleNo || undefined,
                transporter_name: transporterName || undefined,
                transporter_phone: transporterPhone || undefined,
                driver_name: driverName || undefined,
                driver_license: driverLicense || undefined,
                delivery_comments: comments || undefined,
                toll_amount: tollAmount ? Number(tollAmount) : 0,
                extra_charges: extraCharges ? Number(extraCharges) : 0,
                extra_charges_note: extraNote || undefined,
                line_items: lines,
            };
            await createStockPurchase(payload);
            toast.success('Purchase created — lock it to update inventory');
            setIsOpen(false);
            resetForm();
            load();
        } catch (e: any) {
            toast.error(e?.response?.data?.detail || 'Failed to create purchase');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Lock purchase ─────────────────────────────────────────────────────────

    const handleLock = async (id: number) => {
        setLocking(id);
        try {
            await lockStockPurchase(id);
            toast.success('Purchase locked — inventory updated');
            load();
        } catch (e: any) {
            toast.error(e?.response?.data?.detail || 'Failed to lock purchase');
        } finally {
            setLocking(null);
        }
    };

    // ── Delete purchase ───────────────────────────────────────────────────────

    const handleDelete = async (id: number) => {
        try {
            await deleteStockPurchase(id);
            toast.success('Purchase deleted');
            load();
        } catch (e: any) {
            toast.error(e?.response?.data?.detail || 'Failed to delete purchase');
        }
    };

    if (!selectedPump) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 text-slate-400">
                <AlertCircle className="h-10 w-10 mb-3 opacity-30" />
                <p className="font-bold text-sm">No pump selected</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5">

            {/* ── Header ─────────────────────────────────────────── */}
            <div className="flex justify-between items-center bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                <div>
                    <h2 className="text-sm font-extrabold text-text-primary">Stock Purchases</h2>
                    <p className="text-xs text-text-secondary mt-0.5">Log incoming stock — lock to update inventory</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer">
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => { resetForm(); setIsOpen(true); }}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-primary text-white rounded-xl cursor-pointer hover:bg-primary/90">
                        <Plus className="h-3.5 w-3.5" /> New Purchase
                    </button>
                </div>
            </div>

            {/* ── Purchases Table ─────────────────────────────────── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center gap-2 p-10 text-slate-400 text-xs">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading purchases...
                    </div>
                ) : purchases.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <ShoppingCart className="h-8 w-8 mb-3 opacity-30" />
                        <p className="font-bold text-sm">No purchases yet</p>
                        <p className="text-xs mt-1">Create a purchase and lock it to update inventory.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 font-extrabold text-text-secondary">
                                    <th className="p-4 uppercase tracking-wider">Invoice #</th>
                                    <th className="p-4 uppercase tracking-wider">Supplier</th>
                                    <th className="p-4 uppercase tracking-wider">Date</th>
                                    <th className="p-4 uppercase tracking-wider">Items</th>
                                    <th className="p-4 uppercase tracking-wider">Total Value</th>
                                    <th className="p-4 uppercase tracking-wider">Status</th>
                                    <th className="p-4 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-text-primary">
                                {purchases.map(p => {
                                    const totalValue = p.line_items.reduce((s, l) => s + l.after_tax_amount, 0);
                                    return (
                                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 font-mono font-bold text-primary">
                                                {p.invoice_number || `#${p.id}`}
                                            </td>
                                            <td className="p-4 font-bold">{p.supplier_name}</td>
                                            <td className="p-4 text-slate-500">{fmtDate(p.purchase_timestamp)}</td>
                                            <td className="p-4">
                                                <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-bold text-slate-500">
                                                    {p.line_items.length} item{p.line_items.length !== 1 ? 's' : ''}
                                                </span>
                                            </td>
                                            <td className="p-4 font-extrabold font-mono">{fmt(totalValue)}</td>
                                            <td className="p-4">
                                                {p.is_locked ? (
                                                    <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-[10px] rounded-lg w-fit">
                                                        <CheckCircle className="h-3 w-3" /> LOCKED
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-100 text-amber-600 font-bold text-[10px] rounded-lg w-fit">
                                                        <Clock className="h-3 w-3" /> DRAFT
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 flex items-center gap-2">
                                                {!p.is_locked && (
                                                    <>
                                                        <button
                                                            onClick={() => handleLock(p.id)}
                                                            disabled={locking === p.id}
                                                            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer transition-all disabled:opacity-50"
                                                        >
                                                            {locking === p.id
                                                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                                                : <Lock className="h-3 w-3" />}
                                                            Lock
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(p.id)}
                                                            className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg cursor-pointer transition-colors"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </>
                                                )}
                                                {p.is_locked && (
                                                    <span className="text-[10px] text-slate-300 font-medium">
                                                        {p.locked_at ? fmtDate(p.locked_at) : '—'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ════════ MULTI-STEP MODAL ════════ */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-150 text-left flex flex-col max-h-[90vh]">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                                    <ShoppingCart className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-extrabold text-slate-900">New Stock Purchase</h2>
                                    <p className="text-[10px] text-slate-400">Step {step + 1} of {STEPS.length} — {STEPS[step].label}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-xl cursor-pointer text-slate-400">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Step Indicator */}
                        <div className="flex items-center gap-1 px-6 pt-4 pb-2">
                            {STEPS.map((s, i) => {
                                const Icon = s.icon;
                                return (
                                    <React.Fragment key={i}>
                                        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${i === step ? 'bg-primary text-white' :
                                                i < step ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                    'bg-slate-50 text-slate-300 border border-slate-100'
                                            }`}>
                                            <Icon className="h-3 w-3" /> {s.label}
                                        </div>
                                        {i < STEPS.length - 1 && <ChevronRight className="h-3 w-3 text-slate-200 flex-shrink-0" />}
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1 overflow-y-auto p-6">

                            {/* STEP 0 — Invoice Header */}
                            {step === 0 && (
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Supplier Name *</label>
                                        <input type="text" placeholder="e.g. BPCL / HPCL / IOC"
                                            value={supplierName} onChange={e => setSupplierName(e.target.value)}
                                            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Invoice Number</label>
                                            <input type="text" placeholder="e.g. INV-2026-001"
                                                value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)}
                                                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 font-mono" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Invoice Date</label>
                                            <input type="date"
                                                value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)}
                                                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 1 — Line Items */}
                            {step === 1 && (
                                <div className="flex flex-col gap-4">
                                    {lines.map((line, i) => {
                                        const afterTax = lineAfterTax(line);
                                        const selItem = stockItems.find(s => s.id === line.item_id);
                                        return (
                                            <div key={i} className="border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 bg-slate-50/50">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-extrabold text-slate-400 uppercase">Item {i + 1}</span>
                                                    {lines.length > 1 && (
                                                        <button onClick={() => removeLine(i)} className="p-1 hover:bg-red-50 text-red-400 rounded-lg cursor-pointer">
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="col-span-2">
                                                        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Stock Item *</label>
                                                        <select value={line.item_id || ''} onChange={e => updateLine(i, 'item_id', Number(e.target.value))}
                                                            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none bg-white">
                                                            <option value="">— Select Item —</option>
                                                            {stockItems.map(s => (
                                                                <option key={s.id} value={s.id}>{s.name} {s.item_code ? `(${s.item_code})` : ''} — {s.unit}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                                            Qty {selItem ? `(${selItem.unit})` : ''}
                                                        </label>
                                                        <input type="number" step="any" placeholder="0"
                                                            value={line.quantity || ''}
                                                            onChange={e => updateLine(i, 'quantity', Number(e.target.value))}
                                                            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 font-mono" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Basic Rate (₹)</label>
                                                        <input type="number" step="any" placeholder="0.00"
                                                            value={line.basic_rate || ''}
                                                            onChange={e => updateLine(i, 'basic_rate', Number(e.target.value))}
                                                            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 font-mono" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Rebate (₹)</label>
                                                        <input type="number" step="any" placeholder="0"
                                                            value={line.rebate || ''}
                                                            onChange={e => updateLine(i, 'rebate', Number(e.target.value))}
                                                            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 font-mono" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">VAT Amount (₹)</label>
                                                        <input type="number" step="any" placeholder="0"
                                                            value={line.vat_amount || ''}
                                                            onChange={e => updateLine(i, 'vat_amount', Number(e.target.value))}
                                                            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 font-mono" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Surcharge (₹)</label>
                                                        <input type="number" step="any" placeholder="0"
                                                            value={line.surcharge_amount || ''}
                                                            onChange={e => updateLine(i, 'surcharge_amount', Number(e.target.value))}
                                                            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 font-mono" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Dealer Commission (₹)</label>
                                                        <input type="number" step="any" placeholder="0"
                                                            value={line.dealer_commission || ''}
                                                            onChange={e => updateLine(i, 'dealer_commission', Number(e.target.value))}
                                                            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 font-mono" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">License Fees (₹)</label>
                                                        <input type="number" step="any" placeholder="0"
                                                            value={line.license_fees || ''}
                                                            onChange={e => updateLine(i, 'license_fees', Number(e.target.value))}
                                                            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 font-mono" />
                                                    </div>
                                                </div>

                                                {/* After Tax computed */}
                                                {line.quantity > 0 && line.basic_rate > 0 && (
                                                    <div className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-xl px-4 py-2.5">
                                                        <span className="text-[11px] font-bold text-slate-500">After Tax Amount</span>
                                                        <span className="text-sm font-extrabold text-primary font-mono">{fmt(afterTax)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    <button onClick={addLine}
                                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold border border-dashed border-slate-300 text-slate-500 rounded-xl hover:bg-slate-50 cursor-pointer transition-all">
                                        <Plus className="h-3.5 w-3.5" /> Add Another Item
                                    </button>

                                    {/* Total */}
                                    <div className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                                        <span className="text-xs font-extrabold text-slate-500 uppercase">Total Purchase Value</span>
                                        <span className="text-base font-extrabold text-slate-900 font-mono">
                                            {fmt(lines.reduce((s, l) => s + lineAfterTax(l), 0))}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2 — Fuel Sample */}
                            {step === 2 && (
                                <div className="flex flex-col gap-4">
                                    <p className="text-[11px] text-slate-400 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 font-medium">
                                        Required for dispensed (bulk fuel) items for quality compliance.
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Sample Ref Number</label>
                                            <input type="text" placeholder="e.g. SMP-2026-001"
                                                value={sampleRef} onChange={e => setSampleRef(e.target.value)}
                                                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 font-mono" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Sample Quantity (L)</label>
                                            <input type="number" step="any" placeholder="e.g. 2"
                                                value={sampleQty} onChange={e => setSampleQty(e.target.value)}
                                                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 font-mono" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Challan Density @ 15°C</label>
                                            <input type="number" step="any" placeholder="e.g. 0.7340"
                                                value={challanDensity} onChange={e => setChallanDensity(e.target.value)}
                                                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 font-mono" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Observed Density</label>
                                            <input type="number" step="any" placeholder="e.g. 0.7355"
                                                value={observedDensity} onChange={e => setObservedDensity(e.target.value)}
                                                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 font-mono" />
                                        </div>
                                    </div>

                                    {/* Tanker seal numbers */}
                                    <div>
                                        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">Tanker Seal Numbers</label>
                                        <div className="flex flex-col gap-2">
                                            {sealNumbers.map((seal, i) => (
                                                <div key={i} className="flex gap-2">
                                                    <input type="text" placeholder={`Seal #${i + 1}`}
                                                        value={seal} onChange={e => updateSeal(i, e.target.value)}
                                                        className="flex-1 px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 font-mono uppercase" />
                                                    {sealNumbers.length > 1 && (
                                                        <button onClick={() => removeSeal(i)} className="p-2 hover:bg-red-50 text-red-400 rounded-xl cursor-pointer">
                                                            <X className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button onClick={addSeal}
                                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-dashed border-slate-300 text-slate-400 rounded-xl hover:bg-slate-50 cursor-pointer">
                                                <Plus className="h-3.5 w-3.5" /> Add Seal Number
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3 — Logistics */}
                            {step === 3 && (
                                <div className="flex flex-col gap-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Vehicle / Reg Number</label>
                                            <input type="text" placeholder="e.g. UP16T1234"
                                                value={vehicleNo} onChange={e => setVehicleNo(e.target.value.toUpperCase())}
                                                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 font-mono uppercase" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Transporter Name</label>
                                            <input type="text" placeholder="e.g. Sharma Transport Co."
                                                value={transporterName} onChange={e => setTransporterName(e.target.value)}
                                                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Transporter Phone</label>
                                            <input type="tel" placeholder="e.g. 9876543210"
                                                value={transporterPhone} onChange={e => setTransporterPhone(e.target.value)}
                                                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 font-mono" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Driver Name</label>
                                            <input type="text" placeholder="e.g. Ramesh Kumar"
                                                value={driverName} onChange={e => setDriverName(e.target.value)}
                                                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Driver License Number</label>
                                            <input type="text" placeholder="e.g. UP1620210012345"
                                                value={driverLicense} onChange={e => setDriverLicense(e.target.value.toUpperCase())}
                                                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 font-mono uppercase" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Delivery Comments</label>
                                        <textarea rows={2} placeholder="Any notes about this delivery..."
                                            value={comments} onChange={e => setComments(e.target.value)}
                                            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 resize-none" />
                                    </div>
                                </div>
                            )}

                            {/* STEP 4 — Extra Charges */}
                            {step === 4 && (
                                <div className="flex flex-col gap-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Toll Charges (₹)</label>
                                            <input type="number" step="any" placeholder="0.00"
                                                value={tollAmount} onChange={e => setTollAmount(e.target.value)}
                                                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 font-mono" />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Other Extra Charges (₹)</label>
                                            <input type="number" step="any" placeholder="0.00"
                                                value={extraCharges} onChange={e => setExtraCharges(e.target.value)}
                                                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 font-mono" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Extra Charges Note</label>
                                        <textarea rows={2} placeholder="e.g. Loading charges, unloading fees..."
                                            value={extraNote} onChange={e => setExtraNote(e.target.value)}
                                            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 resize-none" />
                                    </div>

                                    {/* Final summary before submit */}
                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-2">
                                        <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Purchase Summary</p>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Supplier</span>
                                            <span className="font-bold">{supplierName}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Invoice #</span>
                                            <span className="font-mono font-bold">{invoiceNo || '—'}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Line Items</span>
                                            <span className="font-bold">{lines.length} item{lines.length !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="flex justify-between text-xs border-t border-slate-200 pt-2 mt-1">
                                            <span className="text-slate-500 font-bold">Total After Tax</span>
                                            <span className="font-extrabold text-primary font-mono">
                                                {fmt(lines.reduce((s, l) => s + lineAfterTax(l), 0))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Navigation */}
                        <div className="flex justify-between items-center p-6 border-t border-slate-100 gap-3">
                            <button
                                onClick={() => step === 0 ? setIsOpen(false) : setStep(s => s - 1)}
                                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                                {step === 0 ? 'Cancel' : 'Back'}
                            </button>

                            {step < STEPS.length - 1 ? (
                                <button
                                    onClick={() => setStep(s => s + 1)}
                                    className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold bg-primary text-white rounded-xl cursor-pointer hover:bg-primary/90 shadow-sm"
                                >
                                    Next <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold bg-emerald-600 text-white rounded-xl cursor-pointer hover:bg-emerald-500 shadow-sm disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle className="h-3.5 w-3.5" /> Save Purchase</>}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}