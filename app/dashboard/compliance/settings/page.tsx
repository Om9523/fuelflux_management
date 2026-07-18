'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ChevronLeft, Settings, RefreshCw, Save, Plus, Trash2, HelpCircle,
  ToggleLeft, ToggleRight, AlertCircle, ShieldAlert
} from 'lucide-react';
import { usePumpStore } from '@/stores/pumps.store';
import { complianceService } from '@/services/complianceService';
import { DocumentTypeConfig } from '@/types/compliance';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/feedback/Toast';

const documentTypeSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  reminderDays: z.number().min(0, 'Days must be 0 or more').max(365, 'Max 365 days'),
  isMandatory: z.boolean(),
  isActive: z.boolean(),
});

const settingsFormSchema = z.object({
  configs: z.array(documentTypeSchema),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function ComplianceSettingsPage() {
  const router = useRouter();
  const { selectedPump } = usePumpStore();
  const pumpId = selectedPump?.id || null;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema) as any,
    defaultValues: {
      configs: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'configs',
  });

  const loadData = useCallback(async () => {
    if (!pumpId) return;
    setIsLoading(true);
    try {
      const types = await complianceService.fetchSettings(pumpId);
      reset({ configs: types });
    } catch (e: any) {
      toast.error('Failed to load settings', e.message);
    } finally {
      setIsLoading(false);
    }
  }, [pumpId, reset]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onSubmit = async (values: SettingsFormValues) => {
    if (!pumpId) return;
    setIsSaving(true);
    try {
      await complianceService.saveSettings(pumpId, values.configs);
      toast.success('Settings Saved', 'Compliance threshold configurations successfully updated.');
      loadData();
    } catch (e: any) {
      toast.error('Failed to save settings', e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!pumpId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <AlertCircle className="h-10 w-10 mb-3 opacity-30 text-amber-500" />
        <p className="font-bold text-sm">No Pump Selected</p>
        <p className="text-xs mt-1">Please select an operational fuel station to view settings.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-white border border-slate-100 rounded-2xl shadow-xs gap-4 text-left">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/compliance')}
            className="p-1.5 hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl cursor-pointer transition-colors outline-none"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-orange-50 border border-orange-200/50 rounded-xl flex items-center justify-center text-primary">
              <Settings className="h-4.5 w-4.5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-text-primary tracking-tight">Compliance Settings</h1>
              <p className="text-xs text-text-secondary">Configure alerts, renewal lead times, and mandatory certificates rules</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => append({ id: `dt_custom_${Date.now()}`, name: '', reminderDays: 30, isMandatory: false, isActive: true })}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-text-primary rounded-xl cursor-pointer transition-all outline-none"
          >
            <Plus className="h-4 w-4 text-slate-500" /> Add Custom Category
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving || isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer border-transparent outline-none transition-all disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Configurations
          </button>
        </div>
      </div>

      {/* Settings Grid list */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 text-left">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 flex flex-col gap-5">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Certificate Rules Register</h3>
              <p className="text-[10px] text-slate-400">Configure trigger reminders and active states</p>
            </div>
            <div className="p-2 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center gap-2 text-[10px] text-blue-700 font-semibold max-w-sm">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 text-blue-500" />
              <span>Inactive document categories will not display in the upload document selection list.</span>
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 flex justify-center text-xs text-slate-400 font-semibold gap-2 items-center">
              <RefreshCw className="h-4 w-4 animate-spin text-primary" /> Loading configuration register...
            </div>
          ) : fields.length === 0 ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
              <ShieldAlert className="h-10 w-10 mb-2 opacity-25 text-amber-500" />
              <p className="font-bold text-xs">No Categories Configured</p>
              <p className="text-[10px] mt-0.5">Click &quot;Add Custom Category&quot; to build a compliance schema.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {fields.map((field, index) => {
                const isSystemDefault = !field.id.includes('custom');
                return (
                  <div
                    key={field.id}
                    className="p-4 bg-slate-50/50 border border-slate-200/50 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-4 items-center relative"
                  >
                    {/* Delete button for custom ones */}
                    {!isSystemDefault && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="absolute top-2 right-2 md:top-auto md:right-4 md:relative md:col-span-1 p-1.5 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg transition-colors cursor-pointer justify-self-end mt-1 md:mt-0"
                        title="Delete custom category"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {isSystemDefault && <div className="hidden md:block md:col-span-1" />}

                    {/* Type Category Name */}
                    <div className="col-span-12 md:col-span-4 flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Category Name</label>
                      <input
                        type="text"
                        disabled={isSystemDefault}
                        placeholder="e.g. Municipal Trade License"
                        {...register(`configs.${index}.name` as const)}
                        className={`px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors bg-white ${
                          isSystemDefault ? 'bg-slate-100/60 text-slate-500 border-slate-200 cursor-not-allowed' : ''
                        }`}
                      />
                      {errors.configs?.[index]?.name && (
                        <span className="text-[9px] text-rose-500 font-semibold">
                          {errors.configs[index]?.name?.message}
                        </span>
                      )}
                    </div>

                    {/* Expiration Threshold Alerts */}
                    <div className="col-span-6 md:col-span-3 flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Reminder Days Before</label>
                      <div className="relative flex items-center">
                        <input
                          type="number"
                          {...register(`configs.${index}.reminderDays` as const, { valueAsNumber: true })}
                          className="w-full px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors bg-white font-mono"
                        />
                        <span className="absolute right-3 text-[10px] text-slate-400 font-bold uppercase pointer-events-none">Days</span>
                      </div>
                      {errors.configs?.[index]?.reminderDays && (
                        <span className="text-[9px] text-rose-500 font-semibold">
                          {errors.configs[index]?.reminderDays?.message}
                        </span>
                      )}
                    </div>

                    {/* Mandatory Switch Toggle */}
                    <div className="col-span-3 md:col-span-2 flex flex-col items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Mandatory</span>
                      <label className="flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          {...register(`configs.${index}.isMandatory` as const)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary relative" />
                      </label>
                    </div>

                    {/* Active State Toggle */}
                    <div className="col-span-3 md:col-span-2 flex flex-col items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Status</span>
                      <label className="flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          {...register(`configs.${index}.isActive` as const)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 relative" />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Button footer */}
        <div className="flex justify-end gap-3 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <Button variant="outline" size="sm" type="button" onClick={() => router.push('/dashboard/compliance')}>
            Back to Compliance
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSaving} disabled={isLoading}>
            Save Threshold Rule Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
