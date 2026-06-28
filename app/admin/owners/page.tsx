'use client';

import React, { useEffect, useState } from 'react';
import { UserCheck, Mail, Phone, Calendar, Building, RefreshCw } from 'lucide-react';
import { toast } from '@/components/feedback/Toast';
import backendApi from '@/lib/backendApi';

interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  created_at: string | null;
  pump_count: number;
}

export default function AdminOwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [isLoading, setLoading] = useState(false);

  const fetchOwners = async () => {
    setLoading(true);
    try {
      const res = await backendApi.get('/admin/owners');
      setOwners(res.data.data?.owners || []);
    } catch { toast.error('Failed to load owners.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOwners(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Registered Pump Owners</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">All station license holders on the FuelFlux platform.</p>
        </div>
        <button onClick={fetchOwners} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-600 outline-none cursor-pointer">
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4">Owner Profile</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 text-center">Stations</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400 font-bold">Loading owners...</td></tr>
              ) : owners.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400 font-bold">No owners registered yet.</td></tr>
              ) : owners.map((owner) => (
                <tr key={owner.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex gap-3 items-center">
                      <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center shrink-0">
                        <UserCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-slate-800 font-extrabold block">{owner.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: #{owner.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{owner.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{owner.phone ? `+91 ${owner.phone}` : '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 border border-slate-200 rounded-lg font-extrabold text-slate-700">
                      <Building className="h-3.5 w-3.5 text-orange-500" />
                      {owner.pump_count} {owner.pump_count === 1 ? 'Station' : 'Stations'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {owner.is_active ? (
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase">Active</span>
                    ) : (
                      <span className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full uppercase">Inactive</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{owner.created_at ? new Date(owner.created_at).toLocaleDateString('en-IN') : '—'}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400">
          {owners.length} owners registered
        </div>
      </div>
    </div>
  );
}