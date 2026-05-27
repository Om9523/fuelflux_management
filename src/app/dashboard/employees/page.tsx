'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  ScanFace,
  Clock,
  Calendar,
  CheckCircle,
  FileSpreadsheet,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  Building,
  Upload,
  X,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import { toast } from '@/components/feedback/Toast';
import { Button } from '@/components/ui/Button';

export default function EmployeesPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'reports' | 'salary'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // AI Face Enrollment state
  const [enrollFile, setEnrollFile] = useState<string | null>(null);
  const [enrollProgress, setEnrollProgress] = useState(-1); // -1 means idle
  const [faceEmbeddings, setFaceEmbeddings] = useState<string | null>(null);

  // Seed employees roster dataset
  const [employees, setEmployees] = useState([
    { id: 'EMP-101', name: 'Vikram Singh', phone: '9876543211', email: 'vikram@fuelflux.com', designation: 'Forecourt Supervisor', shift: 'Shift A (6AM - 2PM)', faceEnrolled: true, status: 'present' },
    { id: 'EMP-102', name: 'Sanjay Dutt', phone: '9876543222', email: 'sanjay@fuelflux.com', designation: 'Pump Attendant', shift: 'Shift B (2PM - 10PM)', faceEnrolled: true, status: 'present' },
    { id: 'EMP-103', name: 'Amit Sharma', phone: '9876543233', email: 'amit@fuelflux.com', designation: 'Pump Attendant', shift: 'Shift B (2PM - 10PM)', faceEnrolled: true, status: 'absent' },
    { id: 'EMP-104', name: 'Sneha Patil', phone: '9876543244', email: 'sneha@fuelflux.com', designation: 'Store Cashier', shift: 'Shift C (10PM - 6AM)', faceEnrolled: false, status: 'present' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    designation: 'Pump Attendant',
    empId: '',
    shift: 'Shift A (6AM - 2PM)',
    accessLevel: 'Employee',
    password: '',
  });

  const handleInputChange = (field: string, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEnrollFile(file.name);
      setEnrollProgress(0);

      // Trigger holographic AI Face scanner progress
      let current = 0;
      const interval = setInterval(() => {
        current += 10;
        setEnrollProgress(current);

        if (current >= 100) {
          clearInterval(interval);
          setFaceEmbeddings('FACE_MATRIX_EMBED_SECURE_SHA256_' + Math.random().toString(36).substr(2, 9).toUpperCase());
          toast.success('AI biometrics scanning complete! Face profile locked.');
        }
      }, 150);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.empId || !formData.phone) {
      toast.error('Name, Employee ID, and Phone are required.');
      return;
    }

    const newEmp = {
      id: formData.empId,
      name: formData.name,
      phone: formData.phone,
      email: formData.email || `${formData.name.toLowerCase().replace(/ /g, '')}@fuelflux.com`,
      designation: formData.designation,
      shift: formData.shift,
      faceEnrolled: !!faceEmbeddings,
      status: 'absent' as const,
    };

    setEmployees((prev) => [...prev, newEmp]);
    toast.success(`Onboarded Employee: ${formData.name}`);
    
    // reset states
    setIsAddModalOpen(false);
    setEnrollFile(null);
    setEnrollProgress(-1);
    setFaceEmbeddings(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      designation: 'Pump Attendant',
      empId: '',
      shift: 'Shift A (6AM - 2PM)',
      accessLevel: 'Employee',
      password: '',
    });
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800">
      {/* 1. HEADER MODAL */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 rounded-2xl p-6 shadow-xs gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 border border-orange-200 text-primary">
            <Users className="h-5.5 w-5.5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold text-text-primary tracking-tight">Workforce & Attendance</h1>
            <p className="text-xs text-text-secondary">Onboard employee details, enroll AI face biometrics, and schedule shifts</p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-4.5 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 transition-all outline-none cursor-pointer"
        >
          <Plus className="h-4 w-4 shrink-0" />
          Onboard Employee
        </button>
      </div>

      {/* 2. REUSABLE operational TABS BAR */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200/60 shadow-xs max-w-lg select-none">
        {[
          { id: 'all', label: 'All Employees', icon: <Users className="h-3.5 w-3.5" /> },
          { id: 'live', label: 'Live Attendance', icon: <UserCheck className="h-3.5 w-3.5" /> },
          { id: 'reports', label: 'Shift Reports', icon: <Calendar className="h-3.5 w-3.5" /> },
          { id: 'salary', label: 'Salaries & Payouts', icon: <CreditCard className="h-3.5 w-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex-1 flex justify-center items-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer outline-none
              ${activeTab === tab.id ? 'bg-primary text-white shadow-md shadow-primary/10' : 'text-slate-500 hover:text-slate-800'}
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. TABS VIEWS */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        {activeTab === 'all' && (
          <div className="flex flex-col gap-6">
            {/* Search filter */}
            <div className="flex items-center relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search employees by name, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>

            {/* Table roster */}
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 font-extrabold text-text-secondary">
                    <th className="p-4 uppercase tracking-wider">Employee ID</th>
                    <th className="p-4 uppercase tracking-wider">Full Name</th>
                    <th className="p-4 uppercase tracking-wider">Designation</th>
                    <th className="p-4 uppercase tracking-wider">Roster Shift</th>
                    <th className="p-4 uppercase tracking-wider">Contact</th>
                    <th className="p-4 uppercase tracking-wider">Biometrics status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-text-primary">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-primary">{emp.id}</td>
                      <td className="p-4 font-bold">{emp.name}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-slate-50 border border-slate-200/50 rounded-lg font-bold text-[10px] text-slate-600">
                          {emp.designation}
                        </span>
                      </td>
                      <td className="p-4 flex items-center gap-1.5 py-4">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {emp.shift}
                      </td>
                      <td className="p-4 text-text-secondary">{emp.phone}</td>
                      <td className="p-4">
                        {emp.faceEnrolled ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-[10px] rounded-lg">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            AI ENROLLED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-100 text-amber-600 font-bold text-[10px] rounded-lg">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            NO FACE DATA
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Live Attendance checkoffs */}
        {activeTab === 'live' && (
          <div className="flex flex-col gap-5 text-left">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h2 className="text-sm font-extrabold text-text-primary flex items-center gap-2">
                <ScanFace className="h-5 w-5 text-primary" />
                Live Camera shift Check-Ins
              </h2>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employees.map((emp) => (
                <div key={emp.id} className="border border-slate-100 p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-xs relative">
                  {/* Status indicator absolute */}
                  <span className={`absolute top-5 right-5 text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                    emp.status === 'present'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {emp.status}
                  </span>

                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center font-bold text-primary">
                      {emp.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-text-primary">{emp.name}</span>
                      <span className="text-[10px] text-text-secondary mt-0.5">{emp.designation}</span>
                      <span className="text-[9px] text-slate-400 font-mono tracking-tight mt-1">{emp.id}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-50 pt-3 flex items-center justify-between text-[10px] font-bold text-text-secondary font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Shift B roster
                    </span>
                    <span>Check-In: 14:02:11</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports placeholder */}
        {activeTab === 'reports' && (
          <div className="text-center py-16 flex flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold text-text-primary">Attendance reports</h3>
              <p className="text-xs text-text-secondary">Export spreadsheets containing shift roster cycles and monthly reports</p>
            </div>
          </div>
        )}

        {/* Salaries configuration */}
        {activeTab === 'salary' && (
          <div className="text-center py-16 flex flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400">
              <CreditCard className="h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold text-text-primary">Workforce Salaries & Payroll</h3>
              <p className="text-xs text-text-secondary">Define hourly base pay scales, overtime coefficients, and monthly transfers</p>
            </div>
          </div>
        )}
      </div>

      {/* 4. ADD EMPLOYEE FORM DIALOG MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsAddModalOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 z-10 max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-base font-extrabold text-text-primary flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" /> Onboard Employee Profile
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-50 text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Form content */}
              <form onSubmit={handleFormSubmit} className="flex flex-col gap-5 text-left">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-text-primary">Employee Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g. Sanjay Dutt"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-text-primary">Employee Phone</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="9876543211"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-text-primary">Employee Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="sanjay@fuelflux.com"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-text-primary"> Roster Employee ID</label>
                    <input
                      type="text"
                      required
                      value={formData.empId}
                      onChange={(e) => handleInputChange('empId', e.target.value)}
                      placeholder="EMP-105"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-text-primary">Designation</label>
                    <select
                      value={formData.designation}
                      onChange={(e) => handleInputChange('designation', e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                    >
                      <option value="Pump Attendant">Pump Attendant</option>
                      <option value="Forecourt Supervisor">Forecourt Supervisor</option>
                      <option value="Store Cashier">Store Cashier</option>
                      <option value="Billing Agent">Billing Agent</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-text-primary">Roster Shift</label>
                    <select
                      value={formData.shift}
                      onChange={(e) => handleInputChange('shift', e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                    >
                      <option value="Shift A (6AM - 2PM)">Shift A (6:00 AM - 2:00 PM)</option>
                      <option value="Shift B (2PM - 10PM)">Shift B (2:00 PM - 10:00 PM)</option>
                      <option value="Shift C (10PM - 6AM)">Shift C (10:00 PM - 6:00 AM)</option>
                    </select>
                  </div>
                </div>

                {/* AI FACE EMBEDDING BIOMETRIC SCROLL CARD */}
                <div className="p-5 border border-slate-100 bg-slate-50 rounded-2xl flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-text-primary flex items-center gap-1.5">
                      <ScanFace className="h-4.5 w-4.5 text-primary shrink-0" />
                      AI Face Profile Enrollment (PESO-Safety Compliance)
                    </span>
                    {faceEmbeddings && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 uppercase font-mono">SECURE</span>}
                  </div>

                  {!enrollFile ? (
                    <label className="flex items-center justify-center border border-dashed border-slate-350 rounded-xl p-6 hover:bg-slate-100/50 cursor-pointer transition-colors relative outline-none">
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                      <div className="flex flex-col items-center gap-1.5 text-xs font-bold text-primary">
                        <Upload className="h-5 w-5 text-slate-400" />
                        Upload biometric roster photo
                      </div>
                    </label>
                  ) : (
                    <div className="flex flex-col gap-2 text-xs">
                      <div className="flex justify-between items-center font-semibold text-text-secondary">
                        <span className="truncate max-w-[200px] font-mono">{enrollFile}</span>
                        <span>{enrollProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            enrollProgress >= 100 ? 'bg-emerald-500' : 'bg-primary'
                          } transition-all duration-300`}
                          style={{ width: `${enrollProgress}%` }}
                        />
                      </div>
                      
                      {enrollProgress >= 100 && (
                        <div className="text-[10px] font-semibold text-text-secondary leading-normal flex flex-col gap-0.5 p-3 bg-white border border-slate-100 rounded-xl">
                          <span className="text-[9px] text-slate-400 font-bold uppercase">FACE SIGNATURE:</span>
                          <span className="font-mono tracking-tight text-emerald-600 break-all truncate">{faceEmbeddings}</span>
                        </div>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => { setEnrollFile(null); setEnrollProgress(-1); setFaceEmbeddings(null); }}
                        className="text-[10px] font-bold text-red-500 hover:underline outline-none text-left w-fit cursor-pointer"
                      >
                        Remove profile image
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-2 shrink-0 border-t border-slate-100 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="flex-1 font-bold"
                  >
                    Onboard Employee
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
