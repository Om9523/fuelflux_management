'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building2, Calendar, Camera, Key, Lock, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import { EmployeeProfile, User as UserType } from '@/lib/mock-db';
import { useEmployeeStore } from '@/stores/employee.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { toast } from '@/components/feedback/Toast';

interface ProfileCardProps {
  profile: EmployeeProfile | null;
  user: Omit<UserType, 'passwordHash'> | null;
}

const profileSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'New passwords do not match',
  path: ['confirmPassword'],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, user }) => {
  const { updateProfile, changePassword } = useEmployeeStore();
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');

  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const {
    register: regPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passErrors, isSubmitting: passSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfile(data);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      await changePassword(data.currentPassword, data.newPassword);
      toast.success('Password updated successfully!');
      resetPasswordForm();
    } catch (err: any) {
      toast.error(err.message || 'Password update failed');
    }
  };

  const handlePhotoUploadMock = () => {
    toast.info('Simulating photo upload...');
    setTimeout(() => {
      // Mock updating the photoUrl to a random premium avatar
      const randomAvatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`;
      updateProfile({ photoUrl: randomAvatar })
        .then(() => toast.success('Profile photo updated successfully!'))
        .catch(() => toast.error('Failed to update photo'));
    }, 1500);
  };

  const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'EE';

  return (
    <div className="grid md:grid-cols-3 gap-6 text-left items-start font-sans">
      {/* Left Avatar & Pump Card */}
      <div className="bg-white border border-orange-100 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center gap-4 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/0 via-orange-500/0 to-orange-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center font-extrabold text-orange-600 text-3xl shadow-inner relative overflow-hidden shrink-0">
            {profile?.photoUrl ? (
              <img src={profile.photoUrl} alt={user?.name} className="h-full w-full object-cover" />
            ) : initials}
          </div>
          <button
            onClick={handlePhotoUploadMock}
            className="absolute bottom-0 right-0 p-2 bg-orange-500 text-white rounded-full shadow-md hover:bg-orange-600 cursor-pointer outline-none transition-colors border border-white"
            title="Upload Photo"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-2">
          <h3 className="text-base font-extrabold text-slate-800">{user?.name || 'Staff User'}</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">{profile?.designation}</span>
        </div>

        <div className="w-full border-t border-slate-50 pt-4 flex flex-col gap-3 text-left font-semibold text-slate-600 text-xs">
          <div className="flex items-center gap-2.5">
            <Building2 className="h-4.5 w-4.5 text-slate-400" />
            <div>
              <span className="text-[10px] text-slate-450 uppercase block font-bold leading-none mb-0.5">Assigned Station</span>
              <span>{profile?.assignedPump || 'Bharat Petroleum Sector 62'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Calendar className="h-4.5 w-4.5 text-slate-400" />
            <div>
              <span className="text-[10px] text-slate-450 uppercase block font-bold leading-none mb-0.5">Joining Date</span>
              <span className="font-mono">{profile?.joiningDate || '2024-04-12'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4.5 w-4.5 text-slate-400" />
            <div>
              <span className="text-[10px] text-slate-450 uppercase block font-bold leading-none mb-0.5">Employee ID</span>
              <span className="font-mono text-orange-600">{profile?.employeeId || 'EMP-XXXX'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Tab Editor Card */}
      <div className="md:col-span-2 bg-white border border-orange-100 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        {/* Tabs switcher */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer outline-none ${
              activeTab === 'info'
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Personal Details
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer outline-none ${
              activeTab === 'security'
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Security & Password
          </button>
        </div>

        {/* Tab Content 1: Personal Info Form */}
        {activeTab === 'info' && (
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="flex flex-col gap-4">
            <Input
              {...regProfile('name')}
              label="Full Name"
              type="text"
              leftIcon={<User className="h-4 w-4 text-slate-400" />}
              error={profileErrors.name?.message}
              disabled={profileSubmitting}
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                {...regProfile('email')}
                label="Email Address"
                type="email"
                leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
                error={profileErrors.email?.message}
                disabled={profileSubmitting}
              />
              <Input
                {...regProfile('phone')}
                label="Mobile Number"
                type="text"
                leftIcon={<Phone className="h-4 w-4 text-slate-400" />}
                error={profileErrors.phone?.message}
                disabled={profileSubmitting}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="mt-2 w-full font-bold bg-orange-500 hover:bg-orange-600 text-white"
              isLoading={profileSubmitting}
            >
              Update Profile Details
            </Button>
          </form>
        )}

        {/* Tab Content 2: Password Change Form */}
        {activeTab === 'security' && (
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600 tracking-wide">Current Password</label>
              <PasswordInput
                {...regPassword('currentPassword')}
                error={passErrors.currentPassword?.message}
                disabled={passSubmitting}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600 tracking-wide">New Password</label>
                <PasswordInput
                  {...regPassword('newPassword')}
                  error={passErrors.newPassword?.message}
                  disabled={passSubmitting}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600 tracking-wide">Confirm New Password</label>
                <PasswordInput
                  {...regPassword('confirmPassword')}
                  error={passErrors.confirmPassword?.message}
                  disabled={passSubmitting}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="mt-2 w-full font-bold bg-orange-500 hover:bg-orange-600 text-white"
              isLoading={passSubmitting}
            >
              <Lock className="h-4 w-4 mr-2" />
              Save New Credentials
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
export default ProfileCard;
