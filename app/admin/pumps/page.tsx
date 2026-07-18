'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Fuel, Search, Filter, Eye, Ban, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/components/feedback/Toast';
import backendApi from '@/lib/backendApi';

interface Pump {
  id: string;
  name: string;
  status: string;
  owner_id: string;
  address: string | null;
  city: string | null;
  state: string | null;
  created_at: string | null;
}

export default function AdminAllPumpsPage() {
  const router = useRouter();
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchPumps = async () => {
    setIsLoading(true);
    try {
      const res = await backendApi.get('/admin/pumps');
      setPumps(res.data.data?.pumps || []);
    } catch { toast.error('Failed to load pumps.'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchPumps(); }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await backendApi.patch(`/admin/pumps/${id}/status`, { status: newStatus });
      toast.success(`Pump ${newStatus === 'inactive' ? 'deactivated' : 'reactivated'}.`);
      fetchPumps();
    } catch { toast.error('Failed to update status.'); }
  };

  const filtered = pumps.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q ||
      p.name?.toLowerCase().includes(q) ||
      p.city?.toLowerCase().includes(q) ||
      p.state?.toLowerCase().includes(q) ||
      String(p.owner_id).includes(q);
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      pending: 'bg-amber-50 text-amber-600 border-amber-100',
      rejected: 'bg-rose-50 text-rose-600 border-rose-100',
      inactive: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return (
      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 border rounded-full uppercase ${map[status] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Fuel Stations Directory</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">All registered pumps across the FuelFlux platform.</p>
        </div>
        <button onClick={fetchPumps} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-600 outline-none cursor-pointer">
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-slate-200 p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search pump name, city, owner ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-orange-500"
          />
        </div>
        <div className="flex items-center gap-2 border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 shrink-0">
          <Filter className="h-3.5 w-3.5" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-0 outline-none text-slate-800 font-extrabold cursor-pointer">
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4">Station</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Owner ID</th>
                <th className="px-6 py-4">Registered</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400 font-bold">Loading pumps...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400 font-bold">No pumps match filters.</td></tr>
              ) : filtered.map((pump) => (
                <tr key={pump.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex gap-3 items-center">
                      <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center shrink-0">
                        <Fuel className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-slate-800 font-extrabold block">{pump.name}</span>
                        <span className="text-[10px] text-slate-400">ID: #{pump.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="block">{pump.city || '—'}</span>
                    <span className="text-[10px] text-slate-400">{pump.state || ''}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-700">#{pump.owner_id}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {pump.created_at ? new Date(pump.created_at).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(pump.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-1.5">
                      <button onClick={() => router.push('/admin/pending')}
                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer outline-none border border-slate-200" title="View Details">
                        <Eye className="h-4 w-4" />
                      </button>
                      {pump.status === 'active' && (
                        <button onClick={() => handleStatusUpdate(pump.id, 'inactive')}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer outline-none border border-rose-100" title="Deactivate">
                          <Ban className="h-4 w-4" />
                        </button>
                      )}
                      {pump.status === 'inactive' && (
                        <button onClick={() => handleStatusUpdate(pump.id, 'active')}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer outline-none border border-emerald-100" title="Reactivate">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Footer count */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400">
          Showing {filtered.length} of {pumps.length} stations
        </div>
      </div>
    </div>
  );
}