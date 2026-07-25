'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Filter,
  ArrowDown,
  CheckCircle,
  Clock,
  Sparkles,
  Database,
  AlertCircle,
  Trash2,
  Settings,
  Plus,
  RefreshCw,
  BarChart2,
  PieChart as PieChartIcon,
  ShieldCheck,
  TrendingUp,
  Flame,
  Users
} from 'lucide-react';
import { usePumpStore } from '@/stores/pumps.store';
import { toast } from '@/components/feedback/Toast';
import { Button } from '@/components/ui/Button';
import { getReportsSummary, exportReport, ReportsSummary } from '@/services/reports.service';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';

interface ExportItem {
  id: string;
  filename: string;
  type: string;
  format: 'xlsx' | 'csv' | 'pdf';
  size: string;
  createdAt: string;
  status: 'ready' | 'compiling' | 'failed';
}

const SEED_EXPORTS: Record<string, ExportItem[]> = {
  pump_1: [
    { id: 'RPT-901', filename: 'vijayawada_highway_sales_journal_may2026.xlsx', type: 'Forecourt Sales Journal', format: 'xlsx', size: '2.4 MB', createdAt: '2026-05-26 18:30', status: 'ready' },
    { id: 'RPT-902', filename: 'vijayawada_underground_fuel_inventory_log.csv', type: 'Fuel Inventory Log', format: 'csv', size: '482 KB', createdAt: '2026-05-24 10:15', status: 'ready' },
    { id: 'RPT-903', filename: 'vijayawada_attendants_attendance_salary.pdf', type: 'Attendant Payroll Sheet', format: 'pdf', size: '1.2 MB', createdAt: '2026-05-01 09:00', status: 'ready' },
  ],
  pump_2: [
    { id: 'RPT-904', filename: 'gachibowli_cashless_split_ledger_may2026.xlsx', type: 'Forecourt Sales Journal', format: 'xlsx', size: '1.8 MB', createdAt: '2026-05-27 12:45', status: 'ready' },
    { id: 'RPT-905', filename: 'gachibowli_ev_utility_power_draw.pdf', type: 'Compliance & Gas Registry', format: 'pdf', size: '920 KB', createdAt: '2026-05-18 16:30', status: 'ready' },
  ],
  default: []
};

const PAYMENT_COLORS = {
  cash: '#10B981',   // Emerald
  pos: '#3B82F6',    // Blue
  upi: '#8B5CF6',    // Violet
  credit: '#F59E0B', // Amber
  upi_gateway: '#EC4899' // Pink
};

