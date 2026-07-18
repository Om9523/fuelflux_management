'use client';

import React, { useEffect, useState } from 'react';
import { Search, Filter, Ban, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/components/feedback/Toast';
import backendApi from '@/lib/backendApi';

interface User { id: string; name: string; email: string; phone: string | null; roles: string[]; is_active: boolean; created_at: string | null; }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await backendApi.get('/admin/users');
      setUsers(res.data.data?.users || []);
    } catch { toast.error('Failed to load users.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggle = async (user: User) => {
    try {
      await backendApi.patch(`/admin/users/${user.id}/status`, { is_active: !user.is_active });
      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'}.`);
      fetchUsers();
    } catch { toast.error('Failed.'); }
  };

  const filtered = users.filter(u => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.includes(q);
    const matchRole = roleFilter === 'all' || (u.roles || []).includes(roleFilter);
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">User & Client Directory</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Manage all user accounts across the platform.</p>
        </div>
        <button onClick={fetchUsers} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-600 outline-none cursor-pointer">
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-slate-200 p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search name, email, phone..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-orange-500" />
        </div>
        <div className="flex items-center gap-2 border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 shrink-0">
          <Filter className="h-3.5 w-3.5" />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="bg-transparent border-0 outline-none text-slate-800 font-extrabold cursor-pointer">
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="pump_owner">Pump Owner</option>
            <option value="logistic">Logistics</option>
            <option value="investor">Investor</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <th className="px-5 py-4">Profile</th>
                <th className="px-5 py-4">Contact</th>
                <th className="px-5 py-4">Roles</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400 font-bold">Loading users...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400 font-bold">No users found.</td></tr>
              ) : filtered.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <span className="font-extrabold text-slate-800 block">{user.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">ID: #{user.id}</span>
                  </td>
                  <td className="px-5 py-3 space-y-0.5">
                    <span className="block text-slate-700">{user.email}</span>
                    <span className="block text-[10px] text-slate-400 font-mono">{user.phone ? `+91 ${user.phone}` : '—'}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(user.roles || []).map(role => (
                        <span key={role} className="text-[9px] font-extrabold px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-slate-600 uppercase">{role.replace('_', ' ')}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {user.is_active
                      ? <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase">Active</span>
                      : <span className="text-[9px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full uppercase">Inactive</span>
                    }
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button onClick={() => handleToggle(user)}
                      className={`p-1.5 rounded-lg border cursor-pointer outline-none transition-colors ${user.is_active ? 'text-rose-500 border-rose-100 hover:bg-rose-50' : 'text-emerald-600 border-emerald-100 hover:bg-emerald-50'}`}>
                      {user.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400">{filtered.length} of {users.length} users</div>
      </div>
    </div>
  );
}