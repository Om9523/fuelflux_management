'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Search, Clock, UserCheck,
  ShieldCheck, AlertTriangle, X, Eye, EyeOff,
  CreditCard, FileSpreadsheet, ToggleLeft, ToggleRight, KeyRound,
  Megaphone, User,
} from 'lucide-react';
import { toast } from '@/components/feedback/Toast';
import backendApi from '@/lib/backendApi';

interface Employee {
  id: string;
  pump_id: string;
  name: string;
  phone: string;
  email: string | null;
  employee_id: string;
  designation: string;
  shift: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

const DESIGNATIONS = ['Pump Attendant', 'Forecourt Supervisor', 'Store Cashier', 'Manager', 'Billing Agent'];
const SHIFTS = [
  { label: 'Morning  (6AM – 2PM)', value: 'Morning' },
  { label: 'Evening  (2PM – 10PM)', value: 'Evening' },
  { label: 'Night    (10PM – 6AM)', value: 'Night' },
];

export default function EmployeesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'reports' | 'salary'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '', phone: '', email: '',
    employee_id: '', password: '',
    designation: 'Pump Attendant', shift: 'Morning',
  });

  // Fetch employees from real API
  const fetchEmployees = () => {
    setLoading(true);
    backendApi.get('/attendants/my-attendants')
      .then((res) => setEmployees(res.data))
      .catch(() => toast.error('Failed to load employees'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleInput = (field: string, val: string) =>
    setFormData((prev) => ({ ...prev, [field]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.employee_id || !formData.password) {
      toast.error('Name, Phone, Employee ID and Password are required.');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await backendApi.post('/attendants/', {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        employee_id: formData.employee_id,
        password: formData.password,
        designation: formData.designation,
        shift: formData.shift,
      });
      toast.success(`Employee ${formData.name} onboarded successfully!`);
      setIsAddModalOpen(false);
      setFormData({ name: '', phone: '', email: '', employee_id: '', password: '', designation: 'Pump Attendant', shift: 'Morning' });
      fetchEmployees();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add employee.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (emp: Employee) => {
    try {
      await backendApi.patch(`/attendants/${emp.id}/toggle-status`);
      toast.success(`${emp.name} ${emp.is_active ? 'deactivated' : 'activated'}.`);
      fetchEmployees();
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.employee_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 rounded-2xl p-6 shadow-xs gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 border border-orange-200 text-orange-500">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight">Workforce & Attendance</h1>
            <p className="text-xs text-slate-400">Onboard employees, assign shifts, manage attendance</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsAnnounceModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-orange-300 bg-orange-50 hover:bg-orange-100 px-4 py-2.5 text-xs font-bold text-orange-600 transition-all cursor-pointer">
            <Megaphone className="h-4 w-4" /> Announce
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-200 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Onboard Employee
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200/60 shadow-xs max-w-lg">
        {[
          { id: 'all', label: 'All Employees', icon: <Users className="h-3.5 w-3.5" /> },
          { id: 'live', label: 'Live Attendance', icon: <UserCheck className="h-3.5 w-3.5" /> },
          { id: 'reports', label: 'Shift Reports', icon: <FileSpreadsheet className="h-3.5 w-3.5" /> },
          { id: 'salary', label: 'Salaries', icon: <CreditCard className="h-3.5 w-3.5" /> },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex justify-center items-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer outline-none ${activeTab === tab.id ? 'bg-orange-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        {activeTab === 'all' && (
          <div className="flex flex-col gap-6">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name or employee ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition placeholder:text-slate-400"
              />
            </div>

            {loading ? (
              <div className="min-h-[200px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-orange-500" />
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500">
                      <th className="p-4 uppercase tracking-wider">Employee ID</th>
                      <th className="p-4 uppercase tracking-wider">Full Name</th>
                      <th className="p-4 uppercase tracking-wider">Designation</th>
                      <th className="p-4 uppercase tracking-wider">Shift</th>
                      <th className="p-4 uppercase tracking-wider">Phone</th>
                      <th className="p-4 uppercase tracking-wider">Status</th>
                      <th className="p-4 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 text-xs font-semibold">
                          No employees found.
                        </td>
                      </tr>
                    ) : filteredEmployees.map((emp) => (
                      <tr key={emp.id}
                        onClick={() => router.push(`/dashboard/employees/${emp.id}`)}
                        className="hover:bg-orange-50/40 transition-colors cursor-pointer">
                        <td className="p-4 font-mono font-bold text-orange-500">{emp.employee_id}</td>
                        <td className="p-4 font-bold">{emp.name}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg font-bold text-[10px] text-slate-600">
                            {emp.designation}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {emp.shift || '—'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{emp.phone}</td>
                        <td className="p-4">
                          {emp.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-[10px] rounded-lg">
                              <ShieldCheck className="h-3.5 w-3.5" /> ACTIVE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-100 text-red-500 font-bold text-[10px] rounded-lg">
                              <AlertTriangle className="h-3.5 w-3.5" /> INACTIVE
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => toggleStatus(emp)}
                            title={emp.is_active ? 'Deactivate' : 'Activate'}
                            className="p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                          >
                            {emp.is_active
                              ? <ToggleRight className="h-5 w-5 text-emerald-500" />
                              : <ToggleLeft className="h-5 w-5 text-slate-400" />
                            }
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'live' && (
          <div className="flex flex-col gap-5">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h2 className="text-sm font-extrabold flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-orange-500" /> Live Shift Status
              </h2>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((emp) => (
                <div key={emp.id} className="border border-slate-100 p-5 rounded-2xl flex flex-col gap-4 shadow-xs relative">
                  <span className={`absolute top-4 right-4 text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${emp.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'
                    }`}>
                    {emp.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center font-bold text-orange-500">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-bold">{emp.name}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{emp.designation}</span>
                      <span className="text-[9px] text-slate-400 font-mono mt-1 block">{emp.employee_id}</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-50 pt-3 flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {emp.shift || 'No Shift'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="text-center py-16 flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-slate-50 border flex items-center justify-center text-slate-400">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Shift Reports</h3>
              <p className="text-xs text-slate-400 mt-1">Monthly attendance and shift roster exports — coming soon.</p>
            </div>
          </div>
        )}

        {activeTab === 'salary' && (
          <div className="text-center py-16 flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-slate-50 border flex items-center justify-center text-slate-400">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Payroll Management</h3>
              <p className="text-xs text-slate-400 mt-1">Generate salary slips and manage payouts — coming soon.</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <Plus className="h-5 w-5 text-orange-500" /> Onboard Employee
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-50 cursor-pointer transition">
                  <X className="h-4.5 w-4.5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Full Name *</label>
                    <input type="text" required value={formData.name}
                      onChange={(e) => handleInput('name', e.target.value)}
                      placeholder="e.g. Sanjay Dutt"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                    />
                  </div>
                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Phone *</label>
                    <input type="tel" required value={formData.phone}
                      onChange={(e) => handleInput('phone', e.target.value)}
                      placeholder="9876543210"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold font-mono outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Email (optional)</label>
                    <input type="email" value={formData.email}
                      onChange={(e) => handleInput('email', e.target.value)}
                      placeholder="sanjay@example.com"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                    />
                  </div>
                  {/* Employee ID */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Employee ID *</label>
                    <input type="text" required value={formData.employee_id}
                      onChange={(e) => handleInput('employee_id', e.target.value)}
                      placeholder="e.g. FF-001"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold font-mono outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Designation */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Designation</label>
                    <select value={formData.designation} onChange={(e) => handleInput('designation', e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer"
                    >
                      {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  {/* Shift */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Shift</label>
                    <select value={formData.shift} onChange={(e) => handleInput('shift', e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer"
                    >
                      {SHIFTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Password — NEW */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-orange-500" />
                    Initial Password * (share this with the employee)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => handleInput('password', e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-11 text-xs font-semibold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                    />
                    <button type="button" onClick={() => setShowPassword(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    Employee will use this password to login at <span className="text-orange-500">/employee/login</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-2 border-t border-slate-100 pt-4">
                  <button type="button" onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-md shadow-orange-100 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    {submitting
                      ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <Plus className="h-4 w-4" />
                    }
                    {submitting ? 'Creating...' : 'Onboard Employee'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {isAnnounceModalOpen && (
          <AnnouncementModal 
            onClose={() => setIsAnnounceModalOpen(false)} 
            employees={employees}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Announcement Modal Component ──────────────────────────────────────────────

interface AnnEmployee { id: string; name: string; employee_id: string; designation: string; }

function AnnouncementModal({ onClose, employees }: { onClose: () => void; employees: AnnEmployee[] }) {
  const [form, setForm] = useState({
    title: '',
    content: '',
    announcement_type: 'General',
    target: 'all',
    target_employee_id: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.target === 'specific' && !form.target_employee_id) {
      toast.error('Please select an employee.');
      return;
    }
    if (!form.title || !form.content) {
      toast.error('Title and content are required.');
      return;
    }
    setSubmitting(true);
    try {
      await backendApi.post('/announcements/', {
        title: form.title,
        content: form.content,
        announcement_type: form.announcement_type,
        target_employee_id: form.target === 'specific' ? form.target_employee_id : null
      });
      toast.success("Announcement sent successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 z-10 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
          <h3 className="text-base font-extrabold flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-orange-500" /> Send Announcement
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-50 cursor-pointer transition">
            <X className="h-4.5 w-4.5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
          {/* Target Cards */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Send To</label>
            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => setForm(f => ({...f, target: 'all', target_employee_id: ''}))}
                className={`p-4 rounded-2xl border-2 flex flex-col gap-1 cursor-pointer transition ${
                  form.target === 'all'
                    ? 'border-orange-400 bg-orange-50 text-orange-600'
                    : 'border-slate-200 bg-white hover:border-orange-200 text-slate-500'
                }`}
              >
                <Users className="h-5 w-5" />
                <span className="text-xs font-extrabold text-slate-800">All Employees</span>
                <span className="text-[10px] text-slate-400 font-semibold">Broadcast to entire pump staff</span>
              </div>
              <div
                onClick={() => setForm(f => ({...f, target: 'specific'}))}
                className={`p-4 rounded-2xl border-2 flex flex-col gap-1 cursor-pointer transition ${
                  form.target === 'specific'
                    ? 'border-orange-400 bg-orange-50 text-orange-600'
                    : 'border-slate-200 bg-white hover:border-orange-200 text-slate-500'
                }`}
              >
                <User className="h-5 w-5" />
                <span className="text-xs font-extrabold text-slate-800">Specific Employee</span>
                <span className="text-[10px] text-slate-400 font-semibold">Send to one staff member only</span>
              </div>
            </div>
          </div>

          {/* Specific Employee Selection */}
          {form.target === 'specific' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Select Employee *</label>
              <select
                required
                value={form.target_employee_id}
                onChange={(e) => setForm(f => ({ ...f, target_employee_id: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer"
              >
                <option value="">Select Employee...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employee_id} — {emp.name} ({emp.designation})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Announcement Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Announcement Type</label>
            <select
              value={form.announcement_type}
              onChange={(e) => setForm(f => ({ ...f, announcement_type: e.target.value }))}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition cursor-pointer"
            >
              <option value="General" className="text-blue-600">General</option>
              <option value="Urgent" className="text-red-600">Urgent</option>
              <option value="Safety" className="text-amber-600">Safety</option>
              <option value="Holiday" className="text-green-600">Holiday</option>
            </select>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Tomorrow is a holiday"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Content *</label>
            <textarea
              required
              rows={4}
              placeholder="Write your message here..."
              value={form.content}
              onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 mt-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-md shadow-orange-100 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Megaphone className="h-4 w-4" />
              )}
              {submitting ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}