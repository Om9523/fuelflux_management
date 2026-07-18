'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Plus, Trash2, ShieldAlert, Loader2 } from 'lucide-react';
import { FileUpload } from '../ui/FileUpload';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { DocumentTypeConfig, ComplianceContact, ComplianceDocument } from '../../types/compliance';
import { toast } from '../feedback/Toast';
import { complianceService } from '../../services/complianceService';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number'),
  email: z.string().email('Invalid email address'),
  notifyWhatsApp: z.boolean(),
  notifyEmail: z.boolean(),
});

const uploadSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  type: z.string().min(1, 'Please select a document type'),
  certificateNumber: z.string().min(2, 'Certificate number is required'),
  issuingAuthority: z.string().min(2, 'Issuing authority is required'),
  issueDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid issue date'),
  expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid expiry date'),
  notifyContacts: z.array(contactSchema),
}).refine((data) => {
  const issue = new Date(data.issueDate);
  const expiry = new Date(data.expiryDate);
  return expiry > issue;
}, {
  message: 'Expiry date must be after the issue date',
  path: ['expiryDate'],
});

interface UploadFormValues {
  name: string;
  type: string;
  certificateNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  notifyContacts: {
    name: string;
    phone: string;
    email: string;
    notifyWhatsApp: boolean;
    notifyEmail: boolean;
  }[];
}

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pumpId: string;
  documentTypes: DocumentTypeConfig[];
  documentToRenew?: ComplianceDocument | null; // If passed, functions as renewal modal
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  pumpId,
  documentTypes,
  documentToRenew,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema) as any,
    defaultValues: {
      name: '',
      type: '',
      certificateNumber: '',
      issuingAuthority: '',
      issueDate: '',
      expiryDate: '',
      notifyContacts: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'notifyContacts',
  });

  // Pre-fill if in renewal mode
  useEffect(() => {
    if (documentToRenew) {
      reset({
        name: `Renewal - ${documentToRenew.name}`,
        type: documentToRenew.type,
        certificateNumber: documentToRenew.certificateNumber,
        issuingAuthority: documentToRenew.issuingAuthority,
        issueDate: '',
        expiryDate: '',
        notifyContacts: documentToRenew.notifyContacts.map(c => ({
          name: c.name,
          phone: c.phone,
          email: c.email,
          notifyWhatsApp: c.notifyWhatsApp,
          notifyEmail: c.notifyEmail,
        })),
      });
      setSelectedFile(null);
    } else {
      reset({
        name: '',
        type: '',
        certificateNumber: '',
        issuingAuthority: '',
        issueDate: '',
        expiryDate: '',
        notifyContacts: [],
      });
      setSelectedFile(null);
    }
  }, [documentToRenew, reset, isOpen]);

  const selectedType = watch('type');

  // Auto set name based on selected type
  useEffect(() => {
    if (selectedType && !documentToRenew) {
      const year = new Date().getFullYear();
      setValue('name', `${selectedType} - ${year}`);
    }
  }, [selectedType, setValue, documentToRenew]);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setSelectedFile(file);
  };

  const handleFileRemove = async () => {
    setSelectedFile(null);
  };

  const onSubmit = async (values: UploadFormValues) => {
    // If not renewing and file is required
    if (!documentToRenew && !selectedFile) {
      toast.error('File Required', 'Please drag & drop or select a document file to upload.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (documentToRenew) {
        await complianceService.renewDocument(pumpId, documentToRenew.id, {
          certificateNumber: values.certificateNumber,
          issueDate: values.issueDate,
          expiryDate: values.expiryDate,
          file: selectedFile,
        });
        toast.success('Document Renewed', 'Compliance certificate successfully updated.');
      } else {
        await complianceService.uploadDocument(pumpId, {
          name: values.name,
          type: values.type,
          certificateNumber: values.certificateNumber,
          issuingAuthority: values.issuingAuthority,
          issueDate: values.issueDate,
          expiryDate: values.expiryDate,
          notifyContacts: values.notifyContacts.map((c, idx) => ({
            id: `c_new_${idx}_${Date.now()}`,
            ...c,
          })),
          file: selectedFile,
        });
        toast.success('Document Uploaded', 'Compliance certificate successfully registered.');
      }

      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error('Upload Failed', e.message || 'An error occurred while saving the document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 border border-orange-200 text-primary">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              {documentToRenew ? 'Renew Document' : 'Upload Compliance Certificate'}
            </h2>
            <p className="text-[10px] text-slate-400">
              {documentToRenew ? `Updating details for: ${documentToRenew.name}` : 'Register a new regulatory NOC, license or stamp'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column - Document details */}
          <div className="md:col-span-6 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5">
              Document Details
            </h3>

            {!documentToRenew && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-text-primary tracking-wide">Document Category *</label>
                <select
                  {...register('type')}
                  className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 bg-white cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {documentTypes
                    .filter((t) => t.isActive)
                    .map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} {t.isMandatory ? '(Mandatory)' : ''}
                      </option>
                    ))}
                </select>
                {errors.type && <span className="text-[10px] text-rose-500 font-semibold">{errors.type.message}</span>}
              </div>
            )}

            {!documentToRenew && (
              <Input
                label="Document Display Name *"
                placeholder="e.g. PESO License 2026"
                error={errors.name?.message}
                {...register('name')}
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Certificate / NOC Number *"
                placeholder="e.g. EXP-MH-12"
                error={errors.certificateNumber?.message}
                {...register('certificateNumber')}
              />
              <Input
                label="Issuing Authority *"
                placeholder="e.g. PESO Metrology Dept"
                error={errors.issuingAuthority?.message}
                {...register('issuingAuthority')}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Issue Date *"
                type="date"
                error={errors.issueDate?.message}
                {...register('issueDate')}
              />
              <Input
                label="Expiry Date *"
                type="date"
                error={errors.expiryDate?.message}
                {...register('expiryDate')}
              />
            </div>

            {/* Drag and drop upload */}
            <div className="mt-2">
              <label className="block text-xs font-semibold text-text-primary tracking-wide mb-1.5">
                {documentToRenew ? 'New File (Optional - keeps existing if empty)' : 'Certificate PDF/Image File *'}
              </label>
              <FileUpload
                accept=".pdf,.png,.jpg,.jpeg"
                maxSizeMB={10}
                onUpload={handleFileUpload}
                onRemove={handleFileRemove}
                currentFile={
                  selectedFile
                    ? { name: selectedFile.name, url: URL.createObjectURL(selectedFile) }
                    : null
                }
                label="Drag & Drop Document"
                compact
              />
            </div>
          </div>

          {/* Right Column - Contacts notification */}
          <div className="md:col-span-6 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Expiration Notification List
              </h3>
              <button
                type="button"
                onClick={() => append({ name: '', phone: '', email: '', notifyWhatsApp: false, notifyEmail: true })}
                className="text-[10px] font-bold text-primary hover:text-primary-hover flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add Contact
              </button>
            </div>

            <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
              {fields.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-1">
                  <p className="font-bold">No notification contacts</p>
                  <p className="text-[10px] max-w-[220px]">
                    Add team members to send WhatsApp and email alerts before document expiry.
                  </p>
                  <button
                    type="button"
                    onClick={() => append({ name: '', phone: '', email: '', notifyWhatsApp: false, notifyEmail: true })}
                    className="mt-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[10px] cursor-pointer"
                  >
                    + Add First Contact
                  </button>
                </div>
              ) : (
                fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-3 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col gap-2.5 relative"
                  >
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="absolute top-2 right-2 p-1 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <input
                          placeholder="Contact Name"
                          {...register(`notifyContacts.${index}.name` as const)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 bg-white rounded-lg outline-none focus:border-primary/50 font-medium"
                        />
                        {errors.notifyContacts?.[index]?.name && (
                          <span className="text-[9px] text-rose-500 font-semibold">
                            {errors.notifyContacts[index]?.name?.message}
                          </span>
                        )}
                      </div>
                      <div>
                        <input
                          placeholder="Phone (10 digit)"
                          {...register(`notifyContacts.${index}.phone` as const)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 bg-white rounded-lg outline-none focus:border-primary/50 font-medium"
                        />
                        {errors.notifyContacts?.[index]?.phone && (
                          <span className="text-[9px] text-rose-500 font-semibold">
                            {errors.notifyContacts[index]?.phone?.message}
                          </span>
                        )}
                      </div>
                      <div>
                        <input
                          placeholder="Email Address"
                          {...register(`notifyContacts.${index}.email` as const)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 bg-white rounded-lg outline-none focus:border-primary/50 font-medium"
                        />
                        {errors.notifyContacts?.[index]?.email && (
                          <span className="text-[9px] text-rose-500 font-semibold">
                            {errors.notifyContacts[index]?.email?.message}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-4 items-center pl-1 text-[10px] font-bold text-slate-500">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register(`notifyContacts.${index}.notifyEmail` as const)}
                          className="rounded border-slate-300 text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                        />
                        <span>Email Alerts</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          {...register(`notifyContacts.${index}.notifyWhatsApp` as const)}
                          className="rounded border-slate-300 text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                        />
                        <span>WhatsApp Alerts</span>
                      </label>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Summary terms alert */}
            <div className="p-3 bg-orange-50/50 border border-orange-100 rounded-2xl flex items-start gap-2 text-[10px] text-orange-700 font-semibold mt-auto">
              <ShieldAlert className="h-4 w-4 shrink-0 text-orange-500 mt-0.5" />
              <p className="leading-relaxed">
                By enabling notifications, our system will automatically push reminders at the configured days prior to expiration.
              </p>
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="md:col-span-12 flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              {documentToRenew ? 'Renew Certificate' : 'Register Document'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
