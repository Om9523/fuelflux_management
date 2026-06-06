'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Download,
  Plus,
  Search,
  FileSpreadsheet,
  Scale,
  Receipt,
  Calendar,
  Building,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Info,
} from 'lucide-react';
import { usePumpStore } from '@/stores/pumps.store';
import { toast } from '@/components/feedback/Toast';
import { Button } from '@/components/ui/Button';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
// import { Input } from '@/components/ui/Input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { fetchDashboardData, DashboardData, AccountingSummary, createExpense, ExpenseItem } from '@/services/accounting.service';



export default function AccountingPage() {
  const { selectedPump } = usePumpStore();
  const currentPumpId = selectedPump?.id || 'pump_1';
  const [activeTab, setActiveTab] = useState<'pl' | 'expenses' | 'gst'>('pl');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseData, setExpenseData] = useState({
    desc: '',
    category: 'Fuel Purchases',
    amount: '',
    paymentMode: 'Net Banking',
    date: new Date().toISOString().split('T')[0],
  });

  // Placeholder pump data removed

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [summary, setSummary] = useState<AccountingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  // State for expenses (still local)
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);

  // Sync state whenever active pump changes
  useEffect(() => {
    // Reset expenses when pump changes
    setExpenses([]);
    setLoading(true);

    // Fetch dashboard data from backend
    fetchDashboardData(currentPumpId, 30)
      .then((data) => {
        setDashboardData(data);
        setSummary(data.summary);
        // Load expenses from backend
        if (data.expenses && Array.isArray(data.expenses)) {
          setExpenses(data.expenses);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch dashboard data', err);
        toast.error('Unable to load accounting data');
        setLoading(false);
      });
  }, [selectedPump]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!expenseData.desc || !expenseData.amount) {
      toast.error("Please specify description and amount.");
      return;
    }

    const numAmt = parseFloat(expenseData.amount.replace(/,/g, ""));

    if (isNaN(numAmt) || numAmt <= 0) {
      toast.error("Please input a valid expense amount.");
      return;
    }

    const payload = {
      pump_id: Number(currentPumpId.replace("pump_", "")),
      desc: expenseData.desc,
      category: expenseData.category,
      amount: numAmt,
      paymentMode: expenseData.paymentMode,
      date: expenseData.date,
    };

    try {
      // Save expense in backend
      await createExpense(payload);

      toast.success(`Expense saved: ${expenseData.desc}`);

      // Refresh dashboard data from backend (so we get real IDs and persisted data)
      const updatedData = await fetchDashboardData(currentPumpId, 30);
      setDashboardData(updatedData);
      setSummary(updatedData.summary);
      if (updatedData.expenses && Array.isArray(updatedData.expenses)) {
        setExpenses(updatedData.expenses);
      }

      // Close modal + reset form
      setIsAddExpenseOpen(false);
      setExpenseData({
        desc: "",
        category: "Fuel Purchases",
        amount: "",
        paymentMode: "Net Banking",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      toast.error("Could not save expense – see console");
      console.error(err);
    }
  };
  const handleExportCSV = () => {
    // Generate simulated CSV
    let csvContent = 'ID,Date,Description,Category,Amount,Payment Mode,Status\n';
    expenses.forEach((e) => {
      csvContent += `${e.id},${e.date},"${e.desc}",${e.category},${e.amount},${e.paymentMode},${e.status}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedPump?.name || 'FuelFlux'}_Ledger_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Chartered Accountant Spreadsheet (CSV) compiled and downloaded successfully!');
  };

  // Calculations for display
  const totalRevenue = summary?.total_sales ?? 0;
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMarginPercent = totalRevenue > 0
    ? parseFloat(((netProfit / totalRevenue) * 100).toFixed(1))
    : 0;
  // Filtered expenses based on search query
  const filteredExpenses = expenses.filter(
    (e) =>
      e.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800 text-left">

      {/* 1. MODULE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 rounded-2xl p-6 shadow-xs gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 border border-orange-200 text-primary">
            <Scale className="h-5.5 w-5.5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold text-text-primary tracking-tight">Accounting & Financial Ledgers</h1>
            <p className="text-xs text-text-secondary">Audit revenue sheets, track corporate expenditures, review tax liability, and export sheets for your Chartered Accountant.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition-all outline-none cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-500" />
            CA Export (.CSV)
          </button>

          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-4.5 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 transition-all outline-none cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Record Expense
          </button>
        </div>
      </div>

      {selectedPump?.status !== 'approved' ? (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center max-w-2xl mx-auto gap-4 mt-6">
          <AlertCircle className="h-10 w-10 text-amber-500 animate-pulse" />
          <h3 className="text-sm font-extrabold text-slate-800">Station Awaiting Accounting Access</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md">
            This petrol pump ({selectedPump?.name || 'Pending Station'}) is currently undergoing regulatory verification. Operational ledgers, GST matrices, and profit charts will be unlocked automatically upon approved credentialing.
          </p>
        </div>
      ) : (
        <>
          {/* 2. FINANCIAL OVERVIEW KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* CARD 1: REVENUE */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600">
                  <DollarSign className="h-5 w-5" />
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> +8.4%
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Inflow (MTD)</span>
                <span className="text-xl font-black text-text-primary font-mono tracking-tight">
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* CARD 2: EXPENSES */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 border border-rose-100 text-rose-600">
                  <Receipt className="h-5 w-5" />
                </div>
                <span className="px-2 py-0.5 rounded-md bg-rose-50 text-[10px] font-bold text-rose-600 flex items-center gap-0.5">
                  <TrendingDown className="h-3 w-3" /> -2.1%
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Expenses (MTD)</span>
                <span className="text-xl font-black text-text-primary font-mono tracking-tight">
                  ₹{totalExpenses.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* CARD 3: NET PROFIT */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 border border-sky-100 text-sky-600">
                  <Building className="h-5 w-5" />
                </div>
                <span className="px-2 py-0.5 rounded-md bg-sky-50 text-[10px] font-bold text-sky-600 font-mono">
                  Realtime
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Profit Outflow</span>
                <span className="text-xl font-black text-text-primary font-mono tracking-tight text-emerald-600">
                  ₹{netProfit.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* CARD 4: PROFIT DIAL GAUGE */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex items-center justify-between h-36">
              <div className="flex flex-col justify-between h-full">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 border border-orange-100 text-primary">
                  <Percent className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profit Margin</span>
                  <span className="text-xl font-black text-text-primary font-mono tracking-tight text-primary">
                    {profitMarginPercent}%
                  </span>
                </div>
              </div>

              {/* Dynamic SVG Semi-Circular Meter */}
              <div className="relative flex items-center justify-center h-20 w-24">
                <svg className="w-full h-full" viewBox="0 0 100 60">
                  {/* Gauge Arc Background */}
                  <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="#F1F5F9"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Active Gauge Arc */}
                  <motion.path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke="url(#profitGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="126"
                    initial={{ strokeDashoffset: 126 }}
                    animate={{ strokeDashoffset: 126 - (126 * (Math.min(profitMarginPercent, 35) / 35)) }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                  {/* Pointer Needle */}
                  <motion.line
                    x1="50"
                    y1="50"
                    x2="50"
                    y2="20"
                    stroke="#FF7A00"
                    strokeWidth="3"
                    strokeLinecap="round"
                    style={{ originX: '50px', originY: '50px' }}
                    initial={{ rotate: -90 }}
                    animate={{ rotate: -90 + (180 * (Math.min(profitMarginPercent, 35) / 35)) }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                  {/* Base cap */}
                  <circle cx="50" cy="50" r="5" fill="#1E293B" />

                  {/* Gradients */}
                  <defs>
                    <linearGradient id="profitGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#EF4444" />
                      <stop offset="50%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute bottom-1.5 text-[9px] font-extrabold text-slate-400 font-mono">
                  TARGET: 25%
                </div>
              </div>
            </div>
          </div>

          {/* 3. GRID CONTENT WITH TABS */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col gap-6">

            {/* Tab Controller */}
            <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-200/50 max-w-md select-none shrink-0 self-start">
              {[
                { id: 'pl', label: 'P&L Statement', icon: <FileSpreadsheet className="h-3.5 w-3.5" /> },
                { id: 'expenses', label: 'Expense Ledger', icon: <Receipt className="h-3.5 w-3.5" /> },
                { id: 'gst', label: 'Taxation & GST', icon: <Scale className="h-3.5 w-3.5" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex-grow flex items-center justify-center gap-1.5 py-2 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer outline-none
                    ${activeTab === tab.id ? 'bg-white text-primary shadow-xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-800'}
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: P&L STATEMENT */}
            {activeTab === 'pl' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Visual margin breakdown */}
                <div className="lg:col-span-2 flex flex-col gap-5">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Financial Performance</h3>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">May 1 - May 27, 2026</span>
                  </div>

                  <div className="flex flex-col gap-4">
                    {/* Inflow section */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5" /> Operations Inflow (Credit/Cash Ledger)
                      </span>
                      <div className="flex flex-col bg-slate-50/50 border border-slate-100 rounded-2xl p-4 divide-y divide-slate-100">
                        {dashboardData?.pl_items?.filter(i => i.type === 'income').map((item, idx) => (
                          <div key={idx} className="flex justify-between py-2.5 text-xs first:pt-0 last:pb-0 font-medium">
                            <span className="text-slate-600 flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-emerald-500" />
                              {item.category}
                            </span>
                            <div className="flex items-center gap-4">
                              <span className="text-slate-400 text-[10px]">{item.percentage}%</span>
                              <span className="font-bold text-slate-800 font-mono">₹{item.amount.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Outflow section */}
                    <div className="flex flex-col gap-2 mt-2">
                      <span className="text-[10px] font-extrabold text-rose-500 uppercase tracking-wider flex items-center gap-1">
                        <TrendingDown className="h-3.5 w-3.5" /> Operations Outflow (Salaries, Fuel tanker draw)
                      </span>
                      <div className="flex flex-col bg-slate-50/50 border border-slate-100 rounded-2xl p-4 divide-y divide-slate-100">
                        {dashboardData?.pl_items?.filter(i => i.type === 'expense').map((item, idx) => (
                          <div key={idx} className="flex justify-between py-2.5 text-xs first:pt-0 last:pb-0 font-medium">
                            <span className="text-slate-600 flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-rose-400" />
                              {item.category}
                            </span>
                            <div className="flex items-center gap-4">
                              <span className="text-slate-400 text-[10px]">{item.percentage}%</span>
                              <span className="font-bold text-slate-800 font-mono">₹{item.amount.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Side audit checklist */}
                <div className="bg-slate-50/60 border border-slate-100 rounded-3xl p-5 flex flex-col justify-between">
                  <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Accounting Health Checklist</span>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-2.5 text-xs font-semibold text-slate-700">
                        <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                          <span>Bank Account Reconciled</span>
                          <span className="text-[10px] font-medium text-slate-400 mt-0.5">Linked directly to SBI Corporate API</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 text-xs font-semibold text-slate-700">
                        <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                          <span>Salaries Disbursed</span>
                          <span className="text-[10px] font-medium text-slate-400 mt-0.5">14 active employees cleared on May 1</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 text-xs font-semibold text-slate-700">
                        <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                          <span>Tanker Receipts Logged</span>
                          <span className="text-[10px] font-medium text-slate-400 mt-0.5">All 3 HPCL tanker bills audited</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 text-xs font-semibold text-slate-700">
                        <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                          <span>Pending GST Provisional Filing</span>
                          <span className="text-[10px] font-medium text-slate-400 mt-0.5">May GSTR-1 & 3B provisional draft due in 15 days</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-white border border-slate-100 rounded-2xl flex flex-col gap-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Consulting Accountant</span>
                    <span className="text-xs font-extrabold text-slate-700">Sharma & Associates CA</span>
                    <span className="text-[10px] text-slate-500">Secured cloud-vault ledger share is enabled.</span>
                    <button
                      onClick={() => toast.success('Sharma & Associates CA notified! Financial vault access refreshed.')}
                      className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 py-2 text-[10px] font-bold text-primary transition-all outline-none cursor-pointer"
                    >
                      Audit Vault Share <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: EXPENSES */}
            {activeTab === 'expenses' && (
              <div className="flex flex-col gap-6">

                {/* Search / Filters */}
                <div className="flex items-center relative w-full sm:max-w-md">
                  <Search className="absolute left-3.5 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search expenses by supplier, type, ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                {/* Table list */}
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 font-extrabold text-text-secondary">
                        <th className="p-4 uppercase tracking-wider">Expense ID</th>
                        <th className="p-4 uppercase tracking-wider">Date</th>
                        <th className="p-4 uppercase tracking-wider">Description</th>
                        <th className="p-4 uppercase tracking-wider">Category</th>
                        <th className="p-4 uppercase tracking-wider">Payment Mode</th>
                        <th className="p-4 uppercase tracking-wider">Status</th>
                        <th className="p-4 uppercase tracking-wider text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-text-primary">
                      {filteredExpenses.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                            No ledger items matching query found.
                          </td>
                        </tr>
                      ) : (
                        filteredExpenses.map((exp) => (
                          <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-mono font-bold text-primary">{exp.id}</td>
                            <td className="p-4 text-slate-500 font-mono">{exp.date}</td>
                            <td className="p-4 font-bold text-slate-700">{exp.desc}</td>
                            <td className="p-4">
                              <span className="px-2.5 py-1 bg-slate-50 border border-slate-200/50 rounded-lg font-bold text-[10px] text-slate-600">
                                {exp.category}
                              </span>
                            </td>
                            <td className="p-4 font-semibold text-slate-500">{exp.paymentMode}</td>
                            <td className="p-4">
                              {exp.status === 'cleared' ? (
                                <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-[9px] rounded-lg flex items-center gap-1 w-fit">
                                  <CheckCircle className="h-3 w-3 shrink-0" />
                                  CLEARED
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 bg-amber-50 border border-amber-100 text-amber-600 font-bold text-[9px] rounded-lg flex items-center gap-1 w-fit">
                                  <Info className="h-3 w-3 shrink-0" />
                                  PENDING BANK RETAIN
                                </span>
                              )}
                            </td>
                            <td className="p-4 font-black font-mono text-right text-slate-800">
                              ₹{exp.amount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: GST / TAXATION */}
            {activeTab === 'gst' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* GST Logs */}
                <div className="lg:col-span-2 flex flex-col gap-5">
                  <div className="pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Tax Ledger Matrix (GST)</h3>
                  </div>

                  <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 font-extrabold text-text-secondary">
                          <th className="p-4 uppercase tracking-wider">Filing Period</th>
                          <th className="p-4 uppercase tracking-wider">CGST (9%)</th>
                          <th className="p-4 uppercase tracking-wider">SGST (9%)</th>
                          <th className="p-4 uppercase tracking-wider">Total Tax Owed</th>
                          <th className="p-4 uppercase tracking-wider">Filing Status</th>
                          <th className="p-4 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-text-primary">
                        {dashboardData?.gst_log?.map((gst, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-bold">{gst.period}</td>
                            <td className="p-4 font-mono font-semibold text-slate-600">₹{gst.cgst.toLocaleString('en-IN')}</td>
                            <td className="p-4 font-mono font-semibold text-slate-600">₹{gst.sgst.toLocaleString('en-IN')}</td>
                            <td className="p-4 font-mono font-extrabold text-slate-800">
                              ₹{(gst.cgst + gst.sgst).toLocaleString('en-IN')}
                            </td>
                            <td className="p-4">
                              {gst.status === 'filed' ? (
                                <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-[9px] rounded-lg flex items-center gap-1 w-fit">
                                  <CheckCircle className="h-3 w-3 shrink-0" />
                                  GSTR FILE COMPLETE
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 bg-amber-50 border border-amber-100 text-amber-600 font-bold text-[9px] rounded-lg flex items-center gap-1 w-fit">
                                  <AlertCircle className="h-3 w-3 shrink-0 animate-pulse" />
                                  DUE FOR COMPLIANCE
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              {gst.status === 'filed' ? (
                                <button
                                  onClick={() => toast.success(`Downloaded GSTR acknowledgement receipt for ${gst.period}`)}
                                  className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                                >
                                  Download ARN
                                </button>
                              ) : (
                                <button
                                  onClick={() => toast.success(`GSTR provisional report sent to Sharma Associates CA for ${gst.period}`)}
                                  className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer"
                                >
                                  File Draft GSTR
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* GST Details info box */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-5 flex flex-col gap-4 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-2 text-slate-800 font-extrabold text-sm border-b border-slate-100 pb-2">
                    <Info className="h-4.5 w-4.5 text-primary shrink-0" />
                    <span>Petroleum Tax Structure</span>
                  </div>

                  <p className="leading-relaxed text-[11px]">
                    In India, core petroleum products (Petrol & Diesel) are currently kept outside the purview of the Goods and Services Tax (GST). Instead, Central Excise Duty and State Value Added Tax (VAT) apply.
                  </p>

                  <div className="flex flex-col gap-2 mt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Applicable Non-GST Taxes:</span>
                    <div className="flex justify-between py-1 bg-white px-2 border border-slate-100 rounded-lg">
                      <span>Central Excise (Diesel):</span>
                      <span className="font-bold text-slate-700">₹15.80 / Liter</span>
                    </div>
                    <div className="flex justify-between py-1 bg-white px-2 border border-slate-100 rounded-lg">
                      <span>State VAT (AP/Telangana):</span>
                      <span className="font-bold text-slate-700">22.5% + Local Cess</span>
                    </div>
                  </div>

                  <p className="leading-relaxed text-[10px] text-slate-400 mt-2">
                    Note: GST is fully applicable on Lube oil product sales (18%), EV Charging utility draw (18%), and conveniences shop bills (18%), which are tracked completely inside this ledgers matrix.
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* 4. ADD EXPENSE MODAL */}
      <AnimatePresence>
        {isAddExpenseOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsAddExpenseOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 z-10"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-base font-extrabold text-text-primary flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" /> Onboard Expense Ledger Entry
                </h3>
                <button
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-50 text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
                >
                  <AlertCircle className="h-4.5 w-4.5 rotate-45" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddExpense} className="flex flex-col gap-5 text-left text-xs">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-primary">Expense Description / Supplier</label>
                  <input
                    type="text"
                    required
                    value={expenseData.desc}
                    onChange={(e) => setExpenseData((prev) => ({ ...prev, desc: e.target.value }))}
                    placeholder="e.g. Tanker Consignment IOCL-8902"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-text-primary">Expenditure Category</label>
                    <select
                      value={expenseData.category}
                      onChange={(e) => setExpenseData((prev) => ({ ...prev, category: e.target.value }))}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer font-bold"
                    >
                      <option value="Fuel Purchases">Fuel Purchases</option>
                      <option value="Salaries">Staff Salaries</option>
                      <option value="Utilities">Utilities & Electricity</option>
                      <option value="Maintenance">Forecourt Maintenance</option>
                      <option value="Compliance">Licenses & Safety</option>
                      <option value="Other">Other Miscellaneous</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-text-primary">Amount (INR)</label>
                    <input
                      type="text"
                      required
                      value={expenseData.amount}
                      onChange={(e) => setExpenseData((prev) => ({ ...prev, amount: e.target.value }))}
                      placeholder="e.g. 150000"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-text-primary">Payment Mode</label>
                    <select
                      value={expenseData.paymentMode}
                      onChange={(e) => setExpenseData((prev) => ({ ...prev, paymentMode: e.target.value }))}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer font-bold"
                    >
                      <option value="RTGS Transfer">RTGS Bank Transfer</option>
                      <option value="Direct Bank Deposit">Direct Corporate Deposit</option>
                      <option value="Corporate Card">Company Credit Card</option>
                      <option value="UPI Gateway">Corporate UPI QR</option>
                      <option value="Auto-Debit ECS">ECS Mandate Draw</option>
                      <option value="Net Banking">Net Banking</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-text-primary">Transaction Date</label>
                    <input
                      type="date"
                      required
                      value={expenseData.date}
                      onChange={(e) => setExpenseData((prev) => ({ ...prev, date: e.target.value }))}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-4 shrink-0 border-t border-slate-100 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setIsAddExpenseOpen(false)}
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
                    Submit Ledger Entry
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
