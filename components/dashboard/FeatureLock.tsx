'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Lock, CreditCard } from 'lucide-react';

interface FeatureLockProps {
    featureName: string;   // e.g. "Inventory Management"
    planName?: string;     // e.g. "Starter" — current plan that's missing this feature
}

/**
 * Full-page lock screen — shown instead of page content when
 * backend returns 403 with code FEATURE_LOCKED or NO_SUBSCRIPTION.
 */
export function FeatureLock({ featureName, planName }: FeatureLockProps) {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white border border-slate-200 rounded-3xl max-w-lg mx-auto my-12">
            <div className="h-16 w-16 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center text-amber-500 mb-5">
                <Lock className="h-7 w-7" />
            </div>
            <h2 className="text-base font-extrabold text-slate-800 mb-1.5">
                {featureName} is Locked
            </h2>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-sm mb-6">
                {planName
                    ? `Your current plan ("${planName}") doesn't include ${featureName}. Upgrade to unlock it.`
                    : `You don't have an active subscription. Choose a plan to unlock ${featureName}.`}
            </p>
            <button
                onClick={() => router.push('/dashboard/subscription')}
                className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl cursor-pointer outline-none transition-colors shadow-lg shadow-orange-500/15"
            >
                <CreditCard className="h-4 w-4" />
                View Plans
            </button>
        </div>
    );
}

/**
 * Helper to parse the locked error shape from feature_gate.py.
 * Backend returns: { detail: { code, feature, plan, message, locked } }
 * Axios wraps this as err.response.data.detail (FastAPI) — but since
 * backendApi's interceptor already converts errors to Error(message),
 * we instead check the raw axios error before it's reformatted, OR
 * read err.message which will contain the JSON-stringified detail
 * if detail was an object. Safest: catch at call-site with try/catch
 * using the raw axios error (see usage example below).
 */
export function isFeatureLockedError(error: any): { locked: boolean; feature?: string; plan?: string; message?: string } {
    const detail = error?.response?.data?.detail;
    if (detail && typeof detail === 'object' && detail.locked) {
        return { locked: true, feature: detail.feature, plan: detail.plan, message: detail.message };
    }
    return { locked: false };
}