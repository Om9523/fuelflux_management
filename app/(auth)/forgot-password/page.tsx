'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { OTPInput } from '@/components/ui/OTPInput';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from '@/components/feedback/Toast';

// Validation schemas for each step
const step1Schema = z.object({
  emailOrPhone: z
    .string()
    .min(1, 'Email or mobile number is required')
    .refine(
      (val) => {
        const isEmail = z.string().email().safeParse(val).success;
        const isPhone = /^[6-9]\d{9}$/.test(val);
        return isEmail || isPhone;
      },
      { message: 'Enter a valid email address or a 10-digit mobile number' }
    ),
});

const step3Schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type Step1Values = z.infer<typeof step1Schema>;
type Step3Values = z.infer<typeof step3Schema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPasswordRequest, resetPassword, verifyOTP, isLoading } = useAuthStore();

  const [step, setStep] = useState(1);
  const [identity, setIdentity] = useState('');
  const [verifiedOtp, setVerifiedOtp] = useState('');
  
  // OTP Verification state
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');

  // Forms hooks
  const step1Form = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { emailOrPhone: '' },
  });

  const step3Form = useForm<Step3Values>({
    resolver: zodResolver(step3Schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  // SUBMIT HANDLERS
  const onStep1Submit = async (data: Step1Values) => {
    try {
      await forgotPasswordRequest(data.emailOrPhone);
      setIdentity(data.emailOrPhone);
      toast.success('Recovery code sent successfully!');
      setStep(2);
      setOtpCode('');
      setOtpError('');
    } catch (err: any) {
      toast.error(err.message || 'Could not verify identity');
    }
  };

  const handleOTPVerify = async () => {
    if (otpCode.length < 6) {
      setOtpError('OTP code must be 6 digits');
      return;
    }
    try {
      await verifyOTP(identity, otpCode);
      setVerifiedOtp(otpCode);
      toast.success('Verification successful!');
      setStep(3);
    } catch (err: any) {
      setOtpError(err.message || 'Invalid verification code');
      toast.error(err.message || 'OTP verification failed');
    }
  };

  const onStep3Submit = async (data: Step3Values) => {
    try {
      await resetPassword(identity, data.password, verifiedOtp);
      toast.success('Password successfully reset! Please log in.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.message || 'Reset failed');
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle={
        step === 1
          ? 'Enter your verified email or mobile to receive a recovery code'
          : step === 2
          ? 'Enter the 6-digit recovery code sent to your account'
          : 'Define a strong new account password'
      }
    >
      <AnimatePresence mode="wait">
        {/* STEP 1: CHOOSE IDENTITY */}
        {step === 1 && (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onSubmit={step1Form.handleSubmit(onStep1Submit)}
            className="flex flex-col gap-5 w-full"
          >
            <Input
              {...step1Form.register('emailOrPhone')}
              label="Email Address or Mobile Number"
              type="text"
              leftIcon={<Mail className="h-4 w-4" />}
              placeholder="you@fuelflux.com or 9876543210"
              error={step1Form.formState.errors.emailOrPhone?.message}
              disabled={isLoading}
            />

            <div className="flex flex-col gap-3">
              <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full font-bold group">
                Send Recovery OTP
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl bg-white hover:bg-slate-50 border border-slate-200 py-2.5 text-sm font-bold text-text-primary transition-all duration-300 gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </motion.form>
        )}

        {/* STEP 2: VERIFY OTP */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex flex-col gap-5 w-full text-center"
          >
            <div className="text-xs font-semibold text-text-secondary">
              We sent a code to <strong className="text-primary font-mono">{identity}</strong>
            </div>

            <OTPInput value={otpCode} onChange={(val) => { setOtpCode(val); setOtpError(''); }} error={otpError} />

            <div className="flex gap-3 w-full mt-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setStep(1)}
                className="flex-1 font-bold"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleOTPVerify}
                isLoading={isLoading}
                className="flex-1 font-bold group"
              >
                Verify Code
                <ShieldCheck className="h-4.5 w-4.5 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: RESET PASSWORD */}
        {step === 3 && (
          <motion.form
            key="step3"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onSubmit={step3Form.handleSubmit(onStep3Submit)}
            className="flex flex-col gap-4 w-full"
          >
            <PasswordInput
              {...step3Form.register('password')}
              label="New Password"
              placeholder="••••••••"
              error={step3Form.formState.errors.password?.message}
              disabled={isLoading}
            />

            <PasswordInput
              {...step3Form.register('confirmPassword')}
              label="Confirm New Password"
              placeholder="••••••••"
              error={step3Form.formState.errors.confirmPassword?.message}
              disabled={isLoading}
            />

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full mt-2 font-bold group">
              Update Password
              <CheckCircle className="h-4.5 w-4.5 ml-2" />
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
