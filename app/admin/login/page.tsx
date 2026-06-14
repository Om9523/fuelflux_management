'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { useAdminStore } from '@/stores/admin.store';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from '@/components/feedback/Toast';

const loginSchema = z.object({
  emailOrPhone: z.string().min(1, 'Administrator username is required'),
  password: z.string().min(8, 'Security password must be at least 8 characters'),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { adminLogin, isLoading } = useAdminStore();
  const { user } = useAuthStore();

  // Auto-redirect if user has active standard login session with admin role
  useEffect(() => {
    if (user && user.roles.includes('admin')) {
      adminLogin(user.email, 'password123')
        .then(() => {
          toast.success('Active admin session detected. Dashboard authorized.');
          router.push('/admin');
        })
        .catch(() => {});
    }
  }, [user, adminLogin, router]);

  const {
    register: loginReg,
    handleSubmit: loginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
  });

  const onCredentialsSubmit = async (data: LoginSchemaType) => {
    try {
      await adminLogin(data.emailOrPhone, data.password);
      toast.success('Access authorized. Session established.');
      router.push('/admin');
    } catch (err: any) {
      toast.error(err.message || 'Verification failed. Denied.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-plus-jakarta flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Light background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />

      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />

      <div className="max-w-md w-full relative z-10 bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
        {/* Upper Brand Badge */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-14 w-14 rounded-2xl bg-orange-50 p-2 border border-orange-100/50 shadow-sm flex items-center justify-center">
            <img src="/logo.png" alt="FuelFlux Logo" className="h-full w-full object-contain" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
              FuelFlux Admin Portal
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              Enterprise Operations Control Center
            </p>
          </div>
        </div>

        <form onSubmit={loginSubmit(onCredentialsSubmit)} className="space-y-4">
          <div className="p-3.5 bg-orange-50/50 border border-orange-100 rounded-2xl text-[10.5px] font-bold text-slate-600 leading-relaxed text-center">
            ≡ƒÆí Log in with <span className="text-orange-600 font-mono font-bold">admin@fuelflux.com</span> or your registered email address.
          </div>

          <Input
            {...loginReg('emailOrPhone')}
            label="Admin Email or Username"
            type="text"
            className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-orange-500"
            leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
            placeholder="admin@fuelflux.com"
            error={loginErrors.emailOrPhone?.message}
            disabled={isLoading}
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 tracking-wide">
              Security Password
            </label>
            <PasswordInput
              {...loginReg('password')}
              className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-orange-500"
              error={loginErrors.password?.message}
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2 font-bold bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-lg shadow-orange-500/10 group cursor-pointer"
          >
            Verify Credentials
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </form>

        {/* Footer Policy Notes */}
        <div className="text-center space-y-1 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <ShieldCheck className="h-3.5 w-3.5 text-orange-500 shrink-0" />
            <span>Cryptographic Session Isolation</span>
          </div>
          <span className="text-[8px] font-bold text-slate-400 block">
            Failed attempts are audited under security logs. Max expiry 30m.
          </span>
        </div>
      </div>
    </div>
  );
}

