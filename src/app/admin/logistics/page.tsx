'use client';

import React, { useEffect } from 'react';
import { Truck, Users, CreditCard, Ticket, Layers } from 'lucide-react';
import { useAdminStore } from '@/stores/admin.store';

export default function AdminLogisticsPage() {
  const { logistics, fetchLogistics, isLoading } = useAdminStore();

  useEffect(() => {
    fetchLogistics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Logistics Fleet Partners
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Auditing corporate fleet transport groups, corporate credit lines, and vouchers usage.
        </p>
      </div>

      {/* Logistics Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4">Fleet Enterprise</th>
                <th className="px-6 py-4">Manager Profile</th>
                <th className="px-6 py-4 text-center">Vehicles Count</th>
                <th className="px-6 py-4">Credit Line Utilization</th>
                <th className="px-6 py-4 text-center">Vouchers Used</th>
                <th className="px-6 py-4 text-right">Fuel Consumption</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 font-bold text-slate-400">
                    Syncing logistics directories...
                  </td>
                </tr>
              ) : logistics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 font-bold text-slate-400">
                    No logistics partners registered.
                  </td>
                </tr>
              ) : (
                logistics.map((partner) => {
                  const percent = Math.min(
                    Math.round((partner.creditUsed / partner.creditLimit) * 100),
                    100
                  );
                  return (
                    <tr key={partner.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex gap-3 items-center">
                          <div className="h-8.5 w-8.5 rounded-lg bg-orange-50 text-orange-500 border border-orange-100/50 flex items-center justify-center shrink-0">
                            <Truck className="h-4.5 w-4.5" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-slate-800 font-extrabold block">
                              {partner.companyName}
                            </span>
                            <span className="text-[9.5px] text-slate-400 block font-mono">
                              ID: {partner.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <span className="text-slate-700 font-bold block">{partner.managerName}</span>
                          <span className="text-[10px] text-slate-400 block">{partner.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg font-extrabold text-slate-700">
                          {partner.vehicleCount} Trucks
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1.5 max-w-[150px]">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500 font-mono">
                            <span>₹{partner.creditUsed.toLocaleString('en-IN')}</span>
                            <span>{percent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${
                                percent > 75 ? 'bg-rose-500' : percent > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <div className="text-[9px] text-slate-400 font-medium">
                            Limit: ₹{partner.creditLimit.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg font-extrabold text-slate-700">
                          <Ticket className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                          {partner.voucherCount} active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-slate-800">
                        {partner.fuelConsumption.toLocaleString('en-IN')} Liters
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
