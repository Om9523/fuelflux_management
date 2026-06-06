'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User as UserIcon,
  Mail,
  Phone,
  ArrowRight,
  ArrowLeft,
  Lock,
  Building2,
  Truck,
  ShieldCheck,
  CheckCircle,
  MessageSquare,
} from 'lucide-react';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { OTPInput } from '@/components/ui/OTPInput';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from '@/components/feedback/Toast';

// Form validation schemas for each step
const step1Schema = z.object({
  name: z.string().min(2, 'Full Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number'),
});

const step2Schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser, verifyOTP, resendOTP, isLoading } = useAuthStore();

  // Wizard State management
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [selectedRoles, setSelectedRoles] = useState<('pump_owner' | 'logistic')[]>([]);

  // OTP Modal State
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [otpTab, setOtpTab] = useState<'sms' | 'email'>('email');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);

  // Form hooks
  const step1Form = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { name: '', email: '', phone: '' },
    mode: 'onChange',
  });

  const step2Form = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onChange',
  });

  // Calculate Password Strength in real time
  const passwordInputVal = step2Form.watch('password') || '';
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score, text: 'Empty', color: 'bg-slate-200' };
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    const statuses = [
      { text: 'Weak', color: 'bg-red-400' },
      { text: 'Weak', color: 'bg-red-400' },
      { text: 'Moderate', color: 'bg-amber-400' },
      { text: 'Good', color: 'bg-blue-400' },
      { text: 'Strong', color: 'bg-emerald-500' },
      { text: 'Very Strong', color: 'bg-emerald-600' },
    ];
    return { score, ...statuses[score] };
  };

  const strength = getPasswordStrength(passwordInputVal);

  const passwordRequirements = [
    { label: 'Minimum 8 characters', met: passwordInputVal.length >= 8 },
    { label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(passwordInputVal) },
    { label: 'One lowercase letter (a-z)', met: /[a-z]/.test(passwordInputVal) },
    { label: 'One digit (0-9)', met: /[0-9]/.test(passwordInputVal) },
    { label: 'One special symbol (e.g. @, #, $, !)', met: /[^A-Za-z0-9]/.test(passwordInputVal) },
  ];

  // OTP Countdown timer helper
  React.useEffect(() => {
    let interval: any;
    if (isOTPModalOpen && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOTPModalOpen, resendTimer]);

  const startResendTimer = () => {
    setResendTimer(60);
  };

  // STEP NAVIGATION & SUBMIT ACTIONS
  const onStep1Submit = (data: Step1Values) => {
    setFormData((prev: any) => ({ ...prev, ...data }));
    setStep(2);
  };

  const onStep2Submit = (data: Step2Values) => {
    setFormData((prev: any) => ({ ...prev, password: data.password }));
    setStep(3);
  };

  const handleRoleToggle = (role: 'pump_owner' | 'logistic') => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleRegisterSubmit = async () => {
    if (selectedRoles.length === 0) {
      toast.error('Please select at least one active user role.');
      return;
    }

    const completePayload = {
      ...formData,
      roles: selectedRoles,
    };

    try {
      await registerUser(completePayload);
      toast.success('Registration initiated successfully! OTP has been sent.');
      setIsOTPModalOpen(true);
      setResendTimer(60);
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    }
  };

  const handleOTPSubmit = async () => {
    if (otpCode.length < 6) {
      setOtpError('OTP code must be 6 digits');
      return;
    }

    const activeIdentifier = otpTab === 'email' ? formData.email : formData.phone;

    try {
      await verifyOTP(activeIdentifier, otpCode);
      setIsOTPModalOpen(false);
      toast.success('Account successfully verified! Please log in.');
      router.push('/login');
    } catch (err: any) {
      setOtpError(err.message || 'Verification failed');
      toast.error(err.message || 'Invalid verification code');
    }
  };

  const handleResendClick = async () => {
    const activeIdentifier = otpTab === 'email' ? formData.email : formData.phone;
    try {
      await resendOTP(activeIdentifier, otpTab === 'email' ? 'email' : 'sms');
      toast.success(`New OTP sent to ${otpTab === 'email' ? 'email' : 'SMS'}`);
      startResendTimer();
      setOtpCode('');
      setOtpError('');
    } catch (err: any) {
      toast.error('Resend failed. Try again.');
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle={
        step === 1
          ? 'Enter your name and contact details to get started'
          : step === 2
          ? 'Secure your new platform access'
          : 'Define your operational roles'
      }
    >
      {/* Wizard Progress Bar */}
      <div className="flex items-center gap-1.5 w-full mb-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              step >= s ? 'bg-primary' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: BASIC DETAILS */}
        {step === 1 && (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onSubmit={step1Form.handleSubmit(onStep1Submit)}
            className="flex flex-col gap-4 w-full"
          >
            <Input
              {...step1Form.register('name')}
              label="Full Name"
              type="text"
              leftIcon={<UserIcon className="h-4 w-4" />}
              placeholder="e.g. Rajesh Kumar"
              error={step1Form.formState.errors.name?.message}
            />

            <Input
              {...step1Form.register('email')}
              label="Email Address"
              type="email"
              leftIcon={<Mail className="h-4 w-4" />}
              placeholder="you@fuelflux.com"
              error={step1Form.formState.errors.email?.message}
            />

            <Input
              {...step1Form.register('phone')}
              label="Mobile Number (India)"
              type="tel"
              leftIcon={<Phone className="h-4 w-4" />}
              placeholder="9876543210"
              error={step1Form.formState.errors.phone?.message}
            />

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2 font-bold group">
              Continue to Security
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.form>
        )}

        {/* STEP 2: SECURITY */}
        {step === 2 && (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onSubmit={step2Form.handleSubmit(onStep2Submit)}
            className="flex flex-col gap-4 w-full"
          >
            <PasswordInput
              {...step2Form.register('password')}
              label="Create Password"
              placeholder="••••••••"
              error={step2Form.formState.errors.password?.message}
            />

            {/* Password strength indicator */}
            {passwordInputVal && (
              <div className="flex flex-col gap-1.5 p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-text-secondary">Password Strength:</span>
                  <span className="font-bold text-text-primary">{strength.text}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} transition-all duration-500`}
                    style={{ width: `${(strength.score / 5) * 100}%` }}
                  />
                </div>
                {/* Requirements Checklist */}
                <div className="flex flex-col gap-1 mt-2">
                  {passwordRequirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[10px] font-semibold text-text-secondary">
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${
                          req.met ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />
                      <span className={req.met ? 'text-emerald-600' : ''}>{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <PasswordInput
              {...step2Form.register('confirmPassword')}
              label="Confirm Password"
              placeholder="••••••••"
              error={step2Form.formState.errors.confirmPassword?.message}
            />

            <div className="flex gap-3 mt-2 w-full">
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
                type="submit"
                variant="primary"
                size="lg"
                disabled={strength.score < 3}
                className="flex-1 font-bold group"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.form>
        )}

        {/* STEP 3: ROLE SELECTION */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex flex-col gap-4 w-full"
          >
            <p className="text-xs text-text-secondary font-medium -mt-2">
              Select one or both operational account roles. Multiple roles can be selected.
            </p>

            <div className="flex flex-col gap-3">
              {/* Pump Owner Card */}
              <div
                onClick={() => handleRoleToggle('pump_owner')}
                className={`
                  flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 select-none
                  ${
                    selectedRoles.includes('pump_owner')
                      ? 'border-primary bg-orange-50/20 shadow-md shadow-primary/5'
                      : 'border-slate-200 bg-white hover:border-border-accent'
                  }
                `}
              >
                <div
                  className={`
                    h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border
                    ${
                      selectedRoles.includes('pump_owner')
                        ? 'bg-primary border-transparent text-white'
                        : 'bg-slate-50 border-slate-200 text-text-secondary'
                    }
                  `}
                >
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-text-primary">Pump Owner Account</span>
                  <span className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                    Access dispenser metrics, employees rosters, fuel sales audits, and wet-stock analytics.
                  </span>
                </div>
              </div>

              {/* Logistics Partner Card */}
              <div
                onClick={() => handleRoleToggle('logistic')}
                className={`
                  flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 select-none
                  ${
                    selectedRoles.includes('logistic')
                      ? 'border-primary bg-orange-50/20 shadow-md shadow-primary/5'
                      : 'border-slate-200 bg-white hover:border-border-accent'
                  }
                `}
              >
                <div
                  className={`
                    h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border
                    ${
                      selectedRoles.includes('logistic')
                        ? 'bg-primary border-transparent text-white'
                        : 'bg-slate-50 border-slate-200 text-text-secondary'
                    }
                  `}
                >
                  <Truck className="h-5 w-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-text-primary">Logistics Partner Account</span>
                  <span className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                    Access dispatch records, tanker tracking, fuel distribution sheets, and driver rosters.
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-2 w-full">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setStep(2)}
                className="flex-1 font-bold"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                type="button"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                onClick={handleRegisterSubmit}
                className="flex-1 font-bold group"
              >
                Sign Up
                <ShieldCheck className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login redirection */}
      <div className="text-center text-xs font-medium text-text-secondary mt-4">
        Already have an account?{' '}
        <Link href="/login" className="font-bold text-primary hover:text-primary-hover transition-colors">
          Sign In
        </Link>
      </div>

      {/* STEP 4: OTP VERIFICATION MODAL OVERLAY */}
      <Modal
        isOpen={isOTPModalOpen}
        onClose={() => setIsOTPModalOpen(false)}
        title="Verification Required"
      >
        <div className="flex flex-col gap-5 text-center">
          <p className="text-xs font-medium text-text-secondary max-w-sm mx-auto leading-relaxed">
            Please enter the 6-digit verification security code sent to verify your identity.
          </p>

          {/* OTP Channel Tab selectors */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 w-full max-w-xs mx-auto">
            <button
              onClick={() => {
                setOtpTab('email');
                setOtpCode('');
                setOtpError('');
              }}
              className={`flex-1 flex justify-center items-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                otpTab === 'email' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              Email OTP
            </button>
            <button
              onClick={() => {
                setOtpTab('sms');
                setOtpCode('');
                setOtpError('');
              }}
              className={`flex-1 flex justify-center items-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                otpTab === 'sms' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              SMS OTP
            </button>
          </div>

          <div className="text-xs font-bold text-text-primary uppercase tracking-wide">
            Sending to:{' '}
            <span className="text-primary font-mono tracking-normal text-xs">
              {otpTab === 'email' ? formData.email : formData.phone}
            </span>
          </div>

          {/* Digital 6-box input */}
          <OTPInput value={otpCode} onChange={(val) => { setOtpCode(val); setOtpError(''); }} error={otpError} />

          {/* Resend and Actions */}
          <div className="flex flex-col items-center gap-3">
            <div className="text-xs font-semibold text-text-secondary">
              {resendTimer > 0 ? (
                <span>Resend available in <strong className="text-primary font-mono">{resendTimer}s</strong></span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendClick}
                  className="font-bold text-primary hover:text-primary-hover underline cursor-pointer outline-none"
                >
                  Resend Verification OTP
                </button>
              )}
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleOTPSubmit}
              isLoading={isLoading}
              className="w-full font-bold mt-2"
            >
              Verify & Activate Account
              <CheckCircle className="h-4.5 w-4.5 ml-2" />
            </Button>
          </div>
        </div>
      </Modal>
    </AuthLayout>
  );
}
