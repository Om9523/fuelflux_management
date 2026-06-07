'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Moon, Sun, Sunrise } from 'lucide-react';
import { ShiftDetails } from '@/lib/mock-db';

interface ShiftCardProps {
  shift: ShiftDetails | null;
}

export const ShiftCard: React.FC<ShiftCardProps> = ({ shift }) => {
  if (!shift) {
    return (
      <div className="bg-white border border-orange-100 rounded-2xl p-6 text-center text-slate-400 text-sm">
        No active shift schedule found.
      </div>
    );
  }

  const getShiftIcon = (type: string) => {
    if (type.includes('Morning')) {
      return <Sunrise className="h-5 w-5 text-amber-500" />;
    }
    if (type.includes('Afternoon')) {
      return <Sun className="h-5 w-5 text-orange-500" />;
    }
    if (type.includes('Night')) {
      return <Moon className="h-5 w-5 text-indigo-500" />;
    }
    return <Calendar className="h-5 w-5 text-slate-400" />;
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-orange-100 rounded-2xl p-6 shadow-sm flex flex-col gap-6 text-left"
    >
      <div className="border-b border-slate-55 pb-4">
        <h3 className="text-base font-bold text-slate-800">Current Assigned Shift</h3>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">Your roster active timings for today.</p>
        
        <div className="mt-4 flex items-center gap-4 bg-orange-50/40 border border-orange-100/50 p-4 rounded-xl">
          <div className="h-10 w-10 rounded-lg bg-white border border-orange-100 flex items-center justify-center shadow-inner">
            {getShiftIcon(shift.currentShift.name)}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">{shift.currentShift.name}</h4>
            <p className="text-xs font-mono font-bold text-orange-600 mt-0.5">
              {shift.currentShift.startTime} - {shift.currentShift.endTime}
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Schedule grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-850 mb-3">Weekly Schedule</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {daysOfWeek.map((day) => {
            const sched = shift.weeklySchedule[day];
            const isOff = sched?.shiftType === 'Off';
            
            return (
              <div
                key={day}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center ${
                  isOff
                    ? 'bg-slate-50 border-slate-100 text-slate-400'
                    : 'bg-white border-orange-100 hover:border-orange-200 shadow-xs hover:shadow-sm'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{day.substring(0, 3)}</span>
                <span className={`text-xs font-bold mt-2 ${isOff ? 'text-slate-400' : 'text-slate-700'}`}>
                  {sched?.shiftType || 'Off'}
                </span>
                <span className="text-[9px] font-mono font-semibold text-slate-400 mt-1">
                  {isOff ? 'Rest Day' : sched?.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
export default ShiftCard;
