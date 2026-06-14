'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Fuel, Search, Filter, ShieldAlert, Eye, Ban, CheckCircle } from 'lucide-react';
import { useAdminStore } from '@/stores/admin.store';
import { Pump } from '@/lib/mock-db';
import { toast } from '@/components/feedback/Toast';

export default function AdminAllPumpsPage() {
  const router = useRouter();
  const { pumps, fetchPumps, updatePumpStatus, isLoading } = useAdminStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Pump['status']>('all');

  useEffect(() => {
    fetchPumps();
  }, []);

  const handleStatusToggle = async (id: string, currentStatus: Pump['status']) => {
    try {
      const nextStatus: Pump['status'] = currentStatus === 'suspended' ? 'approved' : 'suspended';
      await updatePumpStatus(id, nextStatus);
      toast.success(`Pump ${currentStatus === 'suspended' ? 'reactivated' : 'suspended'} successfully.`);
      fetchPumps();
    } catch (e) {
      toast.error('Failed to update status.');
    }
  };

  // Filter pumps
  const filteredPumps = pumps.filter((pump) => {
    const matchesSearch =
      pump.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pump.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pump.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pump.state.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || pump.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Pump['status']) => {
    const badges = {
      approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      pending: 'bg-amber-50 text-amber-600 border-amber-100',
      under_review: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      rejected: 'bg-rose-50 text-rose-600 border-rose-100',
      suspended: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return (
      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 border rounded-full uppercase ${badges[status]}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Fuel Stations Directory
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Auditing registered pumps, subscriptions, operations and compliance.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search pump name, owner or city..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-700 outline-none placeholder:text-slate-400/80 focus:bg-white focus:border-orange-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2.5 w-full sm:w-auto shrink-0 justify-end">
          <div className="flex items-center gap-1.5 border border-slate-200 bg-slate-50 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-600">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="bg-transparent border-0 outline-none text-slate-800 font-extrabold pr-2 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pumps Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4">Station details</th>
                <th className="px-6 py-4">Owner context</th>
                <th className="px-6 py-4">License / GST</th>
                <th className="px-6 py-4 text-right">Lifetime volume</th>
                <th className="px-6 py-4">Plan tier</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 font-bold text-slate-400">
                    Syncing directory metrics...
                  </td>
                </tr>
              ) : filteredPumps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 font-bold text-slate-400">
                    No station records match filters.
                  </td>
                </tr>
              ) : (
                filteredPumps.map((pump) => (
                  <tr key={pump.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex gap-3 items-center">
                        <div className="h-8.5 w-8.5 rounded-lg bg-orange-50 text-orange-500 border border-orange-100/50 flex items-center justify-center shrink-0">
                          <Fuel className="h-4.5 w-4.5" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-slate-800 font-extrabold block leading-tight">
                            {pump.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-medium">
                            {pump.address}, {pump.city}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <span className="text-slate-700 font-bold block">{pump.ownerName}</span>
                        <span className="text-[9px] text-slate-400 block">ID: {pump.ownerId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-[10.5px]">
                      <div className="space-y-0.5">
                        <div>GST: <span className="font-bold text-slate-700">{pump.gstNumber}</span></div>
                        <div>LIC: <span className="font-bold text-slate-700">{pump.licenseNumber}</span></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-800">
                      Γé╣{pump.revenue.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] font-bold text-slate-700">
                        {pump.subscriptionPlan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(pump.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => router.push('/admin/pending')}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer outline-none transition-colors border border-slate-200 bg-white"
                          title="View Registration Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {pump.status === 'approved' && (
                          <button
                            onClick={() => handleStatusToggle(pump.id, pump.status)}
                            className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer outline-none transition-colors border border-rose-100 bg-white"
                            title="Suspend Station"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                        {pump.status === 'suspended' && (
                          <button
                            onClick={() => handleStatusToggle(pump.id, pump.status)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer outline-none transition-colors border border-emerald-100 bg-white"
                            title="Reactivate Station"
                          >
                            <CheckCircle className="h-4 w-4" />
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
