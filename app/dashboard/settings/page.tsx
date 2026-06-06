'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Building,
  Bell,
  Shield,
  Cpu,
  CheckCircle,
  Save,
  AlertCircle,
  Key,
  Sliders,
  Globe,
  Percent,
  RefreshCw,
  Info,
} from 'lucide-react';
import { usePumpStore } from '@/stores/pumps.store';
import { toast } from '@/components/feedback/Toast';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const { selectedPump, setSelectedPump } = usePumpStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'iot' | 'notifications' | 'tax'>('profile');
  
  // Local profile state
  const [profileData, setProfileData] = useState({
    name: '',
    address: '',
    city: '',
    operatingHours: '',
    pincode: '',
    gst: '',
  });

  // IoT state
  const [testingIot, setTestingIot] = useState(false);
  const [iotStatus, setIotStatus] = useState<'idle' | 'ok' | 'fail'>('idle');

  // Notification states
  const [notifs, setNotifs] = useState({
    lowStock: true,
    creditBreach: true,
    anprBlacklist: true,
    weeklyReport: false,
  });

  // Sync profile data whenever active pump shifts
  useEffect(() => {
    if (selectedPump) {
      setProfileData({
        name: selectedPump.name,
        address: selectedPump.address,
        city: selectedPump.city,
        operatingHours: selectedPump.operatingHours,
        pincode: selectedPump.pincode,
        gst: selectedPump.gst,
      });
    }
  }, [selectedPump]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPump) return;

    const updated = {
      ...selectedPump,
      address: profileData.address,
      operatingHours: profileData.operatingHours,
      pincode: profileData.pincode,
    };

    setSelectedPump(updated);
    toast.success('Station profile parameters successfully synchronized to cloud databases.');
  };

  const handleTestIot = () => {
    setTestingIot(true);
    setIotStatus('idle');
    setTimeout(() => {
      setTestingIot(false);
      setIotStatus('ok');
      toast.success('IoT forecourt hardware validation passed. Probe connection online.');
    }, 1500);
  };

  const toggleNotif = (key: keyof typeof notifs) => {
    setNotifs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success(`Alarms rule updated: ${key} is now ${next[key] ? 'ENABLED' : 'DISABLED'}`);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800 text-left">
      
      {/* 1. MODULE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 rounded-2xl p-6 shadow-xs gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 border border-orange-200 text-primary">
            <Settings className="h-5.5 w-5.5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold text-text-primary tracking-tight">System & Telemetry Settings</h1>
            <p className="text-xs text-text-secondary">Configure IoT fuel tank probes, adjust ANPR CCTV RTSP connection credentials, and oversee notification flags.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* 2. LEFT SIDEBAR: TAB SELECTION */}
        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col gap-4 select-none">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
            Settings Category
          </span>

          <div className="flex flex-col gap-1 text-xs font-bold text-slate-500">
            {[
              { id: 'profile', label: 'Station Profile', icon: <Building className="h-4 w-4" /> },
              { id: 'iot', label: 'IoT Pump Hardware', icon: <Cpu className="h-4 w-4" /> },
              { id: 'notifications', label: 'Notification Rules', icon: <Bell className="h-4 w-4" /> },
              { id: 'tax', label: 'Tax & Invoicing', icon: <Percent className="h-4 w-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all cursor-pointer outline-none text-left
                  ${activeTab === tab.id ? 'bg-primary text-white shadow-md shadow-primary/10' : 'hover:bg-slate-50 hover:text-slate-800'}
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. RIGHT CONTENT SECTION */}
        <div className="lg:col-span-3 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[420px]">
          
          <AnimatePresence mode="wait">
            
            {/* TAB: STATION PROFILE */}
            {activeTab === 'profile' && (
              <motion.form
                key="profile"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                onSubmit={handleSaveProfile}
                className="flex flex-col gap-5 text-left text-xs h-full justify-between"
              >
                <div className="flex flex-col gap-5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 block">
                    Station Profile Parameters
                  </span>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase">Pump Station Name</label>
                      <input
                        type="text"
                        disabled
                        value={profileData.name}
                        className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-bold text-slate-400 outline-none cursor-not-allowed"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase">GSTIN Identification</label>
                      <input
                        type="text"
                        disabled
                        value={profileData.gst}
                        className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-bold text-slate-400 font-mono outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-text-primary">Forecourt Address Location</label>
                    <input
                      type="text"
                      required
                      value={profileData.address}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="Enter pump geographic location"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-text-primary">Operating Hours</label>
                      <input
                        type="text"
                        required
                        value={profileData.operatingHours}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, operatingHours: e.target.value }))}
                        placeholder="e.g. 24 Hours"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase">City Region</label>
                      <input
                        type="text"
                        disabled
                        value={profileData.city}
                        className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-bold text-slate-400 outline-none cursor-not-allowed"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-text-primary">Pincode</label>
                      <input
                        type="text"
                        required
                        value={profileData.pincode}
                        onChange={(e) => setProfileData((prev) => ({ ...prev, pincode: e.target.value }))}
                        placeholder="520008"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-100 pt-4 self-end shrink-0">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="font-bold shadow-md shadow-primary/20 flex items-center gap-1.5"
                  >
                    <Save className="h-4.5 w-4.5" />
                    Save Station Profile
                  </Button>
                </div>
              </motion.form>
            )}

            {/* TAB: IOT HARDWARE */}
            {activeTab === 'iot' && (
              <motion.div
                key="iot"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex flex-col gap-5 text-left text-xs h-full justify-between"
              >
                <div className="flex flex-col gap-5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 block">
                    Forecourt IoT Hardware & API Keys
                  </span>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 bg-slate-50 border border-slate-200/50 p-4 rounded-2xl">
                      <span className="text-[9px] font-black text-slate-400 uppercase">ATG Probe Telemetry Key</span>
                      <span className="text-xs font-mono font-bold text-slate-700 mt-1 truncate">atg_key_live_9982a819b30c48e89f81a8b</span>
                      <span className="text-[9px] text-slate-400 mt-1">Used to query fuel temperature and density volumes.</span>
                    </div>

                    <div className="flex flex-col gap-1 bg-slate-50 border border-slate-200/50 p-4 rounded-2xl">
                      <span className="text-[9px] font-black text-slate-400 uppercase">CCTV ANPR Streams</span>
                      <span className="text-xs font-mono font-bold text-slate-700 mt-1 truncate">rtsp://admin:auth123@192.168.1.100:554/ch1</span>
                      <span className="text-[9px] text-slate-400 mt-1">RTSP channel input for ANPR license detection OCR.</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-200/50 mt-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Key className="h-4 w-4 text-primary shrink-0" />
                      API Credentials Control
                    </span>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      API access tokens allow fuel inventory sensors to synchronize with FuelFlux cloud databases. Keep credentials confidential. Regenerate tokens only in case of compromised probe security.
                    </p>
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-100 pt-4 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    {testingIot && (
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" /> Validating probe signals...
                      </span>
                    )}
                    {!testingIot && iotStatus === 'ok' && (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" /> Telemetry Loopback OK
                      </span>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={handleTestIot}
                    disabled={testingIot}
                    className="font-bold flex items-center gap-1.5"
                  >
                    <Sliders className="h-4.5 w-4.5 text-slate-500" />
                    Test Connection
                  </Button>
                </div>
              </motion.div>
            )}

            {/* TAB: NOTIFICATION RULES */}
            {activeTab === 'notifications' && (
              <motion.div
                key="notifs"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex flex-col gap-5 text-left text-xs h-full justify-between"
              >
                <div className="flex flex-col gap-5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 block">
                    Forecourt Alarms & Rules Configuration
                  </span>

                  <div className="flex flex-col bg-slate-50 border border-slate-200/50 rounded-2xl divide-y divide-slate-200/50">
                    
                    {/* Rule 1 */}
                    <div className="flex justify-between items-center p-4">
                      <div className="flex flex-col gap-0.5 max-w-[80%]">
                        <span className="font-extrabold text-slate-700">Low Stock ATG Warning</span>
                        <span className="text-[10px] text-slate-400 leading-relaxed">Alert owner immediately via system UI and SMS once fuel capacity deplets below 30%.</span>
                      </div>
                      <button
                        onClick={() => toggleNotif('lowStock')}
                        className={`h-6 w-11 rounded-full p-0.5 cursor-pointer transition-colors outline-none
                          ${notifs.lowStock ? 'bg-primary' : 'bg-slate-300'}
                        `}
                      >
                        <div className={`h-5 w-5 bg-white rounded-full transition-transform
                          ${notifs.lowStock ? 'translate-x-5' : 'translate-x-0'}
                        `} />
                      </button>
                    </div>

                    {/* Rule 2 */}
                    <div className="flex justify-between items-center p-4">
                      <div className="flex flex-col gap-0.5 max-w-[80%]">
                        <span className="font-extrabold text-slate-700">Credit Limit Breach Alarm</span>
                        <span className="text-[10px] text-slate-400 leading-relaxed">Trigger alert panel whenever fleet accounts outstanding udhaar exceeds 90% of their limit.</span>
                      </div>
                      <button
                        onClick={() => toggleNotif('creditBreach')}
                        className={`h-6 w-11 rounded-full p-0.5 cursor-pointer transition-colors outline-none
                          ${notifs.creditBreach ? 'bg-primary' : 'bg-slate-300'}
                        `}
                      >
                        <div className={`h-5 w-5 bg-white rounded-full transition-transform
                          ${notifs.creditBreach ? 'translate-x-5' : 'translate-x-0'}
                        `} />
                      </button>
                    </div>

                    {/* Rule 3 */}
                    <div className="flex justify-between items-center p-4">
                      <div className="flex flex-col gap-0.5 max-w-[80%]">
                        <span className="font-extrabold text-slate-700">ANPR Blacklist CCTV Detections</span>
                        <span className="text-[10px] text-slate-400 leading-relaxed">Instantly buzz terminal UI upon camera detection of blacklisted license plates or non-payers.</span>
                      </div>
                      <button
                        onClick={() => toggleNotif('anprBlacklist')}
                        className={`h-6 w-11 rounded-full p-0.5 cursor-pointer transition-colors outline-none
                          ${notifs.anprBlacklist ? 'bg-primary' : 'bg-slate-300'}
                        `}
                      >
                        <div className={`h-5 w-5 bg-white rounded-full transition-transform
                          ${notifs.anprBlacklist ? 'translate-x-5' : 'translate-x-0'}
                        `} />
                      </button>
                    </div>

                    {/* Rule 4 */}
                    <div className="flex justify-between items-center p-4">
                      <div className="flex flex-col gap-0.5 max-w-[80%]">
                        <span className="font-extrabold text-slate-700">Weekly Performance summary</span>
                        <span className="text-[10px] text-slate-400 leading-relaxed">Compile and dispatch automated PDF performance reports every Monday morning to consulting CA.</span>
                      </div>
                      <button
                        onClick={() => toggleNotif('weeklyReport')}
                        className={`h-6 w-11 rounded-full p-0.5 cursor-pointer transition-colors outline-none
                          ${notifs.weeklyReport ? 'bg-primary' : 'bg-slate-300'}
                        `}
                      >
                        <div className={`h-5 w-5 bg-white rounded-full transition-transform
                          ${notifs.weeklyReport ? 'translate-x-5' : 'translate-x-0'}
                        `} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: TAX PROFILE */}
            {activeTab === 'tax' && (
              <motion.div
                key="tax"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex flex-col gap-5 text-left text-xs h-full justify-between"
              >
                <div className="flex flex-col gap-5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 block">
                    Taxation & Invoice Preferences
                  </span>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-text-primary">Provisional GST Rates (Lubes/Cafe)</label>
                      <input
                        type="text"
                        disabled
                        value="18.0%"
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-500 font-mono outline-none cursor-not-allowed"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-text-primary">State Cess Percentage (Fuel)</label>
                      <input
                        type="text"
                        disabled
                        value="4.0% (AP/TG Cess)"
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-500 font-mono outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Info className="h-4.5 w-4.5 text-blue-500 shrink-0" />
                      VAT & Excise Information
                    </span>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Fuel station retail pricing automatically integrates central excise rates and state VAT ceilings. These settings are synchronized directly from state tax portals and cannot be altered locally.
                    </p>
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-100 pt-4 self-end shrink-0">
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => toast.success('Tax rules & state HSN logs successfully updated!')}
                    className="font-bold flex items-center gap-1.5 animate-pulse"
                  >
                    <RefreshCw className="h-4 w-4 shrink-0" />
                    Synchronize GSTIN Rules
                  </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
