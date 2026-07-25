'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Fuel, Eye, EyeOff, LogIn, ShieldAlert } from 'lucide-react';
import { useEmployeeStore } from '@/stores/employee.store';
import { toast } from '@/components/feedback/Toast';

export default function EmployeeLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, isLoading, isLoggedIn, initUser } = useEmployeeStore();

    const [form, setForm] = useState({ employee_id: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    // Step 1: load user from localStorage, then mark hydrated
    useEffect(() => {
        initUser();
        setHydrated(true);
    }, []);

    // Step 2: only redirect AFTER hydration — prevents auto-login from stale session
    useEffect(() => {
        if (hydrated && isLoggedIn) router.replace('/employee');
    }, [hydrated, isLoggedIn]);


    useEffect(() => {
        if (searchParams.get('expired') === 'true') {
            toast.error('Session expired. Please login again.');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.employee_id.trim() || !form.password.trim()) {
            toast.error('Please enter Employee ID and password.');
            return;
        }
        try {
            await login({ employee_id: form.employee_id.trim(), password: form.password });
            toast.success('Welcome back!');
            router.replace('/employee');
        } catch (err: any) {
            toast.error(err.message || 'Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-orange-500 shadow-lg shadow-orange-200 mb-4">
                        <Fuel className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">FuelFlux</h1>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Employee Self-Service Portal</p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-100 p-8">
                    <div className="mb-6">
                        <h2 className="text-lg font-extrabold text-slate-800">Employee Login</h2>
                        <p className="text-xs text-slate-400 font-medium mt-1">
                            Use the Employee ID and password provided by your pump owner.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                Employee ID
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. FF-001"
                                value={form.employee_id}
                                onChange={(e) => setForm((f) => ({ ...f, employee_id: e.target.value }))}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                                autoComplete="username"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                                    className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                                    autoComplete="current-password"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((s) => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="mt-2 w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md shadow-orange-100 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isLoading ? (
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <LogIn className="h-4 w-4" />
                            )}
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-xl p-3">
                        <ShieldAlert className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-semibold text-slate-500 leading-relaxed">
                            Forgot your password? Contact your pump owner to reset it.
                            This portal is for authorised pump staff only.
                        </p>
                    </div>
                </div>

                <p className="text-center text-[10px] text-slate-400 font-medium mt-6">
                    Are you a pump owner?{' '}
                    <a href="/login" className="text-orange-500 font-bold hover:underline">
                        Login here
                    </a>
                </p>
            </div>
        </div>
    );
}