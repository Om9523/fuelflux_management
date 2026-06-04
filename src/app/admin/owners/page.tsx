'use client';

import React, { useEffect } from 'react';
import { UserCheck, Mail, Phone, Calendar, Building, Fuel } from 'lucide-react';
import { useAdminStore } from '@/stores/admin.store';
import { toast } from '@/components/feedback/Toast';

export default function AdminOwnersPage() {
  const { owners, fetchOwners, isLoading } = useAdminStore();

  useEffect(() => {
    fetchOwners();
  }, []);

  const getSubStatusBadge = (status: string) => {
    return status === 'active' ? (
      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase">
        Active License
      </span>
    ) : (
      <span className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full uppercase">
        No Active Sub
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Registered Pump Owners
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Auditing station license holders, accounts, and financial contributions.
        </p>
      </div>

      {/* Owners Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4">Owner Profile</th>
                <th className="px-6 py-4">Contact Index</th>
                <th className="px-6 py-4 text-center">Fuel Stations</th>
                <th className="px-6 py-4 text-right">Revenue Contribution</th>
                <th className="px-6 py-4">Subscription Status</th>
                <th className="px-6 py-4">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 font-bold text-slate-400">
                    Syncing owner files...
                  </td>
                </tr>
              ) : owners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 font-bold text-slate-400">
                    No owner records registered on the platform.
                  </td>
                </tr>
              ) : (
                owners.map((owner) => (
                  <tr key={owner.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex gap-3 items-center">
                        <div className="h-8.5 w-8.5 rounded-lg bg-orange-50 text-orange-500 border border-orange-100/50 flex items-center justify-center shrink-0">
                          <UserCheck className="h-4.5 w-4.5" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-slate-800 font-extrabold block">
                            {owner.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            ID: {owner.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{owner.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>+91 {owner.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 border border-slate-200 rounded-lg font-extrabold text-slate-700">
                        <Building className="h-3.5 w-3.5 text-orange-500" />
                        {owner.pumpCount} {owner.pumpCount === 1 ? 'Station' : 'Stations'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-800">
                      ₹{owner.revenueContribution.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      {getSubStatusBadge(owner.subscriptionStatus)}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{new Date(owner.createdAt).toLocaleDateString()}</span>
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
