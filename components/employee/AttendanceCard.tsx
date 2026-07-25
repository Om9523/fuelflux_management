'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Play, Square, Timer } from 'lucide-react';
import { useAttendanceStore } from '@/stores/attendance.store';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/feedback/Toast';

export const AttendanceCard: React.FC = () => {
  const { todayRecord, checkIn, checkOut, isChecking, fetchTodayAttendance } = useAttendanceStore();
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');

  // Fetch today's record on mount
  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  // Live stopwatch — runs while checked in but not checked out
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    // Backend returns "09:15 AM" format — parse it
    const checkInStr = todayRecord?.check_in;
    const checkOutStr = todayRecord?.check_out;

    if (checkInStr && !checkOutStr) {
      const calculateElapsed = () => {
        // Parse "09:15 AM" → hours/minutes
        const [time, meridiem] = checkInStr.split(' ');
        let [h, m] = time.split(':').map(Number);
        if (meridiem === 'PM' && h !== 12) h += 12;
        if (meridiem === 'AM' && h === 12) h = 0;

        const now = new Date();
        const checkInDate = new Date();
        checkInDate.setHours(h, m, 0, 0);

        // Night shift — check-in was yesterday
        if (now.getTime() < checkInDate.getTime()) {
          checkInDate.setDate(checkInDate.getDate() - 1);
        }

        const diffSecs = Math.floor((now.getTime() - checkInDate.getTime()) / 1000);
        const hours = Math.floor(diffSecs / 3600);
        const mins = Math.floor((diffSecs % 3600) / 60);
        const secs = diffSecs % 60;
        const pad = (n: number) => String(n).padStart(2, '0');
        setElapsedTime(`${pad(hours)}:${pad(mins)}:${pad(secs)}`);
      };

      calculateElapsed();
      intervalId = setInterval(calculateElapsed, 1000);
    } else {
      setElapsedTime('00:00:00');
    }

    return () => { if (intervalId) clearInterval(intervalId); };
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
      toast.success('Shift completed! Check-out logged.');
    } catch (err: any) {
      toast.error(err.message || 'Check-out failed');
    }
  };

  // Determine current state
  const notCheckedIn = !todayRecord || todayRecord.today_status === 'Not Checked In';
  const checkedOut = !!todayRecord?.check_out;
  const onShift = !notCheckedIn && !checkedOut;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-orange-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 text-left"
    >
      {/* Left info */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shrink-0 shadow-inner">
          <Clock className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">Shift Attendance Console</h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            {notCheckedIn
              ? "Ready for today's shift. Please check in to log timings."
              : checkedOut
                ? `Shift complete. Checked out at ${todayRecord.check_out}.`
                : `Checked in at ${todayRecord?.check_in}. Shift active.`}
          </p>
        </div>
      </div>

      {/* Right — stopwatch + button */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto shrink-0">
        {/* Live timer — only while on shift */}
        {onShift && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 px-4 py-2.5 rounded-xl">
            <Timer className="h-4 w-4 text-orange-500 animate-pulse" />
            <span className="text-sm font-mono font-bold text-orange-600 tracking-wider">
              {elapsedTime}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {notCheckedIn ? (
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto font-bold bg-orange-500 hover:bg-orange-600 text-white"
              onClick={handleCheckIn}
              isLoading={isChecking}
            >
              <Play className="h-4 w-4 mr-2" />
              Check In Shift
            </Button>
          ) : checkedOut ? (
            <div className="w-full sm:w-auto text-center px-6 py-2.5 bg-green-50 border border-green-100 text-green-600 font-bold rounded-xl text-xs sm:text-sm">
              Today Completed ({todayRecord?.working_hours} hrs)
            </div>
          ) : (
            <Button
              variant="danger"
              size="lg"
              className="w-full sm:w-auto font-bold"
              onClick={handleCheckOut}
              isLoading={isChecking}
            >
              <Square className="h-4 w-4 mr-2" />
              Check Out Shift
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AttendanceCard;