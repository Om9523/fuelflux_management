'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Mail, Phone, RefreshCw } from 'lucide-react';
import { toast } from '@/components/feedback/Toast';
import backendApi from '@/lib/backendApi';

interface Investor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  created_at: string | null;
}

export default function AdminInvestorsPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [isLoading, setLoading] = useState(false);

  const fetchInvestors = async () => {
    setLoading(true);
    try {
      const res = await backendApi.get('/admin/investors');
      setInvestors(res.data.data?.investors || []);
    } catch { toast.error('Failed to load investors.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchInvestors(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Platform Investors</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Financial backers registered on the FuelFlux platform.</p>
        </div>
        <button onClick={fetchInvestors} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-600 outline-none cursor-pointer">
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4">Investor Profile</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
              {isLoading ? (
                <tr><td colSpan={4} className="text-center py-10 text-slate-400 font-bold">Loading investors...</td></tr>
              ) : investors.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10 text-slate-400 font-bold">No investors registered.</td></tr>
              ) : investors.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex gap-3 items-center">
                      <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center shrink-0">
                        <LineChart className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-slate-800 font-extrabold block">{inv.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: #{inv.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{inv.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{inv.phone ? `+91 ${inv.phone}` : '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {inv.is_active
                      ? <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase">Active</span>
                      : <span className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full uppercase">Inactive</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-IN') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400">
          {investors.length} investors registered
        </div>
      </div>
    </div>
  );
}