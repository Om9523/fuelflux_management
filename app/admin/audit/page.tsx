'use client';

import React, { useEffect, useState } from 'react';
import { ClipboardList, Search, RefreshCw, Calendar, Terminal } from 'lucide-react';
import { useAuditStore } from '@/stores/audit.store';

export default function AdminAuditPage() {
  const { auditLogs, fetchAuditLogs, isLoading } = useAuditStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filteredLogs = auditLogs.filter((log) => {
    return (
      log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm)
    );
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Security & Operations Audit Trail
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Immutable log catalog of all administrative actions, session approvals, and configuration changes.
          </p>
        </div>
        <button
          onClick={fetchAuditLogs}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors cursor-pointer outline-none active:scale-95"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Audits
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search admin, action, or entity..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-orange-500"
          />
        </div>
      </div>

      {/* Audits Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4">Security Action</th>
                <th className="px-6 py-4">Scoped Entity</th>
                <th className="px-6 py-4">Audit Actor</th>
                <th className="px-6 py-4 font-mono">IP Address</th>
                <th className="px-6 py-4">Outcome</th>
                <th className="px-6 py-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 font-bold text-slate-400">
                    Syncing cryptographic audits logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 font-bold text-slate-400">
                    No matching audit trail logs recorded.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex gap-2.5 items-center">
                        <div className="p-2 bg-slate-50 text-slate-600 rounded-lg border border-slate-100/50 shrink-0">
                          <Terminal className="h-4 w-4" />
                        </div>
                        <span className="text-slate-800 font-extrabold block max-w-[280px] leading-relaxed">
                          {log.action}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-slate-600 uppercase">
                        {log.entity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-bold">
                      {log.adminName}
                    </td>
                    <td className="px-6 py-4 font-mono text-[10.5px] text-slate-600">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9.5px] font-extrabold px-2 py-0.5 border rounded-md uppercase
                        ${log.result === 'Success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}
                      `}>
                        {log.result}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500 font-medium font-mono text-[10px]">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
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