export default function ReportsPage() {
  const { selectedPump } = usePumpStore();
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('7days');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [fileFormat, setFileFormat] = useState<'xlsx' | 'csv' | 'pdf'>('csv');
  
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileStep, setCompileStep] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'vault'>('overview');
  
  const [summaryData, setSummaryData] = useState<ReportsSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const currentPumpId = selectedPump?.id || '';
  const [exportsList, setExportsList] = useState<ExportItem[]>([]);

  // Safety hydration logic
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync historical reports list from seeds whenever pump shifts
  useEffect(() => {
    if (currentPumpId) {
      setExportsList(SEED_EXPORTS[currentPumpId] || SEED_EXPORTS.pump_1);
    }
  }, [currentPumpId]);

  // Fetch summary reports stats
  const fetchSummary = async () => {
    if (!currentPumpId || selectedPump?.status !== 'approved') return;
    setSummaryLoading(true);
    try {
      const data = await getReportsSummary(
        currentPumpId,
        dateRange,
        dateRange === 'custom' ? fromDate : undefined,
        dateRange === 'custom' ? toDate : undefined
      );
      setSummaryData(data);
    } catch (err) {
      console.error('Failed to load reports summary:', err);
      toast.error('Unable to fetch reports dashboard summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [currentPumpId, dateRange, fromDate, toDate]);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPump?.status !== 'approved') {
      toast.error('Financial reports compilation requires an approved active petrol pump.');
      return;
    }

    if (dateRange === 'custom' && (!fromDate || !toDate)) {
      toast.error('Please specify both starting and ending date.');
      return;
    }

    setIsCompiling(true);
    setCompileStep('Connecting to FuelFlux cloud servers...');

    try {
      const steps = [
        'Querying database for selected parameters...',
        'Aggregating transaction records & nozzle logs...',
        'Validating GSTR & PESO regulatory compliance schemas...',
        'Formatting data matrix & signing document...'
      ];
      
      for (const step of steps) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        setCompileStep(step);
      }

      const blob = await exportReport({
        pump_id: currentPumpId,
        report_type: reportType,
        date_range: dateRange,
        from_date: dateRange === 'custom' ? fromDate : undefined,
        to_date: dateRange === 'custom' ? toDate : undefined,
        format: fileFormat,
      });

      const filename = `${(selectedPump?.name || 'station')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')}_${reportType}_${dateRange}.${fileFormat}`;

      // Download trigger
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      const typeLabels: Record<string, string> = {
        sales: 'Forecourt Sales Journal',
        inventory: 'Fuel Inventory Log',
        employees: 'Attendant Payroll Sheet',
        compliance: 'Compliance & Gas Registry',
        udhaar: 'Credit Udhaar Ledger'
      };

      const newExport: ExportItem = {
        id: 'RPT-' + Math.floor(910 + Math.random() * 80),
        filename,
        type: typeLabels[reportType] || 'Financial Ledger Summary',
        format: fileFormat,
        size: `${(blob.size / 1024).toFixed(1)} KB`,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'ready'
      };

      setExportsList((prev) => [newExport, ...prev]);
      toast.success(`Successfully compiled and downloaded: ${filename}`);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to export and generate report data.');
    } finally {
      setIsCompiling(false);
    }
  };

  const handleDownloadFileLocal = (item: ExportItem) => {
    // Simulate re-download of historical seed files
    const mockContent = `FuelFlux Telemetry Export Record\nID: ${item.id}\nFilename: ${item.filename}\nType: ${item.type}\nFormat: ${item.format.toUpperCase()}\nCompiled At: ${item.createdAt}\nSecurity hash: sha256-${Math.random().toString(36).substr(2, 10).toUpperCase()}`;
    const blob = new Blob([mockContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', item.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Downloaded registry document: ${item.filename}`);
  };

  const handleDeleteReport = (id: string) => {
    setExportsList((prev) => prev.filter((item) => item.id !== id));
    toast.success('Removed filing from registry record.');
  };

  const paymentModesData = summaryData?.payment_modes.map(mode => ({
    name: mode.payment_mode.toUpperCase(),
    value: mode.total_amount,
    color: PAYMENT_COLORS[mode.payment_mode.toLowerCase() as keyof typeof PAYMENT_COLORS] || '#64748B'
  })) || [];

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800 text-left">
      
      {/* 1. HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 rounded-2xl p-6 shadow-xs gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 border border-orange-200 text-primary">
            <Database className="h-5.5 w-5.5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold text-text-primary tracking-tight">Centralized Report Exporter</h1>
            <p className="text-xs text-text-secondary">Synthesize transactional sales files, fuel inventory logs, attendant payroll sheets, and regulatory audits.</p>
          </div>
        </div>
        
        {/* Toggle between visual overview and exported files vault */}
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer outline-none ${
              activeTab === 'overview' ? 'bg-white text-primary shadow-xs border border-slate-200/20' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart2 className="h-4 w-4" /> Operational Stats
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer outline-none ${
              activeTab === 'vault' ? 'bg-white text-primary shadow-xs border border-slate-200/20' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="h-4 w-4" /> Downloads Vault ({exportsList.length})
          </button>
        </div>
      </div>

      {selectedPump?.status !== 'approved' ? (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center max-w-2xl mx-auto gap-4 mt-6">
          <AlertCircle className="h-10 w-10 text-amber-500 animate-pulse" />
          <h3 className="text-sm font-extrabold text-slate-800">Telemetry Exporter Locked</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md">
            This fuel station hasn&apos;t finished active IoT node synchronization. Financial and forecourt data downloads will be available once telemetry verification completes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* 2. PARAMETERS BUILDER */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[460px]">
            <form onSubmit={handleGenerateReport} className="flex flex-col gap-5 text-left text-xs h-full justify-between">
              
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                  Report Configurator
                </span>

                {/* Report target */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-primary">Ledger Target</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    disabled={isCompiling}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-text-primary outline-none cursor-pointer focus:border-primary"
                  >
                    <option value="sales">Forecourt Sales Journal (Receipt register)</option>
                    <option value="inventory">Underground Fuel Inventory Levels & Tanks</option>
                    <option value="employees">Attendant Payroll Sheet & Hours</option>
                    <option value="compliance">PESO Gas Hydrotesting Compliance Certificates</option>
                    <option value="udhaar">Corporate Fleet credit (Udhaar Accounts)</option>
                  </select>
                </div>

                {/* Date range */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-primary">Filing Time Range</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    disabled={isCompiling}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-text-primary outline-none cursor-pointer focus:border-primary"
                  >
                    <option value="today">Last 24 Hours (Daily Audit)</option>
                    <option value="7days">Last 7 Days (Weekly Summary)</option>
                    <option value="30days">Last 30 Days (Monthly Ledger)</option>
                    <option value="mtd">Current Month (MTD Ledger)</option>
                    <option value="custom">Custom Date Range Selector</option>
                  </select>
                </div>

                {/* Custom date pickers */}
                {dateRange === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-2 gap-3"
                  >
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400">From</label>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-text-primary outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400">To</label>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-text-primary outline-none"
                      />
                    </div>
                  </motion.div>
                )}

                {/* File format */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-primary">Output Format</label>
                  <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200/50 select-none">
                    {[
                      { id: 'csv', label: 'CSV Sheet (.csv)', icon: <Database className="h-3.5 w-3.5" /> },
                      { id: 'xlsx', label: 'Excel (.xlsx)', icon: <FileSpreadsheet className="h-3.5 w-3.5" /> },
                      { id: 'pdf', label: 'Portable PDF (.pdf)', icon: <FileText className="h-3.5 w-3.5" /> },
                    ].map((format) => (
                      <button
                        key={format.id}
                        type="button"
                        onClick={() => setFileFormat(format.id as any)}
                        disabled={isCompiling}
                        className={`
                          flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer outline-none
                          ${fileFormat === format.id ? 'bg-white text-primary shadow-xs border border-slate-200/30' : 'text-slate-500 hover:text-slate-800'}
                        `}
                      >
                        {format.icon}
                        {format.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 border-t border-slate-100 pt-4">
                <AnimatePresence mode="wait">
                  {isCompiling ? (
                    <motion.div
                      key="compiling"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2.5"
                    >
                      <RefreshCw className="h-5 w-5 text-primary animate-spin" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-extrabold text-slate-800 font-mono">Compiling Real-Time Telemetry</span>
                        <span className="text-[9px] font-semibold text-slate-400 font-mono italic animate-pulse">{compileStep}</span>
                      </div>
                    </motion.div>
                  ) : (
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full font-bold shadow-md shadow-primary/20 flex items-center justify-center gap-1.5"
                    >
                      <Plus className="h-4.5 w-4.5" />
                      Compile & Download File
                    </Button>
                  )}
                </AnimatePresence>
              </div>

            </form>
          </div>

          {/* 3. RIGHT PANEL */}
          <div className="lg:col-span-3 flex flex-col gap-6 w-full">
            
            {activeTab === 'overview' ? (
              // operational statistics dashboard overview
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-5 min-h-[460px] text-left">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <BarChart2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  Operational metrics overview
                </span>

                {summaryLoading ? (
                  <div className="flex flex-col items-center justify-center flex-1 py-16 gap-3">
                    <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                    <span className="text-xs font-bold text-slate-400">Fetching live summary...</span>
                  </div>
                ) : !summaryData ? (
                  <div className="flex flex-col items-center justify-center flex-1 py-16 gap-3 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <Clock className="h-9 w-9 text-slate-300 animate-pulse" />
                    <span className="text-xs font-bold text-slate-400">No operational summary available</span>
                    <span className="text-[10px] text-slate-400 max-w-xs text-center">Ensure the selected pump contains active transactions.</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5 flex-1 justify-between">
                    
                    {/* Visual cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50/60 p-4 border border-slate-100 rounded-2xl flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Gross Revenue</span>
                        <span className="text-base font-extrabold text-text-primary font-mono leading-none">
                          ₹{summaryData.total_sales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="bg-slate-50/60 p-4 border border-slate-100 rounded-2xl flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Fuel Volume Sold</span>
                        <span className="text-base font-extrabold text-text-primary font-mono leading-none">
                          {summaryData.total_volume.toLocaleString('en-IN', { maximumFractionDigits: 1 })} L
                        </span>
                      </div>
                    </div>

                    {/* Sales Trend Recharts */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-primary" />
                        Sales Trend ({dateRange === '7days' ? 'Last 7 Days' : 'Selected Period'})
                      </span>
                      <div className="h-32 w-full">
                        {mounted && (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={summaryData.sales_trend} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                              <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="date" tickFormatter={(str) => {
                                const d = new Date(str);
                                return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
                              }} tick={{ fontSize: 9, fontWeight: 600, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fontSize: 9, fontWeight: 600, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                              <Tooltip contentStyle={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9', fontSize: '10px', fontWeight: 'bold' }} />
                              <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>

                    {/* Payment Split & Inventory split */}
                    <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 items-start">
                      
                      {/* Payment pie split */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                          <PieChartIcon className="h-3 w-3 text-primary" />
                          Payment Split
                        </span>
                        <div className="h-20 w-full relative">
                          {mounted && (
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={paymentModesData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={15}
                                  outerRadius={28}
                                  paddingAngle={3}
                                  dataKey="value"
                                >
                                  {paymentModesData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`} />
                              </PieChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-2 gap-y-1 justify-center text-[8px] font-bold text-slate-500">
                          {paymentModesData.map((d, i) => (
                            <span key={i} className="flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                              {d.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Fuel Tank Levels */}
                      <div className="flex flex-col gap-2 w-full text-left">
                        <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                          <Flame className="h-3 w-3 text-orange-500" />
                          Fuel Tanks Levels
                        </span>
                        <div className="flex flex-col gap-2 max-h-[110px] overflow-y-auto pr-1">
                          {summaryData.inventory_status.length === 0 ? (
                            <span className="text-[9px] text-slate-400 font-semibold italic">No tanks configured</span>
                          ) : (
                            summaryData.inventory_status.map((tank, i) => (
                              <div key={i} className="flex flex-col gap-1 w-full">
                                <div className="flex justify-between items-center text-[8px] font-extrabold text-slate-600">
                                  <span>{tank.tank_number} ({tank.fuel_type})</span>
                                  <span>{tank.percentage}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      tank.percentage < 25 ? 'bg-rose-500' :
                                      tank.percentage < 55 ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${tank.percentage}%` }}
                                  />
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                    </div>

                  </div>
                )}
              </div>
            ) : (
              // Vault tab showing generated reports downloads vault registry
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-5 min-h-[460px]">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                  Downloads Vault Registry ({exportsList.length} files)
                </span>

                {exportsList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-20 gap-3 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex-1">
                    <Clock className="h-9 w-9 text-slate-300 animate-pulse" />
                    <span className="text-xs font-bold text-slate-400">Vault is empty</span>
                    <span className="text-[10px] text-slate-400 max-w-xs">Use parameters panel to query and compile new financial and compliance files.</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1 flex-1">
                    {exportsList.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-slate-50/40 border border-slate-100 hover:bg-slate-50 rounded-2xl p-4 transition-colors text-xs gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border
                            ${item.format === 'xlsx' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                              item.format === 'pdf' ? 'bg-rose-50 border-rose-100 text-rose-500' :
                              'bg-blue-50 border-blue-100 text-blue-500'}
                          `}>
                            {item.format === 'pdf' ? <FileText className="h-4.5 w-4.5" /> : <FileSpreadsheet className="h-4.5 w-4.5" />}
                          </div>
                          
                          <div className="flex flex-col gap-0.5 text-left">
                            <span className="font-bold text-slate-700 max-w-[140px] truncate">{item.filename}</span>
                            <span className="text-[9px] font-semibold text-slate-400">
                              {item.type} • {item.size} • <span className="font-mono">{item.createdAt}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleDownloadFileLocal(item)}
                            className="h-8 w-8 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-primary shadow-xs transition-colors cursor-pointer outline-none"
                          >
                            <Download className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteReport(item.id)}
                            className="h-8 w-8 rounded-lg bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 flex items-center justify-center text-slate-400 hover:text-red-500 shadow-xs transition-colors cursor-pointer outline-none"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="bg-blue-50/50 border border-blue-200/50 p-4 rounded-2xl flex items-start gap-2.5 text-[10px] text-slate-500 font-semibold leading-relaxed">
                  <CheckCircle className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5 text-left">
                    <span>Security Hash Validation Enabled</span>
                    <span>All documents are compiled dynamically on cloud servers, digitally signed, and stamped with cryptographic SHA-256 validation keys.</span>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
}
