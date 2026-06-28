'use client';

import React, { useEffect, useState } from 'react';
import { Search, RefreshCw, Terminal, Calendar } from 'lucide-react';
import { toast } from '@/components/feedback/Toast';
import backendApi from '@/lib/backendApi';

interface AuditLog { id: string; action: string; admin_id: string; admin_email: string; target_type: string | null; target_id: string | null; timestamp: string; }

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await backendApi.get('/admin/audit-log');
      setLogs(res.data.data?.logs || []);
    } catch { toast.error('Failed to load audit logs.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, []);

  const filtered = logs.filter(l =>
    !searchTerm ||
    l.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.admin_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.target_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Security & Operations Audit Trail</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">All admin actions logged with timestamp.</p>
        </div>
        <button onClick={fetchLogs} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-600 outline-none cursor-pointer">
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="bg-white border border-slate-200 p-4 rounded-2xl">
        <div className="relative max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search action, admin, entity..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-orange-500" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <th className="px-5 py-4">Action</th>
                <th className="px-5 py-4">Target</th>
                <th className="px-5 py-4">Admin</th>
                <th className="px-5 py-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
              {isLoading ? (
                <tr><td colSpan={4} className="text-center py-10 text-slate-400 font-bold">Loading audit logs...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10 text-slate-400 font-bold">
                  {logs.length === 0 ? 'Audit log DB model not yet implemented — logs visible in backend console.' : 'No matching logs.'}
                </td></tr>
              ) : filtered.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg shrink-0">
                        <Terminal className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                      <span className="text-slate-800 font-extrabold">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {log.target_type && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-slate-600 uppercase">
                        {log.target_type} #{log.target_id}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{log.admin_email}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center gap-1.5 justify-end text-slate-400 font-mono text-[10px]">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}