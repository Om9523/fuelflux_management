'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Receipt,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Layers,
  Calendar,
  RefreshCw,
  IndianRupee,
  Droplets,
  ShoppingCart,
  ChevronRight,
  Loader2,
  AlertCircle,
  Plus,
  Upload,
  Trash2,
  X,
  FileSpreadsheet,
  Check,
} from 'lucide-react';
import { toast } from '@/components/feedback/Toast';
import {
  fetchSalesRegister,
  recordSale,
  recordSalesBulk,
  SalesRegisterData,
  ShiftSale,
  NozzleSale,
  RecentTransaction,
  SalePayload,
} from '@/services/sales.service';
import { reconcileManual } from '@/services/reconciliation.service';
import { usePumpStore } from '@/stores/pumps.store';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatLiters(n: number): string {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' L';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'reconciled':
      return (
        <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-[10px] rounded-lg flex items-center gap-1 w-fit">
          <CheckCircle className="h-3 w-3" /> RECONCILED
        </span>
      );
    case 'under_audit':
      return (
        <span className="px-2.5 py-1 bg-amber-50 border border-amber-100 text-amber-600 font-bold text-[10px] rounded-lg flex items-center gap-1 w-fit">
          <AlertTriangle className="h-3 w-3" /> UNDER AUDIT
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-400 font-bold text-[10px] rounded-lg flex items-center gap-1 w-fit">
          <Clock className="h-3 w-3" /> PENDING
        </span>
      );
  }
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex items-start gap-4 text-left">
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-extrabold text-slate-900 mt-0.5">{value}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Fuel Prices for Helper Auto-Calculation ───────────────────────────────
const FUEL_PRICES = {
  Petrol: 101.20,
  Diesel: 89.50,
};

