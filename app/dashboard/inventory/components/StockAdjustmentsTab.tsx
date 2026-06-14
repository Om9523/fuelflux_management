'use client';

/**
 * FILE: app/dashboard/inventory/components/StockAdjustmentsTab.tsx
 * Stock Adjustments — reason-based manual inventory corrections.
 * Business rule: damage/loss/theft/expired → input qty shown as negative
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus, X, Loader2, SlidersHorizontal,
    AlertCircle, RefreshCw, TrendingDown, TrendingUp,
} from 'lucide-react';
import { toast } from '@/components/feedback/Toast';
import { usePumpStore } from '@/stores/pumps.store';
import {
    fetchStockAdjustments, fetchStockItems, createStockAdjustment,
    StockAdjustment, StockItem, StockAdjustmentCreate, AdjustmentReason,
} from '@/services/inventory.service';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const LOSS_REASONS: AdjustmentReason[] = ['damage', 'loss', 'theft', 'expired'];

const REASON_META: Record<AdjustmentReason, { label: string; color: string; bg: string; border: string }> = {
    damage: { label: 'Damage', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
    loss: { label: 'Loss', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
    theft: { label: 'Theft', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
    expired: { label: 'Expired', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    other: { label: 'Other', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function StockAdjustmentsTab() {
    const { selectedPump } = usePumpStore();
    const [loading, setLoading] = useState(false);
    const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form
    const [itemId, setItemId] = useState<number>(0);
    const [reason, setReason] = useState<AdjustmentReason>('damage');
    const [quantity, setQuantity] = useState('');
    const [notes, setNotes] = useState('');

    const isLoss = LOSS_REASONS.includes(reason);
    const selectedItem = stockItems.find(s => s.id === itemId);

    // ── Load ──────────────────────────────────────────────────────────────────

    const load = useCallback(async () => {
        if (!selectedPump?.id) return;
        setLoading(true);
        try {
            const [adj, items] = await Promise.all([
                fetchStockAdjustments(Number(selectedPump.id)),
                fetchStockItems(Number(selectedPump.id)),
            ]);
            setAdjustments(adj);
            setStockItems(items);
        } catch {
            toast.error('Failed to load adjustments');
        } finally {
            setLoading(false);
        }
    }, [selectedPump?.id]);

    useEffect(() => { load(); }, [load]);

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        if (!selectedPump?.id) return;
        if (!itemId) { toast.error('Please select a stock item'); return; }
        if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
            toast.error('Enter a valid positive quantity');
            return;
        }

        setSubmitting(true);
        try {
            await createStockAdjustment({
                pump_id: Number(selectedPump.id),
                item_id: itemId,
                reason,
                quantity: Number(quantity),
                notes: notes.trim() || undefined,
            });
            toast.success(
                isLoss
                    ? `Stock reduced by ${quantity} ${selectedItem?.unit ?? ''} (${REASON_META[reason].label})`
                    : `Stock increased by ${quantity} ${selectedItem?.unit ?? ''}`
            );
            setIsOpen(false);
            setItemId(0); setReason('damage'); setQuantity(''); setNotes('');
            load();
        } catch (e: any) {
            toast.error(e?.response?.data?.detail || 'Failed to save adjustment');
        } finally {
            setSubmitting(false);
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
                    <h2 className="text-sm font-extrabold text-text-primary">Stock Adjustments</h2>
                    <p className="text-xs text-text-secondary mt-0.5">Manual corrections for damage, loss, theft or other reasons</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer">
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-primary text-white rounded-xl cursor-pointer hover:bg-primary/90"
                    >
                        <Plus className="h-3.5 w-3.5" /> New Adjustment
                    </button>
                </div>
            </div>

            {/* ── Adjustments Table ───────────────────────────────── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center gap-2 p-10 text-slate-400 text-xs">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading adjustments...
                    </div>
                ) : adjustments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <SlidersHorizontal className="h-8 w-8 mb-3 opacity-30" />
                        <p className="font-bold text-sm">No adjustments yet</p>
                        <p className="text-xs mt-1">Adjustments for damage, loss or other reasons will appear here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 font-extrabold text-text-secondary">
                                    <th className="p-4 uppercase tracking-wider">Item</th>
                                    <th className="p-4 uppercase tracking-wider">Reason</th>
                                    <th className="p-4 uppercase tracking-wider">Qty Change</th>
                                    <th className="p-4 uppercase tracking-wider">Notes</th>
                                    <th className="p-4 uppercase tracking-wider">Date & Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-text-primary">
                                {adjustments.map(adj => {
                                    const meta = REASON_META[adj.reason];
                                    const isNeg = adj.quantity < 0;
                                    return (
                                        <tr key={adj.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 font-bold">{adj.item_name || `Item #${adj.item_id}`}</td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${meta.bg} ${meta.border} ${meta.color}`}>
                                                    {meta.label.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`flex items-center gap-1 font-extrabold font-mono text-sm ${isNeg ? 'text-red-600' : 'text-emerald-600'}`}>
                                                    {isNeg
                                                        ? <TrendingDown className="h-4 w-4" />
                                                        : <TrendingUp className="h-4 w-4" />}
                                                    {isNeg ? '' : '+'}{adj.quantity}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-400 max-w-[200px] truncate">{adj.notes || '—'}</td>
                                            <td className="p-4 text-slate-400 font-mono text-[11px]">{fmtDate(adj.created_at)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ════════ NEW ADJUSTMENT MODAL ════════ */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-150 text-left">
                        <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl cursor-pointer text-slate-400">
                            <X className="h-4 w-4" />
                        </button>

                        <div className="flex items-center gap-2.5 mb-5">
                            <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-orange-50 border border-orange-100 text-primary">
                                <SlidersHorizontal className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-extrabold text-slate-900">New Stock Adjustment</h2>
                                <p className="text-[10px] text-slate-400">Loss reasons will reduce inventory automatically</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">

                            {/* Item select */}
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Stock Item *</label>
                                <select
                                    value={itemId || ''}
                                    onChange={e => setItemId(Number(e.target.value))}
                                    className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none bg-white"
                                >
                                    <option value="">— Select Item —</option>
                                    {stockItems.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} {s.item_code ? `(${s.item_code})` : ''} — {s.current_quantity} {s.unit} available
                                        </option>
                                    ))}
                                </select>
                                {selectedItem && (
                                    <p className="text-[10px] text-slate-400 mt-1 ml-1">
                                        Current stock: <span className="font-bold text-slate-600">{selectedItem.current_quantity} {selectedItem.unit}</span>
                                    </p>
                                )}
                            </div>

                            {/* Reason selector */}
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">Reason *</label>
                                <div className="grid grid-cols-5 gap-1.5">
                                    {(Object.keys(REASON_META) as AdjustmentReason[]).map(r => {
                                        const m = REASON_META[r];
                                        return (
                                            <button
                                                key={r}
                                                type="button"
                                                onClick={() => setReason(r)}
                                                className={`py-2 px-1 text-[10px] font-bold rounded-xl border transition-all cursor-pointer text-center ${reason === r
                                                        ? `${m.bg} ${m.border} ${m.color} shadow-sm`
                                                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                                                    }`}
                                            >
                                                {m.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Loss warning */}
                                {isLoss && (
                                    <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-xl text-[11px] font-bold text-red-600">
                                        <TrendingDown className="h-3.5 w-3.5 flex-shrink-0" />
                                        This reason will REDUCE inventory (stored as negative)
                                    </div>
                                )}
                                {!isLoss && reason === 'other' && (
                                    <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl text-[11px] font-bold text-blue-600">
                                        <TrendingUp className="h-3.5 w-3.5 flex-shrink-0" />
                                        'Other' reason will INCREASE inventory
                                    </div>
                                )}
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                                    Quantity {selectedItem ? `(${selectedItem.unit})` : ''} *
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    placeholder="Enter positive number"
                                    value={quantity}
                                    onChange={e => setQuantity(e.target.value)}
                                    className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 font-mono"
                                />
                                {/* Live preview */}
                                {quantity && !isNaN(Number(quantity)) && Number(quantity) > 0 && (
                                    <div className={`mt-1.5 px-3 py-2 rounded-xl border text-[11px] font-bold flex justify-between ${isLoss ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                        }`}>
                                        <span>Adjustment quantity:</span>
                                        <span className="font-mono">{isLoss ? '-' : '+'}{quantity} {selectedItem?.unit ?? ''}</span>
                                    </div>
                                )}
                                {/* Overflow warning */}
                                {quantity && selectedItem && isLoss && Number(quantity) > selectedItem.current_quantity && (
                                    <div className="mt-1.5 px-3 py-2 bg-red-100 border border-red-200 rounded-xl text-[11px] font-bold text-red-700 flex items-center gap-2">
                                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                                        Exceeds available stock ({selectedItem.current_quantity} {selectedItem.unit}) — will be rejected by server
                                    </div>
                                )}
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Notes (Optional)</label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. Tank 2 spillage during delivery..."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setIsOpen(false)} className="flex-1 py-2.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className={`flex-1 py-2.5 text-xs font-bold text-white rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer transition-all ${isLoss ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'
                                        }`}
                                >
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : `Save ${isLoss ? 'Loss' : 'Adjustment'}`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}