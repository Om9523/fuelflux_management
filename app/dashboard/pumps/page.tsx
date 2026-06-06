'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Plus,
  Fuel,
  CheckCircle,
  Clock,
  MapPin,
  Layers,
  FileText,
  UploadCloud,
  X,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { usePumpStore, Pump, PumpStatus } from '@/stores/pumps.store';
import { toast } from '@/components/feedback/Toast';

export default function PumpsPage() {
  const { pumps, addPump, isLoading, initializePumps } = usePumpStore();

  React.useEffect(() => {
    initializePumps();
  }, [initializePumps]);

  // Wizard state toggles
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState<any>({
    name: '',
    ownerName: 'Rajesh Kumar',
    gst: '',
    license: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    fuelTypes: [],
    tanksCount: 2,
    nozzlesCount: 6,
    dailyCapacity: 20000,
    operatingHours: '24 Hours',
  });

  // Simulated uploader files
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { name: string; progress: number }>>({});

  const handleInputChange = (field: string, val: any) => {
    setWizardData((prev: any) => ({ ...prev, [field]: val }));
  };

  const handleFuelToggle = (fuel: string) => {
    const current = wizardData.fuelTypes;
    if (current.includes(fuel)) {
      handleInputChange('fuelTypes', current.filter((f: string) => f !== fuel));
    } else {
      handleInputChange('fuelTypes', [...current, fuel]);
    }
  };

  // Simulating drag & drop upload mechanics
  const triggerSimulatedUpload = (docKey: string, fileName: string) => {
    setUploadedFiles((prev) => ({ ...prev, [docKey]: { name: fileName, progress: 0 } }));
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      setUploadedFiles((prev) => {
        if (!prev[docKey]) {
          clearInterval(interval);
          return prev;
        }
        return {
          ...prev,
          [docKey]: { ...prev[docKey], progress: currentProgress },
        };
      });

      if (currentProgress >= 100) {
        clearInterval(interval);
        toast.success(`Successfully uploaded document: ${fileName}`);
      }
    }, 200);
  };

  const removeUploadedFile = (docKey: string) => {
    setUploadedFiles((prev) => {
      const copy = { ...prev };
      delete copy[docKey];
      return copy;
    });
  };

  const handleFormSubmit = async () => {
    if (
      !wizardData.name ||
      !wizardData.gst ||
      !wizardData.license ||
      !wizardData.address ||
      !wizardData.city ||
      !wizardData.state ||
      !wizardData.pincode
    ) {
      toast.error('Please complete all pump details and registration fields.');
      return;
    }

    if (wizardData.fuelTypes.length === 0) {
      toast.error('Please select at least one active fuel type.');
      return;
    }

    // Ensure all 4 documents are uploaded for verification
    const docs = ['gstCert', 'fuelLic', 'aadhaar', 'pan'];
    const missingDocs = docs.filter((d) => !uploadedFiles[d] || uploadedFiles[d].progress < 100);
    
    if (missingDocs.length > 0) {
      toast.error('Verification requires uploading all four compliance documents.');
      return;
    }

    try {
      await addPump(wizardData);
      toast.success('Station onboarded successfully! Status set to PENDING verification.');
      setIsWizardOpen(false);
      setWizardStep(1);
      setUploadedFiles({});
      setWizardData({
        name: '',
        ownerName: 'Rajesh Kumar',
        gst: '',
        license: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        fuelTypes: [],
        tanksCount: 2,
        nozzlesCount: 6,
        dailyCapacity: 20000,
        operatingHours: '24 Hours',
      });
    } catch (err: any) {
      toast.error('Failed to onboard station.');
    }
  };

  const getStatusBadge = (status: PumpStatus) => {
    const Badges = {
      approved: 'bg-emerald-50 text-emerald-600 border-emerald-200/50',
      under_review: 'bg-amber-50 text-amber-600 border-amber-200/50',
      pending: 'bg-blue-50 text-blue-600 border-blue-200/50',
      rejected: 'bg-rose-50 text-rose-600 border-rose-200/50',
      suspended: 'bg-slate-100 text-slate-500 border-slate-200',
    };
    const Labels = {
      approved: 'APPROVED',
      under_review: 'UNDER REVIEW',
      pending: 'PENDING VERIFICATION',
      rejected: 'REJECTED',
      suspended: 'SUSPENDED',
    };
    return (
      <span className={`px-2.5 py-1 border rounded-full text-[10px] font-extrabold tracking-wider ${Badges[status]}`}>
        {Labels[status]}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta">
      {/* 1. MODULE HEADER & TRIGGERS */}
      <div className="flex justify-between items-center bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 border border-orange-200 text-primary">
            <Building2 className="h-5.5 w-5.5" />
          </div>
          <div className="flex flex-col text-left">
            <h1 className="text-lg font-extrabold text-text-primary tracking-tight">My Fuel Stations</h1>
            <p className="text-xs text-text-secondary">Onboard, manage, and track verification compliance audits of your fuel pumps</p>
          </div>
        </div>

        <button
          onClick={() => setIsWizardOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-4.5 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 transition-all outline-none cursor-pointer"
        >
          <Plus className="h-4 w-4 shrink-0" />
          Onboard New Pump
        </button>
      </div>

      {/* 2. PUMPS GRID DIRECTORY */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {pumps.map((pump) => (
          <div
            key={pump.id}
            className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-5 relative group"
          >
            {/* Status absolute label */}
            <div className="absolute top-6 right-6">
              {getStatusBadge(pump.status)}
            </div>

            {/* Pump branding */}
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-500 shrink-0 group-hover:bg-orange-50 group-hover:border-primary/20 group-hover:text-primary transition-colors">
                <Fuel className="h-5.5 w-5.5" />
              </div>
              <div className="flex flex-col text-left pr-28">
                <span className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors leading-snug">
                  {pump.name}
                </span>
                <span className="text-[10px] text-text-secondary font-semibold mt-1 flex items-center gap-0.5">
                  <MapPin className="h-3 w-3" /> {pump.city}, {pump.state}
                </span>
              </div>
            </div>

            {/* Specifications grids */}
            <div className="grid grid-cols-2 gap-3.5 border-t border-b border-slate-50 py-4 text-xs">
              <div className="flex flex-col gap-0.5 text-left">
                <span className="text-[10px] font-bold text-text-secondary uppercase">GST Registration</span>
                <span className="font-mono font-bold text-text-primary">{pump.gst}</span>
              </div>
              <div className="flex flex-col gap-0.5 text-left">
                <span className="text-[10px] font-bold text-text-secondary uppercase">Fuel License</span>
                <span className="font-mono font-bold text-text-primary">{pump.license}</span>
              </div>
              <div className="flex flex-col gap-0.5 text-left">
                <span className="text-[10px] font-bold text-text-secondary uppercase">Nozzle Infrastructure</span>
                <span className="font-bold text-text-primary">{pump.nozzlesCount} Nozzles / {pump.tanksCount} Tanks</span>
              </div>
              <div className="flex flex-col gap-0.5 text-left">
                <span className="text-[10px] font-bold text-text-secondary uppercase">Capacity Limit</span>
                <span className="font-bold text-text-primary">{(pump.dailyCapacity / 1000).toFixed(0)}K Liters / Daily</span>
              </div>
            </div>

            {/* Active Fuel types */}
            <div className="flex flex-wrap gap-1.5 justify-start">
              {pump.fuelTypes.map((fuel) => (
                <span key={fuel} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-bold text-slate-500">
                  {fuel}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 3. MULTI-STEP PUMP ONBOARDING WIZARD DIALOG OVERLAY */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs" onClick={() => setIsWizardOpen(false)} />
          
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col gap-6 z-10 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 shrink-0">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <h2 className="text-base font-extrabold text-text-primary">Pump Onboarding Wizard</h2>
              </div>
              <button
                onClick={() => setIsWizardOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-50 text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Wizard Steps indicator */}
            <div className="flex items-center justify-between gap-1 shrink-0">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                    wizardStep >= s ? 'bg-primary' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {/* Steps Contents */}
            <div className="flex-1 overflow-y-auto pr-1">
              {/* STEP 1: BASIC DETAILS */}
              {wizardStep === 1 && (
                <div className="flex flex-col gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-xs font-semibold text-text-primary">Fuel Station Name</label>
                      <input
                        type="text"
                        value={wizardData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="e.g. Hyderabad Highway Plaza"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-xs font-semibold text-text-primary">GST Number (India)</label>
                      <input
                        type="text"
                        value={wizardData.gst}
                        onChange={(e) => handleInputChange('gst', e.target.value)}
                        placeholder="e.g. 36AAAAA1111A1Z1"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-xs font-semibold text-text-primary">Fuel Retail License Number</label>
                      <input
                        type="text"
                        value={wizardData.license}
                        onChange={(e) => handleInputChange('license', e.target.value)}
                        placeholder="e.g. FL-2026-9092"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-xs font-semibold text-text-primary">Station Address</label>
                      <input
                        type="text"
                        value={wizardData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Plot No. 12, Highway Junction"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-xs font-semibold text-text-primary">City</label>
                      <input
                        type="text"
                        value={wizardData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Hyderabad"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-xs font-semibold text-text-primary">State</label>
                      <input
                        type="text"
                        value={wizardData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="Telangana"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-xs font-semibold text-text-primary">Pincode</label>
                      <input
                        type="text"
                        value={wizardData.pincode}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        placeholder="500032"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 text-left">
                    <label className="text-xs font-semibold text-text-primary">Dispensed Fuel Types</label>
                    <div className="flex flex-wrap gap-2.5 mt-1">
                      {['Petrol', 'Diesel', 'CNG', 'LPG', 'Electric Charging'].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => handleFuelToggle(f)}
                          className={`
                            px-3.5 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer outline-none select-none
                            ${
                              wizardData.fuelTypes.includes(f)
                                ? 'bg-primary border-transparent text-white shadow-md shadow-primary/15'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                            }
                          `}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: INFRASTRUCTURE CAPACITY */}
              {wizardStep === 2 && (
                <div className="flex flex-col gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-xs font-semibold text-text-primary">Number of Storage Tanks</label>
                      <input
                        type="number"
                        value={wizardData.tanksCount}
                        onChange={(e) => handleInputChange('tanksCount', parseInt(e.target.value) || 0)}
                        placeholder="4"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-xs font-semibold text-text-primary">Number of Active Nozzles</label>
                      <input
                        type="number"
                        value={wizardData.nozzlesCount}
                        onChange={(e) => handleInputChange('nozzlesCount', parseInt(e.target.value) || 0)}
                        placeholder="12"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-xs font-semibold text-text-primary">Total Fuel Storage Capacity (Liters)</label>
                      <input
                        type="number"
                        value={wizardData.dailyCapacity}
                        onChange={(e) => handleInputChange('dailyCapacity', parseInt(e.target.value) || 0)}
                        placeholder="40000"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-xs font-semibold text-text-primary">Daily Roster Operating Hours</label>
                      <select
                        value={wizardData.operatingHours}
                        onChange={(e) => handleInputChange('operatingHours', e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                      >
                        <option value="24 Hours">24 Hours (Full Shift)</option>
                        <option value="6:00 AM - 11:00 PM">6:00 AM - 11:00 PM</option>
                        <option value="5:00 AM - 12:00 AM">5:00 AM - 12:00 AM</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: COMPLIANCE DOCUMENTS UPLOAD */}
              {wizardStep === 3 && (
                <div className="flex flex-col gap-4">
                  <p className="text-xs text-text-secondary font-semibold -mt-2 leading-relaxed">
                    Upload dynamic copies of compliance documentation. Simulated drag & drop uploader handles local verification processing.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { key: 'gstCert', label: 'GSTIN Certificate', name: 'gst_certificate.pdf' },
                      { key: 'fuelLic', label: 'Explosives Fuel License', name: 'peso_license.pdf' },
                      { key: 'aadhaar', label: 'Aadhaar Card (Owner)', name: 'aadhaar_front_back.pdf' },
                      { key: 'pan', label: 'Permanent Account Number (PAN)', name: 'pan_card.jpg' },
                    ].map((doc) => {
                      const file = uploadedFiles[doc.key];
                      const isComplete = file && file.progress >= 100;

                      return (
                        <div
                          key={doc.key}
                          className={`
                            border-2 border-dashed rounded-2xl p-4.5 flex flex-col gap-3 relative transition-all duration-300 text-left
                            ${
                              isComplete
                                ? 'border-emerald-300 bg-emerald-50/5 shadow-xs'
                                : file
                                ? 'border-primary/40 bg-orange-50/5'
                                : 'border-slate-200 hover:border-border-accent bg-slate-50/50'
                            }
                          `}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-extrabold text-text-primary">{doc.label}</span>
                            {isComplete && <Check className="h-4.5 w-4.5 text-emerald-500" />}
                          </div>

                          {!file ? (
                            <label className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer">
                              <UploadCloud className="h-4.5 w-4.5" />
                              <span>Upload PDF/Image</span>
                              <input
                                type="file"
                                accept="application/pdf,image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  const selected = e.target.files?.[0];
                                  if (selected) {
                                    triggerSimulatedUpload(doc.key, selected.name);
                                  }
                                }}
                              />
                            </label>
                          ) : (
                            <div className="flex flex-col gap-1.5">
                              <div className="flex justify-between items-center text-[10px] font-semibold text-text-secondary">
                                <span className="truncate max-w-[150px] font-mono">{file.name}</span>
                                <span>{file.progress}%</span>
                              </div>
                              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    isComplete ? 'bg-emerald-500' : 'bg-primary animate-pulse'
                                  }`}
                                  style={{ width: `${file.progress}%` }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeUploadedFile(doc.key)}
                                className="text-[10px] font-bold text-red-500 hover:underline outline-none text-left mt-0.5 cursor-pointer"
                              >
                                Remove File
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW DETAILS SUMMARY */}
              {wizardStep === 4 && (
                <div className="flex flex-col gap-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-left flex flex-col gap-3 text-xs leading-relaxed">
                    <h3 className="font-extrabold text-text-primary border-b border-slate-200/50 pb-2 flex items-center gap-1.5">
                      <CheckCircle className="h-4.5 w-4.5 text-primary" />
                      Station Onboarding Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-text-secondary uppercase">STATION NAME</span>
                        <span className="font-bold text-text-primary">{wizardData.name}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-text-secondary uppercase">GST REGISTERED</span>
                        <span className="font-mono font-bold text-text-primary">{wizardData.gst}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-text-secondary uppercase">INFRASTRUCTURE</span>
                        <span className="font-bold text-text-primary">
                          {wizardData.nozzlesCount} Nozzles / {wizardData.tanksCount} Tanks
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-text-secondary uppercase">OPERATION CAPACITY</span>
                        <span className="font-bold text-text-primary">{wizardData.dailyCapacity} Liters</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200/40 rounded-2xl flex gap-2.5 text-left items-start">
                    <Clock className="h-5.5 w-5.5 text-blue-500 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-blue-900 leading-tight">Verification Compliance Queue</h4>
                      <p className="text-[10px] text-blue-700 mt-1 leading-relaxed">
                        Upon submission, your details and uploaded documents will be queued under **PENDING VERIFICATION** for admin review. Full access is granted upon approval.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="flex justify-between items-center border-t border-slate-100 pt-4 shrink-0">
              {wizardStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep(wizardStep - 1)}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-text-primary hover:border-slate-300 transition-all cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back Step
                </button>
              ) : (
                <div />
              )}

              {wizardStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep(wizardStep + 1)}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md shadow-primary/10 transition-all cursor-pointer"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFormSubmit}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md shadow-primary/10 transition-all cursor-pointer"
                >
                  Submit for Onboarding
                  <Check className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
