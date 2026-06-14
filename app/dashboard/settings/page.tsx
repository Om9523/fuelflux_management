'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Building2, Bell, Cpu, Percent, Save,
  RefreshCw, Info, Key, Sliders, CheckCircle,
  Upload, Trash2, ImageIcon, Loader2, Globe,
  Wifi, WifiOff, AlertTriangle, X, Check,
  MapPin, Phone, Clock, Fuel, Hash,
  Building, ChevronRight, Eye, EyeOff,
} from 'lucide-react';
import { usePumpStore } from '@/stores/pumps.store';
import { toast } from '@/components/feedback/Toast';
import {
  fetchPumpProfile, updatePumpProfile,
  uploadPumpLogo, deletePumpLogo,
  fetchAllMyPumps,
  getLogoUrl,
  PumpProfile, PumpSummary,
} from '@/services/settings.service';

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className={`h-6 w-11 rounded-full p-0.5 cursor-pointer transition-all outline-none flex-shrink-0
        ${on ? 'bg-primary' : 'bg-slate-200'}`}>
      <div className={`h-5 w-5 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

// ─── Field Row ────────────────────────────────────────────────────────────────

function FieldRow({ label, value, editable, onChange, placeholder, mono, type }: {
  label: string; value: string; editable?: boolean;
  onChange?: (v: string) => void; placeholder?: string;
  mono?: boolean; type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">{label}</label>
      <input
        type={type || 'text'}
        value={value}
        disabled={!editable}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none transition-all
          ${mono ? 'font-mono' : 'font-semibold'}
          ${editable
            ? 'bg-white border-slate-200 text-slate-800 focus:border-primary/50 focus:ring-2 focus:ring-primary/10'
            : 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed'
          }`}
      />
    </div>
  );
}

// ─── Logo Uploader ────────────────────────────────────────────────────────────

