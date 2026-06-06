'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  Sparkles,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useInvestorStore, ExecutiveReport } from '@/stores/investor.store';
import { toast } from '@/components/feedback/Toast';

export default function ReportsPage() {
  const { reports, triggerGenerateReport, isLoading } = useInvestorStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportName, setReportName] = useState('');
  const [category, setCategory] = useState<ExecutiveReport['category']>('financial');
  const [compilingMsg, setCompilingMsg] = useState('');

  const filteredReports = reports.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || r.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleGenerateReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportName) {
      toast.error('Please enter a valid report name.');
      return;
    }

    setCompilingMsg('Connecting to central station nodes...');
    try {
      // Trigger Zustand async generation
      const resultPromise = triggerGenerateReport(category, reportName);

      // Cycle compile message for high-fidelity feel
      setTimeout(() => setCompilingMsg('Reconciling SGST/CGST tax registers...'), 800);
      setTimeout(() => setCompilingMsg('Compiling fleet voucher logs...'), 1600);

      await resultPromise;

      toast.success(`Report "${reportName}" compiled successfully.`);
      setIsModalOpen(false);
      
      // Reset
      setReportName('');
      setCategory('financial');
    } catch (err) {
      toast.error('Failed to compile report.');
    }
  };

  const handleDownload = (report: ExecutiveReport, format: 'PDF' | 'CSV' | 'Excel') => {
    toast.success(`Download started: ${report.name}.${format.toLowerCase()}`);
  };

  const categoryLabels: Record<ExecutiveReport['category'], string> = {
    financial: 'Financial Audit',
    portfolio: 'Portfolio Summary',
    revenue: 'Revenue Report',
    growth: 'Growth Analysis',
    fleet: 'Fleet Analytics',
    risk: 'Risk Analysis'
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Reports Center
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Download financial audits, B2B credit ratings, and custom portfolio yield spreadsheets
          </p>
        </div>

        <button
          onClick={() => {
            setIsModalOpen(true);
            setCompilingMsg('');
          }}
          className="flex items-center justify-center gap-1.5 px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-orange-500/25 transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          Compile Report
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search report archive by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-1.5 w-full md:w-auto">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-600 focus:outline-none cursor-pointer w-full text-slate-800 font-sans"
          >
            <option value="all" className="bg-white text-slate-850">All Categories</option>
            <option value="financial" className="bg-white text-slate-850">Financial Reports</option>
            <option value="portfolio" className="bg-white text-slate-850">Portfolio Reports</option>
            <option value="risk" className="bg-white text-slate-850">Risk Reports</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/60 bg-slate-50 text-[9px] font-black text-slate-450 uppercase tracking-wider">
                <th className="p-4 pl-6">Report ID</th>
                <th className="p-4">Report Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Date Generated</th>
                <th className="p-4 text-center">File Size</th>
                <th className="p-4 text-right pr-6">Export Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 pl-6 font-bold text-slate-400">{report.id}</td>
                  <td className="p-4 font-black text-slate-800 flex items-center gap-2">
                    <FileText className="h-4.5 w-4.5 text-orange-500" />
                    {report.name}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-slate-50 border border-slate-200/60 rounded text-[9px] font-black uppercase text-slate-600">
                      {categoryLabels[report.category]}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{report.createdDate}</td>
                  <td className="p-4 text-center text-slate-500">{report.fileSize}</td>
                  <td className="p-4 text-right pr-6">
                    <div className="flex justify-end gap-1.5 font-bold">
                      <button
                        onClick={() => handleDownload(report, 'PDF')}
                        className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-650 hover:text-slate-850 rounded text-[10px] transition-all cursor-pointer border border-slate-200"
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => handleDownload(report, 'CSV')}
                        className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-650 hover:text-slate-850 rounded text-[10px] transition-all cursor-pointer border border-slate-200"
                      >
                        CSV
                      </button>
                      <button
                        onClick={() => handleDownload(report, 'Excel')}
                        className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-650 hover:text-slate-850 rounded text-[10px] transition-all cursor-pointer border border-slate-200"
                      >
                        XLS
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-bold">
                    <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-xs">No reports found matching filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compile Report Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isLoading) setIsModalOpen(false); }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-200/60 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden z-10 p-6 text-left"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">Compile Portfolio Audit</h3>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Collects sales ledgers and fuel reserves directly from station terminals</p>
                </div>
                {!isLoading && (
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {!isLoading ? (
                <form onSubmit={handleGenerateReportSubmit} className="space-y-4 text-xs font-semibold text-slate-650">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Report Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Q2 Gross Margins Reconciliations"
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-orange-500/50"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Report Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ExecutiveReport['category'])}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold text-slate-850 focus:outline-none focus:bg-white focus:border-orange-500/50 cursor-pointer"
                    >
                      <option value="financial">Financial Report</option>
                      <option value="portfolio">Portfolio Report</option>
                      <option value="revenue">Revenue Report</option>
                      <option value="growth">Growth Report</option>
                      <option value="fleet">Fleet Report</option>
                      <option value="risk">Risk Analysis</option>
                    </select>
                  </div>

                  <div className="flex gap-3 justify-end border-t border-slate-100 pt-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-orange-500/20 transition-all cursor-pointer"
                    >
                      Compile Report
                    </button>
                  </div>
                </form>
              ) : (
                <div className="py-8 text-center flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
                  <div className="space-y-1">
                    <p className="text-xs font-black text-slate-800 uppercase tracking-wider">Generating Audit Journal...</p>
                    <p className="text-[10px] text-slate-500 font-semibold">{compilingMsg}</p>
                  </div>
                  {/* Progress bar simulation */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden max-w-[200px] border border-slate-200/60">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2.3 }}
                      className="bg-orange-500 h-full rounded-full"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
