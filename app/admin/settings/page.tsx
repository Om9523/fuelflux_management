'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Shield, KeyRound, Save, Copy, Plus, RefreshCw } from 'lucide-react';
import { toast } from '@/components/feedback/Toast';
import backendApi from '@/lib/backendApi';

export default function AdminSettingsPage() {
  const [sessionExpiry, setSessionExpiry] = useState('30');
  const [require2fa, setRequire2fa] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [creditDefault, setCreditDefault] = useState('500000');
  const [alertThreshold, setAlertThreshold] = useState('200000');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await backendApi.get('/admin/settings');
      const d = res.data.data;
      setCreditDefault(String(d.default_fleet_credit_limit));
      setAlertThreshold(String(d.transaction_alert_threshold));
      setRequire2fa(d.require_2fa);
      setSessionExpiry(String(d.admin_session_expiry_minutes));
      setApiKey(d.api_key || '');
    } catch { toast.error('Failed to load settings.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await backendApi.patch('/admin/settings', {
        default_fleet_credit_limit: parseFloat(creditDefault),
        transaction_alert_threshold: parseFloat(alertThreshold),
        require_2fa: require2fa,
        admin_session_expiry_minutes: parseInt(sessionExpiry),
      });
      toast.success('Settings saved successfully.');
    } catch (e: any) { toast.error(e.message || 'Failed to save settings.'); }
    finally { setSaving(false); }
  };

  const handleGenerateKey = async () => {
    setRegenerating(true);
    try {
      const res = await backendApi.post('/admin/settings/regenerate-key');
      setApiKey(res.data.data.api_key);
      toast.success('New API key generated.');
    } catch { toast.error('Failed to regenerate key.'); }
    finally { setRegenerating(false); }
  };

  if (loading) {
    return <div className="text-center py-20 text-xs font-bold text-slate-400">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">System & Platform Settings</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Configure security policies, API integrations, and global limits.</p>
        </div>
        <button onClick={fetchSettings} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-600 outline-none cursor-pointer">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* General */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex gap-2.5 items-center border-b border-slate-100 pb-3">
              <div className="p-2 bg-orange-50 text-orange-500 rounded-xl border border-orange-100">
                <Settings className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">Platform Default Parameters</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Default Fleet Credit Limit (₹)</label>
                <input type="number" value={creditDefault} onChange={e => setCreditDefault(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-orange-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Transaction Alert Threshold (₹)</label>
                <input type="number" value={alertThreshold} onChange={e => setAlertThreshold(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-orange-500" />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex gap-2.5 items-center border-b border-slate-100 pb-3">
              <div className="p-2 bg-rose-50 text-rose-500 rounded-xl border border-rose-100">
                <Shield className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">Authentication Security Policies</h3>
            </div>
            <div className="space-y-3 text-xs font-semibold text-slate-600">
              <div className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-slate-50/20">
                <div>
                  <span className="text-slate-800 font-extrabold block">Mandatory 2FA</span>
                  <span className="text-[10px] text-slate-400">Enforce 2FA for all admin logins.</span>
                </div>
                <input type="checkbox" checked={require2fa} onChange={e => setRequire2fa(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-orange-500" />
              </div>
              <div className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-slate-50/20">
                <div>
                  <span className="text-slate-800 font-extrabold block">Session Expiry</span>
                  <span className="text-[10px] text-slate-400">Admin token auto-invalidation timeout.</span>
                </div>
                <select value={sessionExpiry} onChange={e => setSessionExpiry(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-orange-500 cursor-pointer">
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">60 Minutes</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right: API Keys + Save */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex gap-2.5 items-center border-b border-slate-100 pb-3">
              <div className="p-2 bg-indigo-50 text-indigo-500 rounded-xl border border-indigo-100">
                <KeyRound className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-800">API Credentials</h3>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-500 block">Primary Secret Key</label>
              <div className="flex gap-2 items-center">
                <input type="text" value={apiKey} readOnly
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-600 outline-none select-all" />
                <button type="button" onClick={() => { navigator.clipboard.writeText(apiKey); toast.success('Copied!'); }}
                  className="p-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-pointer outline-none">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <button type="button" onClick={handleGenerateKey} disabled={regenerating}
                className="w-full py-2.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer outline-none flex items-center justify-center gap-1.5 disabled:opacity-50">
                <Plus className="h-4 w-4" /> {regenerating ? 'Generating...' : 'Regenerate Key'}
              </button>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full py-3.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl cursor-pointer transition-colors shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2 outline-none border-0 disabled:opacity-50">
            <Save className="h-4.5 w-4.5" />
            {saving ? 'Saving...' : 'Save Configurations'}
          </button>
        </div>
      </div>
    </div>
  );
}