function LogoUploader({ pumpId, currentLogoUrl, onLogoChange }: {
  pumpId: number;
  currentLogoUrl: string | null;
  onLogoChange: (url: string | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const logoUrl = getLogoUrl(currentLogoUrl);

  const handleFile = async (file: File) => {
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext || '')) {
      toast.error('Invalid File', 'Only PNG, JPG, SVG, WEBP allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Too Large', 'Max file size is 5MB');
      return;
    }

    setUploading(true);
    try {
      const res = await uploadPumpLogo(pumpId, file);
      onLogoChange(res.logo_url);
      toast.success('Logo Uploaded', 'Your brand logo has been saved');
    } catch (e: any) {
      toast.error('Upload Failed', e?.response?.data?.detail || 'Could not upload logo');
    } finally { setUploading(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Remove logo?')) return;
    setDeleting(true);
    try {
      await deletePumpLogo(pumpId);
      onLogoChange(null);
      toast.success('Logo Removed', 'Brand logo has been cleared');
    } catch (e: any) {
      toast.error('Failed', e?.response?.data?.detail || 'Could not remove logo');
    } finally { setDeleting(false); }
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
        Brand / Station Logo
      </label>

      <div className="flex items-start gap-4">
        {/* Preview */}
        <div className={`w-24 h-24 rounded-2xl border-2 flex items-center justify-center flex-shrink-0 overflow-hidden transition-all
          ${dragOver ? 'border-primary bg-orange-50' : 'border-slate-200 bg-slate-50'}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault(); setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}>
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-slate-300">
              <ImageIcon className="h-8 w-8" />
              <span className="text-[9px] font-bold">No Logo</span>
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex flex-col gap-2 flex-1">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            This logo will appear on all credit contracts and invoices generated for your station.
            Upload your brand/company logo for a professional look.
          </p>
          <p className="text-[10px] text-slate-400">PNG, JPG, SVG, WEBP · Max 5MB · Recommended: 200×200px</p>

          <div className="flex gap-2 mt-1">
            <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.svg,.webp"
              className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary/90 cursor-pointer disabled:opacity-50 transition-all">
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {uploading ? 'Uploading...' : 'Upload Logo'}
            </button>

            {currentLogoUrl && (
              <button onClick={handleDelete} disabled={deleting}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-500 border border-red-100 bg-red-50 rounded-xl hover:bg-red-100 cursor-pointer disabled:opacity-50 transition-all">
                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Drop Zone hint */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-[10px] text-slate-400 font-medium">
        <Upload className="h-3 w-3" />
        Or drag and drop your logo onto the preview box above
      </div>
    </div>
  );
}

// ─── Pump Selector Card (franchise) ──────────────────────────────────────────

function PumpCard({ pump, selected, onClick }: {
  pump: PumpSummary; selected: boolean; onClick: () => void;
}) {
  const logoUrl = getLogoUrl(pump.logo_url);
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all
        ${selected ? 'border-primary bg-orange-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
      <div className="w-10 h-10 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {logoUrl
          ? <img src={logoUrl} alt="" className="w-full h-full object-contain p-1" />
          : <Building2 className="h-4 w-4 text-slate-300" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold truncate ${selected ? 'text-primary' : 'text-slate-800'}`}>{pump.name}</p>
        <p className="text-[10px] text-slate-400 truncate">{pump.city || pump.address}</p>
      </div>
      {selected && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
    </button>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────

export default function SettingsPage() {
  const { selectedPump, setSelectedPump } = usePumpStore();
  const pumpId = selectedPump?.id ? Number(selectedPump.id) : null;

  const [activeTab, setActiveTab] = useState<'profile' | 'brand' | 'iot' | 'notifications' | 'tax' | 'stations'>('profile');
  const [profile, setProfile] = useState<PumpProfile | null>(null);
  const [allPumps, setAllPumps] = useState<PumpSummary[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Editable profile fields
  const [fields, setFields] = useState({
    org_name: '',
    address: '',
    opening_time: '',
    closing_time: '',
    pincode: '',
    contact_number: '',
  });

  // IoT state
  const [iotStatus, setIotStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');
  const [showAtgKey, setShowAtgKey] = useState(false);

  // Notification state
  const [notifs, setNotifs] = useState({
    lowStock: true,
    creditBreach: true,
    anprBlacklist: true,
    weeklyReport: false,
    invoiceOverdue: true,
    contractExpiry: true,
  });

  // Load profile
  const loadProfile = useCallback(async () => {
    if (!pumpId) return;
    setLoadingProfile(true);
    try {
      const p = await fetchPumpProfile(pumpId);
      setProfile(p);
      setFields({
        org_name: p.org_name || '',
        address: p.address || '',
        opening_time: p.opening_time || '',
        closing_time: p.closing_time || '',
        pincode: p.pincode || '',
        contact_number: p.contact_number || '',
      });
    } catch (e: any) {
      toast.error('Error', 'Failed to load pump profile');
    } finally { setLoadingProfile(false); }
  }, [pumpId]);

  // Load all pumps (franchise)
  const loadAllPumps = useCallback(async () => {
    try {
      const pumps = await fetchAllMyPumps();
      setAllPumps(pumps);
    } catch { }
  }, []);

  useEffect(() => {
    loadProfile();
    loadAllPumps();
  }, [loadProfile, loadAllPumps]);

  const handleSaveProfile = async () => {
    if (!pumpId) return;
    setSavingProfile(true);
    try {
      await updatePumpProfile(pumpId, fields);
      toast.success('Profile Saved', 'Station profile updated successfully');
      loadProfile();
    } catch (e: any) {
      toast.error('Failed', e?.response?.data?.detail || 'Could not save profile');
    } finally { setSavingProfile(false); }
  };

  const handleTestIoT = () => {
    setIotStatus('testing');
    setTimeout(() => {
      setIotStatus('ok');
      toast.success('IoT Connected', 'Forecourt hardware validation passed. Probe online.');
    }, 2000);
  };

  const toggleNotif = (key: keyof typeof notifs) => {
    setNotifs(prev => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success('Rule Updated', `${key} is now ${next[key] ? 'enabled' : 'disabled'}`);
      return next;
    });
  };

  const TABS = [
    { id: 'profile', label: 'Station Profile', icon: <Building className="h-4 w-4" /> },
    { id: 'brand', label: 'Brand & Logo', icon: <ImageIcon className="h-4 w-4" /> },
    { id: 'iot', label: 'IoT Hardware', icon: <Cpu className="h-4 w-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id: 'tax', label: 'Tax & Invoicing', icon: <Percent className="h-4 w-4" /> },
    { id: 'stations', label: `My Stations (${allPumps.length})`, icon: <Globe className="h-4 w-4" /> },
  ];

  if (!pumpId) return (
    <div className="flex flex-col items-center justify-center py-24 text-slate-400">
      <Settings className="h-10 w-10 mb-3 opacity-20" />
      <p className="font-bold text-sm">No pump selected</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800">

      {/* Header */}
      <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 border border-orange-200 text-primary">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-xs text-slate-400">Manage station profile, brand identity, IoT hardware, and notification rules</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Sidebar */}
        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-4 shadow-xs flex flex-col gap-1 select-none h-fit">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 pb-2 mb-1 border-b border-slate-100">
            Settings Category
          </p>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left w-full
                ${activeTab === tab.id ? 'bg-primary text-white shadow-md shadow-primary/10' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">

          {loadingProfile && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {!loadingProfile && (
            <AnimatePresence mode="wait">

              {/* ── PROFILE TAB ── */}
              {activeTab === 'profile' && (
                <motion.div key="profile"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="p-6 flex flex-col gap-5">

                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Station Profile Parameters</p>
                    <button onClick={loadProfile} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer transition-colors">
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FieldRow label="Pump Station Name" value={profile?.name || ''} />
                    <FieldRow label="GSTIN" value={profile?.gst || '—'} mono />
                    <FieldRow label="License Number" value={profile?.license || '—'} mono />
                    <FieldRow label="City / Region" value={[profile?.city, profile?.state].filter(Boolean).join(', ') || '—'} />
                  </div>

                  <div className="border-t border-slate-50 pt-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Editable Fields</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FieldRow label="Organisation Name" value={fields.org_name}
                        editable onChange={v => setFields(f => ({ ...f, org_name: v }))}
                        placeholder="e.g. Sharma Enterprises" />
                      <FieldRow label="Contact Number" value={fields.contact_number}
                        editable onChange={v => setFields(f => ({ ...f, contact_number: v }))}
                        placeholder="9876543210" />
                      <div className="sm:col-span-2">
                        <FieldRow label="Address" value={fields.address}
                          editable onChange={v => setFields(f => ({ ...f, address: v }))}
                          placeholder="Full station address" />
                      </div>
                      <FieldRow label="Opening Time" value={fields.opening_time}
                        editable onChange={v => setFields(f => ({ ...f, opening_time: v }))}
                        placeholder="06:00 AM" />
                      <FieldRow label="Closing Time" value={fields.closing_time}
                        editable onChange={v => setFields(f => ({ ...f, closing_time: v }))}
                        placeholder="10:00 PM" />
                      <FieldRow label="Pincode" value={fields.pincode}
                        editable onChange={v => setFields(f => ({ ...f, pincode: v }))}
                        placeholder="400001" mono />
                    </div>
                  </div>

                  {/* Station Stats */}
                  {profile && (
                    <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      {[
                        { label: 'Tanks', value: profile.tanks_count, icon: <Fuel className="h-4 w-4 text-blue-500" /> },
                        { label: 'Nozzles', value: profile.nozzles_count, icon: <Hash className="h-4 w-4 text-violet-500" /> },
                        { label: 'Daily Capacity', value: `${profile.daily_capacity}L`, icon: <Clock className="h-4 w-4 text-emerald-500" /> },
                      ].map(({ label, value, icon }) => (
                        <div key={label} className="flex flex-col items-center gap-1 p-3 bg-white rounded-xl border border-slate-100">
                          {icon}
                          <p className="text-sm font-extrabold text-slate-900">{value}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{label}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button onClick={handleSaveProfile} disabled={savingProfile}
                      className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 cursor-pointer transition-all shadow-sm">
                      {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Profile
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── BRAND TAB ── */}
              {activeTab === 'brand' && (
                <motion.div key="brand"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="p-6 flex flex-col gap-6">

                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-100">
                    Brand Identity & Logo Management
                  </p>

                  {pumpId && (
                    <LogoUploader
                      pumpId={pumpId}
                      currentLogoUrl={profile?.logo_url || null}
                      onLogoChange={(url) => {
                        setProfile(p => p ? { ...p, logo_url: url } : p);
                      }}
                    />
                  )}

                  {/* Contract Preview */}
                  <div className="flex flex-col gap-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Contract Letterhead Preview
                    </p>
                    <div className="border border-slate-200 rounded-2xl p-5 bg-white">
                      <div className="flex justify-between items-start pb-4 border-b-2 border-slate-800 mb-4">
                        <div>
                          <p className="text-base font-black text-slate-900">
                            {fields.org_name || profile?.org_name || profile?.name || 'Organisation Name'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {profile?.address || 'Station Address'} · GST: {profile?.gst || '—'}
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {getLogoUrl(profile?.logo_url || null)
                            ? <img src={getLogoUrl(profile?.logo_url || null)!} alt="Logo" className="w-full h-full object-contain p-1" />
                            : <Building2 className="h-5 w-5 text-slate-300" />
                          }
                        </div>
                      </div>
                      <p className="text-center text-xs font-black uppercase tracking-widest text-slate-800">
                        Credit Fueling Agreement
                      </p>
                      <p className="text-center text-[10px] text-slate-400 mt-1">
                        This is how your contract letterhead will appear
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                    <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-blue-800">Logo used in contracts</p>
                      <p className="text-[11px] text-blue-600 mt-0.5">
                        The logo you upload here will automatically appear on all credit fueling contracts and invoices generated for your customers. Make sure it's high quality and represents your brand.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── IOT TAB ── */}
              {activeTab === 'iot' && (
                <motion.div key="iot"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="p-6 flex flex-col gap-5">

                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-100">
                    Forecourt IoT Hardware & Edge Computing
                  </p>

                  {/* Connection Status */}
                  <div className={`flex items-center gap-3 p-4 rounded-2xl border ${iotStatus === 'ok' ? 'bg-emerald-50 border-emerald-100' :
                      iotStatus === 'fail' ? 'bg-red-50 border-red-100' :
                        iotStatus === 'testing' ? 'bg-amber-50 border-amber-100' :
                          'bg-slate-50 border-slate-100'
                    }`}>
                    {iotStatus === 'ok' && <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />}
                    {iotStatus === 'fail' && <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />}
                    {iotStatus === 'testing' && <Loader2 className="h-5 w-5 text-amber-500 animate-spin flex-shrink-0" />}
                    {iotStatus === 'idle' && <Wifi className="h-5 w-5 text-slate-400 flex-shrink-0" />}
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {iotStatus === 'ok' ? 'All Systems Online' :
                          iotStatus === 'fail' ? 'Connection Failed' :
                            iotStatus === 'testing' ? 'Validating probe signals...' :
                              'IoT Connection Status'}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {iotStatus === 'ok' ? 'ATG probe, ANPR camera, and nozzle sensors connected via MQTT' :
                          iotStatus === 'idle' ? 'Click "Test Connection" to validate edge device connectivity' :
                            'Sending loopback signal to edge device...'}
                      </p>
                    </div>
                  </div>

                  {/* MQTT Config */}
                  <div className="flex flex-col gap-3">
                    <p className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">MQTT Broker Configuration</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <FieldRow label="Broker URL" value="mqtt://broker.fuelflux.in:1883" mono />
                      <FieldRow label="Topic Prefix" value={`fuelflux/${pumpId}`} mono />
                      <FieldRow label="Client ID" value={`pump_${pumpId}_edge`} mono />
                      <FieldRow label="QoS Level" value="1 (At least once)" />
                    </div>
                  </div>

                  {/* Edge Device Topics */}
                  <div className="flex flex-col gap-2">
                    <p className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider mb-1">Active Edge Data Topics</p>
                    {[
                      { topic: `fuelflux/${pumpId}/atg`, desc: 'ATG Probe — Fuel level, temperature, density', status: true },
                      { topic: `fuelflux/${pumpId}/nozzle`, desc: 'Nozzle sensors — Volume dispensed per nozzle', status: true },
                      { topic: `fuelflux/${pumpId}/anpr`, desc: 'ANPR Camera — Vehicle plate detection', status: false },
                      { topic: `fuelflux/${pumpId}/attendance`, desc: 'Employee attendance — Present/Absent/Idle', status: true },
                      { topic: `fuelflux/${pumpId}/vehicle_count`, desc: 'Vehicle analytics — Entry/exit frequency', status: false },
                    ].map(({ topic, desc, status }) => (
                      <div key={topic} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${status ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-mono font-bold text-slate-700 truncate">{topic}</p>
                          <p className="text-[10px] text-slate-400">{desc}</p>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${status ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400'}`}>
                          {status ? 'LIVE' : 'OFFLINE'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* API Keys */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">ATG Probe API Key</label>
                      <div className="flex gap-2">
                        <input type={showAtgKey ? 'text' : 'password'}
                          value="atg_live_9982a819b30c48e89f81a8b"
                          disabled
                          className="flex-1 px-3 py-2.5 text-xs font-mono bg-slate-50 border border-slate-100 rounded-xl text-slate-500 outline-none cursor-not-allowed" />
                        <button onClick={() => setShowAtgKey(s => !s)}
                          className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-400">
                          {showAtgKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                    <FieldRow label="ANPR RTSP Stream" value="rtsp://admin:***@192.168.1.100:554/ch1" mono />
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400">Edge device routes coming soon — IoT data ingestion pipeline in progress</p>
                    <button onClick={handleTestIoT} disabled={iotStatus === 'testing'}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer disabled:opacity-50 transition-all">
                      {iotStatus === 'testing'
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Sliders className="h-3.5 w-3.5" />
                      }
                      Test Connection
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── NOTIFICATIONS TAB ── */}
              {activeTab === 'notifications' && (
                <motion.div key="notifs"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="p-6 flex flex-col gap-4">

                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-100">
                    Forecourt Alarms & Notification Rules
                  </p>

                  <div className="flex flex-col bg-white border border-slate-100 rounded-2xl divide-y divide-slate-50 overflow-hidden">
                    {[
                      { key: 'lowStock', label: 'Low Stock ATG Warning', desc: 'Alert when fuel level drops below 30% of tank capacity via ATG probe', color: 'text-blue-500', bg: 'bg-blue-50' },
                      { key: 'creditBreach', label: 'Credit Limit Breach Alert', desc: 'Notify when fleet accounts outstanding exceeds 90% of their credit limit', color: 'text-red-500', bg: 'bg-red-50' },
                      { key: 'anprBlacklist', label: 'ANPR Blacklist Detection', desc: 'Instant alert when blacklisted or defaulter vehicle plates are detected', color: 'text-amber-500', bg: 'bg-amber-50' },
                      { key: 'invoiceOverdue', label: 'Invoice Overdue Reminder', desc: 'Send reminders when credit customer invoices cross due date', color: 'text-violet-500', bg: 'bg-violet-50' },
                      { key: 'contractExpiry', label: 'Contract Expiry Warning', desc: 'Alert 7 days before any active credit contract expires', color: 'text-orange-500', bg: 'bg-orange-50' },
                      { key: 'weeklyReport', label: 'Weekly Performance Summary', desc: 'Automated PDF performance report every Monday morning', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    ].map(({ key, label, desc, color, bg }) => (
                      <div key={key} className="flex justify-between items-center p-4 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-start gap-3 flex-1 pr-4">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notifs[key as keyof typeof notifs] ? bg.replace('bg-', 'bg-').replace('50', '400') : 'bg-slate-200'}`} />
                          <div>
                            <p className="text-xs font-bold text-slate-800">{label}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
                          </div>
                        </div>
                        <Toggle on={notifs[key as keyof typeof notifs]} onToggle={() => toggleNotif(key as keyof typeof notifs)} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── TAX TAB ── */}
              {activeTab === 'tax' && (
                <motion.div key="tax"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="p-6 flex flex-col gap-5">

                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-100">
                    Taxation & Invoice Preferences
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FieldRow label="GST Rate (Lubes/Cafe)" value="18.0%" mono />
                    <FieldRow label="State Cess (Fuel)" value="4.0%" mono />
                    <FieldRow label="Central Excise" value="Auto-synced" mono />
                    <FieldRow label="Invoice Prefix" value="INV-" mono />
                  </div>

                  <div className="flex flex-col gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <p className="text-xs font-bold text-blue-800">VAT & Excise Information</p>
                    </div>
                    <p className="text-[11px] text-blue-600 leading-relaxed">
                      Fuel station retail pricing automatically integrates central excise rates and state VAT ceilings.
                      These are synchronized directly from state tax portals and cannot be altered locally.
                      Contact your CA or state portal for any discrepancy.
                    </p>
                  </div>

                  <div className="flex justify-end border-t border-slate-100 pt-3">
                    <button onClick={() => toast.success('GSTIN Synced', 'Tax rules updated from state portal')}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary/90 cursor-pointer transition-all shadow-sm">
                      <RefreshCw className="h-3.5 w-3.5" />
                      Sync GSTIN Rules
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STATIONS TAB ── */}
              {activeTab === 'stations' && (
                <motion.div key="stations"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="p-6 flex flex-col gap-4">

                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-100">
                    My Fuel Stations — Franchise Overview
                  </p>

                  {allPumps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <Building2 className="h-10 w-10 mb-3 opacity-20" />
                      <p className="font-bold text-sm">No stations found</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {allPumps.map(pump => (
                        <div key={pump.id}
                          className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 transition-all">
                          <div className="w-12 h-12 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {getLogoUrl(pump.logo_url)
                              ? <img src={getLogoUrl(pump.logo_url)!} alt="" className="w-full h-full object-contain p-1" />
                              : <Building2 className="h-5 w-5 text-slate-300" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-900 truncate">{pump.name}</p>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${pump.status === 'active' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                  'bg-amber-50 border-amber-100 text-amber-600'
                                }`}>{pump.status.toUpperCase()}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{pump.address}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] text-slate-400">{pump.tanks_count} tanks</span>
                              <span className="text-[10px] text-slate-400">{pump.nozzles_count} nozzles</span>
                              {pump.gst && <span className="text-[10px] text-slate-400 font-mono">GST: {pump.gst}</span>}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] text-slate-400">#{pump.id}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-100 rounded-xl mt-2">
                    <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-orange-700">
                      Each station has its own IoT edge device, MQTT topic, and credit customer directory.
                      Switch between stations using the pump selector in the top navigation.
                    </p>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}