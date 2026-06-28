'use client';

/**
 * FILE: app/dashboard/inventory/components/StockItemsTab.tsx
 * Stock Items tab — manage Item Groups and Stock Items.
 * Features: Create Group (with tax settings), Create Item, Set Rates
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus, X, Loader2, Package, Layers, RefreshCw,
    ChevronRight, IndianRupee, Tag, AlertCircle, Check,
} from 'lucide-react';
import { toast } from '@/components/feedback/Toast';
import { usePumpStore } from '@/stores/pumps.store';
import {
    fetchItemGroups, fetchStockItems, createItemGroup,
    createStockItem, setItemRates,
    ItemGroup, StockItem, ItemGroupCreate, StockItemCreate,
} from '@/services/inventory.service';

// ─── Sub-tab ──────────────────────────────────────────────────────────────────

type SubTab = 'items' | 'groups';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 2) {
    return n.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StockItemsTab() {
    const { selectedPump } = usePumpStore();
    const [subTab, setSubTab] = useState<SubTab>('items');
    const [loading, setLoading] = useState(false);
    const [groups, setGroups] = useState<ItemGroup[]>([]);
    const [items, setItems] = useState<StockItem[]>([]);

    // Modals
    const [isGroupOpen, setIsGroupOpen] = useState(false);
    const [isItemOpen, setIsItemOpen] = useState(false);
    const [isRateOpen, setIsRateOpen] = useState(false);
    const [rateTarget, setRateTarget] = useState<StockItem | null>(null);
    const [newRate, setNewRate] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Group form
    const [gForm, setGForm] = useState<Partial<ItemGroupCreate>>({
        item_class: 'goods', tax_type: 'vat',
        rate_tax_type: 'after_tax', valuation_method: 'average_purchase_date',
        vat_rate: 0, surcharge_rate: 0, cess_rate: 0, additional_cess_rate: 0,
    });

    // Item form
    const [iForm, setIForm] = useState<Partial<StockItemCreate>>({
        is_dispensed_item: true, unit: 'Liters', selling_rate: 0,
    });

    const load = useCallback(async () => {
        if (!selectedPump?.id) return;
        setLoading(true);
        try {
            const [g, i] = await Promise.all([
                fetchItemGroups(selectedPump.id),
                fetchStockItems(selectedPump.id),
            ]);
            setGroups(g);
            setItems(i);
        } catch {
            toast.error('Failed to load inventory data');
        } finally {
            setLoading(false);
        }
    }, [selectedPump?.id]);

    useEffect(() => { load(); }, [load]);

    // ── Create Group ────────────────────────────────────────────────────────────

    const handleCreateGroup = async () => {
        if (!selectedPump?.id || !gForm.name?.trim()) {
            toast.error('Group name is required');
            return;
        }
        setSubmitting(true);
        try {
            await createItemGroup({ ...gForm, pump_id: selectedPump.id } as ItemGroupCreate);
            toast.success('Item group created successfully');
            setIsGroupOpen(false);
            setGForm({ item_class: 'goods', tax_type: 'vat', rate_tax_type: 'after_tax', valuation_method: 'average_purchase_date', vat_rate: 0, surcharge_rate: 0, cess_rate: 0, additional_cess_rate: 0 });
            load();
        } catch (e: any) {
            toast.error(e?.response?.data?.detail || 'Failed to create group');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Create Item ─────────────────────────────────────────────────────────────

    const handleCreateItem = async () => {
        if (!selectedPump?.id || !iForm.name?.trim()) {
            toast.error('Item name is required');
            return;
        }
        setSubmitting(true);
        try {
            await createStockItem({ ...iForm, pump_id: selectedPump.id } as StockItemCreate);
            toast.success('Stock item created successfully');
            setIsItemOpen(false);
            setIForm({ is_dispensed_item: true, unit: 'Liters', selling_rate: 0 });
            load();
        } catch (e: any) {
            toast.error(e?.response?.data?.detail || 'Failed to create item');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Set Rate ────────────────────────────────────────────────────────────────

    const handleSetRate = async () => {
        if (!rateTarget || !newRate) return;
        setSubmitting(true);
        try {
            await setItemRates([{ item_id: rateTarget.id, selling_rate: Number(newRate) }]);
            toast.success(`Rate updated to ₹${newRate} for ${rateTarget.name}`);
            setIsRateOpen(false);
            setRateTarget(null);
            load();
        } catch (e: any) {
            toast.error(e?.response?.data?.detail || 'Failed to update rate');
        } finally {
            setSubmitting(false);
        }
    };

    // ── No pump guard ───────────────────────────────────────────────────────────

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
            <div className="flex flex-wrap justify-between items-center gap-3 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                {/* Sub-tabs: Items / Groups */}
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200/50 gap-1">
                    {(['items', 'groups'] as SubTab[]).map(t => (
                        <button
                            key={t}
                            onClick={() => setSubTab(t)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer capitalize
                ${subTab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {t === 'items' ? <span className="flex items-center gap-1.5"><Package className="h-3.5 w-3.5" />Items</span>
                                : <span className="flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" />Groups</span>}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer transition-all">
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    {subTab === 'groups' && (
                        <button onClick={() => setIsGroupOpen(true)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl cursor-pointer hover:bg-slate-800 transition-all">
                            <Plus className="h-3.5 w-3.5" /> New Group
                        </button>
                    )}
                    {subTab === 'items' && (
                        <button onClick={() => setIsItemOpen(true)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-primary text-white rounded-xl cursor-pointer hover:bg-primary/90 transition-all">
                            <Plus className="h-3.5 w-3.5" /> New Item
                        </button>
                    )}
                </div>
            </div>

            {/* ── GROUPS TABLE ──────────────────────────────────── */}
            {subTab === 'groups' && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2 p-10 text-slate-400 text-xs">
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading groups...
                        </div>
                    ) : groups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <Layers className="h-8 w-8 mb-3 opacity-30" />
                            <p className="font-bold text-sm">No groups yet</p>
                            <p className="text-xs mt-1">Create a group to define tax settings for your products.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 font-extrabold text-text-secondary">
                                        <th className="p-4 uppercase tracking-wider">Group Name</th>
                                        <th className="p-4 uppercase tracking-wider">Category</th>
                                        <th className="p-4 uppercase tracking-wider">Class</th>
                                        <th className="p-4 uppercase tracking-wider">Tax Type</th>
                                        <th className="p-4 uppercase tracking-wider">VAT %</th>
                                        <th className="p-4 uppercase tracking-wider">Surcharge %</th>
                                        <th className="p-4 uppercase tracking-wider">Cess %</th>
                                        <th className="p-4 uppercase tracking-wider">Valuation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-text-primary font-medium">
                                    {groups.map(g => (
                                        <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 font-bold">{g.name}</td>
                                            <td className="p-4 text-slate-500">{g.category || '—'}</td>
                                            <td className="p-4 capitalize">{g.item_class}</td>
                                            <td className="p-4">
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 border border-blue-100 text-blue-600 uppercase">
                                                    {g.tax_type}
                                                </span>
                                            </td>
                                            <td className="p-4 font-mono">{g.vat_rate}%</td>
                                            <td className="p-4 font-mono">{g.surcharge_rate}%</td>
                                            <td className="p-4 font-mono">{g.cess_rate}%</td>
                                            <td className="p-4 text-slate-400 text-[10px]">
                                                {g.valuation_method === 'average_purchase_date' ? 'Avg Purchase Date' : 'FIFO'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── ITEMS TABLE ───────────────────────────────────── */}
            {subTab === 'items' && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2 p-10 text-slate-400 text-xs">
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading items...
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <Package className="h-8 w-8 mb-3 opacity-30" />
                            <p className="font-bold text-sm">No stock items yet</p>
                            <p className="text-xs mt-1">Add your first product like Petrol, Diesel or Engine Oil.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 font-extrabold text-text-secondary">
                                        <th className="p-4 uppercase tracking-wider">Item</th>
                                        <th className="p-4 uppercase tracking-wider">Code</th>
                                        <th className="p-4 uppercase tracking-wider">Group</th>
                                        <th className="p-4 uppercase tracking-wider">Type</th>
                                        <th className="p-4 uppercase tracking-wider">Unit</th>
                                        <th className="p-4 uppercase tracking-wider">Qty</th>
                                        <th className="p-4 uppercase tracking-wider">Avg Rate</th>
                                        <th className="p-4 uppercase tracking-wider">Valuation</th>
                                        <th className="p-4 uppercase tracking-wider">Selling Rate</th>
                                        <th className="p-4 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-text-primary font-medium">
                                    {items.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 font-bold">{item.name}</td>
                                            <td className="p-4 font-mono text-slate-500">{item.item_code || '—'}</td>
                                            <td className="p-4 text-slate-500">{item.group_name || '—'}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${item.is_dispensed_item
                                                        ? 'bg-orange-50 border-orange-100 text-orange-600'
                                                        : 'bg-slate-50 border-slate-200 text-slate-500'
                                                    }`}>
                                                    {item.is_dispensed_item ? 'Dispensed' : 'Packaged'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-400">{item.unit}</td>
                                            <td className="p-4 font-mono font-bold">
                                                {item.current_quantity === 0
                                                    ? <span className="text-slate-300">0</span>
                                                    : fmt(item.current_quantity, 1)}
                                            </td>
                                            <td className="p-4 font-mono">₹{fmt(item.average_rate)}</td>
                                            <td className="p-4 font-mono font-bold text-slate-800">₹{fmt(item.current_valuation)}</td>
                                            <td className="p-4 font-mono font-bold text-emerald-600">₹{fmt(item.selling_rate)}</td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => { setRateTarget(item); setNewRate(String(item.selling_rate)); setIsRateOpen(true); }}
                                                    className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-lg cursor-pointer transition-all"
                                                >
                                                    <Tag className="h-3 w-3" /> Set Rate
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ════════════════ MODALS ════════════════ */}

            {/* ── New Group Modal ─────────────────────────────── */}
            {isGroupOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-150 text-left max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setIsGroupOpen(false)} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl cursor-pointer text-slate-400">
                            <X className="h-4 w-4" />
                        </button>
                        <div className="flex items-center gap-2.5 mb-5">
                            <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
                                <Layers className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-extrabold text-slate-900">New Item Group</h2>
                                <p className="text-[10px] text-slate-400">Tax settings here are inherited by all items in this group</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Group Name *</label>
                                    <input type="text" placeholder="e.g. Dispensing Products"
                                        value={gForm.name || ''}
                                        onChange={e => setGForm(p => ({ ...p, name: e.target.value }))}
                                        className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                                    <input type="text" placeholder="e.g. Fuel"
                                        value={gForm.category || ''}
                                        onChange={e => setGForm(p => ({ ...p, category: e.target.value }))}
                                        className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Class</label>
                                    <select value={gForm.item_class} onChange={e => setGForm(p => ({ ...p, item_class: e.target.value as any }))}
                                        className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none bg-white">
                                        <option value="goods">Goods</option>
                                        <option value="services">Services</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">HSN Code</label>
                                    <input type="text" placeholder="Optional"
                                        value={gForm.hsn_code || ''}
                                        onChange={e => setGForm(p => ({ ...p, hsn_code: e.target.value }))}
                                        className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50"
                                    />
                                </div>
                            </div>

                            {/* Tax Config */}
                            <div className="border-t border-slate-100 pt-4">
                                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">Tax Configuration</p>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Tax Type</label>
                                        <select value={gForm.tax_type} onChange={e => setGForm(p => ({ ...p, tax_type: e.target.value as any }))}
                                            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none bg-white">
                                            <option value="vat">VAT</option>
                                            <option value="gst">GST</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Rate Tax Type</label>
                                        <select value={gForm.rate_tax_type} onChange={e => setGForm(p => ({ ...p, rate_tax_type: e.target.value as any }))}
                                            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none bg-white">
                                            <option value="after_tax">After Tax</option>
                                            <option value="before_tax">Before Tax</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Valuation</label>
                                        <select value={gForm.valuation_method} onChange={e => setGForm(p => ({ ...p, valuation_method: e.target.value as any }))}
                                            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none bg-white">
                                            <option value="average_purchase_date">Avg Purchase Date</option>
                                            <option value="fifo">FIFO</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-3 mt-3">
                                    {[
                                        { label: 'VAT %', key: 'vat_rate' },
                                        { label: 'Surcharge %', key: 'surcharge_rate' },
                                        { label: 'Cess %', key: 'cess_rate' },
                                        { label: 'Add. Cess %', key: 'additional_cess_rate' },
                                    ].map(f => (
                                        <div key={f.key}>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">{f.label}</label>
                                            <input type="number" step="any" placeholder="0"
                                                value={(gForm as any)[f.key] ?? 0}
                                                onChange={e => setGForm(p => ({ ...p, [f.key]: Number(e.target.value) }))}
                                                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 font-mono"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Account Mappings */}
                            <div className="border-t border-slate-100 pt-4">
                                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">Account Mappings (Optional)</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Sales Account', key: 'sales_account' },
                                        { label: 'Purchase Account', key: 'purchase_account' },
                                        { label: 'VAT Account', key: 'vat_account' },
                                        { label: 'Surcharge Account', key: 'surcharge_account' },
                                        { label: 'Dealer Commission A/C', key: 'commission_account' },
                                        { label: 'Rebate Account', key: 'rebate_account' },
                                    ].map(f => (
                                        <div key={f.key}>
                                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">{f.label}</label>
                                            <input type="text" placeholder="Account name/code"
                                                value={(gForm as any)[f.key] || ''}
                                                onChange={e => setGForm(p => ({ ...p, [f.key]: e.target.value }))}
                                                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setIsGroupOpen(false)} className="flex-1 py-2.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">Cancel</button>
                                <button onClick={handleCreateGroup} disabled={submitting} className="flex-1 py-2.5 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer">
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Group'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── New Item Modal ───────────────────────────────── */}
            {isItemOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-150 text-left">
                        <button onClick={() => setIsItemOpen(false)} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl cursor-pointer text-slate-400">
                            <X className="h-4 w-4" />
                        </button>
                        <div className="flex items-center gap-2.5 mb-5">
                            <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-orange-50 border border-orange-100 text-primary">
                                <Package className="h-4 w-4" />
                            </div>
                            <h2 className="text-sm font-extrabold text-slate-900">New Stock Item</h2>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Item Name *</label>
                                    <input type="text" placeholder="e.g. Petrol"
                                        value={iForm.name || ''}
                                        onChange={e => setIForm(p => ({ ...p, name: e.target.value }))}
                                        className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Code (e.g. MS)</label>
                                    <input type="text" placeholder="e.g. MS"
                                        value={iForm.item_code || ''}
                                        onChange={e => setIForm(p => ({ ...p, item_code: e.target.value }))}
                                        className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Group</label>
                                    <select value={iForm.group_id || ''} onChange={e => setIForm(p => ({ ...p, group_id: e.target.value || undefined }))}
                                        className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none bg-white">
                                        <option value="">— No Group —</option>
                                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Unit</label>
                                    <select value={iForm.unit} onChange={e => setIForm(p => ({ ...p, unit: e.target.value }))}
                                        className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none bg-white">
                                        <option value="Liters">Liters</option>
                                        <option value="Pieces">Pieces</option>
                                        <option value="Kg">Kg</option>
                                        <option value="ML">ML</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">Item Type</label>
                                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200/50">
                                    {[{ val: true, label: 'Dispensed (Bulk Fuel)' }, { val: false, label: 'Packaged (Bottled)' }].map(opt => (
                                        <button key={String(opt.val)} type="button"
                                            onClick={() => setIForm(p => ({ ...p, is_dispensed_item: opt.val }))}
                                            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${iForm.is_dispensed_item === opt.val ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                                }`}
                                        >{opt.label}</button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Selling Rate (₹)</label>
                                <input type="number" step="any" placeholder="0.00"
                                    value={iForm.selling_rate || ''}
                                    onChange={e => setIForm(p => ({ ...p, selling_rate: Number(e.target.value) }))}
                                    className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 font-mono"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setIsItemOpen(false)} className="flex-1 py-2.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">Cancel</button>
                                <button onClick={handleCreateItem} disabled={submitting} className="flex-1 py-2.5 text-xs font-bold bg-primary text-white rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer hover:bg-primary/90">
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Item'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Set Rate Modal ───────────────────────────────── */}
            {isRateOpen && rateTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-150 text-left">
                        <button onClick={() => setIsRateOpen(false)} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl cursor-pointer text-slate-400">
                            <X className="h-4 w-4" />
                        </button>
                        <div className="flex items-center gap-2.5 mb-5">
                            <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600">
                                <IndianRupee className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-extrabold text-slate-900">Set Selling Rate</h2>
                                <p className="text-[10px] text-slate-400">{rateTarget.name} — current: ₹{fmt(rateTarget.selling_rate)}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">New Rate (₹ per {rateTarget.unit})</label>
                                <input type="number" step="any" autoFocus
                                    value={newRate}
                                    onChange={e => setNewRate(e.target.value)}
                                    className="w-full px-3 py-2.5 text-sm font-bold border border-slate-200 rounded-xl outline-none focus:border-primary/50 font-mono"
                                />
                            </div>
                            {newRate && !isNaN(Number(newRate)) && (
                                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-600">
                                    <Check className="h-4 w-4" /> Rate will be set to ₹{Number(newRate).toFixed(2)} per {rateTarget.unit}
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button onClick={() => setIsRateOpen(false)} className="flex-1 py-2.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">Cancel</button>
                                <button onClick={handleSetRate} disabled={submitting || !newRate} className="flex-1 py-2.5 text-xs font-bold bg-emerald-600 text-white rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer hover:bg-emerald-500">
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Rate'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}