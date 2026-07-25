'use client';

import React, { useEffect, useState } from 'react';
import { User, Phone, Mail, MapPin, Calendar, Shield, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import backendApi from '@/lib/backendApi';
import { toast } from '@/components/feedback/Toast';
import { EmployeeProfile } from '@/types/employee';

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <span className="text-xs font-semibold text-slate-700">{value || '—'}</span>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwSubmitting, setPwSubmitting] = useState(false);

  useEffect(() => {
    backendApi.get('/employee/my-profile')
      .then((res) => setProfile(res.data.data))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwForm.current_password || !pwForm.new_password) {
      toast.error('Both fields are required.');
      return;
    }
    if (pwForm.new_password.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    setPwSubmitting(true);
    try {
      await backendApi.post('/employee/change-password', pwForm);
      toast.success('Password changed successfully!');
      setPwForm({ current_password: '', new_password: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setPwSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-orange-500" />
      </div>
    );
  }

  const initials = profile?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '??';

  return (
    <div className="flex flex-col gap-6 font-sans text-slate-800">
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <User className="h-5 w-5 text-orange-500" />
          My Profile
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">View your details and manage credentials.</p>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="h-16 w-16 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center text-orange-600 font-extrabold text-xl shrink-0">
          {initials}
        </div>
        <div className="flex-1">
          <h2 className="text-base font-extrabold text-slate-800">{profile?.name}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[9px] font-bold uppercase rounded-full tracking-wider border border-orange-200">
              {profile?.employee_id}
            </span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase rounded-full tracking-wider">
              {profile?.designation}
            </span>
            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full tracking-wider ${
              profile?.is_active
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                : 'bg-red-50 text-red-500 border border-red-100'
            }`}>
              {profile?.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-4 pb-3 border-b border-slate-100">
          Personal Details
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          <InfoRow label="Phone" value={profile?.phone} />
          <InfoRow label="Email" value={profile?.email} />
          <InfoRow label="Shift" value={profile?.shift} />
          <InfoRow label="Pump ID" value={profile?.pump_id} />
          <InfoRow label="Date of Joining" value={profile?.date_of_joining} />
          <InfoRow label="Date of Birth" value={profile?.date_of_birth} />
          <InfoRow label="Emergency Contact" value={profile?.emergency_contact} />
          <InfoRow label="Address" value={profile?.address} />
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-orange-500" /> Change Password
        </h3>
        <form onSubmit={handlePasswordChange} className="flex flex-col gap-4 max-w-sm">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={pwForm.current_password}
                onChange={(e) => setPwForm((p) => ({ ...p, current_password: e.target.value }))}
                placeholder="Enter current password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-xs font-semibold outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition"
              />
              <button type="button" onClick={() => setShowCurrent((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={pwForm.new_password}
                onChange={(e) => setPwForm((p) => ({ ...p, new_password: e.target.value }))}
                placeholder="Min. 6 characters"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-xs font-semibold outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition"
              />
              <button type="button" onClick={() => setShowNew((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={pwSubmitting}
            className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl px-5 py-2.5 text-xs transition shadow-md shadow-orange-100 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pwSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            {pwSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
