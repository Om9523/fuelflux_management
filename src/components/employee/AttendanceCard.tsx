'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Play, Square, Timer } from 'lucide-react';
import { useAttendanceStore } from '@/stores/attendance.store';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/feedback/Toast';

export const AttendanceCard: React.FC = () => {
  const { todayRecord, checkIn, checkOut, isLoading } = useAttendanceStore();
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (todayRecord && todayRecord.checkIn && !todayRecord.checkOut) {
      // Calculate elapsed time from check-in
      const calculateElapsed = () => {
        const checkInTimeStr = todayRecord.checkIn!;
        const [inH, inM] = checkInTimeStr.split(':').map(Number);
        
        const now = new Date();
        const checkInDate = new Date();
        checkInDate.setHours(inH, inM, 0, 0);

        // If check-in was yesterday (e.g. night shift)
        if (now.getTime() < checkInDate.getTime()) {
          checkInDate.setDate(checkInDate.getDate() - 1);
        }

        const diffMs = now.getTime() - checkInDate.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const hours = Math.floor(diffSecs / 3600);
        const mins = Math.floor((diffSecs % 3600) / 60);
        const secs = diffSecs % 60;

        const pad = (num: number) => String(num).padStart(2, '0');
        setElapsedTime(`${pad(hours)}:${pad(mins)}:${pad(secs)}`);
      };

      calculateElapsed();
      intervalId = setInterval(calculateElapsed, 1000);
    } else {
      setElapsedTime('00:00:00');
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [todayRecord]);

  const handleCheckIn = async () => {
    try {
      await checkIn();
      toast.success('Successfully checked in for today!');
    } catch (err: any) {
      toast.error(err.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut();
      toast.success('Successfully checked out. Shift completed!');
    } catch (err: any) {
      toast.error(err.message || 'Check-out failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-orange-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 text-left"
    >
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shrink-0 shadow-inner">
          <Clock className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">Shift Attendance Console</h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            {!todayRecord 
              ? 'Ready for today\'s shift. Please check in to log timings.'
              : todayRecord.checkOut 
                ? 'Thank you! Shift complete. Check-out logged.'
                : `Checked in today at ${todayRecord.checkIn}. Shift active.`}
          </p>
        </div>
      </div>

      {/* Stopwatch & Action Panel */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto shrink-0">
        {todayRecord && !todayRecord.checkOut && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 px-4 py-2.5 rounded-xl">
            <Timer className="h-4 w-4 text-orange-500 animate-pulse" />
            <span className="text-sm font-mono font-bold text-orange-600 tracking-wider">
              {elapsedTime}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {!todayRecord ? (
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto font-bold bg-orange-500 hover:bg-orange-600 text-white"
              onClick={handleCheckIn}
              isLoading={isLoading}
            >
              <Play className="h-4 w-4 mr-2" />
              Check In Shift
            </Button>
          ) : !todayRecord.checkOut ? (
            <Button
              variant="danger"
              size="lg"
              className="w-full sm:w-auto font-bold bg-red-500 hover:bg-red-600 text-white"
              onClick={handleCheckOut}
              isLoading={isLoading}
            >
              <Square className="h-4 w-4 mr-2" />
              Check Out Shift
            </Button>
          ) : (
            <div className="w-full sm:w-auto text-center px-6 py-2.5 bg-green-50 border border-green-100 text-green-600 font-bold rounded-xl text-xs sm:text-sm">
              Today Completed ({todayRecord.workingHours} hrs)
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
export default AttendanceCard;
