'use client';

/**
 * FILE: app/dashboard/inventory/components/StockSummaryTab.tsx
 * Stock Summary — aggregated report with global filters.
 * Columns: Opening | Purchase | Sales | Adjustment | Closing
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    BarChart3, RefreshCw, Loader2, AlertCircle,
    TrendingUp, TrendingDown, Package, IndianRupee, Filter,
} from 'lucide-react';
import { toast } from '@/components/feedback/Toast';
import { usePumpStore } from '@/stores/pumps.store';
import {
    fetchStockSummary, fetchItemGroups,
    StockSummaryResponse, StockSummaryRow, ItemGroup,
} from '@/services/inventory.service';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtQty(n: number, unit: string) {
    return `${n.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ${unit}`;
}
function fmtVal(n: number) {
    return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function SummaryStatCard({
    label, value, sub, icon, color,
}: {
    label: string; value: string; sub?: string;
    icon: React.ReactNode; color: string;
}) {
    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex items-start gap-4 text-left">
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="text-lg font-extrabold text-slate-900 mt-0.5">{value}</p>
                {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StockSummaryTab() {
    const { selectedPump } = usePumpStore();
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<StockSummaryResponse | null>(null);
    const [groups, setGroups] = useState<ItemGroup[]>([]);

    // Filters — persistent across renders (same tab, same session)
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [groupId, setGroupId] = useState<string>('');
    const [category, setCategory] = useState('');

    // ── Load ──────────────────────────────────────────────────────────────────

    const load = useCallback(async () => {
        if (!selectedPump?.id) return;
        setLoading(true);
        try {
            const [s, g] = await Promise.all([
                fetchStockSummary(selectedPump.id, {
                    date_from: dateFrom || undefined,
                    date_to: dateTo || undefined,
                    group_id: groupId || undefined,
                    category: category || undefined,
                }),
                fetchItemGroups(selectedPump.id),
            ]);
            setSummary(s);
            setGroups(g);
        } catch {
            toast.error('Failed to load stock summary');
        } finally {
            setLoading(false);
        }
    }, [selectedPump?.id, dateFrom, dateTo, groupId, category]);

    useEffect(() => { load(); }, [load]);

    // ── Unique categories from summary rows ────────────────────────────────────
    const categories = summary
        ? Array.from(new Set(summary.items.map(r => r.category).filter(Boolean))) as string[]
        : [];

    // ── Top-level stats ────────────────────────────────────────────────────────
    const totalPurchaseQty = summary?.items.reduce((s, r) => s + r.purchase_quantity, 0) ?? 0;
    const totalAdjQty = summary?.items.reduce((s, r) => s + r.adjustment_quantity, 0) ?? 0;
    const totalClosingValue = summary?.total_closing_value ?? 0;
    const totalItems = summary?.items.length ?? 0;

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
                    <h2 className="text-sm font-extrabold text-text-primary">Stock Summary</h2>
                    <p className="text-xs text-text-secondary mt-0.5">
                        Opening → Purchases → Sales → Adjustments → Closing
                    </p>
                </div>
                <button
                    onClick={load}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer disabled:opacity-50"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* ── Global Filter Engine ────────────────────────────── */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                    <Filter className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Filters</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Date From</label>
                        <input type="date"
                            value={dateFrom}
                            onChange={e => setDateFrom(e.target.value)}
                            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Date To</label>
                        <input type="date"
                            value={dateTo}
                            onChange={e => setDateTo(e.target.value)}
                            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Group</label>
                        <select
                            value={groupId}
                            onChange={e => setGroupId(e.target.value)}
                            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none bg-white"
                        >
                            <option value="">All Groups</option>
                            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                        <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none bg-white"
                        >
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                {(dateFrom || dateTo || groupId || category) && (
                    <button
                        onClick={() => { setDateFrom(''); setDateTo(''); setGroupId(''); setCategory(''); }}
                        className="mt-3 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                    >
                        Clear all filters
                    </button>
                )}
            </div>

            {/* ── Stat Cards ──────────────────────────────────────── */}
            {!loading && summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <SummaryStatCard
                        label="Total Items"
                        value={String(totalItems)}
                        sub="active stock items"
                        icon={<Package className="h-5 w-5 text-blue-600" />}
                        color="bg-blue-50 border border-blue-100"
                    />
                    <SummaryStatCard
                        label="Closing Valuation"
                        value={fmtVal(totalClosingValue)}
                        sub="current stock value"
                        icon={<IndianRupee className="h-5 w-5 text-emerald-600" />}
                        color="bg-emerald-50 border border-emerald-100"
                    />
                    <SummaryStatCard
                        label="Total Purchases"
                        value={totalPurchaseQty.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                        sub="units purchased"
                        icon={<TrendingUp className="h-5 w-5 text-violet-600" />}
                        color="bg-violet-50 border border-violet-100"
                    />
                    <SummaryStatCard
                        label="Net Adjustments"
                        value={(totalAdjQty >= 0 ? '+' : '') + totalAdjQty.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                        sub={totalAdjQty < 0 ? 'net stock loss' : 'net stock gain'}
                        icon={<TrendingDown className={`h-5 w-5 ${totalAdjQty < 0 ? 'text-red-500' : 'text-emerald-500'}`} />}
                        color={totalAdjQty < 0 ? 'bg-red-50 border border-red-100' : 'bg-emerald-50 border border-emerald-100'}
                    />
                </div>
            )}

            {/* ── Summary Table ───────────────────────────────────── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center gap-2 p-10 text-slate-400 text-xs">
                        <Loader2 className="h-4 w-4 animate-spin" /> Building summary...
                    </div>
                ) : !summary || summary.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <BarChart3 className="h-8 w-8 mb-3 opacity-30" />
                        <p className="font-bold text-sm">No data found</p>
                        <p className="text-xs mt-1">Try adjusting your filters or add stock purchases first.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 font-extrabold text-text-secondary">
                                    {/* Item info */}
                                    <th className="p-4 uppercase tracking-wider">Item</th>
                                    <th className="p-4 uppercase tracking-wider">Group</th>
                                    {/* Opening */}
                                    <th className="p-4 uppercase tracking-wider bg-slate-100/60 text-center" colSpan={2}>
                                        Opening
                                    </th>
                                    {/* Movements */}
                                    <th className="p-4 uppercase tracking-wider text-center">Purchases</th>
                                    <th className="p-4 uppercase tracking-wider text-center">Sales</th>
                                    <th className="p-4 uppercase tracking-wider text-center">Adjustments</th>
                                    {/* Closing */}
                                    <th className="p-4 uppercase tracking-wider bg-emerald-50/60 text-center" colSpan={2}>
                                        Closing
                                    </th>
                                    <th className="p-4 uppercase tracking-wider text-center">Avg Rate</th>
                                </tr>
                                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400">
                                    <th className="px-4 pb-2" colSpan={2}></th>
                                    <th className="px-4 pb-2 bg-slate-100/60 text-center">Qty</th>
                                    <th className="px-4 pb-2 bg-slate-100/60 text-center">Value</th>
                                    <th className="px-4 pb-2 text-center">Qty</th>
                                    <th className="px-4 pb-2 text-center">Qty</th>
                                    <th className="px-4 pb-2 text-center">Qty</th>
                                    <th className="px-4 pb-2 bg-emerald-50/60 text-center">Qty</th>
                                    <th className="px-4 pb-2 bg-emerald-50/60 text-center">Value</th>
                                    <th className="px-4 pb-2 text-center">(₹/unit)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-text-primary">
                                {summary.items.map((row: StockSummaryRow) => (
                                    <tr key={row.item_id} className="hover:bg-slate-50/50 transition-colors">
                                        {/* Item */}
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold">{row.item_name}</span>
                                                {row.item_code && (
                                                    <span className="text-[10px] font-mono text-slate-400">{row.item_code}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-400">{row.group_name || '—'}</td>

                                        {/* Opening */}
                                        <td className="p-4 text-center bg-slate-50/40 font-mono">
                                            {fmtQty(row.opening_quantity, row.unit)}
                                        </td>
                                        <td className="p-4 text-center bg-slate-50/40 font-mono text-slate-500">
                                            {fmtVal(row.opening_value)}
                                        </td>

                                        {/* Purchases */}
                                        <td className="p-4 text-center">
                                            <span className="font-bold text-violet-600 font-mono">
                                                +{fmtQty(row.purchase_quantity, row.unit)}
                                            </span>
                                        </td>

                                        {/* Sales */}
                                        <td className="p-4 text-center">
                                            {row.sales_quantity > 0 ? (
                                                <span className="font-bold text-blue-600 font-mono">
                                                    -{fmtQty(row.sales_quantity, row.unit)}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300">—</span>
                                            )}
                                        </td>

                                        {/* Adjustments */}
                                        <td className="p-4 text-center">
                                            {row.adjustment_quantity === 0 ? (
                                                <span className="text-slate-300">—</span>
                                            ) : (
                                                <span className={`font-bold font-mono ${row.adjustment_quantity < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                    {row.adjustment_quantity > 0 ? '+' : ''}{fmtQty(row.adjustment_quantity, row.unit)}
                                                </span>
                                            )}
                                        </td>

                                        {/* Closing */}
                                        <td className="p-4 text-center bg-emerald-50/30">
                                            <span className={`font-extrabold font-mono ${row.closing_quantity === 0 ? 'text-slate-300' : 'text-slate-800'}`}>
                                                {fmtQty(row.closing_quantity, row.unit)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center bg-emerald-50/30">
                                            <span className="font-extrabold font-mono text-emerald-700">
                                                {fmtVal(row.closing_value)}
                                            </span>
                                        </td>

                                        {/* Avg Rate */}
                                        <td className="p-4 text-center font-mono text-slate-500">
                                            {fmtVal(row.average_rate)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                            {/* Footer total row */}
                            <tfoot>
                                <tr className="bg-slate-50 border-t-2 border-slate-200 font-extrabold text-slate-700">
                                    <td className="p-4" colSpan={2}>TOTAL</td>
                                    <td className="p-4 text-center bg-slate-100/60">—</td>
                                    <td className="p-4 text-center bg-slate-100/60 font-mono">
                                        {fmtVal(summary.items.reduce((s, r) => s + r.opening_value, 0))}
                                    </td>
                                    <td className="p-4 text-center font-mono text-violet-600">
                                        +{summary.items.reduce((s, r) => s + r.purchase_quantity, 0).toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                                    </td>
                                    <td className="p-4 text-center font-mono text-blue-600">
                                        -{summary.items.reduce((s, r) => s + r.sales_quantity, 0).toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                                    </td>
                                    <td className="p-4 text-center font-mono text-red-500">
                                        {summary.items.reduce((s, r) => s + r.adjustment_quantity, 0).toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                                    </td>
                                    <td className="p-4 text-center bg-emerald-50/30 font-mono">—</td>
                                    <td className="p-4 text-center bg-emerald-50/30 font-mono text-emerald-700 text-sm">
                                        {fmtVal(totalClosingValue)}
                                    </td>
                                    <td className="p-4"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}