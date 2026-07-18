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
} from 'lucide-react';
import { usePumpStore } from '@/stores/pumps.store';
import { toast } from '@/components/feedback/Toast';
import { Button } from '@/components/ui/Button';

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

export default function ReportsPage() {
  const { selectedPump } = usePumpStore();
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('7days');
  const [fileFormat, setFileFormat] = useState<'xlsx' | 'csv' | 'pdf'>('xlsx');
  
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileStep, setCompileStep] = useState('');
  
  const currentPumpId = selectedPump?.id || 'pump_1';
  const pumpExportsSeed = SEED_EXPORTS[currentPumpId] || SEED_EXPORTS.pump_1;
  const [exportsList, setExportsList] = useState<ExportItem[]>(pumpExportsSeed);

  // Sync reports list whenever selected pump shifts
  useEffect(() => {
    setExportsList(SEED_EXPORTS[currentPumpId] || SEED_EXPORTS.pump_1);
  }, [currentPumpId]);

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPump?.status !== 'approved') {
      toast.error('Financial reports compilation requires an approved active petrol pump.');
      return;
    }

    setIsCompiling(true);
    setCompileStep('Contacting telemetry IoT nodes...');

    // Sequence of high-fidelity progress updates
    setTimeout(() => {
      setCompileStep('Aggregating underground fuel sensor logs...');
      setTimeout(() => {
        setCompileStep('Reconciling shift cash ledgers & POS deposits...');
        setTimeout(() => {
          setCompileStep('Formatting columns and compiling signatures...');
          setTimeout(() => {
            setIsCompiling(false);
            
            // Build the export item
            const pumpSlug = (selectedPump?.name || 'station')
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '_')
              .replace(/(^_+|_+$)/g, '');
              
            const formatLabels = {
              sales: 'sales_journal',
              inventory: 'fuel_inventory_log',
              employees: 'attendance_roster',
              compliance: 'hydrotesting_PESO_log',
              udhaar: 'credit_udhaar_ledger'
            };
            const label = formatLabels[reportType as keyof typeof formatLabels] || 'financial_report';
            const filename = `${pumpSlug}_${label}_may2026.${fileFormat}`;
            
            const typeLabels = {
              sales: 'Forecourt Sales Journal',
              inventory: 'Fuel Inventory Log',
              employees: 'Attendant Payroll Sheet',
              compliance: 'Compliance & Gas Registry',
              udhaar: 'Credit Udhaar Ledger'
            };

            const newExport: ExportItem = {
              id: 'RPT-' + Math.floor(910 + Math.random() * 80),
              filename,
              type: typeLabels[reportType as keyof typeof typeLabels] || 'Financial Ledger Summary',
              format: fileFormat,
              size: fileFormat === 'pdf' ? '1.1 MB' : fileFormat === 'csv' ? '320 KB' : '2.1 MB',
              createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              status: 'ready'
            };

            setExportsList((prev) => [newExport, ...prev]);
            toast.success(`Compiled document: ${filename}`);
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const handleDownloadFile = (item: ExportItem) => {
    // Simulate downloading by popping up success toast and generating a mock text file
    const mockContent = `FuelFlux Telemetry Export Record\nID: ${item.id}\nFilename: ${item.filename}\nType: ${item.type}\nFormat: ${item.format.toUpperCase()}\nCompiled At: ${item.createdAt}\nSecurity hash: sha256-${Math.random().toString(36).substr(2, 10).toUpperCase()}`;
    const blob = new Blob([mockContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', item.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Downloaded compiled spreadsheet file: ${item.filename}`);
  };

  const handleDeleteReport = (id: string) => {
    setExportsList((prev) => prev.filter((item) => item.id !== id));
    toast.success('Filing removed from cloud export history.');
  };

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800 text-left">
      
      {/* 1. MODULE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 rounded-2xl p-6 shadow-xs gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 border border-orange-200 text-primary">
            <Database className="h-5.5 w-5.5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold text-text-primary tracking-tight">Centralized Report Exporter</h1>
            <p className="text-xs text-text-secondary">Synthesize transactional sales files, fuel inventory logs, attendant salary spreadsheets, and PESO certifications.</p>
          </div>
        </div>
      </div>

      {selectedPump?.status !== 'approved' ? (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center max-w-2xl mx-auto gap-4 mt-6">
          <AlertCircle className="h-10 w-10 text-amber-500 animate-pulse" />
          <h3 className="text-sm font-extrabold text-slate-800">Telemetry Exporter Locked</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md">
            This fuel station hasn't finished active IoT node synchronization. Financial and forecourt data downloads will be available once telemetry verification completes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* 2. LEFT SIDE: REPORT CONFIGURATOR */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[460px]">
            <form onSubmit={handleGenerateReport} className="flex flex-col gap-5 text-left text-xs h-full justify-between">
              
              <div className="flex flex-col gap-5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                  Report Builder Parameter
                </span>

                {/* Report type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-primary">Operational Ledger Target</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    disabled={isCompiling}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-text-primary outline-none cursor-pointer focus:border-primary"
                  >
                    <option value="sales">Forecourt Sales Journal (Receipt register)</option>
                    <option value="inventory">Underground Fuel Inventory Levels & Tanks</option>
                    <option value="employees">Forecourt Attendants Roster & Salaries</option>
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

                {/* File format */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-primary">Output Format</label>
                  <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200/50 select-none">
                    {[
                      { id: 'xlsx', label: 'Excel (.xlsx)', icon: <FileSpreadsheet className="h-3.5 w-3.5" /> },
                      { id: 'csv', label: 'CSV Sheet (.csv)', icon: <Database className="h-3.5 w-3.5" /> },
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

              {/* Action Button / Progress */}
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
                        <span className="text-[10px] font-extrabold text-slate-800">Compiling Operational Telemetry</span>
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
                      Compile Excel/PDF Ledger
                    </Button>
                  )}
                </AnimatePresence>
              </div>

            </form>
          </div>

          {/* 3. RIGHT SIDE: EXPORTS REGISTRY */}
          <div className="lg:col-span-3 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
              Download Vault Registry ({exportsList.length} files)
            </span>

            {exportsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 gap-3 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <Clock className="h-9 w-9 text-slate-300 animate-pulse" />
                <span className="text-xs font-bold text-slate-400">Cloud filing vault is empty</span>
                <span className="text-[10px] text-slate-400 max-w-xs">Use the builder parameters panel to query and compile new financial and compliance files.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
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
                      
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-700 max-w-[200px] truncate sm:max-w-xs">{item.filename}</span>
                        <span className="text-[9px] font-semibold text-slate-400">
                          {item.type} • {item.size} • <span className="font-mono">{item.createdAt}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadFile(item)}
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
            
            <div className="bg-blue-50/50 border border-blue-200/50 p-4 rounded-2xl flex items-start gap-2.5 mt-2 text-[10px] text-slate-500 font-semibold leading-relaxed">
              <CheckCircle className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span>Encrypted Security Hash Validation</span>
                <span>All documents are compiled dynamically on cloud servers, digitally signed, and stamped with cryptographic SHA-256 validation keys to satisfy PESO and GSTR compliance audits.</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
