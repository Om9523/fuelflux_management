'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Script from 'next/script';
import { Check, X, Crown, Zap, Clock, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { usePumpStore } from '@/stores/pumps.store';
import { toast } from '@/components/feedback/Toast';
import backendApi from '@/lib/backendApi';

interface Plan {
    id: string;
    name: string;
    description: string;
    price_monthly: number;
    price_annual: number | null;
    features: Record<string, boolean>;
    limits: { max_staff: number; max_pumps: number; max_tanks: number; report_history_days: number };
}

interface CurrentSub {
    status: string;
    is_trial: boolean;
    trial_days_left: number | null;
    plan: { name: string } | null;
}

const FEATURE_LABELS: Record<string, string> = {
    sales: 'Sales Register', inventory: 'Inventory Management', crm: 'Customer CRM',
    udhaar: 'Credit / Udhaar System', analytics: 'Analytics & Reports', accounting: 'Accounting Module',
    logistic: 'Logistics Integration', multi_pump: 'Multiple Pumps', api_access: 'API Access',
    priority_support: 'Priority Support',
};

declare global { interface Window { Razorpay: any; } }

export default function SubscriptionPlansPage() {
    const { selectedPump } = usePumpStore();
    const pumpId = selectedPump?.id;

    const [plans, setPlans] = useState<Plan[]>([]);
    const [currentSub, setCurrentSub] = useState<CurrentSub | null>(null);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
    const [loading, setLoading] = useState(true);
    const [payingId, setPayingId] = useState<string | null>(null);
    const [rzpReady, setRzpReady] = useState(false);

    const fetchData = useCallback(async () => {
        if (!pumpId) return;
        setLoading(true);
        try {
            const [plansRes, subRes] = await Promise.all([
                backendApi.get('/subscriptions/plans'),
                backendApi.get(`/subscriptions/my-subscription?pump_id=${pumpId}`),
            ]);
            setPlans(plansRes.data.data?.plans || []);
            setCurrentSub(subRes.data.data);
        } catch {
            toast.error('Failed to load plans.');
        } finally { setLoading(false); }
    }, [pumpId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubscribe = async (plan: Plan) => {
        if (!pumpId) { toast.error('No pump selected.'); return; }

        setPayingId(plan.id);
        try {
            // 1. Create order (real or mock)
            const orderRes = await backendApi.post('/subscriptions/create-order', {
                pump_id: pumpId, plan_id: plan.id, billing_cycle: billingCycle,
            });

            // Backend returns { success, data: { order_id, amount, ... , mock? } }
            const orderData = orderRes.data?.data ?? orderRes.data;
            const { order_id, amount, currency, key_id, plan_name } = orderData;
            const isMock: boolean = !!orderRes.data?.mock || !!orderData?.mock;

            if (isMock) {
                // DEV: skip Razorpay UI, directly activate
                await backendApi.post('/subscriptions/verify-payment', {
                    razorpay_order_id:   order_id,
                    razorpay_payment_id: `mock_pay_${Date.now()}`,
                    razorpay_signature:  'mock_sig',
                    pump_id: pumpId, plan_id: plan.id, billing_cycle: billingCycle,
                });
                toast.success(`${plan.name} activated! 🎉`);
                await fetchData();
                setPayingId(null);
                return;
            }

            // 2. Real Razorpay — guard against script not loaded yet
            if (!window.Razorpay) {
                toast.error('Payment gateway not ready yet. Please try again in a moment.');
                setPayingId(null);
                return;
            }

            const options = {
                key: key_id,
                amount,
                currency,
                order_id,
                name: 'FuelFlux',
                description: `${plan_name} — ${billingCycle} subscription`,
                theme: { color: '#f97316' },
                handler: async (response: any) => {
                    try {
                        await backendApi.post('/subscriptions/verify-payment', {
                            razorpay_order_id:   response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature:  response.razorpay_signature,
                            pump_id: pumpId, plan_id: plan.id, billing_cycle: billingCycle,
                        });
                        toast.success(`${plan.name} plan activated! 🎉`);
                        await fetchData();
                    } catch {
                        toast.error('Payment verification failed. Contact support.');
                    } finally {
                        setPayingId(null);
                    }
                },
                modal: {
                    ondismiss: () => setPayingId(null),
                    escape: true,
                },
                prefill: {},
                retry: { enabled: false },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', () => {
                toast.error('Payment failed. Please try again.');
                setPayingId(null);
            });
            rzp.open();

        } catch (e: any) {
            toast.error(e.message || 'Failed to initiate payment.');
            setPayingId(null);
        }
    };

    const isCurrentPlan = (planName: string) =>
        currentSub?.plan?.name === planName && currentSub?.status !== 'no_plan';

    return (
        <div className="space-y-6">
            {/* Load Razorpay eagerly so it's ready on first click */}
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="afterInteractive"
                onLoad={() => setRzpReady(true)}
                onError={() => toast.error('Failed to load payment gateway.')}
            />



            {/* Header */}
            <div className="text-center space-y-2 max-w-xl mx-auto">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Choose Your Plan</h1>
                <p className="text-xs text-slate-500 font-semibold">
                    Unlock powerful features for your station. Upgrade or downgrade anytime.
                </p>
            </div>

            {/* Current Plan Banner */}
            {currentSub && currentSub.status !== 'no_plan' && (
                <div className={`max-w-2xl mx-auto rounded-2xl p-4 flex items-center justify-center gap-2 text-xs font-bold ${currentSub.is_trial ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                    <Clock className="h-4 w-4" />
                    {currentSub.is_trial
                        ? `You're on a free trial of "${currentSub.plan?.name}" — ${currentSub.trial_days_left} days remaining`
                        : `Current plan: "${currentSub.plan?.name}" — Active`}
                </div>
            )}

            {/* Billing toggle */}
            <div className="flex justify-center">
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                    {(['monthly', 'annual'] as const).map(cycle => (
                        <button key={cycle} onClick={() => setBillingCycle(cycle)}
                            className={`px-5 py-2 rounded-lg text-xs font-bold capitalize cursor-pointer outline-none transition-all ${billingCycle === cycle ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
                            {cycle} {cycle === 'annual' && <span className="text-emerald-500 ml-1">Save</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Plans Grid */}
            {loading ? (
                <div className="text-center py-16 text-xs font-bold text-slate-400">Loading plans...</div>
            ) : plans.length === 0 ? (
                <div className="text-center py-16 text-xs font-bold text-slate-400">No plans available yet. Contact admin.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
                    {plans.map((plan, idx) => {
                        const price = billingCycle === 'annual' && plan.price_annual ? plan.price_annual : plan.price_monthly;
                        const isPro = idx === 1; // Middle plan highlighted
                        const isCurrent = isCurrentPlan(plan.name);
                        const featureList = Object.entries(plan.features).filter(([k]) => FEATURE_LABELS[k]);

                        return (
                            <div key={plan.id} className={`relative rounded-3xl p-6 border-2 flex flex-col ${isPro ? 'border-orange-400 bg-orange-50/30 shadow-xl scale-[1.02]' : 'border-slate-200 bg-white'}`}>
                                {isPro && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[9px] font-extrabold px-3 py-1 rounded-full uppercase flex items-center gap-1">
                                        <Crown className="h-3 w-3" /> Most Popular
                                    </span>
                                )}

                                <div className="text-center space-y-1 mb-5">
                                    <h3 className="text-base font-extrabold text-slate-800">{plan.name}</h3>
                                    <p className="text-[11px] text-slate-400 font-semibold">{plan.description}</p>
                                </div>

                                <div className="text-center mb-6">
                                    <span className="text-3xl font-extrabold text-slate-900">₹{price.toLocaleString('en-IN')}</span>
                                    <span className="text-xs text-slate-400 font-bold">/{billingCycle === 'annual' ? 'year' : 'month'}</span>
                                </div>

                                <div className="space-y-2.5 flex-1 mb-6">
                                    {featureList.map(([key, enabled]) => (
                                        <div key={key} className={`flex items-center gap-2 text-xs font-semibold ${enabled ? 'text-slate-700' : 'text-slate-300'}`}>
                                            {enabled ? <Check className="h-4 w-4 text-emerald-500 shrink-0" /> : <X className="h-4 w-4 text-slate-300 shrink-0" />}
                                            {FEATURE_LABELS[key]}
                                        </div>
                                    ))}
                                    <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-semibold space-y-1">
                                        <div>👤 Up to {plan.limits.max_staff || 'unlimited'} staff</div>
                                        <div>⛽ Up to {plan.limits.max_pumps || 'unlimited'} pumps</div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleSubscribe(plan)}
                                    disabled={payingId === plan.id || isCurrent}
                                    className={`w-full py-3 rounded-xl text-xs font-bold cursor-pointer outline-none transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed ${isCurrent
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                            : isPro
                                                ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'
                                                : 'bg-slate-800 hover:bg-slate-900 text-white'
                                        }`}
                                >
                                    {payingId === plan.id ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                                    ) : isCurrent ? (
                                        <><Check className="h-4 w-4" /> Current Plan</>
                                    ) : (
                                        <><CreditCard className="h-4 w-4" /> Subscribe Now</>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}