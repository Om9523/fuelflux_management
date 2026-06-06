'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, ArrowRight, Building2, Truck, Sliders } from 'lucide-react';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from '@/components/feedback/Toast';

// Form validation schema: handles email OR 10-digit Indian mobile numbers
const loginSchema = z.object({
  emailOrPhone: z
    .string()
    .min(1, 'Email or mobile number is required')
    .refine(
      (val) => {
        const isEmail = z.string().email().safeParse(val).success;
        // 10-digit Indian mobile number check (starts with 6-9)
        const isPhone = /^[6-9]\d{9}$/.test(val);
        return isEmail || isPhone;
      },
      {
        message: 'Enter a valid email address or a 10-digit mobile number',
      }
    ),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrPhone: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const result = await login(data.emailOrPhone, data.password, data.rememberMe);
      toast.success('Successfully logged in!');

      if (result.rolesCount === 1) {
        // Single role → get the active role from store and redirect directly
        const { activeRole } = useAuthStore.getState();
        const roleDashboardMap: Record<string, string> = {
          pump_owner: '/dashboard',
          logistic:   '/logistic/dashboard',
          investor:   '/investor',
          admin:      '/dashboard',
          employee:   '/dashboard',
        };
        const destination = roleDashboardMap[activeRole ?? ''] ?? '/dashboard';
        toast.info(`Welcome! Redirecting to your ${activeRole?.replace('_', ' ')} dashboard…`);
        router.push(destination);
      } else {
        // Multi-role → let user pick their role
        router.push('/select-role');
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
    }
  };


  const handleFillDemo = (email: string, pass: string, profileLabel: string) => {
    setValue('emailOrPhone', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
    toast.info(`Pre-filled credentials for ${profileLabel}`);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your credentials to access your FuelFlux dashboard"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full">
        {/* Email or Phone Input */}
        <Input
          {...register('emailOrPhone')}
          label="Email Address or Mobile Number"
          type="text"
          leftIcon={<Mail className="h-4 w-4" />}
          placeholder="you@fuelflux.com or 9876543210"
          error={errors.emailOrPhone?.message}
          disabled={isLoading}
        />

        {/* Password Input */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-primary tracking-wide">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-primary hover:text-primary-hover transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            {...register('password')}
            error={errors.password?.message}
            disabled={isLoading}
          />
        </div>

        {/* Remember Me Checkbox */}
        <label className="flex items-center gap-2 select-none cursor-pointer w-fit py-0.5">
          <input
            {...register('rememberMe')}
            type="checkbox"
            className="h-4 w-4 rounded border-slate-200 text-primary focus:ring-primary/20 accent-primary cursor-pointer"
            disabled={isLoading}
          />
          <span className="text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors">
            Remember my session
          </span>
        </label>

        {/* Server Error Alert */}
        {error && !errors.emailOrPhone && !errors.password && (
          <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs font-medium text-red-600 flex items-center gap-2 animate-fadeIn">
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {/* Sign In Button */}
        <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full mt-2 font-bold group">
          Sign In to Platform
          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>

        {/* Signup redirection link */}
        <div className="text-center text-xs font-medium text-text-secondary mt-1">
          New to FuelFlux?{' '}
          <Link href="/register" className="font-bold text-primary hover:text-primary-hover transition-colors">
            Create an Account
          </Link>
        </div>

        {/* Quick Access Demo Profiles Block */}
        <div className="mt-4 pt-5 border-t border-slate-100 flex flex-col gap-2.5">
          <span className="text-[10px] font-bold text-text-secondary tracking-widest uppercase text-center">
            One-Click Demo Profiles
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('owner@fuelflux.com', 'password123', 'Pump Owner')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50 hover:bg-orange-50 border border-slate-200/60 hover:border-primary/30 transition-all duration-200 cursor-pointer outline-none active:scale-95 group"
            >
              <Building2 className="h-4.5 w-4.5 text-primary mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-text-primary text-center">Owner</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('logistic@fuelflux.com', 'password123', 'Logistics Manager')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/60 hover:border-blue-500/30 transition-all duration-200 cursor-pointer outline-none active:scale-95 group"
            >
              <Truck className="h-4.5 w-4.5 text-blue-500 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-text-primary text-center">Logistics</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('multi@fuelflux.com', 'password123', 'Multi-Role Exec')}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/60 hover:border-emerald-500/30 transition-all duration-200 cursor-pointer outline-none active:scale-95 group"
            >
              <Sliders className="h-4.5 w-4.5 text-emerald-500 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-text-primary text-center">Multi-Role</span>
            </button>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}
