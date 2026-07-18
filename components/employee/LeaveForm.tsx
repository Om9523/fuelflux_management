'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, FileText, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/feedback/Toast';
import { leaveService } from '@/services/leave.service';

const leaveSchema = z.object({
  leaveType: z.enum(['Casual Leave', 'Sick Leave', 'Emergency Leave']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters long'),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: 'End date must be after or equal to start date',
  path: ['endDate'],
});

type LeaveFormValues = z.infer<typeof leaveSchema>;

interface LeaveFormProps {
  onSuccess?: () => void;
}

export const LeaveForm: React.FC<LeaveFormProps> = ({ onSuccess }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      leaveType: 'Casual Leave',
      startDate: '',
      endDate: '',
      reason: '',
    },
  });

  const onSubmit = async (data: LeaveFormValues) => {
    try {
      await leaveService.applyForLeave(data);
      toast.success('Leave application submitted successfully!');
      reset();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit leave application');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 text-left">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-600">Leave Type</label>
        <select
          {...register('leaveType')}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-755 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all cursor-pointer"
          disabled={isSubmitting}
        >
          <option value="Casual Leave">Casual Leave</option>
          <option value="Sick Leave">Sick Leave</option>
          <option value="Emergency Leave">Emergency Leave</option>
        </select>
        {errors.leaveType && (
          <span className="text-[10px] text-rose-500 font-semibold">{errors.leaveType.message}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-655">Start Date</label>
          <Input
            {...register('startDate')}
            type="date"
            leftIcon={<Calendar className="h-4 w-4 text-slate-400" />}
            error={errors.startDate?.message}
            disabled={isSubmitting}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-655">End Date</label>
          <Input
            {...register('endDate')}
            type="date"
            leftIcon={<Calendar className="h-4 w-4 text-slate-400" />}
            error={errors.endDate?.message}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-600">Reason</label>
        <div className="relative">
          <textarea
            {...register('reason')}
            rows={3}
            placeholder="Please detail the reason for requesting leave..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 resize-none"
            disabled={isSubmitting}
          />
        </div>
        {errors.reason && (
          <span className="text-[10px] text-rose-500 font-semibold">{errors.reason.message}</span>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="mt-2 w-full font-bold bg-orange-500 hover:bg-orange-600 text-white"
        isLoading={isSubmitting}
      >
        <Send className="h-4 w-4 mr-2" />
        Submit Leave Request
      </Button>
    </form>
  );
};
export default LeaveForm;
