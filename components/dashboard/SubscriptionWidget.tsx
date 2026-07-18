'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, Clock, ChevronRight, Lock, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import backendApi from '@/lib/backendApi';

interface SubData {
    status: string;
    is_trial: boolean;
    trial_days_left: number | null;
    plan: { name: string; price_monthly: number } | null;
    features: Record<string, boolean>;
    end_date: string | null;
}

const FEATURE_LABELS: Record<string, string> = {
    sales: 'Sales', inventory: 'Inventory', crm: 'CRM', udhaar: 'Udhaar',
    analytics: 'Analytics', accounting: 'Accounting', logistic: 'Logistics',
};

export function SubscriptionWidget({ pumpId }: { pumpId: number | string }) {
    const router = useRouter();
    const [sub, setSub] = useState<SubData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!pumpId) return;
        backendApi.get(`/subscriptions/my-subscription?pump_id=${pumpId}`)
            .then(res => setSub(res.data.data))
            .catch(() => setSub(null))
            .finally(() => setLoading(false));
    }, [pumpId]);

    if (loading) {
        return <div className="bg-white border border-slate-100 rounded-2xl p-5 h-24 animate-pulse" />;
    }

    // No plan state
    if (!sub || sub.status === 'no_plan') {
        return (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                        <Lock className="h-5 w-5" />
                    </div>
                    <div>
                        <span className="text-sm font-extrabold text-amber-800 block">No Active Subscription</span>
                        <span className="text-xs text-amber-600 font-semibold">Choose a plan to unlock features for this pump.</span>
                    </div>
                </div>
                <button onClick={() => router.push('/dashboard/subscription')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl cursor-pointer outline-none shrink-0">
                    Choose Plan <ChevronRight className="h-3.5 w-3.5" />
                </button>
            </div>
        );
    }

    const isTrial = sub.is_trial;
    const featureList = Object.entries(sub.features || {}).filter(([k]) => FEATURE_LABELS[k]);

    return (
        <div className={`border rounded-2xl p-5 ${isTrial ? 'bg-blue-50 border-blue-100' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${isTrial ? 'bg-blue-500 text-white' : 'bg-orange-50 text-orange-500'}`}>
                        <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-slate-800">{sub.plan?.name || 'Plan'}</span>
                            {isTrial && (
                                <span className="text-[9px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full uppercase">Trial</span>
                            )}
                        </div>
                        <span className="text-xs text-slate-500 font-semibold">
                            {isTrial
                                ? `${sub.trial_days_left ?? 0} days left in trial`
                                : sub.end_date ? `Renews ${new Date(sub.end_date).toLocaleDateString('en-IN')}` : 'Active'}
                        </span>
                    </div>
                </div>

                {isTrial && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-white px-3 py-1.5 rounded-xl border border-blue-100">
                        <Clock className="h-3.5 w-3.5" />
                        {sub.trial_days_left ?? 0}d remaining
                    </div>
                )}
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-1.5 mt-4">
                {featureList.map(([key, enabled]) => (
                    <span key={key} className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border ${enabled ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                        {enabled ? <CheckCircle2 className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                        {FEATURE_LABELS[key]}
                    </span>
                ))}
            </div>

            <button onClick={() => router.push('/dashboard/subscription')}
                className="mt-4 flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-600 cursor-pointer outline-none">
                {sub.status === 'no_plan' ? 'Choose a plan' : 'Manage subscription'} <ChevronRight className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}