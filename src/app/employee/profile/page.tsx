'use client';

import React from 'react';
import { User } from 'lucide-react';
import { ProfileCard } from '@/components/employee/ProfileCard';
import { useEmployeeStore } from '@/stores/employee.store';

export default function ProfileSettingsPage() {
  const { profile, user } = useEmployeeStore();

  return (
    <div className="flex flex-col gap-6 text-left font-sans">
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <User className="h-5.5 w-5.5 text-orange-500" />
          My Profile Settings
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">Manage personal contact details, credentials, and profile image.</p>
      </div>

      <ProfileCard profile={profile} user={user} />
    </div>
  );
}
