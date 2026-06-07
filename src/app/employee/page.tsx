'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Award,
  TrendingUp,
  Megaphone,
  User,
  ArrowRight,
  PlusCircle,
  DollarSign,
  Briefcase,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useEmployeeStore } from '@/stores/employee.store';
import { useAttendanceStore } from '@/stores/attendance.store';
import { EmployeeKpiCard } from '@/components/employee/EmployeeKpiCard';
import { AttendanceCard } from '@/components/employee/AttendanceCard';
import { shiftService } from '@/services/shift.service';
import { ShiftDetails, Announcement } from '@/lib/mock-db';
import { toast } from '@/components/feedback/Toast';

// Recharts imports for premium graphics
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export default function EmployeeDashboard() {
  const router = useRouter();
  const { profile, user, announcements, fetchAnnouncements } = useEmployeeStore();
  const { records, todayRecord, fetchAttendance } = useAttendanceStore();
  const [shift, setShift] = useState<ShiftDetails | null>(null);
  const [loadingShift, setLoadingShift] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
    fetchAttendance();
    
    shiftService.getShiftDetails()
      .then((data) => setShift(data))
      .catch(() => toast.error('Failed to load shift details'))
      .finally(() => setLoadingShift(false));
  }, [fetchAnnouncements, fetchAttendance]);

  // Compute stats
  const totalDays = records.length;
  const presentDays = records.filter((r) => r.status === 'Present' || r.status === 'Late').length;
  const lateDays = records.filter((r) => r.status === 'Late').length;
  const leavesTaken = records.filter((r) => r.status === 'Leave').length;

  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  // Prepare chart data (last 7 logs)
  const chartData = [...records]
    .reverse()
    .slice(-7)
    .map((r) => ({
      date: new Date(r.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      hours: r.workingHours || 0,
      status: r.status,
    }));

  return (
    <div className="flex flex-col gap-6 text-left font-sans">
      {/* Welcome & Security Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-150/40 p-6 rounded-2xl">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Welcome back, {user?.name || 'Staff User'}!
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            You are logged into the self-service portal. Station: <span className="font-bold text-orange-600">{profile?.assignedPump || 'Sector 62 BP'}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-white px-3.5 py-2 rounded-xl border border-orange-100 shadow-sm">
          <ShieldAlert className="h-4 w-4 text-orange-500 shrink-0" />
          ROLE BOUNDARY ACTIVE: RESTRICTED VIEW
        </div>
      </div>

      {/* Interactive Attendance Card */}
      <AttendanceCard />

      {/* KPI Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <EmployeeKpiCard
          title="Today's Shift"
          value={shift?.currentShift.name || 'Afternoon Shift'}
          description={shift ? `${shift.currentShift.startTime} - ${shift.currentShift.endTime}` : 'Loading...'}
          icon={<Briefcase className="h-5.5 w-5.5" />}
        />
        <EmployeeKpiCard
          title="Attendance Status"
          value={!todayRecord ? 'Not Checked In' : todayRecord.checkOut ? 'Shift Completed' : 'On Shift Duty'}
          description={todayRecord?.checkIn ? `Checked in at ${todayRecord.checkIn}` : 'Pending shift start'}
          icon={<Clock className="h-5.5 w-5.5" />}
        />
        <EmployeeKpiCard
          title="Hours Logged Today"
          value={todayRecord?.workingHours ? `${todayRecord.workingHours} hrs` : '0.00 hrs'}
          description={todayRecord?.checkOut ? 'Logged checkout time' : 'Timer running'}
          icon={<TrendingUp className="h-5.5 w-5.5" />}
        />
        <EmployeeKpiCard
          title="Monthly Attendance"
          value={`${attendanceRate}%`}
          description={`${presentDays} days present out of ${totalDays}`}
          icon={<Award className="h-5.5 w-5.5" />}
        />
      </div>

      {/* Core Split Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Side: Chart and Roster */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Recharts working hours log */}
          <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Working Hours History</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Logged hours across your last 7 active days.</p>
              </div>
            </div>
            <div className="h-64 w-full">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                  No attendance history logged yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tickLine={false} axisLine={false} style={{ fontSize: 9, fontWeight: 700, fill: '#94A3B8' }} />
                    <YAxis tickLine={false} axisLine={false} style={{ fontSize: 9, fontWeight: 700, fill: '#94A3B8' }} />
                    <Tooltip
                      contentStyle={{ background: '#FFF', border: '1px solid #FED7AA', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                      labelClassName="text-orange-500"
                    />
                    <Area type="monotone" dataKey="hours" stroke="#F97316" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHours)" name="Hours Worked" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Quick Actions widget */}
          <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Quick Self-Service Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link
                href="/employee/attendance"
                className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-orange-50/50 border border-slate-200/60 hover:border-orange-200 rounded-2xl transition-all duration-300 group cursor-pointer"
              >
                <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                  <Clock className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-700">My Attendance</span>
              </Link>
              <Link
                href="/employee/leave"
                className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-orange-50/50 border border-slate-200/60 hover:border-orange-200 rounded-2xl transition-all duration-300 group cursor-pointer"
              >
                <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-700">Apply Leave</span>
              </Link>
              <Link
                href="/employee/salary"
                className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-orange-50/50 border border-slate-200/60 hover:border-orange-200 rounded-2xl transition-all duration-300 group cursor-pointer"
              >
                <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                  <DollarSign className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-700">View Salary</span>
              </Link>
              <Link
                href="/employee/profile"
                className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-orange-50/50 border border-slate-200/60 hover:border-orange-200 rounded-2xl transition-all duration-300 group cursor-pointer"
              >
                <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                  <User className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-700">Update Profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Announcements and shift brief */}
        <div className="flex flex-col gap-6">
          {/* Shift info snippet */}
          <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm text-left">
            <h3 className="text-sm font-bold text-slate-800 mb-3.5">Today's Shift Hours</h3>
            {shift ? (
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500 border-b border-slate-50 pb-2">
                  <span>Shift Name:</span>
                  <span className="text-slate-800 font-bold">{shift.currentShift.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500 border-b border-slate-50 pb-2">
                  <span>Active Hours:</span>
                  <span className="text-orange-500 font-bold font-mono">{shift.currentShift.startTime} - {shift.currentShift.endTime}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span>Tomorrow's Shift:</span>
                  <span className="text-slate-800 font-bold">Afternoon Shift</span>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-xs font-semibold">Loading roster info...</div>
            )}
            <Link
              href="/employee/shifts"
              className="mt-4 flex w-full justify-center items-center gap-1 text-[11px] font-bold text-orange-500 hover:text-orange-600 hover:underline"
            >
              Check Weekly Schedule
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Announcements notices snippet */}
          <div className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-2">
              <h3 className="text-sm font-bold text-slate-850">Recent Announcements</h3>
              <Link href="/employee/announcements" className="text-[10px] font-bold text-orange-500 hover:underline">
                View All
              </Link>
            </div>
            
            <div className="flex flex-col gap-3">
              {announcements.slice(0, 2).map((ann) => {
                const badgeColor = ann.type === 'Urgent' ? 'bg-red-100 text-red-700' : ann.type === 'Safety' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-755';
                return (
                  <div key={ann.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${badgeColor}`}>
                        {ann.type}
                      </span>
                      <span className="text-[8px] font-mono font-bold text-slate-400">{ann.date}</span>
                    </div>
                    <h4 className="text-xs font-extrabold text-slate-800 leading-tight mt-1 truncate">{ann.title}</h4>
                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed mt-0.5 line-clamp-2">
                      {ann.content}
                    </p>
                  </div>
                );
              })}
              {announcements.length === 0 && (
                <div className="text-center py-4 text-xs font-medium text-slate-400">
                  No active announcements
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
