'use client';

import React, { useState } from 'react';
import { Settings, Shield, KeyRound, Terminal, Save, Copy, Plus } from 'lucide-react';
import { toast } from '@/components/feedback/Toast';
import { api } from '@/lib/api';

export default function AdminSettingsPage() {
  const [sessionExpiry, setSessionExpiry] = useState('30');
  const [require2fa, setRequire2fa] = useState(true);
  const [apiKey, setApiKey] = useState('ff_live_55af28d9c22883eb9e3');
  const [creditDefault, setCreditDefault] = useState('500000');

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulate saving setting to mock database via mock post/patch which writes an audit log
      const auditLogs = JSON.parse(localStorage.getItem('fuelflux_audit_logs') || '[]');
      auditLogs.push({
        id: 'audit_' + Math.random().toString(36).substr(2, 9),
        adminName: 'Suresh Patel',
        action: `Updated platform settings (sessionExpiry=${sessionExpiry}m, require2fa=${require2fa}, defaultCredit=${creditDefault})`,
        entity: 'System Config',
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.1',
        result: 'Success',
      });
      localStorage.setItem('fuelflux_audit_logs', JSON.stringify(auditLogs));

      toast.success('System configuration updated successfully.');
    } catch (err) {
      toast.error('Failed to save settings.');
    }
  };

  const handleGenerateKey = () => {
    const key = 'ff_live_' + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);
    setApiKey(key);
    toast.success('New API key generated successfully.');
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast.info('API Key copied to clipboard.');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          System & Platform Settings
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Configure security policies, API integrations, global limits, and notification templates.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Configuration tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Limits */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex gap-2.5 items-center border-b border-slate-100 pb-3">
              <div className="p-2 bg-orange-50 text-orange-500 rounded-xl border border-orange-100 shrink-0">
                <Settings className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">
                Platform Default Parameters
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Default Fleet Credit Limit (INR)</label>
                <input
                  type="number"
                  value={creditDefault}
                  onChange={(e) => setCreditDefault(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Transaction Daily Alert Threshold (INR)</label>
                <input
                  type="number"
                  defaultValue="200000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Security Policy */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex gap-2.5 items-center border-b border-slate-100 pb-3">
              <div className="p-2 bg-rose-50 text-rose-500 rounded-xl border border-rose-100 shrink-0">
                <Shield className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">
                Authentication Security Policies
              </h3>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-slate-50/20">
                <div className="space-y-0.5 max-w-[70%]">
                  <span className="text-slate-800 font-extrabold block">Mandatory 2FA authentication</span>
                  <span className="text-[10px] text-slate-400 block leading-normal">
                    Enforce 2FA verification code checking for all administrative credentials entries.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={require2fa}
                  onChange={(e) => setRequire2fa(e.target.checked)}
                  className="rounded border-slate-200 text-orange-500 focus:ring-orange-500/20 h-4.5 w-4.5"
                />
              </div>

              <div className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-slate-50/20">
                <div className="space-y-0.5 max-w-[70%]">
                  <span className="text-slate-800 font-extrabold block">Admin Session Invalidation Limit</span>
                  <span className="text-[10px] text-slate-400 block leading-normal">
                    Minutes of idle inactivity before admin JWT claim is invalidated and forces logout.
                  </span>
                </div>
                <select
                  value={sessionExpiry}
                  onChange={(e) => setSessionExpiry(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-orange-500 cursor-pointer"
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">60 Minutes</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Integrations API keys */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex gap-2.5 items-center border-b border-slate-100 pb-3">
              <div className="p-2 bg-indigo-50 text-indigo-500 rounded-xl border border-indigo-100 shrink-0">
                <KeyRound className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">
                Developer API Credentials
              </h3>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 block">Primary Secret Key</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={apiKey}
                    readOnly
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-600 outline-none select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="p-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 shrink-0 cursor-pointer"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateKey}
                className="w-full py-2.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5 outline-none"
              >
                <Plus className="h-4 w-4" />
                Regenerate Live Token
              </button>
            </div>
          </div>

          {/* Action Trigger */}
          <button
            type="submit"
            className="w-full py-3.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl cursor-pointer transition-colors shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2 outline-none border-0"
          >
            <Save className="h-4.5 w-4.5" />
            Save Configurations
          </button>
        </div>
      </form>
    </div>
  );
}
