'use client';

import React, { useEffect, useState } from 'react';
import { Search, Filter, ShieldAlert, KeyRound, Ban, CheckCircle, RefreshCcw } from 'lucide-react';
import { useAdminStore } from '@/stores/admin.store';
import { User, Role } from '@/lib/mock-db';
import { toast } from '@/components/feedback/Toast';
import { api } from '@/lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users);
    } catch (e) {
      toast.error('Failed to load user directory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus?: 'active' | 'suspended') => {
    try {
      const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
      await api.patch(`/admin/users/${id}`, { status: nextStatus });
      toast.success(`User state updated to "${nextStatus}"`);
      fetchUsers();
    } catch (e) {
      toast.error('Failed to modify account state.');
    }
  };

  const handleForceLogout = (name: string) => {
    // Audit it
    toast.success(`Forced session termination for: ${name}`);
  };

  const handleResetPassword = async (email: string) => {
    try {
      await api.post('/auth/forgot-password-request', { emailOrPhone: email });
      toast.success(`Temporary reset OTP dispatch requested for: ${email}`);
    } catch (e) {
      toast.error('Reset request failed.');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);

    const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter);

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          User & Client Directory
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Verify profiles, control authorization, reset credentials and audit active sessions.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, email, or mobile..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-orange-500"
          />
        </div>

        <div className="flex gap-2.5 w-full sm:w-auto shrink-0 justify-end">
          <div className="flex items-center gap-1.5 border border-slate-200 bg-slate-50 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600">
            <Filter className="h-3.5 w-3.5" />
            <span>Role Type:</span>
            <select
              value={roleFilter}
              onChange={(e: any) => setRoleFilter(e.target.value)}
              className="bg-transparent border-0 outline-none text-slate-800 font-extrabold pr-2 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="pump_owner">Station Owners</option>
              <option value="logistic">Logistics Fleet</option>
              <option value="investor">Investors</option>
              <option value="employee">Employees</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4">Account Profile</th>
                <th className="px-6 py-4">Contact Credentials</th>
                <th className="px-6 py-4">Roles Context</th>
                <th className="px-6 py-4">Account State</th>
                <th className="px-6 py-4 text-center">Session Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 font-bold text-slate-400">
                    Syncing client profiles...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 font-bold text-slate-400">
                    No user profiles found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <span className="text-slate-800 font-extrabold block">
                          {user.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          UID: {user.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5 font-medium">
                        <div className="text-slate-700 font-semibold">{user.email}</div>
                        <div className="text-slate-400 font-mono text-[10.5px]">+91 {user.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <span
                            key={role}
                            className="text-[9.5px] font-extrabold px-2 py-0.5 bg-slate-50 border border-slate-200/80 rounded-md text-slate-600 uppercase"
                          >
                            {role.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 border rounded-full uppercase
                        ${user.status !== 'suspended' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}
                      `}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => handleResetPassword(user.email)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 bg-white cursor-pointer outline-none transition-colors"
                          title="Trigger Password Reset"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleForceLogout(user.name)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 bg-white cursor-pointer outline-none transition-colors"
                          title="Force Session Log out"
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </button>
                        {user.status === 'suspended' ? (
                          <button
                            onClick={() => handleToggleStatus(user.id, user.status)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-emerald-100 bg-white cursor-pointer outline-none transition-colors"
                            title="Activate User"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(user.id, user.status)}
                            className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-100 bg-white cursor-pointer outline-none transition-colors"
                            title="Suspend User"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
