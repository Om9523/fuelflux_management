'use client';

import React, { useEffect, useState } from 'react';
import {
  Building,
  ShieldCheck,
  FileText,
  Save,
  CheckCircle2,
  Key
} from 'lucide-react';
import { useFleetStore } from '@/stores/fleet.store';
import { logisticService } from '@/services/logistic.service';
import { toast } from '@/components/feedback/Toast';

export default function ProfilePage() {
  const { activeFleetId, fleets } = useFleetStore();

  const activeFleet = fleets.find((f) => f.id === activeFleetId) || fleets[0];

  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [saving, setSaving] = useState(false);

  // Policy Settings
  const [pinRequired, setPinRequired] = useState(true);
  const [restrictNightFill, setRestrictNightFill] = useState(false);
  const [allowCng, setAllowCng] = useState(true);

  // Sync state with active fleet
  useEffect(() => {
    if (activeFleet) {
      setCompanyName(activeFleet.name);
      setGstin(activeFleet.gstin);
      setBillingAddress(activeFleet.billingAddress);
    }
  }, [activeFleet]);

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !gstin || !billingAddress) {
      toast.error('Please fill in all company information.');
      return;
    }

    setSaving(true);
    try {
      await logisticService.updateProfile({
        name: companyName,
        gstin,
        billingAddress,
      });
      toast.success('Corporate configuration saved successfully.');
      setSaving(false);
    } catch (_err) {
      toast.error('Failed to update company profile.');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Company Settings
          </h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">
            Configure billing profiles, GST parameters, and dispenser authorization policies
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Settings Form (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleUpdateProfileSubmit} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Corporate Billing Profile</h3>
              <span className="text-[10px] font-black bg-orange-50 text-orange-600 border border-orange-100/50 px-2 py-0.5 rounded-md uppercase">
                GST Registered
              </span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Registered Company Name *</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Corporate GSTIN Number *</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Registered Billing Address *</label>
                <textarea
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-orange-500 h-24 resize-none"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/10 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Company Details'}
              </button>
            </div>
          </form>

          {/* Refueling Authorization Policy */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Refueling Authorization Policy</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Require Driver OTP PIN Verification</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Dispenser locks until driver enters SMS OTP PIN code at pump terminal.</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pinRequired}
                    onChange={(e) => setPinRequired(e.target.checked)}
                    className="sr-only peer"
                    id="pinVerificationToggle"
                  />
                  <label
                    htmlFor="pinVerificationToggle"
                    className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Restrict Night Fueling</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Refuse dispenser releases between 10:00 PM and 6:00 AM.</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={restrictNightFill}
                    onChange={(e) => setRestrictNightFill(e.target.checked)}
                    className="sr-only peer"
                    id="restrictNightToggle"
                  />
                  <label
                    htmlFor="restrictNightToggle"
                    className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Allow CNG fueling limits</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Enables vehicles registered for CNG to request vouchers or credit.</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowCng}
                    onChange={(e) => setAllowCng(e.target.checked)}
                    className="sr-only peer"
                    id="allowCngToggle"
                  />
                  <label
                    htmlFor="allowCngToggle"
                    className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Account Credentials (1/3 width) */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Security Keys</h3>
            
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2.5 text-xs">
                <Key className="h-4.5 w-4.5 text-slate-400" />
                <div>
                  <p className="font-bold text-slate-700">API Access Token</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Token: ff_sec_key_44322</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 border-t border-slate-200/60 pt-3">
                <span>Created 2026-05-01</span>
                <button className="text-orange-500 hover:underline cursor-pointer">Rotate Key</button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Operational Compliance</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-xs">
                <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800">GSTIN Audited</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">GST filings and input tax credit accounts successfully matched.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-t border-slate-100 pt-3 text-xs">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800">KYC Compliant</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Logistics carrier business license verified under Central motor authority rules.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
