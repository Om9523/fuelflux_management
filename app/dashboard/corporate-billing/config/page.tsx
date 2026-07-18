'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ChevronLeft, Settings, RefreshCw, Save, Landmark, FileText, Calendar,
  Mail, AlertCircle, ToggleLeft, ToggleRight, Sparkles
} from 'lucide-react';
import { usePumpStore } from '@/stores/pumps.store';
import { corporateBillingService } from '@/services/corporateBillingService';
import { BillingConfig } from '@/types/corporateBilling';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/feedback/Toast';

const configSchema = z.object({
  pumpGstDetails: z.object({
    gstin: z.string().regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/, 'Invalid GSTIN number format'),
    legalName: z.string().min(3, 'Legal name must be at least 3 characters'),
    tradeName: z.string().min(3, 'Trade name must be at least 3 characters'),
    address: z.string().min(5, 'Address is too short'),
  }),
  invoiceSettings: z.object({
    prefix: z.string().min(1, 'Prefix is required'),
    nextNumber: z.number().min(1, 'Increment number must be greater than 0'),
    terms: z.string().min(5, 'Terms are required'),
  }),
  billingSchedule: z.object({
    cycle: z.enum(['weekly', 'fortnightly', 'monthly']),
    dayOfMonth: z.number().min(1).max(28, 'Must be between 1 and 28'),
    dayOfWeek: z.number().min(0).max(6, 'Must be between 0 (Sunday) and 6 (Saturday)'),
  }),
  emailSettings: z.object({
    autoSend: z.boolean(),
    ccEmailsString: z.string().default(''), // mapped helper for comma-separated cc
    subjectTemplate: z.string().min(3, 'Subject template is required'),
    bodyTemplate: z.string().min(5, 'Body template is required'),
  }),
});

type ConfigFormValues = z.infer<typeof configSchema>;

