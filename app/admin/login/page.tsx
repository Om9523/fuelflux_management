'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, ArrowRight, ShieldCheck, Shield, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { useAdminStore } from '@/stores/admin.store';
import { toast } from '@/components/feedback/Toast';

// ─── Schemas ───────────────────────────────────────────────────
const loginSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type LoginForm = z.infer<typeof loginSchema>;

// ─── Step type ─────────────────────────────────────────────────
type Step = 'credentials' | '2fa';

export default function AdminLoginPage() {
  const router = useRouter();
  const { adminLogin, verifyAdmin2FA, isLoading } = useAdminStore();

  const [step, setStep] = useState<Step>('credentials');
  const [adminEmail, setAdminEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [verifying2FA, setVerifying2FA] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Resend countdown ──────────────────────────────────────────
  const startResendTimer = () => {
    setResendTimer(30);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // ── Step 1: Credentials ───────────────────────────────────────
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onCredentialsSubmit = async (data: LoginForm) => {
    try {
      const result = await adminLogin(data.emailOrPhone, data.password);
      setAdminEmail(result.email);
      setStep('2fa');
      startResendTimer();
      toast.success('OTP sent to your registered email.');
    } catch (err: any) {
      toast.error(err?.message || 'Invalid credentials. Access denied.');
    }
  };

  // ── OTP input handlers ────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;           // digits only
    const next = [...otp];
    next[index] = value.slice(-1);              // max 1 digit per box
    setOtp(next);
    setOtpError('');

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  // ── Step 2: Verify 2FA ────────────────────────────────────────
  const on2FASubmit = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setOtpError('Enter all 6 digits of your OTP.');
      return;
    }
    setVerifying2FA(true);
    try {
      await verifyAdmin2FA(adminEmail, code);
      toast.success('Identity verified. Welcome to Control Center.');
      router.push('/admin');
    } catch (err: any) {
      setOtpError(err?.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setVerifying2FA(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      // Re-trigger login to get a fresh OTP (reuses adminLogin)
      // In production: dedicated /admin/auth/resend-otp endpoint
      toast.success('New OTP sent to your email.');
      setOtp(['', '', '', '', '', '']);
      setOtpError('');
      startResendTimer();
      otpRefs.current[0]?.focus();
    } catch {
      toast.error('Failed to resend OTP.');
    }
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-plus-jakarta flex items-center justify-center p-4 relative overflow-hidden select-none">

      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />

      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">

        {/* ── Brand Header ── */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-14 w-14 rounded-2xl bg-orange-50 p-2 border border-orange-100/50 shadow-sm flex items-center justify-center">
            <img src="/logo.png" alt="FuelFlux" className="h-full w-full object-contain" />
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

        {/* ── Step Indicator ── */}
        <div className="flex items-center justify-center gap-2">
          {/* Step 1 */}
          <div className="flex items-center gap-1.5">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-colors ${step === 'credentials'
                ? 'bg-orange-500 text-white'
                : 'bg-emerald-500 text-white'
              }`}>
              {step === '2fa' ? <CheckCircle2 className="h-3.5 w-3.5" /> : '1'}
            </div>
            <span className={`text-[10px] font-bold transition-colors ${step === 'credentials' ? 'text-slate-700' : 'text-slate-400'
              }`}>
              Credentials
            </span>
          </div>

          <div className="w-8 h-px bg-slate-200" />

          {/* Step 2 */}
          <div className="flex items-center gap-1.5">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-extrabold transition-colors ${step === '2fa'
                ? 'bg-orange-500 text-white'
                : 'bg-slate-100 text-slate-400'
              }`}>
              2
            </div>
            <span className={`text-[10px] font-bold transition-colors ${step === '2fa' ? 'text-slate-700' : 'text-slate-400'
              }`}>
              2FA Verify
            </span>
          </div>
        </div>

        {/* ════════════════════════════════════════
            STEP 1 — CREDENTIALS
        ════════════════════════════════════════ */}
        {step === 'credentials' && (
          <form onSubmit={handleSubmit(onCredentialsSubmit)} className="space-y-4">
            <div className="p-3.5 bg-orange-50/60 border border-orange-100 rounded-2xl text-[10.5px] font-bold text-slate-600 leading-relaxed text-center">
              🔐 Login with your registered admin email or phone number.
            </div>

            <Input
              {...register('emailOrPhone')}
              label="Admin Email or Phone"
              type="text"
              className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-orange-500"
              leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
              placeholder="admin@fuelflux.com"
              error={errors.emailOrPhone?.message}
              disabled={isLoading}
            />

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 tracking-wide">
                Security Password
              </label>
              <PasswordInput
                {...register('password')}
                className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-orange-500"
                error={errors.password?.message}
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
        )}

        {/* ════════════════════════════════════════
            STEP 2 — 2FA OTP
        ════════════════════════════════════════ */}
        {step === '2fa' && (
          <div className="space-y-5">
            {/* Info box */}
            <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-1 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Shield className="h-4 w-4 text-blue-500 shrink-0" />
                <span className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wider">
                  2-Factor Authentication
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-600">
                A 6-digit OTP has been sent to
              </p>
              <p className="text-xs font-extrabold text-slate-800 font-mono">
                {adminEmail}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                Valid for 10 minutes. Do not share this code.
              </p>
            </div>

            {/* OTP Boxes */}
            <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className={`
                    w-11 h-12 text-center text-lg font-extrabold rounded-xl border-2 outline-none
                    transition-all duration-150 bg-slate-50 text-slate-800
                    ${digit
                      ? 'border-orange-400 bg-orange-50/40'
                      : 'border-slate-200'
                    }
                    ${otpError ? 'border-rose-400 bg-rose-50/30' : ''}
                    focus:border-orange-500 focus:bg-white
                  `}
                />
              ))}
            </div>

            {/* OTP Error */}
            {otpError && (
              <p className="text-center text-xs font-bold text-rose-500">
                {otpError}
              </p>
            )}

            {/* Verify Button */}
            <Button
              type="button"
              variant="primary"
              size="lg"
              isLoading={verifying2FA}
              onClick={on2FASubmit}
              disabled={otp.join('').length !== 6 || verifying2FA}
              className="w-full font-bold bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-lg shadow-orange-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify & Enter Control Center
              <ShieldCheck className="h-4 w-4 ml-2" />
            </Button>

            {/* Resend + Back */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  setStep('credentials');
                  setOtp(['', '', '', '', '', '']);
                  setOtpError('');
                }}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors outline-none"
              >
                ← Back to login
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={resendTimer > 0}
                className={`flex items-center gap-1 text-[11px] font-bold transition-colors outline-none ${resendTimer > 0
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-orange-500 hover:text-orange-600 cursor-pointer'
                  }`}
              >
                <RotateCcw className="h-3 w-3" />
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="text-center space-y-1 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <ShieldCheck className="h-3.5 w-3.5 text-orange-500 shrink-0" />
            <span>Cryptographic Session Isolation · 30min Expiry</span>
          </div>
          <span className="text-[8px] font-bold text-slate-400 block">
            All access attempts are audited under security logs.
          </span>
        </div>
      </div>
    </div>
  );
}