export default function SalesRegisterPage() {
  const { selectedPump } = usePumpStore();
  const [activeTab, setActiveTab] = useState<'shift' | 'nozzle' | 'recent'>('shift');
  const [days, setDays] = useState(30);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SalesRegisterData | null>(null);

  // Modals state
  const [isSingleOpen, setIsSingleOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isReconcileOpen, setIsReconcileOpen] = useState(false);

  // Single Sale Form State
  const [singleNozzle, setSingleNozzle] = useState<string>('1');
  const [singleAttendant, setSingleAttendant] = useState<string>('');
  const [singleVehicle, setSingleVehicle] = useState<string>('');
  const [singleFuelType, setSingleFuelType] = useState<'Petrol' | 'Diesel'>('Petrol');
  const [singleVolume, setSingleVolume] = useState<string>('');
  const [singleAmount, setSingleAmount] = useState<string>('');
  const [submittingSingle, setSubmittingSingle] = useState(false);

  // Bulk Sales State (Spreadsheet Rows)
  const [bulkRows, setBulkRows] = useState<any[]>([
    { nozzle_id: '1', fuel_type: 'Petrol', volume: '', amount: '', vehicle_plate: '', attendant_id: '' }
  ]);
  const [submittingBulk, setSubmittingBulk] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Shift Reconciliation Form State
  const [selectedReconcileShift, setSelectedReconcileShift] = useState<ShiftSale | null>(null);
  const [actualCollectedAmount, setActualCollectedAmount] = useState<string>('');
  const [reconcileRemarks, setReconcileRemarks] = useState<string>('');
  const [submittingReconcile, setSubmittingReconcile] = useState(false);

  const loadData = useCallback(async () => {
    if (!selectedPump?.id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSalesRegister(selectedPump.id, days);
      setData(result);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to load sales data';
      setError(msg);
      toast.error('Sales Register Error', msg);
    } finally {
      setLoading(false);
    }
  }, [selectedPump?.id, days]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Auto Calculate Single Sale Volume / Amount ──
  const handleSingleVolumeChange = (val: string) => {
    setSingleVolume(val);
    if (!val || isNaN(Number(val))) {
      setSingleAmount('');
      return;
    }
    const calculated = Number(val) * FUEL_PRICES[singleFuelType];
    setSingleAmount(calculated.toFixed(2));
  };

  const handleSingleAmountChange = (val: string) => {
    setSingleAmount(val);
    if (!val || isNaN(Number(val))) {
      setSingleVolume('');
      return;
    }
    const calculated = Number(val) / FUEL_PRICES[singleFuelType];
    setSingleVolume(calculated.toFixed(2));
  };

  const handleSingleFuelChange = (type: 'Petrol' | 'Diesel') => {
    setSingleFuelType(type);
    if (singleVolume && !isNaN(Number(singleVolume))) {
      const calculated = Number(singleVolume) * FUEL_PRICES[type];
      setSingleAmount(calculated.toFixed(2));
    }
  };

  const handleAddSingleSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPump?.id) return;
    if (!singleVolume || !singleAmount) {
      toast.error('Validation Error', 'Volume and Amount are required.');
      return;
    }

    setSubmittingSingle(true);
    try {
      await recordSale({
        pump_id: Number(selectedPump.id),
        nozzle_id: singleNozzle ? Number(singleNozzle) : null,
        attendant_id: singleAttendant ? Number(singleAttendant) : null,
        vehicle_plate: singleVehicle.trim() || null,
        volume: Number(singleVolume),
        amount: Number(singleAmount),
      });

      toast.success('Sale Recorded', 'Transaction has been successfully created.');
      setIsSingleOpen(false);
      // Reset form
      setSingleVolume('');
      setSingleAmount('');
      setSingleVehicle('');
      setSingleAttendant('');
      loadData();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to record transaction';
      toast.error('Submission Failed', msg);
    } finally {
      setSubmittingSingle(false);
    }
  };

  // ── Bulk Spreadsheet Grid Handlers ──
  const addBulkRow = () => {
    setBulkRows([
      ...bulkRows,
      { nozzle_id: '1', fuel_type: 'Petrol', volume: '', amount: '', vehicle_plate: '', attendant_id: '' }
    ]);
  };

  const removeBulkRow = (index: number) => {
    if (bulkRows.length === 1) return;
    setBulkRows(bulkRows.filter((_, i) => i !== index));
  };

  const updateBulkRow = (index: number, field: string, val: string) => {
    const updated = [...bulkRows];
    updated[index][field] = val;

    // Auto calculate if volume or amount changes
    if (field === 'volume') {
      const fuelType = updated[index].fuel_type as 'Petrol' | 'Diesel';
      if (val && !isNaN(Number(val))) {
        updated[index].amount = (Number(val) * FUEL_PRICES[fuelType]).toFixed(2);
      } else {
        updated[index].amount = '';
      }
    } else if (field === 'amount') {
      const fuelType = updated[index].fuel_type as 'Petrol' | 'Diesel';
      if (val && !isNaN(Number(val))) {
        updated[index].volume = (Number(val) / FUEL_PRICES[fuelType]).toFixed(2);
      } else {
        updated[index].volume = '';
      }
    } else if (field === 'fuel_type') {
      const fuelType = val as 'Petrol' | 'Diesel';
      const vol = updated[index].volume;
      if (vol && !isNaN(Number(vol))) {
        updated[index].amount = (Number(vol) * FUEL_PRICES[fuelType]).toFixed(2);
      }
    }

    setBulkRows(updated);
  };

  // ── CSV Import Handler ──
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        toast.error('Invalid CSV', 'CSV must contain headers and at least one data row.');
        return;
      }

      // Parse headers
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      const newRows: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: any = {
          nozzle_id: '1',
          fuel_type: 'Petrol',
          volume: '',
          amount: '',
          vehicle_plate: '',
          attendant_id: ''
        };

        headers.forEach((hdr, idx) => {
          const val = values[idx] || '';
          if (hdr === 'nozzle_id') row.nozzle_id = val;
          else if (hdr === 'fuel_type') row.fuel_type = val;
          else if (hdr === 'volume') row.volume = val;
          else if (hdr === 'amount') row.amount = val;
          else if (hdr === 'vehicle_plate') row.vehicle_plate = val;
          else if (hdr === 'attendant_id') row.attendant_id = val;
        });

        // Trigger auto-calculation if volume is set but not amount, or vice versa
        const price = FUEL_PRICES[row.fuel_type as 'Petrol' | 'Diesel'] || FUEL_PRICES.Petrol;
        if (row.volume && !row.amount) {
          row.amount = (Number(row.volume) * price).toFixed(2);
        } else if (row.amount && !row.volume) {
          row.volume = (Number(row.amount) / price).toFixed(2);
        }

        newRows.push(row);
      }

      setBulkRows(newRows);
      toast.success('CSV Imported', `Loaded ${newRows.length} rows into the edit grid.`);
    };

    reader.readAsText(file);
    // Reset file input value to allow uploading same file again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddBulkSales = async () => {
    if (!selectedPump?.id) return;
    
    // Validate rows
    const validPayloads: SalePayload[] = [];
    for (let i = 0; i < bulkRows.length; i++) {
      const r = bulkRows[i];
      if (!r.volume || !r.amount) {
        toast.error('Validation Error', `Row ${i + 1} is missing Volume or Amount.`);
        return;
      }
      validPayloads.push({
        pump_id: Number(selectedPump.id),
        nozzle_id: r.nozzle_id ? Number(r.nozzle_id) : null,
        attendant_id: r.attendant_id ? Number(r.attendant_id) : null,
        vehicle_plate: r.vehicle_plate.trim() || null,
        volume: Number(r.volume),
        amount: Number(r.amount),
      });
    }

    setSubmittingBulk(true);
    try {
      await recordSalesBulk(validPayloads);
      toast.success('Bulk Sales Recorded', `Successfully recorded ${validPayloads.length} transactions.`);
      setIsBulkOpen(false);
      // Reset bulk editor
      setBulkRows([{ nozzle_id: '1', fuel_type: 'Petrol', volume: '', amount: '', vehicle_plate: '', attendant_id: '' }]);
      loadData();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to record bulk sales';
      toast.error('Bulk Submission Failed', msg);
    } finally {
      setSubmittingBulk(false);
    }
  };

  // ── Shift Reconciliation Handlers ──
  const handleOpenReconcile = (shift: ShiftSale) => {
    setSelectedReconcileShift(shift);
    setActualCollectedAmount(shift.total_amount.toString());
    setReconcileRemarks('');
    setIsReconcileOpen(true);
  };

  const handleCompleteReconciliation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPump?.id || !selectedReconcileShift) return;

    setSubmittingReconcile(true);
    try {
      const res = await reconcileManual({
        pump_id: Number(selectedPump.id),
        expected_amount: selectedReconcileShift.total_amount,
        actual_amount: Number(actualCollectedAmount),
        remarks: reconcileRemarks,
      });

      toast.success('Shift Reconciled', `Reconciliation status: ${res.status.toUpperCase()}. ${res.message}`);
      setIsReconcileOpen(false);
      loadData();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to complete reconciliation';
      toast.error('Reconciliation Error', msg);
    } finally {
      setSubmittingReconcile(false);
    }
  };

  // ── Filtered data ──
  const filteredShifts: ShiftSale[] = (data?.shifts ?? []).filter(
    (s) =>
      s.shift_label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.date.includes(searchQuery)
  );

  const filteredNozzles: NozzleSale[] = (data?.nozzles ?? []).filter(
    (n) =>
      n.nozzle_label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.fuel_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRecent: RecentTransaction[] = (data?.recent_transactions ?? []).filter(
    (t) =>
      (t.vehicle_plate ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.timestamp.includes(searchQuery)
  );

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800 relative">

      {/* 1. MODULE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 rounded-2xl p-6 shadow-xs gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 border border-orange-200 text-primary">
            <Receipt className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold text-text-primary tracking-tight">Sales Register</h1>
            <p className="text-xs text-text-secondary">
              {data ? `${data.pump_name} — Last ${days} days` : 'Live nozzle & shift-wise sales data'}
            </p>
          </div>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          {/* Action buttons */}
          <button
            onClick={() => setIsSingleOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl shadow-sm hover:bg-slate-800 transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Sale
          </button>
          <button
            onClick={() => setIsBulkOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-500 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Bulk Import
          </button>

          {/* Period Selector */}
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 outline-none cursor-pointer hover:border-primary/40 transition-colors"
          >
            <option value={7}>Last 7 days</option>
            <option value={15}>Last 15 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-primary text-white rounded-xl shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* 2. STATS ROW */}
      {loading && !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Revenue"
            value={formatCurrency(data.total_sales)}
            sub={`Last ${data.period_days} days`}
            icon={<IndianRupee className="h-5 w-5 text-emerald-600" />}
            color="bg-emerald-50 border border-emerald-100"
          />
          <StatCard
            label="Total Volume Sold"
            value={formatLiters(data.total_volume)}
            sub={`Across ${data.nozzles.length} nozzle(s)`}
            icon={<Droplets className="h-5 w-5 text-blue-600" />}
            color="bg-blue-50 border border-blue-100"
          />
          <StatCard
            label="Total Transactions"
            value={data.recent_transactions.length.toString()}
            sub={`${data.shifts.length} shift record(s)`}
            icon={<ShoppingCart className="h-5 w-5 text-violet-600" />}
            color="bg-violet-50 border border-violet-100"
          />
        </div>
      ) : null}

      {/* 3. TABBED CONTROLS */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200/60 shadow-xs max-w-lg select-none">
        {[
          { id: 'shift', label: 'Shift Wise', icon: <Clock className="h-3.5 w-3.5" /> },
          { id: 'nozzle', label: 'Nozzle Wise', icon: <Layers className="h-3.5 w-3.5" /> },
          { id: 'recent', label: 'Transactions', icon: <ChevronRight className="h-3.5 w-3.5" /> },
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

      {/* 4. SEARCH BAR */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-xs font-medium bg-white border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {/* 5. ERROR STATE */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">Failed to load sales data</p>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* 6. TABS DATA VIEWS */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

        {/* LOADING OVERLAY */}
        {loading && data && (
          <div className="flex items-center justify-center gap-2 p-6 text-slate-400 text-sm border-b border-slate-100">
            <Loader2 className="h-4 w-4 animate-spin" />
            Refreshing...
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && data && data.shifts.length === 0 && data.nozzles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Receipt className="h-10 w-10 mb-3 opacity-30" />
            <p className="font-bold text-sm">No sales recorded yet</p>
            <p className="text-xs mt-1">Transactions will appear here once sales are recorded for this pump.</p>
          </div>
        )}

        {/* NO PUMP SELECTED */}
        {!selectedPump && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <AlertCircle className="h-10 w-10 mb-3 opacity-30" />
            <p className="font-bold text-sm">No pump selected</p>
            <p className="text-xs mt-1">Please select a pump to view its sales register.</p>
          </div>
        )}

        {/* ─── SHIFT TAB ─────────────────────────────────────── */}
        {activeTab === 'shift' && data && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 font-extrabold text-text-secondary">
                  <th className="p-4 uppercase tracking-wider">Shift</th>
                  <th className="p-4 uppercase tracking-wider">Date</th>
                  <th className="p-4 uppercase tracking-wider">Transactions</th>
                  <th className="p-4 uppercase tracking-wider">Liters Sold</th>
                  <th className="p-4 uppercase tracking-wider">Gross Collection</th>
                  <th className="p-4 uppercase tracking-wider">Status & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-text-primary">
                {filteredShifts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No shift records match your search.
                    </td>
                  </tr>
                ) : (
                  filteredShifts.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-primary">{s.shift_label}</td>
                      <td className="p-4 flex items-center gap-1.5 py-4">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {formatDate(s.date)}
                      </td>
                      <td className="p-4 font-mono text-slate-500">{s.transaction_count}</td>
                      <td className="p-4 font-bold">{formatLiters(s.total_liters)}</td>
                      <td className="p-4 font-extrabold text-slate-900 font-mono">
                        {formatCurrency(s.total_amount)}
                      </td>
                      <td className="p-4 flex items-center gap-3">
                        <StatusBadge status={s.status} />
                        {s.status === 'under_audit' && (
                          <button
                            onClick={() => handleOpenReconcile(s)}
                            className="px-2.5 py-1 text-[10px] font-extrabold bg-orange-500 hover:bg-orange-600 text-white rounded-lg cursor-pointer transition-all shadow-xs"
                          >
                            Reconcile Shift
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── NOZZLE TAB ────────────────────────────────────── */}
        {activeTab === 'nozzle' && data && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 font-extrabold text-text-secondary">
                  <th className="p-4 uppercase tracking-wider">Nozzle</th>
                  <th className="p-4 uppercase tracking-wider">Fuel Type</th>
                  <th className="p-4 uppercase tracking-wider">Transactions</th>
                  <th className="p-4 uppercase tracking-wider">Volume Sold</th>
                  <th className="p-4 uppercase tracking-wider">Total Revenue</th>
                  <th className="p-4 uppercase tracking-wider">Last Sale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-text-primary">
                {filteredNozzles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No nozzle records match your search.
                    </td>
                  </tr>
                ) : (
                  filteredNozzles.map((n) => (
                    <tr key={n.nozzle_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-primary">{n.nozzle_label}</td>
                      <td className="p-4 font-bold">{n.fuel_type}</td>
                      <td className="p-4 font-mono text-slate-500">{n.transaction_count}</td>
                      <td className="p-4 font-bold">{formatLiters(n.total_liters)}</td>
                      <td className="p-4 font-extrabold text-slate-900 font-mono">
                        {formatCurrency(n.total_amount)}
                      </td>
                      <td className="p-4 text-slate-400">
                        {n.last_sale ? formatDateTime(n.last_sale) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── RECENT TRANSACTIONS TAB ───────────────────────── */}
        {activeTab === 'recent' && data && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 font-extrabold text-text-secondary">
                  <th className="p-4 uppercase tracking-wider">TXN ID</th>
                  <th className="p-4 uppercase tracking-wider">Nozzle</th>
                  <th className="p-4 uppercase tracking-wider">Vehicle</th>
                  <th className="p-4 uppercase tracking-wider">Volume</th>
                  <th className="p-4 uppercase tracking-wider">Amount</th>
                  <th className="p-4 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-text-primary">
                {filteredRecent.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredRecent.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-primary">#{t.id}</td>
                      <td className="p-4 text-slate-500">
                        {t.nozzle_id ? `N-${t.nozzle_id}` : '—'}
                      </td>
                      <td className="p-4 font-bold">
                        {t.vehicle_plate ?? <span className="text-slate-300">—</span>}
                      </td>
                      <td className="p-4 font-bold">{formatLiters(t.volume)}</td>
                      <td className="p-4 font-extrabold text-slate-900 font-mono">
                        {formatCurrency(t.amount)}
                      </td>
                      <td className="p-4 text-slate-400">{formatDateTime(t.timestamp)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ───────────────── 7. SINGLE SALE MODAL ───────────────── */}
      {isSingleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200">
          <div className="relative w-full max-w-md bg-white border border-slate-150 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left">
            <button
              onClick={() => setIsSingleOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-slate-400 hover:text-slate-600"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 border border-orange-200 text-primary">
                <Receipt className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900">Record Single Sale</h2>
            </div>

            <form onSubmit={handleAddSingleSale} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Fuel Type</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200/50">
                  {['Petrol', 'Diesel'].map((fuel) => (
                    <button
                      key={fuel}
                      type="button"
                      onClick={() => handleSingleFuelChange(fuel as any)}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        singleFuelType === fuel
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {fuel}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Nozzle ID</label>
                  <input
                    type="number"
                    value={singleNozzle}
                    onChange={(e) => setSingleNozzle(e.target.value)}
                    required
                    placeholder="1"
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Attendant ID (Opt)</label>
                  <input
                    type="number"
                    value={singleAttendant}
                    onChange={(e) => setSingleAttendant(e.target.value)}
                    placeholder="e.g. 3"
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Vehicle Number (Opt)</label>
                <input
                  type="text"
                  value={singleVehicle}
                  onChange={(e) => setSingleVehicle(e.target.value)}
                  placeholder="e.g. DL 3C AY 4567"
                  className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Volume (Liters)</label>
                  <input
                    type="number"
                    step="any"
                    value={singleVolume}
                    onChange={(e) => handleSingleVolumeChange(e.target.value)}
                    required
                    placeholder="0.0"
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Amount (₹)</label>
                  <input
                    type="number"
                    step="any"
                    value={singleAmount}
                    onChange={(e) => handleSingleAmountChange(e.target.value)}
                    required
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsSingleOpen(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSingle}
                  className="flex-1 py-2.5 text-xs font-bold bg-primary text-white rounded-xl shadow-md hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {submittingSingle ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : 'Record Sale'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────── 8. BULK SALES IMPORT MODAL ───────────────── */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200">
          <div className="relative w-full max-w-4xl bg-white border border-slate-150 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left flex flex-col max-h-[85vh]">
            <button
              onClick={() => setIsBulkOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-slate-400 hover:text-slate-600"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
                  <FileSpreadsheet className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Bulk Sales Ledger</h2>
                  <p className="text-[10px] text-slate-400">Import CSV or add transactions dynamically inside the spreadsheet-grid below.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleCSVUpload}
                  accept=".csv"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100/50 transition-all cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Load CSV File
                </button>
                <a
                  href="data:text/csv;charset=utf-8,nozzle_id,fuel_type,volume,amount,vehicle_plate,attendant_id%0A1,Petrol,15,1518.00,DL3C4567,2%0A2,Diesel,50,4475.00,UP16T1234,3"
                  download="fuelflux_sales_template.csv"
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-600 underline"
                >
                  Download Template
                </a>
              </div>
            </div>

            {/* Editable Spreadsheet Table */}
            <div className="flex-1 overflow-auto border border-slate-100 rounded-2xl mb-4 bg-slate-50/50 p-2 min-h-[300px]">
              <table className="w-full text-left border-collapse text-xs bg-white rounded-xl shadow-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 font-extrabold text-text-secondary select-none">
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3 w-32">Fuel Type</th>
                    <th className="p-3 w-28">Nozzle ID</th>
                    <th className="p-3 w-28">Attendant ID</th>
                    <th className="p-3 w-36">Vehicle Number</th>
                    <th className="p-3 w-28">Volume (L)</th>
                    <th className="p-3 w-32">Amount (₹)</th>
                    <th className="p-3 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {bulkRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/20">
                      <td className="p-3 text-center font-bold text-slate-400 font-mono">{idx + 1}</td>
                      <td className="p-3">
                        <select
                          value={row.fuel_type}
                          onChange={(e) => updateBulkRow(idx, 'fuel_type', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none font-bold"
                        >
                          <option value="Petrol">Petrol</option>
                          <option value="Diesel">Diesel</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={row.nozzle_id}
                          onChange={(e) => updateBulkRow(idx, 'nozzle_id', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-2 py-1 outline-none font-mono"
                          placeholder="e.g. 1"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={row.attendant_id}
                          onChange={(e) => updateBulkRow(idx, 'attendant_id', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-2 py-1 outline-none font-mono"
                          placeholder="e.g. 3"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={row.vehicle_plate}
                          onChange={(e) => updateBulkRow(idx, 'vehicle_plate', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-2 py-1 outline-none uppercase font-bold"
                          placeholder="e.g. DL 3C 1234"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          step="any"
                          value={row.volume}
                          onChange={(e) => updateBulkRow(idx, 'volume', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-2 py-1 outline-none font-mono font-bold"
                          placeholder="0.0"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          step="any"
                          value={row.amount}
                          onChange={(e) => updateBulkRow(idx, 'amount', e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-2 py-1 outline-none font-mono font-extrabold text-slate-800"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeBulkRow(idx)}
                          disabled={bulkRows.length === 1}
                          className="p-1 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer disabled:opacity-30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center gap-3">
              <button
                type="button"
                onClick={addBulkRow}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add New Row
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsBulkOpen(false)}
                  className="px-5 py-2 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddBulkSales}
                  disabled={submittingBulk}
                  className="px-6 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-500 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {submittingBulk ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : 'Commit All Sales'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────── 9. SHIFT RECONCILIATION MODAL ───────────────── */}
      {isReconcileOpen && selectedReconcileShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200">
          <div className="relative w-full max-w-md bg-white border border-slate-150 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left">
            <button
              onClick={() => setIsReconcileOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-slate-400 hover:text-slate-600"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 border border-orange-200 text-primary">
                <CheckCircle className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Shift Reconciliation Audit</h2>
                <p className="text-[10px] text-slate-400">Verify total revenue and close out shift ledger.</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-4 flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-semibold">Shift:</span>
                <span className="font-extrabold text-slate-700">{selectedReconcileShift.shift_label}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-semibold">Date:</span>
                <span className="font-extrabold text-slate-700">{formatDate(selectedReconcileShift.date)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-semibold">Expected Volume:</span>
                <span className="font-extrabold text-slate-700">{formatLiters(selectedReconcileShift.total_liters)}</span>
              </div>
              <div className="flex justify-between text-xs border-t border-slate-200/60 pt-2">
                <span className="text-slate-400 font-semibold">Expected Revenue:</span>
                <span className="font-black text-slate-800 font-mono text-sm">{formatCurrency(selectedReconcileShift.total_amount)}</span>
              </div>
            </div>

            <form onSubmit={handleCompleteReconciliation} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                  Actual Revenue Collected (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  value={actualCollectedAmount}
                  onChange={(e) => setActualCollectedAmount(e.target.value)}
                  required
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors font-mono"
                />
              </div>

              {/* Dynamic Mismatch Feedback */}
              {actualCollectedAmount && !isNaN(Number(actualCollectedAmount)) && (
                <div className="text-xs font-bold">
                  {Number(actualCollectedAmount) === selectedReconcileShift.total_amount ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
                      <Check className="h-4 w-4" /> Perfect Match! (No discrepancies)
                    </div>
                  ) : (
                    <div className={`flex items-center gap-1.5 p-2.5 rounded-xl border ${
                      Math.abs(Number(actualCollectedAmount) - selectedReconcileShift.total_amount) <= 50
                        ? 'text-amber-600 bg-amber-50 border-amber-100'
                        : 'text-rose-600 bg-rose-50 border-rose-100'
                    }`}>
                      <AlertTriangle className="h-4 w-4" /> 
                      Mismatch: {formatCurrency(Number(actualCollectedAmount) - selectedReconcileShift.total_amount)}
                      {Number(actualCollectedAmount) < selectedReconcileShift.total_amount ? ' (Shortage)' : ' (Excess)'}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Remarks / Audit Notes</label>
                <textarea
                  value={reconcileRemarks}
                  onChange={(e) => setReconcileRemarks(e.target.value)}
                  placeholder="e.g. Minor cash change discrepancy or card payout lag"
                  rows={2}
                  className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors resize-none"
                />
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsReconcileOpen(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReconcile}
                  className="flex-1 py-2.5 text-xs font-bold bg-primary text-white rounded-xl shadow-md hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {submittingReconcile ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : 'Complete Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}