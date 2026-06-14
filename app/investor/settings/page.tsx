'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  ShieldCheck,
  Bell,
  Mail,
  FileText,
  Key,
  Save,
  Lock,
  Compass,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from '@/components/feedback/Toast';

export default function SettingsPage() {
  const { user } = useAuthStore();

  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [anomalyAlert, setAnomalyAlert] = useState(true);
  const [creditAlert, setCreditAlert] = useState(false);
  const [defaultFormat, setDefaultFormat] = useState('pdf');

  const handleSaveSettings = () => {
    toast.success('Investor preferences saved successfully.');
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Venture Settings
          </h1>
          <p className="text-xs font-semibold text-slate-505 mt-1">
            Configure report delivery parameters, email digest alerts, and security API keys
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings options (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Alert Preferences */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
              Venture Notification channels
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Weekly Performance Digest</h4>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Receive aggregated revenue and profit margin audits every Monday morning.</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={weeklyDigest}
                    onChange={(e) => setWeeklyDigest(e.target.checked)}
                    className="sr-only peer"
                    id="weeklyDigestToggle"
                  />
                  <label
                    htmlFor="weeklyDigestToggle"
                    className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Siphoning & Loss Alerts</h4>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Instant alerts on abnormal ATG level drops or dispenser offset variances.</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={anomalyAlert}
                    onChange={(e) => setAnomalyAlert(e.target.checked)}
                    className="sr-only peer"
                    id="anomalyAlertToggle"
                  />
                  <label
                    htmlFor="anomalyAlertToggle"
                    className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">B2B Credit Exposure Limits</h4>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Alerts when transport carrier outstanding udhaar balances exceed 80% bounds.</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={creditAlert}
                    onChange={(e) => setCreditAlert(e.target.checked)}
                    className="sr-only peer"
                    id="creditAlertToggle"
                  />
                  <label
                    htmlFor="creditAlertToggle"
                    className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Export Preferences */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
              Export Formatting
            </h3>

            <div className="space-y-3.5 text-xs font-semibold text-slate-600">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Preferred Compile Format</label>
                <select
                  value={defaultFormat}
                  onChange={(e) => setDefaultFormat(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-orange-500/50 cursor-pointer font-sans"
                >
                  <option value="pdf" className="bg-white text-slate-800">Adobe PDF Document (.pdf)</option>
                  <option value="csv" className="bg-white text-slate-800">Comma-Separated Ledger (.csv)</option>
                  <option value="xls" className="bg-white text-slate-800">Microsoft Excel Spreadsheet (.xlsx)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button
                onClick={handleSaveSettings}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="h-4 w-4" /> Save Preferences
              </button>
            </div>
          </div>
        </div>

        {/* Credentials and Security Info (1/3 width) */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
              Stakeholder Credentials
            </h3>

            <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4 space-y-3.5 text-xs font-semibold text-slate-650">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Name</span>
                <span className="font-bold text-slate-850">{user?.name || 'Investor'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Registered Email</span>
                <span className="font-bold text-slate-850">{user?.email || 'investor@fuelflux.com'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Authorized Role</span>
                <span className="px-2 py-0.5 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded text-[9px] font-black uppercase">
                  Venture Partner
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
              API Auditing Keys
            </h3>

            <div className="bg-slate-50 border border-slate-200/40 rounded-2xl p-4 space-y-3.5 text-xs font-semibold text-slate-650">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-slate-450 shrink-0" />
                <div>
                  <p className="font-bold text-slate-800">Auditor Read Key</p>
                  <p className="text-[9px] font-mono text-slate-400 mt-0.5 uppercase tracking-wide">Key: ff_bi_aud_9982</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
