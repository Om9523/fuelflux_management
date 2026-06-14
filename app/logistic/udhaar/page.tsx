'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    CheckCircle,
    Coins,
    Building2,
    Car,
    TrendingUp,
    TrendingDown,
    IndianRupee,
    Clock,
    Fuel,
    RefreshCw,
} from 'lucide-react';
import backendApi from '@/lib/backendApi';
import { toast } from '@/components/feedback/Toast';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UsageSummary {
    customer_id: number;
    vehicle_plate: string;
    pump_id: number;
    pump_name: string;
    credit_limit: number;
    outstanding_amount: number;
    available_credit: number;
}

interface RecentTransaction {
    id: number;
    vehicle_id: number;
    pump_id: number;
    amount: number;
    volume: number | null;
    fuel_type: string | null;
    remarks: string | null;
    used_at: string | null;
}

interface OverspendAlert {
    id: number;
    vehicle_plate: string;
    pump_id: number;
    pump_name: string;
    credit_limit: number;
    amount_used: number;
    overspend_amount: number;
    created_at: string | null;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function LogisticUdhaarPage() {
    const [usageSummary, setUsageSummary] = useState<UsageSummary[]>([]);
    const [recentTxns, setRecentTxns] = useState<RecentTransaction[]>([]);
    const [alerts, setAlerts] = useState<OverspendAlert[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'summary' | 'history' | 'alerts'>('summary');

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [usageRes, alertsRes] = await Promise.all([
                backendApi.get('/udhaar/my-usage'),
                backendApi.get('/udhaar/my-alerts'),
            ]);
            setUsageSummary(usageRes.data.usage_summary || []);
            setRecentTxns(usageRes.data.recent_transactions || []);
            setAlerts(alertsRes.data || []);
        } catch (err: any) {
            console.error('[UdhaarPage] Failed to load data:', err);
            toast.error('Failed to load credit usage data.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // ─── Derived stats ──────────────────────────────────────────────────────────
    const totalCredit = usageSummary.reduce((s, u) => s + u.credit_limit, 0);
    const totalUsed = usageSummary.reduce((s, u) => s + u.outstanding_amount, 0);
    const totalAvailable = usageSummary.reduce((s, u) => s + u.available_credit, 0);

    // ─── Helpers ────────────────────────────────────────────────────────────────
    const usagePct = (used: number, limit: number) =>
        limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

    const usageColor = (pct: number) => {
        if (pct >= 100) return 'bg-red-500';
        if (pct >= 80) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    const usageTextColor = (pct: number) => {
        if (pct >= 100) return 'text-red-600';
        if (pct >= 80) return 'text-amber-600';
        return 'text-emerald-600';
    };

    // ─── Loading ────────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-10 bg-slate-200 rounded-xl w-1/3" />
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-28 bg-slate-200 rounded-2xl" />)}
                </div>
                <div className="h-64 bg-slate-200 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* ── Page Header ──────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Credit Usage & Udhaar
                    </h1>
                    <p className="text-sm font-semibold text-slate-400 mt-1">
                        Track credit usage across pump stations and manage overspend alerts
                    </p>
                </div>
                <button
                    onClick={loadData}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-orange-400 text-slate-600 hover:text-orange-500 rounded-xl text-sm font-bold transition-all cursor-pointer"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {/* ── Overspend Alert Banner ────────────────────────────────────────────── */}
            <AnimatePresence>
                {alerts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3"
                    >
                        <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-red-700">
                                {alerts.length} overspend {alerts.length === 1 ? 'alert' : 'alerts'} — action required
                            </p>
                            <p className="text-xs text-red-500 mt-0.5 font-medium">
                                Your vehicles have exceeded credit limits at some pumps. Submit payment to clear overspend first — remaining amount will become new credit.
                            </p>
                        </div>
                        <button
                            onClick={() => setActiveTab('alerts')}
                            className="shrink-0 text-xs font-bold text-red-600 hover:text-red-800 underline cursor-pointer"
                        >
                            View alerts
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Summary Cards ─────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Coins className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Credit</p>
                            <p className="text-xl font-black text-slate-900">₹{totalCredit.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Used / Outstanding</p>
                            <p className="text-xl font-black text-rose-600">₹{totalUsed.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <TrendingDown className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Available Credit</p>
                            <p className="text-xl font-black text-emerald-600">₹{totalAvailable.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
            <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm max-w-md select-none">
                {[
                    { id: 'summary', label: 'Pump-wise Summary' },
                    { id: 'history', label: 'Recent Transactions' },
                    { id: 'alerts', label: `Alerts${alerts.length > 0 ? ` (${alerts.length})` : ''}` },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
              flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer outline-none
              ${activeTab === tab.id
                                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                                : 'text-slate-500 hover:text-slate-800'
                            }
              ${tab.id === 'alerts' && alerts.length > 0 && activeTab !== 'alerts'
                                ? 'text-red-500 hover:text-red-700'
                                : ''
                            }
            `}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── Tab Content ──────────────────────────────────────────────────────── */}

            {/* SUMMARY TAB */}
            {activeTab === 'summary' && (
                <div className="space-y-4">
                    {usageSummary.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
                            <Coins className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                            <p className="font-semibold text-sm">No credit usage yet.</p>
                            <p className="text-xs mt-1">Once your vehicles fuel at a pump on credit, usage will appear here.</p>
                        </div>
                    ) : (
                        usageSummary.map((item) => {
                            const pct = usagePct(item.outstanding_amount, item.credit_limit);
                            const isOverspent = item.outstanding_amount > item.credit_limit;

                            return (
                                <div
                                    key={`${item.vehicle_plate}_${item.pump_id}`}
                                    className={`bg-white border rounded-2xl p-5 shadow-sm ${isOverspent ? 'border-red-200' : 'border-slate-200'}`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                        {/* Vehicle + Pump info */}
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isOverspent ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'}`}>
                                                <Car className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 font-mono">{item.vehicle_plate}</p>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <Building2 className="h-3 w-3 text-slate-400" />
                                                    <p className="text-xs text-slate-500 font-medium">{item.pump_name}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status badge */}
                                        {isOverspent ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-full">
                                                <AlertTriangle className="h-3.5 w-3.5" />
                                                Overspent by ₹{(item.outstanding_amount - item.credit_limit).toLocaleString('en-IN')}
                                            </span>
                                        ) : pct >= 80 ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-600 text-xs font-bold rounded-full">
                                                <AlertTriangle className="h-3.5 w-3.5" />
                                                High usage — {pct}%
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-bold rounded-full">
                                                <CheckCircle className="h-3.5 w-3.5" />
                                                Within limit — {pct}%
                                            </span>
                                        )}
                                    </div>

                                    {/* Progress bar */}
                                    <div className="w-full bg-slate-100 rounded-full h-2.5 mb-3 overflow-hidden">
                                        <div
                                            className={`h-2.5 rounded-full transition-all ${usageColor(pct)}`}
                                            style={{ width: `${Math.min(pct, 100)}%` }}
                                        />
                                    </div>

                                    {/* Numbers */}
                                    <div className="grid grid-cols-3 gap-4 text-xs">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Credit Limit</p>
                                            <p className="font-black text-slate-800 font-mono mt-0.5">₹{item.credit_limit.toLocaleString('en-IN')}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Used</p>
                                            <p className={`font-black font-mono mt-0.5 ${usageTextColor(pct)}`}>
                                                ₹{item.outstanding_amount.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Available</p>
                                            <p className="font-black text-emerald-600 font-mono mt-0.5">
                                                ₹{Math.max(0, item.available_credit).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                    <th className="px-5 py-3">Date</th>
                                    <th className="px-5 py-3">Pump</th>
                                    <th className="px-5 py-3">Fuel</th>
                                    <th className="px-5 py-3 text-right">Volume</th>
                                    <th className="px-5 py-3 text-right">Amount</th>
                                    <th className="px-5 py-3">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                                {recentTxns.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                                            No transactions yet.
                                        </td>
                                    </tr>
                                ) : recentTxns.map((txn) => (
                                    <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5 text-slate-300" />
                                                {txn.used_at || '—'}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-slate-600">
                                            <div className="flex items-center gap-1.5">
                                                <Building2 className="h-3.5 w-3.5 text-slate-300" />
                                                Pump #{txn.pump_id}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            {txn.fuel_type ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-100 rounded text-[10px] font-bold uppercase">
                                                    <Fuel className="h-3 w-3" />
                                                    {txn.fuel_type}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td className="px-5 py-3 text-right font-mono text-slate-600">
                                            {txn.volume ? `${txn.volume} L` : '—'}
                                        </td>
                                        <td className="px-5 py-3 text-right font-black text-rose-600 font-mono">
                                            ₹{txn.amount.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-5 py-3 text-slate-400 truncate max-w-[160px]">
                                            {txn.remarks || '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ALERTS TAB */}
            {activeTab === 'alerts' && (
                <div className="space-y-4">
                    {alerts.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
                            <CheckCircle className="h-10 w-10 mx-auto mb-3 text-emerald-300" />
                            <p className="font-semibold text-sm">No overspend alerts.</p>
                            <p className="text-xs mt-1">All your vehicles are within their credit limits.</p>
                        </div>
                    ) : (
                        alerts.map((alert) => (
                            <motion.div
                                key={alert.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                            <AlertTriangle className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-sm font-black text-red-800 font-mono">{alert.vehicle_plate}</p>
                                                <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                                    OVERSPENT
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <Building2 className="h-3 w-3 text-red-400" />
                                                <p className="text-xs text-red-600 font-medium">{alert.pump_name}</p>
                                            </div>
                                            {alert.created_at && (
                                                <p className="text-[10px] text-red-400 mt-1">{alert.created_at}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Amounts */}
                                    <div className="grid grid-cols-3 gap-3 text-xs shrink-0">
                                        <div className="text-center">
                                            <p className="text-[9px] font-bold text-red-400 uppercase">Limit</p>
                                            <p className="font-black text-red-700 font-mono mt-0.5">
                                                ₹{alert.credit_limit.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[9px] font-bold text-red-400 uppercase">Used</p>
                                            <p className="font-black text-red-700 font-mono mt-0.5">
                                                ₹{alert.amount_used.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div className="text-center bg-red-100 border border-red-200 rounded-xl px-3 py-1">
                                            <p className="text-[9px] font-bold text-red-500 uppercase">Over by</p>
                                            <p className="font-black text-red-600 font-mono mt-0.5">
                                                ₹{alert.overspend_amount.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* CTA */}
                                <div className="mt-4 pt-4 border-t border-red-200 flex items-center justify-between gap-3">
                                    <p className="text-xs text-red-500 font-medium">
                                        Submit payment ≥ ₹{alert.overspend_amount.toLocaleString('en-IN')} to clear overspend. Remaining amount will become new credit limit.
                                    </p>
                                    <a
                                        href="/logistic/wallet"
                                        className="shrink-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                                    >
                                        Pay Now
                                    </a>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}