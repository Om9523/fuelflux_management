'use client';

import React, { useState } from 'react';
import { Shield, Check, X, ShieldAlert, Plus, Layers } from 'lucide-react';
import { toast } from '@/components/feedback/Toast';

export default function AdminRolesPermissionsPage() {
  const [newRoleName, setNewRoleName] = useState('');
  const [customRoles, setCustomRoles] = useState<string[]>([]);
  
  // Seed permissions
  const permissionsList = [
    { key: 'all_stations', label: 'Global Pump Access', desc: 'Allows monitoring and editing of all station installations.' },
    { key: 'manage_users', label: 'User Directory Control', desc: 'Allows account suspension, profile edits, and role switches.' },
    { key: 'view_revenue', label: 'Financial Records Audits', desc: 'Access to system MRR, ARR, pricing plans, and refund portals.' },
    { key: 'system_config', label: 'System Properties Control', desc: 'Change api limits, security configs, and notifications defaults.' },
    { key: 'export_reports', label: 'Export Operations Data', desc: 'Allows download of financial logs and audit trail csv sheets.' },
    { key: 'own_stations', label: 'Station Management', desc: 'Access own station inventories, employees, and registers.' },
    { key: 'fleet_status', label: 'Logistics Fleet Monitoring', desc: 'Access vehicles log, trips status, and voucher records.' },
    { key: 'view_analytics', label: 'Investor Dashboard View', desc: 'Access portfolio evaluations and overall growth summaries.' }
  ];

  // Pre-configured role checks mapping
  const rolePermissions: Record<string, string[]> = {
    admin: ['all_stations', 'manage_users', 'view_revenue', 'system_config', 'export_reports'],
    pump_owner: ['own_stations', 'export_reports'],
    logistic: ['fleet_status'],
    investor: ['view_analytics'],
    employee: ['own_stations'] // restricted
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      toast.error('Please enter a role label.');
      return;
    }
    const roleSlug = newRoleName.trim().toLowerCase().replace(/\s+/g, '_');
    if (rolePermissions[roleSlug] || customRoles.includes(roleSlug)) {
      toast.error('Role key already exists.');
      return;
    }
    setCustomRoles([...customRoles, roleSlug]);
    setNewRoleName('');
    toast.success(`Custom role "${newRoleName}" registered into system.`);
  };

  const allRoles = ['admin', 'pump_owner', 'logistic', 'investor', 'employee', ...customRoles];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          System Roles & Permissions Matrix
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Define access scopes, audit role structures, and provision custom credentials mapping.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Matrix Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Access Control Grid
            </span>
            <span className="text-[10px] text-slate-400 font-extrabold">CRYPTOGRAPHIC POLICIES INTACT</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">
                  <th className="px-6 py-4 max-w-[200px]">Security Scopes</th>
                  {allRoles.map((role) => (
                    <th key={role} className="px-4 py-4 text-center">
                      <span className="text-[9px] font-extrabold text-slate-600 block uppercase tracking-wider">
                        {role.replace('_', ' ')}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                {permissionsList.map((perm) => (
                  <tr key={perm.key} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 max-w-[200px] space-y-0.5">
                      <span className="text-slate-800 font-extrabold block">
                        {perm.label}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-medium leading-normal">
                        {perm.desc}
                      </span>
                    </td>
                    {allRoles.map((role) => {
                      const hasPerm = (rolePermissions[role] || []).includes(perm.key);
                      return (
                        <td key={role} className="px-4 py-4 text-center">
                          <div className="flex justify-center">
                            {hasPerm ? (
                              <div className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                                <Check className="h-3.5 w-3.5" />
                              </div>
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-slate-50 text-slate-300 border border-slate-100 flex items-center justify-center">
                                <X className="h-3.5 w-3.5" />
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Custom Role Provisioner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5 shadow-xs">
          <div className="space-y-1.5 pb-3 border-b border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Provisioning Controls
            </span>
            <h3 className="text-sm font-extrabold text-slate-800">
              Register New System Role
            </h3>
          </div>

          <form onSubmit={handleCreateRole} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Role Label</label>
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="e.g. Audit Auditor"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-orange-500"
              />
            </div>

            <div className="space-y-2 font-semibold text-xs text-slate-500">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                Assign Scopes
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {permissionsList.map((perm) => (
                  <label key={perm.key} className="flex gap-2.5 items-start p-2 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 rounded border-slate-200 text-orange-500 focus:ring-orange-500/20"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-700 block">{perm.label}</span>
                      <span className="text-[9.5px] text-slate-400 leading-normal block">{perm.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl cursor-pointer transition-colors shadow-lg shadow-orange-500/10 flex items-center justify-center gap-1.5 outline-none"
            >
              <Plus className="h-4 w-4" />
              Provision Access Role
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