export default function BillingConfigPage() {
  const router = useRouter();
  const { selectedPump } = usePumpStore();
  const pumpId = selectedPump?.id || null;

  const [activeTab, setActiveTab] = useState<'gst' | 'invoice' | 'schedule' | 'email'>('gst');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema) as any,
    defaultValues: {
      pumpGstDetails: { gstin: '', legalName: '', tradeName: '', address: '' },
      invoiceSettings: { prefix: '', nextNumber: 1001, terms: '' },
      billingSchedule: { cycle: 'monthly', dayOfMonth: 1, dayOfWeek: 1 },
      emailSettings: { autoSend: true, ccEmailsString: '', subjectTemplate: '', bodyTemplate: '' },
    },
  });

  const loadConfig = useCallback(async () => {
    if (!pumpId) return;
    setIsLoading(true);
    try {
      const cfg = await corporateBillingService.fetchBillingConfig(pumpId);
      reset({
        pumpGstDetails: cfg.pumpGstDetails,
        invoiceSettings: {
          prefix: cfg.invoiceSettings.prefix,
          nextNumber: cfg.invoiceSettings.nextNumber,
          terms: cfg.invoiceSettings.terms,
        },
        billingSchedule: cfg.billingSchedule,
        emailSettings: {
          autoSend: cfg.emailSettings.autoSend,
          ccEmailsString: cfg.emailSettings.ccEmails.join(', '),
          subjectTemplate: cfg.emailSettings.subjectTemplate,
          bodyTemplate: cfg.emailSettings.bodyTemplate,
        },
      });
    } catch (e: any) {
      toast.error('Failed to load configuration', e.message);
    } finally {
      setIsLoading(false);
    }
  }, [pumpId, reset]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const onSubmit = async (values: ConfigFormValues) => {
    if (!pumpId) return;
    setIsSaving(true);
    try {
      const ccEmailsArray = values.emailSettings.ccEmailsString
        .split(',')
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      const finalConfig: BillingConfig = {
        pumpGstDetails: values.pumpGstDetails,
        invoiceSettings: {
          prefix: values.invoiceSettings.prefix,
          nextNumber: values.invoiceSettings.nextNumber,
          terms: values.invoiceSettings.terms,
          logoUrl: '/logo.png', // keep static
        },
        billingSchedule: values.billingSchedule,
        emailSettings: {
          autoSend: values.emailSettings.autoSend,
          ccEmails: ccEmailsArray,
          subjectTemplate: values.emailSettings.subjectTemplate,
          bodyTemplate: values.emailSettings.bodyTemplate,
        },
      };

      await corporateBillingService.updateBillingConfig(pumpId, finalConfig);
      toast.success('Configurations Saved', 'Corporate Billing configs updated successfully.');
      loadConfig();
    } catch (e: any) {
      toast.error('Failed to save settings', e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCycle = watch('billingSchedule.cycle');
  const isAutoSend = watch('emailSettings.autoSend');

  if (!pumpId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <AlertCircle className="h-10 w-10 mb-3 opacity-30 text-amber-500" />
        <p className="font-bold text-sm">No Pump Selected</p>
        <p className="text-xs mt-1">Please select an operational fuel station to configure billing.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'gst', label: 'GST Registry', icon: <Landmark className="h-4 w-4" /> },
    { id: 'invoice', label: 'Invoice Layout', icon: <FileText className="h-4 w-4" /> },
    { id: 'schedule', label: 'Billing Schedule', icon: <Calendar className="h-4 w-4" /> },
    { id: 'email', label: 'Email Automation', icon: <Mail className="h-4 w-4" /> },
  ];

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-white border border-slate-100 rounded-2xl shadow-xs gap-4 text-left">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/corporate-billing')}
            className="p-1.5 hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl cursor-pointer transition-colors outline-none"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-orange-50 border border-orange-200/50 rounded-xl flex items-center justify-center text-primary">
              <Settings className="h-4.5 w-4.5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-text-primary tracking-tight">Billing Settings</h1>
              <p className="text-xs text-text-secondary">Configure station tax profiles, invoice layouts, schedules, and email template dispatch rules</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving || isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer border-transparent outline-none transition-all disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start text-left">
        {/* Navigation Sidebar Tabs */}
        <div className="md:col-span-3 bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex flex-col gap-1.5 select-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer outline-none ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'hover:bg-slate-50 text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Configurations Fields Area */}
        <div className="md:col-span-9 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm min-h-[400px] flex flex-col">
          {isLoading ? (
            <div className="py-24 flex justify-center text-xs text-slate-400 font-semibold gap-2 items-center m-auto">
              <RefreshCw className="h-4 w-4 animate-spin text-primary" /> Loading configuration panel...
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col gap-6">
              
              {/* Tab 1: GST Details */}
              {activeTab === 'gst' && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                    GST Registries Details
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Supplier Legal Business Name *"
                      placeholder="e.g. Flux Stations Pvt Ltd"
                      error={errors.pumpGstDetails?.legalName?.message}
                      {...register('pumpGstDetails.legalName')}
                    />
                    <Input
                      label="Trade Name (DBA) *"
                      placeholder="e.g. FuelFlux Express Vashi"
                      error={errors.pumpGstDetails?.tradeName?.message}
                      {...register('pumpGstDetails.tradeName')}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Business GSTIN Number *"
                      placeholder="e.g. 27AAGCF7829A1ZX"
                      error={errors.pumpGstDetails?.gstin?.message}
                      {...register('pumpGstDetails.gstin')}
                      className="font-mono font-bold uppercase"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-text-primary tracking-wide">Registered Business Address *</label>
                    <textarea
                      placeholder="Enter business address as registered in GST directory"
                      rows={3}
                      {...register('pumpGstDetails.address')}
                      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-text-primary placeholder:text-text-secondary/60 outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/10 ${
                        errors.pumpGstDetails?.address ? 'border-red-400 focus:border-red-500' : ''
                      }`}
                    />
                    {errors.pumpGstDetails?.address && (
                      <span className="text-[10px] text-rose-500 font-semibold">{errors.pumpGstDetails.address.message}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Invoice Settings */}
              {activeTab === 'invoice' && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                    Invoice Settings & Customizations
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Invoice Number Prefix *"
                      placeholder="e.g. FF/INV/"
                      error={errors.invoiceSettings?.prefix?.message}
                      {...register('invoiceSettings.prefix')}
                    />
                    <Input
                      label="Next Invoice Serial Code (Increment counter) *"
                      type="number"
                      error={errors.invoiceSettings?.nextNumber?.message}
                      {...register('invoiceSettings.nextNumber', { valueAsNumber: true })}
                      className="font-mono font-bold"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-text-primary tracking-wide">Terms, Conditions & Bank details *</label>
                    <textarea
                      placeholder="Invoice footer notes..."
                      rows={5}
                      {...register('invoiceSettings.terms')}
                      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-text-primary placeholder:text-text-secondary/60 outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/10 ${
                        errors.invoiceSettings?.terms ? 'border-red-400 focus:border-red-500' : ''
                      }`}
                    />
                    {errors.invoiceSettings?.terms && (
                      <span className="text-[10px] text-rose-500 font-semibold">{errors.invoiceSettings.terms.message}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Billing Schedule */}
              {activeTab === 'schedule' && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                    Billing Cycle & Calendar Schedules
                  </h3>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text-primary tracking-wide">Cycle Periodicity *</label>
                    <select
                      {...register('billingSchedule.cycle')}
                      className="w-full sm:max-w-xs px-3 py-2.5 text-xs font-bold border border-slate-200 rounded-xl outline-none bg-white cursor-pointer"
                    >
                      <option value="weekly">Weekly Cutoff</option>
                      <option value="fortnightly">Fortnightly Cycle (1st and 15th)</option>
                      <option value="monthly">Monthly Cycle (End of Month)</option>
                    </select>
                  </div>

                  {selectedCycle === 'monthly' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Day of Month for Invoicing (1-28) *"
                        type="number"
                        error={errors.billingSchedule?.dayOfMonth?.message}
                        {...register('billingSchedule.dayOfMonth', { valueAsNumber: true })}
                      />
                    </div>
                  )}

                  {selectedCycle === 'weekly' && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-text-primary tracking-wide">Day of Week for Invoicing *</label>
                      <select
                        {...register('billingSchedule.dayOfWeek', { valueAsNumber: true })}
                        className="w-full sm:max-w-xs px-3 py-2.5 text-xs font-bold border border-slate-200 rounded-xl outline-none bg-white cursor-pointer"
                      >
                        <option value={1}>Monday</option>
                        <option value={2}>Tuesday</option>
                        <option value={3}>Wednesday</option>
                        <option value={4}>Thursday</option>
                        <option value={5}>Friday</option>
                        <option value={6}>Saturday</option>
                        <option value={0}>Sunday</option>
                      </select>
                    </div>
                  )}

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex gap-2 text-[10px] text-slate-500 font-semibold leading-relaxed">
                    <AlertCircle className="h-4.5 w-4.5 text-primary shrink-0" />
                    <p>
                      Automated invoice cycles gather all credit sales logs for linked accounts and compile invoices automatically at midnight of the chosen cycle.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 4: Email Settings */}
              {activeTab === 'email' && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                    Email Dispatch Configurations
                  </h3>

                  <div className="flex items-center gap-3.5 py-1">
                    <span className="text-xs font-bold text-slate-700">Auto-send dispatch on compilation</span>
                    <label className="flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        {...register('emailSettings.autoSend')}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary relative" />
                    </label>
                  </div>

                  <Input
                    label="Operations Audit CC Emails (Comma separated)"
                    placeholder="e.g. audit@fuelflux.com, backup@fuelflux.com"
                    error={errors.emailSettings?.ccEmailsString?.message}
                    {...register('emailSettings.ccEmailsString')}
                  />

                  <Input
                    label="Email Subject Template *"
                    placeholder="e.g. Invoice {invoice_number} from FuelFlux"
                    error={errors.emailSettings?.subjectTemplate?.message}
                    {...register('emailSettings.subjectTemplate')}
                  />

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-text-primary tracking-wide">Email Body Template *</label>
                    <textarea
                      placeholder="Email text body template"
                      rows={5}
                      {...register('emailSettings.bodyTemplate')}
                      className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-text-primary placeholder:text-text-secondary/60 outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/10 ${
                        errors.emailSettings?.bodyTemplate ? 'border-red-400 focus:border-red-500' : ''
                      }`}
                    />
                    {errors.emailSettings?.bodyTemplate && (
                      <span className="text-[10px] text-rose-500 font-semibold">{errors.emailSettings.bodyTemplate.message}</span>
                    )}
                  </div>

                  <div className="p-3 bg-orange-50/50 border border-orange-100 rounded-2xl flex items-start gap-2 text-[10px] text-orange-700 font-bold">
                    <Sparkles className="h-4.5 w-4.5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <p>Dynamic token variables available in templates:</p>
                      <p className="font-mono mt-1 text-[9px] text-slate-500">
                        {`{invoice_number} • {billing_period} • {total_amount} • {due_date}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Footer */}
              <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4 mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => router.push('/dashboard/corporate-billing')}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={isSaving}>
                  Save Settings
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
