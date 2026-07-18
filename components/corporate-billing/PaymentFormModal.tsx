'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Landmark, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Invoice } from '../../types/corporateBilling';
import { toast } from '../feedback/Toast';

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  invoice: Invoice;
  pumpId: string;
}

export const PaymentFormModal: React.FC<PaymentFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  invoice,
  pumpId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPaid = invoice.payments.reduce((acc, p) => acc + p.amount, 0);
  const remainingBalance = invoice.totalAmount - totalPaid;

  const paymentSchema = z.object({
    amount: z
      .number()
      .min(1, 'Amount must be at least ₹1')
      .max(remainingBalance, `Amount cannot exceed remaining balance of ₹${remainingBalance.toLocaleString()}`),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
    paymentMode: z.enum(['cash', 'card', 'bank_transfer', 'upi']),
    referenceNumber: z.string().min(3, 'Reference number / receipt is required'),
  });

  type PaymentFormValues = z.infer<typeof paymentSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: remainingBalance,
      date: new Date().toISOString().split('T')[0],
      paymentMode: 'bank_transfer',
      referenceNumber: '',
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (values: PaymentFormValues) => {
    setIsSubmitting(true);
    try {
      const { corporateBillingService } = await import('../../services/corporateBillingService');
      await corporateBillingService.recordPayment(pumpId, invoice.id, {
        amount: values.amount,
        date: values.date,
        paymentMode: values.paymentMode,
        referenceNumber: values.referenceNumber,
      });
      toast.success('Payment Recorded', `Amount of ₹${values.amount.toLocaleString()} captured.`);
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error('Payment Failed', e.message || 'Could not record invoice payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col gap-4 text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 border border-orange-200 text-primary">
            <Landmark className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Record Payment</h2>
            <p className="text-[10px] text-slate-400">
              Apply a manual payment transaction to Invoice {invoice.invoiceNumber}
            </p>
          </div>
        </div>

        {/* Current status display */}
        <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-2xl flex flex-col gap-1 text-[11px]">
          <div className="flex justify-between text-slate-500 font-semibold">
            <span>Total Amount:</span>
            <span className="font-mono text-slate-900">₹{invoice.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-slate-500 font-semibold">
            <span>Already Paid:</span>
            <span className="font-mono text-emerald-600">₹{totalPaid.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200/60 pt-1 mt-1 font-bold">
            <span className="text-slate-800">Remaining Balance:</span>
            <span className="font-mono text-primary">₹{remainingBalance.toLocaleString()}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-primary tracking-wide">Payment Amount (INR) *</label>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              {...register('amount', { valueAsNumber: true })}
              className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-text-primary placeholder:text-text-secondary/60 outline-none transition-all duration-300 focus:border-primary focus:ring-4 focus:ring-primary/10 ${
                errors.amount ? 'border-red-400 focus:border-red-500' : ''
              }`}
            />
            {errors.amount && (
              <span className="text-[10px] text-rose-500 font-semibold">{errors.amount.message}</span>
            )}
          </div>

          <Input
            label="Payment Date *"
            type="date"
            error={errors.date?.message}
            {...register('date')}
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-primary tracking-wide">Payment Method *</label>
            <select
              {...register('paymentMode')}
              className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 bg-white cursor-pointer"
            >
              <option value="bank_transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
              <option value="upi">UPI / QR Scan</option>
              <option value="card">Debit/Credit Card</option>
              <option value="cash">Cash Settlement</option>
            </select>
            {errors.paymentMode && (
              <span className="text-[10px] text-rose-500 font-semibold">{errors.paymentMode.message}</span>
            )}
          </div>

          <Input
            label="Reference Number / UTR / Txn ID *"
            placeholder="e.g. UTR1029381029"
            error={errors.referenceNumber?.message}
            {...register('referenceNumber')}
          />

          <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-3 mt-1">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Record Payment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
