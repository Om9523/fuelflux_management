'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Receipt,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Calendar,
  RefreshCw,
  IndianRupee,
  Droplets,
  ShoppingCart,
  Loader2,
  AlertCircle,
  Plus,
  X,
  Fuel,
  CreditCard,
  Wallet,
  Smartphone,
  ChevronRight,
  ChevronLeft,
  PlayCircle,
  StopCircle,
  Eye,
  Filter,
  Settings2,
  History,
  Layers,
  Save,
  Camera,
  ScanLine,
  Sparkles,
  QrCode,
  Copy,
  CheckCheck,
} from 'lucide-react';
import { toast } from '@/components/feedback/Toast';
import { usePumpStore } from '@/stores/pumps.store';
import {
  startShift,
  endShift,
  getActiveShift,
  getLastShift,
  getShiftSummary,
  addSaleLog,
  addSaleLogsBulk,
  getSaleLogs,
  getSalesOverview,
  getPumpAttendants,
  scanReceipt,
  checkVehiclePaymentInfo,
  VehiclePaymentCheckResult,
  ShiftSummary,
  SaleLog,
  SaleLogPayload,
  OcrScanResult,
  OverviewData,
  Attendant,
  ShiftPointIn,
  ShiftType,
  PaymentMode,
  SaleType,
} from '@/services/salesShift.service';
import {
  fetchStockItems,
  setItemRates,
  StockItem,
} from '@/services/inventory.service';
import { fetchCustomers } from '@/services/udhaar.service';
import { ownerWalletService, UpiId } from '@/services/ownerWallet.service';

// ─── Constants ──────────────────────────────────────────────────

// Maps physical dispensing nozzles -> item name (matched against StockItem.name)
// TODO: replace with real nozzle config from pump settings if available
const NOZZLES = [
  { nozzle_id: '1', item_name: 'Petrol' },
  { nozzle_id: '2', item_name: 'Petrol' },
  { nozzle_id: '3', item_name: 'Diesel' },
  { nozzle_id: '4', item_name: 'Diesel' },
];

const SHIFT_PRESETS: { label: string; value: ShiftType; getStart: () => Date }[] = [
  { label: 'Morning', value: 'morning', getStart: () => { const d = new Date(); d.setHours(6, 0, 0, 0); return d; } },
  { label: 'Evening', value: 'evening', getStart: () => { const d = new Date(); d.setHours(14, 0, 0, 0); return d; } },
  { label: 'Night', value: 'night', getStart: () => { const d = new Date(); d.setHours(22, 0, 0, 0); return d; } },
  { label: 'Custom', value: 'custom', getStart: () => new Date() },
];

const PAYMENT_MODES: { label: string; value: PaymentMode; icon: React.ReactNode }[] = [
  { label: 'Cash', value: 'cash', icon: <Wallet className="h-3.5 w-3.5" /> },
  { label: 'Credit', value: 'credit', icon: <CreditCard className="h-3.5 w-3.5" /> },
  { label: 'POS', value: 'pos', icon: <Smartphone className="h-3.5 w-3.5" /> },
  { label: 'UPI', value: 'upi', icon: <IndianRupee className="h-3.5 w-3.5" /> },
];

// ─── Helpers ────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return '₹' + (n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatLiters(n: number): string {
  return (n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' L';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
}

function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInputValue(s: string): string {
  return new Date(s).toISOString();
}

/** Safely extract a human-readable error message from an Axios error.
 *  FastAPI can return `detail` as a string, an array of validation
 *  objects, or a plain object — all of which would render as
 *  "[object Object]" if interpolated directly. */
function extractApiError(err: any, fallback: string): string {
  const detail = err?.response?.data?.detail;
  if (!detail) return err?.message || fallback;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    // FastAPI 422 validation array: [{ loc, msg, type }]
    return detail.map((d: any) => d?.msg || JSON.stringify(d)).join('; ');
  }
  return JSON.stringify(detail);
}

// ─── Small UI Pieces ────────────────────────────────────────────

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

function PaymentBadge({ mode }: { mode: string }) {
  const map: Record<string, string> = {
    cash: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    credit: 'bg-amber-50 border-amber-100 text-amber-600',
    pos: 'bg-indigo-50 border-indigo-100 text-indigo-600',
    upi: 'bg-violet-50 border-violet-100 text-violet-600',
  };
  const cls = map[mode] || 'bg-slate-50 border-slate-200 text-slate-400';
  return (
    <span className={`px-2.5 py-1 border font-bold text-[10px] rounded-lg uppercase ${cls}`}>
      {mode}
    </span>
  );
}
// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function SalesSectionPage() {
  const { selectedPump } = usePumpStore();
  const pumpId = selectedPump?.id || null;

  // ── Top-level tabs: Overview / Entries ──
  const [mainTab, setMainTab] = useState<'overview' | 'entries'>('overview');

  // ── Inventory (live items + rates) ──
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // ── Overview state ──
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [overviewDays, setOverviewDays] = useState(30);
  const [loadingOverview, setLoadingOverview] = useState(false);

  // ── Entries / logs state ──
  const [logs, setLogs] = useState<SaleLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);

  // Filters
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterVehicleType, setFilterVehicleType] = useState('');
  const [filterVehicleNumber, setFilterVehicleNumber] = useState('');
  const [filterItem, setFilterItem] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // ── Active shift state ──
  const [activeShift, setActiveShift] = useState<ShiftSummary | null>(null);
  const [checkingShift, setCheckingShift] = useState(false);

  // ── Modal visibility ──
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [isShiftSetupOpen, setIsShiftSetupOpen] = useState(false);
  const [isSaleEditorOpen, setIsSaleEditorOpen] = useState(false);
  const [isEndShiftOpen, setIsEndShiftOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isRatesOpen, setIsRatesOpen] = useState(false);

  // ── Attendants ──
  const [attendants, setAttendants] = useState<Attendant[]>([]);

  // ════════════════════════════════════════════════════════════
  // HELPERS — rate lookup by item name
  // ════════════════════════════════════════════════════════════

  const getRate = useCallback((itemName: string): number => {
    const item = stockItems.find(
      (s) => s.name.toLowerCase() === itemName.toLowerCase() && s.is_dispensed_item
    );
    return item?.selling_rate ?? 0;
  }, [stockItems]);

  const dispensedItems = stockItems.filter((s) => s.is_dispensed_item && s.is_active);

  // ════════════════════════════════════════════════════════════
  // DATA LOADERS
  // ════════════════════════════════════════════════════════════

  const loadStockItems = useCallback(async () => {
    if (!pumpId) return;
    setLoadingItems(true);
    try {
      const data = await fetchStockItems(pumpId);
      setStockItems(data);
    } catch (err: any) {
      const msg = extractApiError(err, 'Failed to load inventory items');
      toast.error('Inventory Error', msg);
    } finally {
      setLoadingItems(false);
    }
  }, [pumpId]);

  const loadOverview = useCallback(async () => {
    if (!pumpId) return;
    setLoadingOverview(true);
    try {
      const data = await getSalesOverview(pumpId, overviewDays);
      setOverview(data);
    } catch (err: any) {
      const msg = extractApiError(err, 'Failed to load overview');
      toast.error('Overview Error', msg);
    } finally {
      setLoadingOverview(false);
    }
  }, [pumpId, overviewDays]);

  const loadLogs = useCallback(async () => {
    if (!pumpId) return;
    setLoadingLogs(true);
    setLogsError(null);
    try {
      const data = await getSaleLogs({
        pump_id: pumpId,
        customer_name: filterCustomer || undefined,
        vehicle_type: filterVehicleType || undefined,
        vehicle_number: filterVehicleNumber || undefined,
        item_name: filterItem || undefined,
        payment_mode: (filterPayment as PaymentMode) || undefined,
        page: 1,
        page_size: 100,
      });
      setLogs(data);
    } catch (err: any) {
      const msg = extractApiError(err, 'Failed to load entries');
      setLogsError(msg);
      toast.error('Entries Error', msg);
    } finally {
      setLoadingLogs(false);
    }
  }, [pumpId, filterCustomer, filterVehicleType, filterVehicleNumber, filterItem, filterPayment]);

  const checkActiveShift = useCallback(async () => {
    if (!pumpId) return;
    setCheckingShift(true);
    try {
      const res = await getActiveShift(pumpId);
      setActiveShift(res.active ? res.shift : null);
    } catch (err: any) {
      setActiveShift(null);
    } finally {
      setCheckingShift(false);
    }
  }, [pumpId]);

  const loadAttendants = useCallback(async () => {
    if (!pumpId) return;
    try {
      const data = await getPumpAttendants(pumpId);
      setAttendants(data);
    } catch (err) {
      // non-critical
    }
  }, [pumpId]);

  const refreshActiveShiftSummary = useCallback(async () => {
    if (!activeShift) return;
    try {
      const summary = await getShiftSummary(activeShift.shift_id);
      setActiveShift(summary);
    } catch (err) {
      // ignore
    }
  }, [activeShift]);

  // ── Initial loads ──
  useEffect(() => {
    if (mainTab === 'overview') loadOverview();
  }, [mainTab, loadOverview]);

  useEffect(() => {
    if (mainTab === 'entries') loadLogs();
  }, [mainTab, loadLogs]);

  useEffect(() => {
    checkActiveShift();
    loadAttendants();
    loadStockItems();
  }, [checkActiveShift, loadAttendants, loadStockItems]);
  // ════════════════════════════════════════════════════════════
  // NEW SALE (Single, standalone or in active shift) — Form State
  // ════════════════════════════════════════════════════════════

  const [nsTimestamp, setNsTimestamp] = useState(toLocalInputValue(new Date()));
  const [nsPaymentMode, setNsPaymentMode] = useState<PaymentMode>('cash');
  const [nsItemName, setNsItemName] = useState('');
  const [nsNozzleId, setNsNozzleId] = useState<string>('');
  const [nsQuantity, setNsQuantity] = useState('');
  const [nsCustomerName, setNsCustomerName] = useState('');
  const [nsCustomerId, setNsCustomerId] = useState(''); // linked UdhaarCustomer ID
  const [nsVehicleNumber, setNsVehicleNumber] = useState('');
  const [nsVehicleType, setNsVehicleType] = useState('');
  const [nsRegistrationType, setNsRegistrationType] = useState('');
  const [nsCreditSlipRef, setNsCreditSlipRef] = useState('');
  const [nsPosMachine, setNsPosMachine] = useState('');
  const [nsBillingRef, setNsBillingRef] = useState('');
  const [nsRemarks, setNsRemarks] = useState('');
  const [nsReceiptUrl, setNsReceiptUrl] = useState('');
  const [nsAttendantId, setNsAttendantId] = useState('');
  const [nsStep, setNsStep] = useState(1); // 1: basic, 2: customer, 3: attachments
  const [submittingNewSale, setSubmittingNewSale] = useState(false);

  // ── Udhaar customers list for credit mode ──
  const [udhaarCustomers, setUdhaarCustomers] = useState<{ id: string; name: string; contact_phone: string | null }[]>([]);
  const [loadingUdhaarCustomers, setLoadingUdhaarCustomers] = useState(false);

  const nsRate = nsItemName ? getRate(nsItemName) : 0;
  const nsAmount = nsQuantity && !isNaN(Number(nsQuantity)) ? Number(nsQuantity) * nsRate : 0;

  // ── OCR Scan state ──
  const [nsScanLoading, setNsScanLoading] = useState(false);
  const [nsScanResult, setNsScanResult] = useState<OcrScanResult | null>(null);

  // ── Vehicle payment check state ──
  const [vehicleCheckResult, setVehicleCheckResult] = useState<VehiclePaymentCheckResult | null>(null);
  const [checkingVehicle, setCheckingVehicle] = useState(false);

  // ── Pump UPI IDs (for QR code display on UPI payment mode) ──
  const [pumpUpiIds, setPumpUpiIds] = useState<UpiId[]>([]);
  const [selectedUpiVpa, setSelectedUpiVpa] = useState<string>('');
  const [copiedUpiVpa, setCopiedUpiVpa] = useState(false);

  // Load Udhaar customers when credit mode is selected and modal is open
  useEffect(() => {
    if (!pumpId || !isNewSaleOpen || nsPaymentMode !== 'credit') return;
    if (udhaarCustomers.length > 0) return; // already loaded
    setLoadingUdhaarCustomers(true);
    fetchCustomers(pumpId)
      .then((list) => setUdhaarCustomers(list.map((c) => ({ id: c.id, name: c.name, contact_phone: c.contact_phone }))))
      .catch(() => {/* non-critical */})
      .finally(() => setLoadingUdhaarCustomers(false));
  }, [pumpId, isNewSaleOpen, nsPaymentMode, udhaarCustomers.length]);

  // Load pump UPI IDs for QR code whenever pump changes
  useEffect(() => {
    if (!pumpId) { setPumpUpiIds([]); setSelectedUpiVpa(''); return; }
    ownerWalletService.getWalletSummary(pumpId)
      .then((s) => {
        const ids = s.upi_ids || [];
        setPumpUpiIds(ids);
        const primary = ids.find(u => u.is_primary) || ids[0];
        if (primary) setSelectedUpiVpa(primary.upi_vpa);
      })
      .catch(() => { setPumpUpiIds([]); setSelectedUpiVpa(''); });
  }, [pumpId]);

  // Trigger check when vehicle number changes or new sale modal is opened
  useEffect(() => {
    if (!pumpId || !nsVehicleNumber.trim()) {
      setVehicleCheckResult(null);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setCheckingVehicle(true);
      try {
        const res = await checkVehiclePaymentInfo(nsVehicleNumber.trim(), pumpId);
        setVehicleCheckResult(res);
        if (res.status === 'credit') {
          // Logistic partner credit
          setNsPaymentMode('credit');
          setNsCustomerName(res.partner_name || '');
        } else if (res.status === 'voucher') {
          // Logistic fuel voucher
          setNsPaymentMode('credit');
          setNsCustomerName(res.partner_name || '');
          setNsBillingRef(res.voucher_id || '');
          if (res.amount && nsRate > 0) {
            setNsQuantity((res.amount / nsRate).toFixed(2));
          }
        } else if (res.status === 'udhaar_credit') {
          // Direct Udhaar customer (pump owner's registered credit customer)
          setNsPaymentMode('credit');
          setNsCustomerName(res.customer_name || '');
          setNsCustomerId(res.customer_id || '');
        } else if (res.status === 'udhaar_no_contract') {
          // Vehicle matched but no active contract
          setNsCustomerName(res.customer_name || '');
          setNsCustomerId(res.customer_id || '');
        }
      } catch (err) {
        console.warn('Vehicle check failed:', err);
      } finally {
        setCheckingVehicle(false);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(delayDebounce);
  }, [nsVehicleNumber, pumpId, nsRate]);

  // Backend base URL for building full receipt image links
  const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '')
    : 'http://127.0.0.1:8000';

  const resetNewSaleForm = () => {
    setNsTimestamp(toLocalInputValue(new Date()));
    setNsPaymentMode('cash');
    setNsItemName('');
    setNsNozzleId('');
    setNsQuantity('');
    setNsCustomerName('');
    setNsCustomerId('');
    setNsVehicleNumber('');
    setNsVehicleType('');
    setNsRegistrationType('');
    setNsCreditSlipRef('');
    setNsPosMachine('');
    setNsBillingRef('');
    setNsRemarks('');
    setNsReceiptUrl('');
    setNsAttendantId('');
    setNsStep(1);
    setNsScanLoading(false);
    setNsScanResult(null);
    setVehicleCheckResult(null);
    setCheckingVehicle(false);
  };

  /**
   * Handle camera/file input → send to backend OCR → auto-fill form fields.
   * All auto-fills are best-effort; user can always override manually.
   */
  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset the input so the same file can be re-selected if needed
    e.target.value = '';

    setNsScanLoading(true);
    setNsScanResult(null);
    try {
      const result = await scanReceipt(file);
      setNsScanResult(result);

      // ── Auto-fill: Vehicle Number ──────────────────────────
      if (result.vehicle_no) {
        setNsVehicleNumber(result.vehicle_no.toUpperCase());
      }

      // ── Auto-fill: Customer Name ───────────────────────────
      if (result.customer_name_suggested) {
        setNsCustomerName(result.customer_name_suggested);
      }

      // ── Auto-fill: Quantity from Amount / Rate ─────────────
      if (result.total_amount && nsRate > 0) {
        const computedQty = (result.total_amount / nsRate).toFixed(2);
        setNsQuantity(computedQty);
      }

      // ── Auto-fill: Receipt URL ─────────────────────────────
      if (result.receipt_url) {
        setNsReceiptUrl(`${BACKEND_BASE}${result.receipt_url}`);
      }

      if (result.error && result.error !== 'no_text_detected') {
        toast.error('OCR Warning', 'Could not fully read the slip. Please verify and fill fields manually.');
      } else if (!result.total_amount && !result.vehicle_no && !result.customer_name_suggested) {
        toast.error('No Data Extracted', 'OCR found no recognizable text. Try a clearer photo in good lighting.');
      } else {
        toast.success('Slip Scanned!', 'Fields auto-filled from credit slip. Please review and correct if needed.');
      }
    } catch (err: any) {
      const msg = extractApiError(err, 'OCR scan failed. Please try again or fill manually.');
      toast.error('Scan Failed', msg);
      setNsScanResult(null);
    } finally {
      setNsScanLoading(false);
    }
  };

  const openNewSale = () => {
    resetNewSaleForm();
    if (dispensedItems.length > 0) setNsItemName(dispensedItems[0].name);
    setIsNewSaleOpen(true);
  };

  const handleNsItemChange = (itemName: string) => {
    setNsItemName(itemName);
    // auto-pick first matching nozzle
    const match = NOZZLES.find((n) => n.item_name.toLowerCase() === itemName.toLowerCase());
    if (match) setNsNozzleId(String(match.nozzle_id));
  };

  const validateNewSaleStep1 = (): boolean => {
    if (!nsItemName) {
      toast.error('Validation Error', 'Please select an item.');
      return false;
    }
    if (!nsQuantity || isNaN(Number(nsQuantity)) || Number(nsQuantity) <= 0) {
      toast.error('Validation Error', 'Please enter a valid quantity.');
      return false;
    }
    if (nsRate <= 0) {
      toast.error('Rate Missing', `No rate found for "${nsItemName}" in Inventory. Please set a selling rate first.`);
      return false;
    }
    return true;
  };

  const validateNewSaleStep2 = (): boolean => {
    if (nsPaymentMode === 'credit' && !nsCustomerName.trim()) {
      toast.error('Validation Error', 'Credit sales require a customer name.');
      return false;
    }
    if (nsPaymentMode === 'pos' && !nsBillingRef.trim()) {
      toast.error('Validation Error', 'POS sales require a billing reference number.');
      return false;
    }
    return true;
  };

  const handleNsNext = () => {
    if (nsStep === 1 && !validateNewSaleStep1()) return;
    if (nsStep === 2 && !validateNewSaleStep2()) return;
    setNsStep((s) => Math.min(3, s + 1));
  };

  const handleNsBack = () => setNsStep((s) => Math.max(1, s - 1));

  const handleSubmitNewSale = async () => {
    if (!pumpId) return;
    if (!validateNewSaleStep1() || !validateNewSaleStep2()) return;

    setSubmittingNewSale(true);
    try {
      const payload: SaleLogPayload = {
        pump_id: pumpId,
        shift_id: activeShift ? activeShift.shift_id : null,
        sale_type: 'single',
        timestamp: fromLocalInputValue(nsTimestamp),
        nozzle_id: nsNozzleId || null,
        item_name: nsItemName,
        rate: nsRate,
        quantity: Number(nsQuantity),
        payment_mode: nsPaymentMode,
        pos_machine: nsPosMachine || null,
        billing_ref: nsBillingRef || null,
        customer_name: nsCustomerName || null,
        customer_id: nsCustomerId || null,
        credit_slip_ref: nsCreditSlipRef || null,
        vehicle_number: nsVehicleNumber || null,
        vehicle_type: nsVehicleType || null,
        attendant_id: nsAttendantId || null,
        remarks: nsRemarks || null,
        receipt_url: nsReceiptUrl || null,
      };

      await addSaleLog(payload);
      toast.success('Sale Recorded', `${nsItemName} sale of ${nsQuantity} L recorded successfully.`);
      setIsNewSaleOpen(false);
      resetNewSaleForm();

      if (mainTab === 'entries') loadLogs();
      if (activeShift) refreshActiveShiftSummary();
      loadOverview();
    } catch (err: any) {
      const msg = extractApiError(err, 'Failed to record sale');
      toast.error('Submission Failed', msg);
    } finally {
      setSubmittingNewSale(false);
    }
  };
  // ════════════════════════════════════════════════════════════
  // SHIFT SETUP (Bulk Add/Edit -> New Shift)
  // ════════════════════════════════════════════════════════════

  const [shiftSetupStep, setShiftSetupStep] = useState(1); // 1: type/time, 2: points, 3: personnel
  const [shiftType, setShiftType] = useState<ShiftType>('morning');
  const [shiftStartTime, setShiftStartTime] = useState(toLocalInputValue(SHIFT_PRESETS[0].getStart()));
  const [shiftPoints, setShiftPoints] = useState<(ShiftPointIn & { auto?: boolean })[]>([]);
  const [shiftPersonnelIds, setShiftPersonnelIds] = useState<string[]>([]);
  const [startingShift, setStartingShift] = useState(false);
  const [lastClosedShift, setLastClosedShift] = useState<ShiftSummary | null>(null);
  const [loadingLastShift, setLoadingLastShift] = useState(false);

  const resetShiftSetup = () => {
    setShiftSetupStep(1);
    setShiftType('morning');
    setShiftStartTime(toLocalInputValue(SHIFT_PRESETS[0].getStart()));
    setShiftPersonnelIds([]);
    // Initialize points from NOZZLES — start_reading 0 triggers backend auto-fetch
    setShiftPoints(
      NOZZLES.map((n) => ({
        nozzle_id: n.nozzle_id,
        item_name: n.item_name,
        start_reading: 0, // 0 = auto-fetch from previous shift's end_reading
        testing_value: 0,
        is_active: true,
        auto: true,
      }))
    );
  };

  const openShiftSetup = () => {
    if (activeShift) {
      toast.error('Shift Already Active', `Shift #${activeShift.shift_id} is currently active. Close it before starting a new one.`);
      setIsSaleEditorOpen(true);
      return;
    }
    resetShiftSetup();
    setIsShiftSetupOpen(true);
  };

  const handleShiftPresetChange = (preset: typeof SHIFT_PRESETS[number]) => {
    setShiftType(preset.value);
    setShiftStartTime(toLocalInputValue(preset.getStart()));
  };

  const updateShiftPoint = (idx: number, field: keyof ShiftPointIn, value: any) => {
    setShiftPoints((prev) => {
      const updated = [...prev];
      (updated[idx] as any)[field] = value;
      if (field === 'start_reading') (updated[idx] as any).auto = false;
      return updated;
    });
  };

  const togglePointActive = (idx: number) => {
    setShiftPoints((prev) => {
      const updated = [...prev];
      updated[idx].is_active = !updated[idx].is_active;
      return updated;
    });
  };

  const togglePersonnel = (attendantId: string) => {
    setShiftPersonnelIds((prev) =>
      prev.includes(attendantId) ? prev.filter((id) => id !== attendantId) : [...prev, attendantId]
    );
  };

  const handleShiftSetupNext = () => {
    if (shiftSetupStep === 1 && !shiftStartTime) {
      toast.error('Validation Error', 'Please select a shift start time.');
      return;
    }
    setShiftSetupStep((s) => Math.min(3, s + 1));
  };

  const handleShiftSetupBack = () => setShiftSetupStep((s) => Math.max(1, s - 1));

  const handleStartShift = async () => {
    if (!pumpId) return;
    if (shiftPersonnelIds.length === 0) {
      toast.error('Validation Error', 'Please assign at least one attendant for this shift.');
      return;
    }

    setStartingShift(true);
    try {
      const activePoints = shiftPoints.filter((p) => p.is_active);
      if (activePoints.length === 0) {
        toast.error('Validation Error', 'At least one dispensing point must be active.');
        setStartingShift(false);
        return;
      }

      const shift = await startShift({
        pump_id: pumpId,
        shift_type: shiftType,
        start_time: fromLocalInputValue(shiftStartTime),
        point_readings: shiftPoints.map(({ auto, ...p }) => p),
        personnel_ids: shiftPersonnelIds,
      });

      toast.success('Shift Started', `Shift #${shift.id} (${shiftType}) is now active.`);
      setIsShiftSetupOpen(false);
      await checkActiveShift();
      setIsSaleEditorOpen(true);
    } catch (err: any) {
      const msg = extractApiError(err, 'Failed to start shift');
      toast.error('Shift Start Failed', msg);
    } finally {
      setStartingShift(false);
    }
  };

  // ── Last Shift retrieval (retroactive edit) ──
  const handleViewLastShift = async () => {
    if (!pumpId) return;
    setLoadingLastShift(true);
    try {
      const summary = await getLastShift(pumpId);
      setLastClosedShift(summary);
      setIsSummaryOpen(true);
    } catch (err: any) {
      const msg = extractApiError(err, 'No previous shifts found');
      toast.error('Last Shift', msg);
    } finally {
      setLoadingLastShift(false);
    }
  };
  // ════════════════════════════════════════════════════════════
  // SALE EDITOR — Single / Batch logging within active shift
  // ════════════════════════════════════════════════════════════

  const [editorSaleType, setEditorSaleType] = useState<SaleType>('single');
  const [edTimestamp, setEdTimestamp] = useState(toLocalInputValue(new Date()));
  const [edAttendantId, setEdAttendantId] = useState('');
  const [edItemName, setEdItemName] = useState('');
  const [edNozzleId, setEdNozzleId] = useState('');
  const [edQuantity, setEdQuantity] = useState('');
  const [edPaymentMode, setEdPaymentMode] = useState<PaymentMode>('cash');
  const [edPosMachine, setEdPosMachine] = useState('');
  const [edBillingRef, setEdBillingRef] = useState('');
  const [edCustomerName, setEdCustomerName] = useState('');
  const [edCreditSlipRef, setEdCreditSlipRef] = useState('');
  const [edVehicleNumber, setEdVehicleNumber] = useState('');
  const [edVehicleType, setEdVehicleType] = useState('');
  const [edRemarks, setEdRemarks] = useState('');
  const [edReceiptUrl, setEdReceiptUrl] = useState('');
  const [savingLog, setSavingLog] = useState(false);

  // Pending logs queue — logged but not yet "saved" to backend
  const [pendingLogs, setPendingLogs] = useState<SaleLogPayload[]>([]);

  const edRate = edItemName ? getRate(edItemName) : 0;
  const edAmount = edQuantity && !isNaN(Number(edQuantity)) ? Number(edQuantity) * edRate : 0;

  const resetEditorForm = () => {
    setEdTimestamp(toLocalInputValue(new Date()));
    setEdAttendantId('');
    setEdQuantity('');
    setEdPaymentMode('cash');
    setEdPosMachine('');
    setEdBillingRef('');
    setEdCustomerName('');
    setEdCreditSlipRef('');
    setEdVehicleNumber('');
    setEdVehicleType('');
    setEdRemarks('');
    setEdReceiptUrl('');
  };

  const handleEdItemChange = (itemName: string) => {
    setEdItemName(itemName);
    const match = NOZZLES.find((n) => n.item_name.toLowerCase() === itemName.toLowerCase());
    if (match) setEdNozzleId(String(match.nozzle_id));
  };

  // Open sale editor: default item to first active shift point
  useEffect(() => {
    if (isSaleEditorOpen && activeShift && !edItemName) {
      const firstPoint = activeShift.point_summaries[0];
      if (firstPoint) {
        setEdItemName(firstPoint.item_name);
        setEdNozzleId(String(firstPoint.nozzle_id));
      } else if (dispensedItems.length > 0) {
        setEdItemName(dispensedItems[0].name);
      }
    }
  }, [isSaleEditorOpen, activeShift, edItemName, dispensedItems]);

  const validateLogEntry = (): boolean => {
    if (!edItemName) {
      toast.error('Validation Error', 'Please select an item.');
      return false;
    }
    if (!edQuantity || isNaN(Number(edQuantity)) || Number(edQuantity) <= 0) {
      toast.error('Validation Error', 'Please enter a valid quantity.');
      return false;
    }
    if (edRate <= 0) {
      toast.error('Rate Missing', `No rate set for "${edItemName}". Update rates first.`);
      return false;
    }
    if (edPaymentMode === 'credit' && !edCustomerName.trim()) {
      toast.error('Validation Error', 'Credit sales require a customer name.');
      return false;
    }
    if (edPaymentMode === 'pos' && !edBillingRef.trim()) {
      toast.error('Validation Error', 'POS sales require a billing reference.');
      return false;
    }
    if (editorSaleType === 'single' && !edAttendantId) {
      toast.error('Validation Error', 'Please select the attendant for this sale.');
      return false;
    }
    return true;
  };

  // "Add" — queue a log entry locally (for batch grouping before Save)
  const handleQueueLog = () => {
    if (!pumpId || !activeShift) return;
    if (!validateLogEntry()) return;

    const payload: SaleLogPayload = {
      pump_id: pumpId,
      shift_id: activeShift.shift_id,
      sale_type: editorSaleType,
      timestamp: fromLocalInputValue(edTimestamp),
      nozzle_id: edNozzleId || null,
      item_name: edItemName,
      rate: edRate,
      quantity: Number(edQuantity),
      payment_mode: edPaymentMode,
      pos_machine: edPosMachine || null,
      billing_ref: edBillingRef || null,
      customer_name: edCustomerName || null,
      credit_slip_ref: edCreditSlipRef || null,
      vehicle_number: edVehicleNumber || null,
      vehicle_type: edVehicleType || null,
      attendant_id: edAttendantId || null,
      remarks: edRemarks || null,
      receipt_url: edReceiptUrl || null,
    };

    setPendingLogs((prev) => [...prev, payload]);
    toast.success('Sale Logged', `${edItemName} • ${edQuantity} L • ${formatCurrency(edAmount)} added to queue.`);
    resetEditorForm();
  };

  const removePendingLog = (idx: number) => {
    setPendingLogs((prev) => prev.filter((_, i) => i !== idx));
  };

  // "Save" — commit all pending logs to backend
  const handleSaveLogs = async () => {
    if (pendingLogs.length === 0) {
      toast.error('Nothing to Save', 'Log at least one sale before saving.');
      return;
    }
    setSavingLog(true);
    try {
      await addSaleLogsBulk(pendingLogs);
      toast.success('Sales Saved', `${pendingLogs.length} sale(s) committed successfully.`);
      setPendingLogs([]);
      await refreshActiveShiftSummary();
    } catch (err: any) {
      const msg = extractApiError(err, 'Failed to save sales');
      toast.error('Save Failed', msg);
    } finally {
      setSavingLog(false);
    }
  };

  const pendingTotal = pendingLogs.reduce((sum, l) => sum + l.quantity * l.rate, 0);
  // ════════════════════════════════════════════════════════════
  // END SHIFT — final totallizer verification
  // ════════════════════════════════════════════════════════════

  const [endReadings, setEndReadings] = useState<Record<string, { end_reading: string; testing_value: string }>>({});
  const [endingShift, setEndingShift] = useState(false);

  const openEndShift = () => {
    if (!activeShift) return;
    const initial: Record<string, { end_reading: string; testing_value: string }> = {};
    activeShift.point_summaries.forEach((p) => {
      initial[p.nozzle_id] = {
        end_reading: p.end_reading != null ? String(p.end_reading) : String(p.start_reading),
        testing_value: String(p.testing_value),
      };
    });
    setEndReadings(initial);
    setIsEndShiftOpen(true);
  };

  const updateEndReading = (nozzleId: string, field: 'end_reading' | 'testing_value', value: string) => {
    setEndReadings((prev) => ({
      ...prev,
      [nozzleId]: { ...prev[nozzleId], [field]: value },
    }));
  };

  const handleConfirmEndShift = async () => {
    if (!activeShift) return;

    // Validate end >= start for each point
    for (const p of activeShift.point_summaries) {
      const er = endReadings[p.nozzle_id];
      if (!er || er.end_reading === '' || isNaN(Number(er.end_reading))) {
        toast.error('Validation Error', `Please enter end totallizer for Nozzle #${p.nozzle_id}.`);
        return;
      }
      if (Number(er.end_reading) < p.start_reading) {
        toast.error(
          'Invalid Reading',
          `Nozzle #${p.nozzle_id}: end reading (${er.end_reading}) cannot be less than start reading (${p.start_reading}).`
        );
        return;
      }
    }

    setEndingShift(true);
    try {
      const summary = await endShift({
        shift_id: activeShift.shift_id,
        end_readings: activeShift.point_summaries.map((p) => ({
          nozzle_id: p.nozzle_id,
          end_reading: Number(endReadings[p.nozzle_id].end_reading),
          testing_value: Number(endReadings[p.nozzle_id].testing_value || 0),
        })),
      });

      toast.success('Shift Closed', `Shift #${summary.shift_id} successfully closed. Net amount: ${formatCurrency(summary.net_amount)}`);
      setIsEndShiftOpen(false);
      setIsSaleEditorOpen(false);
      setActiveShift(null);
      setPendingLogs([]);
      loadOverview();
      if (mainTab === 'entries') loadLogs();
    } catch (err: any) {
      const msg = extractApiError(err, 'Failed to close shift');
      toast.error('End Shift Failed', msg);
    } finally {
      setEndingShift(false);
    }
  };

  // ════════════════════════════════════════════════════════════
  // ITEM RATES — mid-shift update
  // ════════════════════════════════════════════════════════════

  const [editableRates, setEditableRates] = useState<Record<string, string>>({});
  const [savingRates, setSavingRates] = useState(false);

  const openRatesEditor = () => {
    const initial: Record<string, string> = {};
    dispensedItems.forEach((item) => {
      initial[item.id] = String(item.selling_rate);
    });
    setEditableRates(initial);
    setIsRatesOpen(true);
  };

  const handleSaveRates = async () => {
    setSavingRates(true);
    try {
      const rates = dispensedItems
        .filter((item) => editableRates[item.id] !== undefined && Number(editableRates[item.id]) !== item.selling_rate)
        .map((item) => ({ item_id: item.id, selling_rate: Number(editableRates[item.id]) }));

      if (rates.length === 0) {
        toast.success('No Changes', 'Rates are already up to date.');
        setIsRatesOpen(false);
        setSavingRates(false);
        return;
      }

      await setItemRates(rates);
      toast.success('Rates Updated', `${rates.length} item rate(s) updated. New sales will use updated rates.`);
      setIsRatesOpen(false);
      await loadStockItems();
    } catch (err: any) {
      const msg = extractApiError(err, 'Failed to update rates');
      toast.error('Rate Update Failed', msg);
    } finally {
      setSavingRates(false);
    }
  };

  // ════════════════════════════════════════════════════════════
  // FILTERED VIEWS
  // ════════════════════════════════════════════════════════════

  const hasActiveFilters = !!(filterCustomer || filterVehicleType || filterVehicleNumber || filterItem || filterPayment);

  const clearFilters = () => {
    setFilterCustomer('');
    setFilterVehicleType('');
    setFilterVehicleNumber('');
    setFilterItem('');
    setFilterPayment('');
  };
  // ════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800 relative">

      {/* 1. MODULE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 rounded-2xl p-6 shadow-xs gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 border border-orange-200 text-primary">
            <Receipt className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold text-text-primary tracking-tight">Sales</h1>
            <p className="text-xs text-text-secondary">
              {selectedPump ? `${selectedPump.name} — Shift & transaction management` : 'Select a pump to manage sales'}
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Active Shift Badge */}
          {activeShift && (
            <button
              onClick={() => setIsSaleEditorOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl shadow-sm hover:bg-emerald-100 transition-all cursor-pointer animate-pulse"
            >
              <PlayCircle className="h-3.5 w-3.5" />
              Shift #{activeShift.shift_id} Active
            </button>
          )}

          <button
            onClick={openNewSale}
            disabled={!selectedPump}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl shadow-sm hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
            New Sale
          </button>

          <button
            onClick={openShiftSetup}
            disabled={!selectedPump}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-500 transition-all cursor-pointer disabled:opacity-40"
          >
            <Layers className="h-3.5 w-3.5" />
            Bulk Add / Shift
          </button>

          <button
            onClick={handleViewLastShift}
            disabled={!selectedPump || loadingLastShift}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-40"
          >
            {loadingLastShift ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <History className="h-3.5 w-3.5" />}
            Last Shift
          </button>
        </div>
      </div>

      {/* NO PUMP SELECTED */}
      {!selectedPump && (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-100 rounded-2xl text-slate-400">
          <AlertCircle className="h-10 w-10 mb-3 opacity-30" />
          <p className="font-bold text-sm">No pump selected</p>
          <p className="text-xs mt-1">Please select a pump to view its sales data.</p>
        </div>
      )}

      {selectedPump && (
        <>
          {/* 2. MAIN TABS: Overview / Entries */}
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200/60 shadow-xs max-w-xs select-none">
            {[
              { id: 'overview', label: 'Overview', icon: <TrendingUp className="h-3.5 w-3.5" /> },
              { id: 'entries', label: 'Entries', icon: <Receipt className="h-3.5 w-3.5" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMainTab(tab.id as any)}
                className={`
                  flex-1 flex justify-center items-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer outline-none
                  ${mainTab === tab.id ? 'bg-primary text-white shadow-md shadow-primary/10' : 'text-slate-500 hover:text-slate-800'}
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
          {mainTab === 'overview' && (
            <div className="flex flex-col gap-6">
              {/* Period selector */}
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-extrabold text-slate-700">Performance Overview</h2>
                <div className="flex items-center gap-2">
                  <select
                    value={overviewDays}
                    onChange={(e) => setOverviewDays(Number(e.target.value))}
                    className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 outline-none cursor-pointer hover:border-primary/40 transition-colors"
                  >
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                  </select>
                  <button
                    onClick={loadOverview}
                    disabled={loadingOverview}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-primary text-white rounded-xl shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${loadingOverview ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>

              {loadingOverview && !overview ? (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 animate-pulse">
                  {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
                </div>
              ) : overview ? (
                <>
                  {/* Stat cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      label="Net Amount"
                      value={formatCurrency(overview.net_amount)}
                      sub={`Last ${overview.period_days} days`}
                      icon={<IndianRupee className="h-5 w-5 text-emerald-600" />}
                      color="bg-emerald-50 border border-emerald-100"
                    />
                    <StatCard
                      label="Credit Ratio"
                      value={`${overview.credit_ratio}%`}
                      sub={`${formatCurrency(overview.credit_amount)} on credit`}
                      icon={<CreditCard className="h-5 w-5 text-amber-600" />}
                      color="bg-amber-50 border border-amber-100"
                    />
                    <StatCard
                      label="Cash Sales"
                      value={formatCurrency(overview.cash_amount)}
                      icon={<Wallet className="h-5 w-5 text-blue-600" />}
                      color="bg-blue-50 border border-blue-100"
                    />
                    <StatCard
                      label="POS Sales"
                      value={formatCurrency(overview.pos_amount)}
                      icon={<Smartphone className="h-5 w-5 text-violet-600" />}
                      color="bg-violet-50 border border-violet-100"
                    />
                  </div>

                  {/* Item-wise monthly sales */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                    <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-primary" /> Item-wise Sales (Monthly)
                    </h3>
                    {Object.keys(overview.monthly_item_sales).length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">No item sales data available yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 font-extrabold text-slate-500">
                              <th className="p-3 uppercase tracking-wider">Item</th>
                              {Array.from(
                                new Set(
                                  Object.values(overview.monthly_item_sales).flatMap((m) => Object.keys(m))
                                )
                              ).sort().map((month) => (
                                <th key={month} className="p-3 uppercase tracking-wider text-right">{month}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {Object.entries(overview.monthly_item_sales).map(([item, months]) => (
                              <tr key={item}>
                                <td className="p-3 font-bold text-primary">{item}</td>
                                {Array.from(
                                  new Set(
                                    Object.values(overview.monthly_item_sales).flatMap((m) => Object.keys(m))
                                  )
                                ).sort().map((month) => (
                                  <td key={month} className="p-3 text-right font-mono">
                                    {months[month] ? formatCurrency(months[month]) : '—'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Payment method breakdown */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                    <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" /> Payment Method Breakdown
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Cash', val: overview.cash_amount, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                        { label: 'Credit', val: overview.credit_amount, color: 'text-amber-600 bg-amber-50 border-amber-100' },
                        { label: 'POS', val: overview.pos_amount, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
                        { label: 'Net Total', val: overview.net_amount, color: 'text-slate-700 bg-slate-50 border-slate-200' },
                      ].map((p) => (
                        <div key={p.label} className={`border rounded-xl p-3 ${p.color}`}>
                          <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{p.label}</p>
                          <p className="text-sm font-extrabold font-mono mt-1">{formatCurrency(p.val)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent closed shifts */}
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100">
                      <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" /> Recent Closed Shifts
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 font-extrabold text-slate-500">
                            <th className="p-4 uppercase tracking-wider">Shift</th>
                            <th className="p-4 uppercase tracking-wider">Start</th>
                            <th className="p-4 uppercase tracking-wider">End</th>
                            <th className="p-4 uppercase tracking-wider">Sales Count</th>
                            <th className="p-4 uppercase tracking-wider">Net Amount</th>
                            <th className="p-4 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {overview.recent_shifts.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-400">No closed shifts yet.</td></tr>
                          ) : (
                            overview.recent_shifts.map((s) => (
                              <tr key={s.shift_id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 font-bold text-primary capitalize">#{s.shift_id} — {s.shift_type}</td>
                                <td className="p-4 text-slate-500">{formatDateTime(s.start_time)}</td>
                                <td className="p-4 text-slate-500">{s.end_time ? formatDateTime(s.end_time) : '—'}</td>
                                <td className="p-4 font-mono text-slate-500">{s.sales_count}</td>
                                <td className="p-4 font-extrabold text-slate-900 font-mono">{formatCurrency(s.net_amount)}</td>
                                <td className="p-4">
                                  <button
                                    onClick={async () => {
                                      try {
                                        const summary = await getShiftSummary(s.shift_id);
                                        setLastClosedShift(summary);
                                        setIsSummaryOpen(true);
                                      } catch (err: any) {
                                        toast.error('Error', 'Failed to load shift summary');
                                      }
                                    }}
                                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer transition-all"
                                  >
                                    <Eye className="h-3 w-3" /> View
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-100 rounded-2xl text-slate-400">
                  <TrendingUp className="h-10 w-10 mb-3 opacity-30" />
                  <p className="font-bold text-sm">No overview data</p>
                </div>
              )}
            </div>
          )}
          {/* ═══════════════ ENTRIES TAB ═══════════════ */}
          {mainTab === 'entries' && (
            <div className="flex flex-col gap-4">
              {/* Filter bar */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setShowFilters((v) => !v)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${showFilters || hasActiveFilters
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                  >
                    <Filter className="h-3.5 w-3.5" />
                    Filters {hasActiveFilters && `(${[filterCustomer, filterVehicleType, filterVehicleNumber, filterItem, filterPayment].filter(Boolean).length})`}
                  </button>

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      <X className="h-3 w-3" /> Clear all
                    </button>
                  )}

                  <button
                    onClick={loadLogs}
                    disabled={loadingLogs}
                    className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-primary text-white rounded-xl shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                {showFilters && (
                  <div className="bg-white border border-slate-100 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Customer</label>
                      <input
                        type="text"
                        value={filterCustomer}
                        onChange={(e) => setFilterCustomer(e.target.value)}
                        placeholder="Customer name"
                        className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Vehicle Type</label>
                      <input
                        type="text"
                        value={filterVehicleType}
                        onChange={(e) => setFilterVehicleType(e.target.value)}
                        placeholder="e.g. Car, Truck"
                        className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Vehicle Number</label>
                      <input
                        type="text"
                        value={filterVehicleNumber}
                        onChange={(e) => setFilterVehicleNumber(e.target.value)}
                        placeholder="DL 3C AY 4567"
                        className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Item</label>
                      <select
                        value={filterItem}
                        onChange={(e) => setFilterItem(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors cursor-pointer"
                      >
                        <option value="">All Items</option>
                        {dispensedItems.map((item) => (
                          <option key={item.id} value={item.name}>{item.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Payment Mode</label>
                      <select
                        value={filterPayment}
                        onChange={(e) => setFilterPayment(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors cursor-pointer"
                      >
                        <option value="">All Modes</option>
                        {PAYMENT_MODES.map((m) => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Error state */}
              {logsError && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-sm">Failed to load entries</p>
                    <p className="text-xs mt-0.5">{logsError}</p>
                  </div>
                </div>
              )}

              {/* Entries table */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {loadingLogs && (
                  <div className="flex items-center justify-center gap-2 p-6 text-slate-400 text-sm border-b border-slate-100">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading entries...
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 font-extrabold text-slate-500">
                        <th className="p-4 uppercase tracking-wider">Time</th>
                        <th className="p-4 uppercase tracking-wider">Item</th>
                        <th className="p-4 uppercase tracking-wider">Nozzle</th>
                        <th className="p-4 uppercase tracking-wider">Qty</th>
                        <th className="p-4 uppercase tracking-wider">Rate</th>
                        <th className="p-4 uppercase tracking-wider">Amount</th>
                        <th className="p-4 uppercase tracking-wider">Payment</th>
                        <th className="p-4 uppercase tracking-wider">Customer / Vehicle</th>
                        <th className="p-4 uppercase tracking-wider">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-text-primary">
                      {!loadingLogs && logs.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-12 text-center text-slate-400">
                            <Receipt className="h-8 w-8 mx-auto mb-2 opacity-30" />
                            <p className="font-bold text-sm">No sale records found</p>
                            <p className="text-xs mt-1">{hasActiveFilters ? 'Try adjusting your filters.' : 'Start a shift or record a single sale to see entries here.'}</p>
                          </td>
                        </tr>
                      ) : (
                        logs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 text-slate-400 whitespace-nowrap">{formatDateTime(log.timestamp)}</td>
                            <td className="p-4 font-bold text-primary">{log.item_name}</td>
                            <td className="p-4 font-mono text-slate-500">{log.nozzle_id ? `N-${log.nozzle_id}` : '—'}</td>
                            <td className="p-4 font-bold">{formatLiters(log.quantity)}</td>
                            <td className="p-4 font-mono text-slate-500">₹{log.rate.toFixed(2)}</td>
                            <td className="p-4 font-extrabold text-slate-900 font-mono">{formatCurrency(log.amount)}</td>
                            <td className="p-4"><PaymentBadge mode={log.payment_mode} /></td>
                            <td className="p-4 text-slate-600">
                              {log.customer_name || log.vehicle_number ? (
                                <div className="flex flex-col">
                                  {log.customer_name && <span className="font-bold">{log.customer_name}</span>}
                                  {log.vehicle_number && <span className="text-[10px] text-slate-400 font-mono">{log.vehicle_number}</span>}
                                </div>
                              ) : <span className="text-slate-300">—</span>}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${log.sale_type === 'batch' ? 'bg-violet-50 text-violet-600' : 'bg-slate-100 text-slate-500'}`}>
                                {log.sale_type}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {/* ═══════════════ NEW SALE MODAL (3-step) ═══════════════ */}
      {isNewSaleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border border-slate-150 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left max-h-[92vh] flex flex-col overflow-hidden">
            <div className="overflow-y-auto flex-1 p-6">
            <button
              onClick={() => setIsNewSaleOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-slate-400 hover:text-slate-600"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 border border-orange-200 text-primary">
                <Receipt className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Record New Sale</h2>
                <p className="text-[10px] text-slate-400">Step {nsStep} of 3 {activeShift ? `• Shift #${activeShift.shift_id}` : '• Standalone'}</p>
              </div>
            </div>

            {/* Step indicator */}
            <div className="flex gap-1.5 mb-5">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= nsStep ? 'bg-primary' : 'bg-slate-100'}`} />
              ))}
            </div>

            {/* ── STEP 1: Item, Quantity, Payment ── */}
            {nsStep === 1 && (
              <div className="flex flex-col gap-4">
                {/* ── Scan Credit Slip ─────────────────────────────────── */}
                <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-3.5">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <ScanLine className="h-3.5 w-3.5 text-orange-500" />
                      <span className="text-[11px] font-extrabold text-orange-700 uppercase tracking-wider">Scan Credit Slip</span>
                    </div>
                    <span className="text-[10px] text-orange-400 font-medium">Auto-fills fields via OCR</span>
                  </div>

                  {/* Hidden file input — triggers camera on mobile */}
                  <input
                    id="ns-slip-scan-input"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleScanReceipt}
                    disabled={nsScanLoading}
                  />

                  {/* Scan button */}
                  <label
                    htmlFor="ns-slip-scan-input"
                    className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      nsScanLoading
                        ? 'bg-orange-100 border-orange-200 text-orange-400 pointer-events-none'
                        : 'bg-white border-orange-200 text-orange-600 hover:bg-orange-100 hover:border-orange-300 shadow-xs'
                    }`}
                  >
                    {nsScanLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                        <span>Reading slip...</span>
                        <span className="text-[10px] font-normal opacity-60">(may take a few seconds)</span>
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4" />
                        <span>{nsScanResult ? 'Re-scan / Change Photo' : 'Take Photo or Select Image'}</span>
                      </>
                    )}
                  </label>

                  {/* Scan result badge */}
                  {nsScanResult && !nsScanLoading && (
                    <div className={`mt-2.5 rounded-xl p-3 text-xs border ${
                      nsScanResult.error && nsScanResult.error !== 'no_text_detected'
                        ? 'bg-amber-50 border-amber-100'
                        : 'bg-emerald-50 border-emerald-100'
                    }`}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Sparkles className={`h-3.5 w-3.5 ${
                          nsScanResult.error && nsScanResult.error !== 'no_text_detected'
                            ? 'text-amber-500'
                            : 'text-emerald-500'
                        }`} />
                        <span className={`font-extrabold uppercase tracking-wider text-[10px] ${
                          nsScanResult.error && nsScanResult.error !== 'no_text_detected'
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}>
                          {nsScanResult.error && nsScanResult.error !== 'no_text_detected'
                            ? 'Partial read — verify below'
                            : 'Extracted from slip'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-medium">
                        <span className="text-slate-400">Amount</span>
                        <span className="font-mono font-bold text-slate-800">
                          {nsScanResult.total_amount ? `₹${nsScanResult.total_amount.toLocaleString('en-IN')}` : '—'}
                        </span>
                        <span className="text-slate-400">Vehicle No</span>
                        <span className="font-mono font-bold text-slate-800">
                          {nsScanResult.vehicle_no || '—'}
                        </span>
                        <span className="text-slate-400">Customer</span>
                        <span className="font-bold text-slate-800 truncate">
                          {nsScanResult.customer_name_suggested || '—'}
                        </span>
                      </div>
                      {nsScanResult.total_amount && nsRate > 0 && (
                        <p className="mt-2 text-[10px] text-emerald-600 font-medium">
                          ✓ Quantity auto-set to {(nsScanResult.total_amount / nsRate).toFixed(2)} L (₹{nsScanResult.total_amount} ÷ ₹{nsRate}/L)
                        </p>
                      )}
                      {nsScanResult.total_amount && nsRate <= 0 && (
                        <p className="mt-2 text-[10px] text-amber-600 font-medium">
                          ⚠ Select an item in Step 1 to auto-compute quantity from amount.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Timestamp</label>
                  <input
                    type="datetime-local"
                    value={nsTimestamp}
                    onChange={(e) => setNsTimestamp(e.target.value)}
                    max={toLocalInputValue(new Date())}
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Past dates/times allowed for retroactive entry.</p>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Payment Mode</label>
                  <div className="grid grid-cols-4 gap-2">
                    {PAYMENT_MODES.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setNsPaymentMode(m.value)}
                        className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${nsPaymentMode === m.value
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-primary/30'
                          }`}
                      >
                        {m.icon}
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Item</label>
                  {loadingItems ? (
                    <div className="flex items-center gap-2 text-xs text-slate-400 py-2"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading items...</div>
                  ) : dispensedItems.length === 0 ? (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl p-2.5">
                      No dispensed items found in Inventory. Add items there first.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {dispensedItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleNsItemChange(item.name)}
                          className={`flex flex-col items-start gap-0.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${nsItemName === item.name
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-primary/30'
                            }`}
                        >
                          {item.name}
                          <span className="text-[10px] font-mono opacity-70">₹{item.selling_rate.toFixed(2)}/{item.unit}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Point (Nozzle)</label>
                  <select
                    value={nsNozzleId}
                    onChange={(e) => setNsNozzleId(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors cursor-pointer"
                  >
                    <option value="">— Select Nozzle —</option>
                    {NOZZLES.filter((n) => n.item_name === nsItemName).map((n) => (
                      <option key={n.nozzle_id} value={n.nozzle_id}>Nozzle #{n.nozzle_id} ({n.item_name})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Quantity (L)</label>
                    <input
                      type="number"
                      step="any"
                      value={nsQuantity}
                      onChange={(e) => setNsQuantity(e.target.value)}
                      placeholder="0.0"
                      className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Rate</label>
                    <div className="w-full px-3 py-2 text-xs font-bold border border-slate-100 bg-slate-50 rounded-xl font-mono text-slate-500">
                      ₹{nsRate.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-700">Amount</span>
                  <span className="text-lg font-extrabold text-emerald-700 font-mono">{formatCurrency(nsAmount)}</span>
                </div>

                {/* ── UPI QR Code Panel ───────────────────────────── */}
                {nsPaymentMode === 'upi' && (
                  <div className="rounded-2xl border border-violet-200 bg-gradient-to-b from-violet-50 to-purple-50/60 p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="flex items-center gap-2 mb-3">
                      <QrCode className="h-4 w-4 text-violet-600" />
                      <span className="text-[11px] font-extrabold text-violet-800 uppercase tracking-wider">UPI Payment QR</span>
                      <span className="ml-auto text-[10px] bg-violet-100 text-violet-600 font-bold px-2 py-0.5 rounded-lg">Customer Scan Kare</span>
                    </div>

                    {pumpUpiIds.length === 0 ? (
                      <div className="text-center py-6 flex flex-col items-center gap-2">
                        <div className="h-12 w-12 rounded-full bg-violet-100 flex items-center justify-center">
                          <QrCode className="h-6 w-6 text-violet-400" />
                        </div>
                        <p className="text-xs font-bold text-violet-700">Koi UPI ID configure nahi hai</p>
                        <p className="text-[10px] text-violet-400">Wallet → UPI Settings mein UPI ID add karein</p>
                      </div>
                    ) : (() => {
                      const activeUpi = pumpUpiIds.find(u => u.upi_vpa === selectedUpiVpa) || pumpUpiIds[0];
                      const upiUrl = `upi://pay?pa=${encodeURIComponent(activeUpi.upi_vpa)}&pn=${encodeURIComponent(selectedPump?.name || 'Petrol Pump')}&am=${nsAmount > 0 ? nsAmount.toFixed(2) : ''}&cu=INR&tn=${encodeURIComponent('Fuel Sale')}`;
                      return (
                        <div className="flex flex-col items-center gap-3">
                          {/* QR Code box */}
                          <div className="bg-white rounded-2xl p-3 shadow-sm border border-violet-100 relative">
                            <QRCodeSVG
                              value={upiUrl}
                              size={170}
                              fgColor="#4c1d95"
                              bgColor="#ffffff"
                              level="M"
                            />
                            {nsAmount <= 0 && (
                              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-2xl">
                                <p className="text-[10px] font-extrabold text-violet-500 text-center px-3">Quantity enter karne par QR activate ho jayega</p>
                              </div>
                            )}
                          </div>

                          {/* UPI VPA + amount */}
                          <div className="text-center w-full">
                            <div className="flex items-center justify-center gap-1.5">
                              <p className="text-sm font-extrabold text-violet-900">{activeUpi.upi_vpa}</p>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(activeUpi.upi_vpa);
                                  setCopiedUpiVpa(true);
                                  setTimeout(() => setCopiedUpiVpa(false), 2000);
                                }}
                                className="p-1 rounded-lg hover:bg-violet-100 transition-colors"
                              >
                                {copiedUpiVpa
                                  ? <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                                  : <Copy className="h-3.5 w-3.5 text-violet-400" />}
                              </button>
                            </div>
                            <p className="text-[10px] text-violet-500 mt-0.5">{activeUpi.label} • {selectedPump?.name}</p>
                            {nsAmount > 0 && (
                              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-extrabold">
                                <IndianRupee className="h-3.5 w-3.5" />
                                {nsAmount.toFixed(2)} QR mein encoded hai
                              </div>
                            )}
                          </div>

                          {/* Switch between UPI IDs if multiple */}
                          {pumpUpiIds.length > 1 && (
                            <div className="flex gap-1.5 flex-wrap justify-center">
                              {pumpUpiIds.map((uid) => (
                                <button
                                  key={uid.upi_vpa}
                                  type="button"
                                  onClick={() => setSelectedUpiVpa(uid.upi_vpa)}
                                  className={`text-[10px] px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer ${
                                    selectedUpiVpa === uid.upi_vpa
                                      ? 'bg-violet-600 text-white border-violet-600'
                                      : 'bg-white text-violet-600 border-violet-200 hover:border-violet-400'
                                  }`}
                                >
                                  {uid.label}
                                </button>
                              ))}
                            </div>
                          )}

                          <p className="text-[10px] text-violet-400 text-center">
                            Customer is QR ko scan karke ₹{nsAmount > 0 ? nsAmount.toFixed(2) : '___'} pay karega
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 2: Customer / Vehicle / Credit/POS details ── */}
            {nsStep === 2 && (
              <div className="flex flex-col gap-4">
                {nsPaymentMode === 'credit' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                        Credit Customer <span className="text-red-500">*</span>
                      </label>
                      {loadingUdhaarCustomers ? (
                        <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading credit customers...
                        </div>
                      ) : udhaarCustomers.length > 0 ? (
                        <>
                          <select
                            value={nsCustomerId}
                            onChange={(e) => {
                              const c = udhaarCustomers.find(x => x.id === e.target.value);
                              setNsCustomerId(e.target.value);
                              setNsCustomerName(c?.name || '');
                            }}
                            className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 bg-white cursor-pointer transition-colors"
                          >
                            <option value="">— Select registered customer —</option>
                            {udhaarCustomers.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}{c.contact_phone ? ` (${c.contact_phone})` : ''}
                              </option>
                            ))}
                          </select>
                          {!nsCustomerId && (
                            <input
                              type="text"
                              value={nsCustomerName}
                              onChange={(e) => setNsCustomerName(e.target.value)}
                              placeholder="Or type customer name manually…"
                              className="w-full mt-2 px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors"
                            />
                          )}
                        </>
                      ) : (
                        <input
                          type="text"
                          value={nsCustomerName}
                          onChange={(e) => setNsCustomerName(e.target.value)}
                          placeholder="e.g. Rajesh Transport Co."
                          className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Credit Slip Reference (Opt)</label>
                      <input
                        type="text"
                        value={nsCreditSlipRef}
                        onChange={(e) => setNsCreditSlipRef(e.target.value)}
                        placeholder="Slip #"
                        className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </>
                )}

                {nsPaymentMode === 'upi' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                        UPI Transaction Ref / UTR (Optional)
                      </label>
                      <input
                        type="text"
                        value={nsBillingRef}
                        onChange={(e) => setNsBillingRef(e.target.value)}
                        placeholder="e.g. 42612345678901"
                        className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors font-mono"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Customer ka UTR / Transaction ID — reconciliation ke liye helpful hai</p>
                    </div>
                  </>
                )}

                {nsPaymentMode === 'pos' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">POS Machine</label>
                      <input
                        type="text"
                        value={nsPosMachine}
                        onChange={(e) => setNsPosMachine(e.target.value)}
                        placeholder="e.g. PAYTM-01"
                        className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Billing Reference <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={nsBillingRef}
                        onChange={(e) => setNsBillingRef(e.target.value)}
                        placeholder="Transaction ref number"
                        className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Vehicle Type (Opt)</label>
                    <input
                      type="text"
                      value={nsVehicleType}
                      onChange={(e) => setNsVehicleType(e.target.value)}
                      placeholder="e.g. Truck, Car"
                      className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Registration Type (Opt)</label>
                    <input
                      type="text"
                      value={nsRegistrationType}
                      onChange={(e) => setNsRegistrationType(e.target.value)}
                      placeholder="e.g. Commercial"
                      className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Vehicle Number (Opt)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={nsVehicleNumber}
                      onChange={(e) => setNsVehicleNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. DL 3C AY 4567"
                      className="flex-1 px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors uppercase font-mono"
                    />
                  </div>
                  {checkingVehicle && (
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                      <Loader2 className="h-3 w-3 animate-spin text-slate-500" />
                      <span>Verifying billing profile...</span>
                    </span>
                  )}
                  {vehicleCheckResult && vehicleCheckResult.status === 'credit' && (
                    <div className="mt-1.5 p-2 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] text-emerald-700 font-bold flex items-center gap-1.5 animate-in fade-in duration-200">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Matched credit profile of {vehicleCheckResult.partner_name} (Available Limit: {formatCurrency(vehicleCheckResult.available_credit || 0)})</span>
                    </div>
                  )}
                  {vehicleCheckResult && vehicleCheckResult.status === 'voucher' && (
                    <div className="mt-1.5 p-2 bg-blue-50 border border-blue-100 rounded-xl text-[10px] text-blue-700 font-bold flex flex-col gap-0.5 animate-in fade-in duration-200">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5 text-blue-600" />
                        <span>Active fuel voucher found for {vehicleCheckResult.partner_name} (Value: {formatCurrency(vehicleCheckResult.amount || 0)})</span>
                      </div>
                      {vehicleCheckResult.notes && (
                        <span className="text-[9px] text-slate-500 font-normal italic ml-5">Note: "{vehicleCheckResult.notes}"</span>
                      )}
                    </div>
                  )}
                  {vehicleCheckResult && vehicleCheckResult.status === 'udhaar_credit' && (
                    <div className="mt-1.5 p-2 bg-orange-50 border border-orange-200 rounded-xl text-[10px] text-orange-700 font-bold flex items-center gap-1.5 animate-in fade-in duration-200">
                      <CheckCircle className="h-3.5 w-3.5 text-orange-600" />
                      <span>
                        Credit customer: <span className="font-extrabold">{vehicleCheckResult.customer_name}</span>
                        {vehicleCheckResult.contact_phone ? ` · ${vehicleCheckResult.contact_phone}` : ''}
                        {' · '}Available: {formatCurrency(vehicleCheckResult.available_credit || 0)}
                      </span>
                    </div>
                  )}
                  {vehicleCheckResult && vehicleCheckResult.status === 'udhaar_no_contract' && (
                    <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-700 font-bold flex items-center gap-1.5 animate-in fade-in duration-200">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                      <span>Vehicle belongs to <span className="font-extrabold">{vehicleCheckResult.customer_name}</span> but they have no active credit contract.</span>
                    </div>
                  )}
                  {vehicleCheckResult && vehicleCheckResult.status === 'none' && nsVehicleNumber.trim().length > 4 && (
                    <div className="mt-1.5 p-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] text-slate-500 font-semibold flex items-center gap-1.5 animate-in fade-in duration-200">
                      <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
                      <span>No credit profile found for this vehicle. Proceed as cash/UPI/POS.</span>
                    </div>
                  )}
                </div>

                {attendants.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Attendant (Opt)</label>
                    <select
                      value={nsAttendantId}
                      onChange={(e) => setNsAttendantId(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors cursor-pointer"
                    >
                      <option value="">— Select Attendant —</option>
                      {attendants.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 3: Remarks / Attachments ── */}
            {nsStep === 3 && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Remarks (Opt)</label>
                  <textarea
                    value={nsRemarks}
                    onChange={(e) => setNsRemarks(e.target.value)}
                    placeholder="Any additional notes..."
                    rows={2}
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                    Receipt Image
                    {nsReceiptUrl && <span className="ml-1.5 text-emerald-500 font-bold text-[9px]">● SCANNED</span>}
                  </label>
                  {nsReceiptUrl ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="text-[10px] text-emerald-700 font-semibold truncate flex-1">{nsReceiptUrl.split('/').pop()}</span>
                        <button
                          type="button"
                          onClick={() => setNsReceiptUrl('')}
                          className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={nsReceiptUrl}
                        onChange={(e) => setNsReceiptUrl(e.target.value)}
                        placeholder="Receipt URL"
                        className="w-full px-3 py-2 text-[10px] font-mono border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors text-slate-500"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <input
                        type="text"
                        value={nsReceiptUrl}
                        onChange={(e) => setNsReceiptUrl(e.target.value)}
                        placeholder="Auto-filled after scanning, or paste URL manually"
                        className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors"
                      />
                      <p className="text-[10px] text-slate-400">Use ↑ Step 2 → Scan Credit Slip to auto-populate this field.</p>
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-400">Item</span><span className="font-bold">{nsItemName}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Quantity</span><span className="font-bold">{formatLiters(Number(nsQuantity) || 0)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Rate</span><span className="font-bold font-mono">₹{nsRate.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Payment</span><span className="font-bold uppercase">{nsPaymentMode}</span></div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 mt-1"><span className="font-bold text-slate-600">Amount</span><span className="font-extrabold font-mono text-emerald-600">{formatCurrency(nsAmount)}</span></div>
                </div>
              </div>
            )}

            {/* Navigation buttons - sticky bottom, always visible */}
            </div>
            <div className="px-6 pb-5 pt-3 border-t border-slate-100 flex gap-3 flex-shrink-0 bg-white rounded-b-3xl">
              {nsStep > 1 && (
                <button
                  onClick={handleNsBack}
                  className="flex items-center gap-1 px-4 py-2.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Back
                </button>
              )}
              <button
                onClick={() => setIsNewSaleOpen(false)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              {nsStep < 3 ? (
                <button
                  onClick={handleNsNext}
                  className="flex-1 py-2.5 text-xs font-bold bg-primary text-white rounded-xl shadow-md hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitNewSale}
                  disabled={submittingNewSale}
                  className="flex-1 py-2.5 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-500 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {submittingNewSale ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <>Add Sale <CheckCircle className="h-3.5 w-3.5" /></>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ═══════════════ SHIFT SETUP MODAL (3-step) ═══════════════ */}
      {isShiftSetupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white border border-slate-150 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left max-h-[88vh] overflow-y-auto">
            <button
              onClick={() => setIsShiftSetupOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-slate-400 hover:text-slate-600"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
                <Layers className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">New Shift Setup</h2>
                <p className="text-[10px] text-slate-400">Step {shiftSetupStep} of 3 — {selectedPump?.name}</p>
              </div>
            </div>

            <div className="flex gap-1.5 mb-5">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= shiftSetupStep ? 'bg-indigo-600' : 'bg-slate-100'}`} />
              ))}
            </div>

            {/* ── STEP 1: Shift Type & Timing ── */}
            {shiftSetupStep === 1 && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Shift Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {SHIFT_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => handleShiftPresetChange(preset)}
                        className={`py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${shiftType === preset.value
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300'
                          }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">Presets are suggestions — custom time can be set below.</p>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Shift Start Time</label>
                  <input
                    type="datetime-local"
                    value={shiftStartTime}
                    onChange={(e) => { setShiftStartTime(e.target.value); setShiftType('custom'); }}
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-indigo-400 transition-colors"
                  />
                </div>

                {dispensedItems.length === 0 && (
                  <div className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl p-3">
                    No active inventory items found. Sales logging will require valid rates — set up items in Inventory first.
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 2: Point Readings (Totallizer Verification) ── */}
            {shiftSetupStep === 2 && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-slate-400 mb-1">
                  Start totallizer values are auto-fetched from the previous shift's closing readings (marked "Auto"). Override if needed.
                </p>
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 font-extrabold text-slate-500">
                        <th className="p-3 uppercase tracking-wider">Nozzle</th>
                        <th className="p-3 uppercase tracking-wider">Item</th>
                        <th className="p-3 uppercase tracking-wider">Start Totallizer</th>
                        <th className="p-3 uppercase tracking-wider">Testing Value</th>
                        <th className="p-3 uppercase tracking-wider text-center">Active</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {shiftPoints.map((pt, idx) => (
                        <tr key={pt.nozzle_id} className={!pt.is_active ? 'opacity-40' : ''}>
                          <td className="p-3 font-bold font-mono text-indigo-600">Nozzle #{pt.nozzle_id}</td>
                          <td className="p-3 font-bold">{pt.item_name}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                step="any"
                                value={pt.start_reading}
                                onChange={(e) => updateShiftPoint(idx, 'start_reading', Number(e.target.value))}
                                disabled={!pt.is_active}
                                className="w-24 border border-slate-200 rounded-lg px-2 py-1 outline-none font-mono disabled:bg-slate-50"
                              />
                              {pt.auto && <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">AUTO</span>}
                            </div>
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              step="any"
                              value={pt.testing_value}
                              onChange={(e) => updateShiftPoint(idx, 'testing_value', Number(e.target.value))}
                              disabled={!pt.is_active}
                              className="w-20 border border-slate-200 rounded-lg px-2 py-1 outline-none font-mono disabled:bg-slate-50"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => togglePointActive(idx)}
                              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${pt.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'
                                }`}
                            >
                              {pt.is_active ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── STEP 3: Personnel Assignment ── */}
            {shiftSetupStep === 3 && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-slate-400 mb-1">Select attendants who will be active during this shift.</p>
                {attendants.length === 0 ? (
                  <div className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                    No attendants found for this pump. Add attendants in the Employees section first.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {attendants.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => togglePersonnel(a.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${shiftPersonnelIds.includes(a.id)
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300'
                          }`}
                      >
                        {shiftPersonnelIds.includes(a.id) ? <CheckCircle className="h-3.5 w-3.5" /> : <div className="h-3.5 w-3.5 rounded-full border border-slate-300" />}
                        {a.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Final Summary */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mt-2 flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-slate-400">Shift Type</span><span className="font-bold capitalize">{shiftType}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Start Time</span><span className="font-bold">{new Date(shiftStartTime).toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Active Points</span><span className="font-bold">{shiftPoints.filter((p) => p.is_active).length} / {shiftPoints.length}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Personnel</span><span className="font-bold">{shiftPersonnelIds.length} selected</span></div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-5 flex gap-3">
              {shiftSetupStep > 1 && (
                <button
                  onClick={handleShiftSetupBack}
                  className="flex items-center gap-1 px-4 py-2.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Back
                </button>
              )}
              <button
                onClick={() => setIsShiftSetupOpen(false)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              {shiftSetupStep < 3 ? (
                <button
                  onClick={handleShiftSetupNext}
                  className="flex-1 py-2.5 text-xs font-bold bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-500 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleStartShift}
                  disabled={startingShift}
                  className="flex-1 py-2.5 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-500 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {startingShift ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <><PlayCircle className="h-3.5 w-3.5" /> Start Shift</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ═══════════════ SALE EDITOR MODAL ═══════════════ */}
      {isSaleEditorOpen && activeShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-5xl bg-white border border-slate-150 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsSaleEditorOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-slate-400 hover:text-slate-600"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Header */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 animate-pulse">
                  <PlayCircle className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Shift Sale Editor</h2>
                  <p className="text-[10px] text-slate-400 capitalize">
                    Shift #{activeShift.shift_id} • {activeShift.shift_type} • Started {formatDateTime(activeShift.start_time)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={openRatesEditor}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <Settings2 className="h-3.5 w-3.5" /> Item Rates
                </button>
                <button
                  onClick={async () => { await refreshActiveShiftSummary(); setIsSummaryOpen(true); setLastClosedShift(activeShift); }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" /> See Summary
                </button>
                <button
                  onClick={openEndShift}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-rose-50 border border-rose-100 text-rose-600 rounded-xl hover:bg-rose-100 transition-all cursor-pointer"
                >
                  <StopCircle className="h-3.5 w-3.5" /> End Shift
                </button>
              </div>
            </div>

            {/* Point readings strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              {activeShift.point_summaries.map((p) => (
                <div key={p.nozzle_id} className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Nozzle #{p.nozzle_id} — {p.item_name}</p>
                  <p className="text-xs font-extrabold text-slate-700 font-mono mt-0.5">Start: {p.start_reading.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-400">Testing: {p.testing_value} L</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* ── Left: Sale Entry Form ── */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                {/* Type toggle */}
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200/60 max-w-xs">
                  {(['single', 'batch'] as SaleType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setEditorSaleType(t)}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer capitalize ${editorSaleType === t ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 -mt-2">
                  {editorSaleType === 'single'
                    ? 'Detailed entry for one vehicle/customer with attendant tracking.'
                    : 'Quick entry for high-volume sales of the same item/rate (e.g. bulk cash sales).'}
                </p>

                {/* Timestamp + Attendant */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Timestamp</label>
                    <input
                      type="datetime-local"
                      value={edTimestamp}
                      onChange={(e) => setEdTimestamp(e.target.value)}
                      max={toLocalInputValue(new Date())}
                      className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                      Attendant {editorSaleType === 'single' && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      value={edAttendantId}
                      onChange={(e) => setEdAttendantId(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-emerald-400 transition-colors cursor-pointer"
                    >
                      <option value="">— Select —</option>
                      {attendants
                        .filter((a) => activeShift.point_summaries.length === 0 || true)
                        .map((a) => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Item + Nozzle + Rate */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Item / Point</label>
                    <select
                      value={edItemName}
                      onChange={(e) => handleEdItemChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-emerald-400 transition-colors cursor-pointer"
                    >
                      <option value="">— Select Item —</option>
                      {dispensedItems.map((item) => (
                        <option key={item.id} value={item.name}>{item.name} (₹{item.selling_rate.toFixed(2)})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Rate</label>
                    <div className="w-full px-3 py-2 text-xs font-bold border border-slate-100 bg-slate-50 rounded-xl font-mono text-slate-500">
                      ₹{edRate.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Quantity + Amount */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Quantity (L)</label>
                    <input
                      type="number"
                      step="any"
                      value={edQuantity}
                      onChange={(e) => setEdQuantity(e.target.value)}
                      placeholder="0.0"
                      className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-emerald-400 transition-colors font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Amount</label>
                    <div className="w-full px-3 py-2 text-xs font-extrabold border border-emerald-100 bg-emerald-50 rounded-xl font-mono text-emerald-700">
                      {formatCurrency(edAmount)}
                    </div>
                  </div>
                </div>

                {/* Payment Mode */}
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Payment Method</label>
                  <div className="grid grid-cols-4 gap-2">
                    {PAYMENT_MODES.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => setEdPaymentMode(m.value)}
                        className={`flex flex-col items-center gap-1 py-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${edPaymentMode === m.value
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-emerald-300'
                          }`}
                      >
                        {m.icon}
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional fields */}
                {edPaymentMode === 'pos' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">POS Machine</label>
                      <input type="text" value={edPosMachine} onChange={(e) => setEdPosMachine(e.target.value)} placeholder="e.g. PAYTM-01"
                        className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-emerald-400 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Billing Ref <span className="text-red-500">*</span></label>
                      <input type="text" value={edBillingRef} onChange={(e) => setEdBillingRef(e.target.value)} placeholder="Ref number"
                        className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-emerald-400 transition-colors" />
                    </div>
                  </div>
                )}

                {edPaymentMode === 'credit' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Customer Name <span className="text-red-500">*</span></label>
                      <input type="text" value={edCustomerName} onChange={(e) => setEdCustomerName(e.target.value)} placeholder="Customer / company"
                        className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-emerald-400 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Credit Slip Ref (Opt)</label>
                      <input type="text" value={edCreditSlipRef} onChange={(e) => setEdCreditSlipRef(e.target.value)} placeholder="Slip #"
                        className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-emerald-400 transition-colors" />
                    </div>
                  </div>
                )}

                {/* Single-only: vehicle details */}
                {editorSaleType === 'single' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Vehicle Number (Opt)</label>
                      <input type="text" value={edVehicleNumber} onChange={(e) => setEdVehicleNumber(e.target.value.toUpperCase())} placeholder="DL 3C AY 4567"
                        className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-emerald-400 transition-colors uppercase" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Vehicle Type (Opt)</label>
                      <input type="text" value={edVehicleType} onChange={(e) => setEdVehicleType(e.target.value)} placeholder="Car, Truck, etc."
                        className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-emerald-400 transition-colors" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Remarks (Opt)</label>
                    <input type="text" value={edRemarks} onChange={(e) => setEdRemarks(e.target.value)} placeholder="Notes..."
                      className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-emerald-400 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Receipt (Opt)</label>
                    <input type="text" value={edReceiptUrl} onChange={(e) => setEdReceiptUrl(e.target.value)} placeholder="Attachment URL"
                      className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl outline-none focus:border-emerald-400 transition-colors" />
                  </div>
                </div>

                {/* Add button */}
                <button
                  onClick={handleQueueLog}
                  className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold bg-slate-900 text-white rounded-xl shadow-sm hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add to Queue
                </button>
              </div>

              {/* ── Right: Pending Logs Queue + Save ── */}
              <div className="flex flex-col gap-3">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex-1 flex flex-col min-h-[300px]">
                  <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-3 flex items-center justify-between">
                    Pending Queue
                    <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-lg">{pendingLogs.length}</span>
                  </h3>

                  {pendingLogs.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                      <Receipt className="h-8 w-8 mb-2 opacity-40" />
                      <p className="text-[11px] font-bold">No pending sales</p>
                      <p className="text-[10px] mt-1 text-center">Add sales above — they'll appear here before saving.</p>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto flex flex-col gap-2 max-h-[280px]">
                      {pendingLogs.map((log, idx) => (
                        <div key={idx} className="bg-white border border-slate-100 rounded-xl p-2.5 flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-700">{log.item_name}</span>
                              <PaymentBadge mode={log.payment_mode} />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {formatLiters(log.quantity)} × ₹{log.rate.toFixed(2)} = <span className="font-bold text-slate-600">{formatCurrency(log.quantity * log.rate)}</span>
                            </p>
                            {log.customer_name && <p className="text-[10px] text-slate-400">{log.customer_name}</p>}
                            {log.vehicle_number && <p className="text-[10px] text-slate-400 font-mono">{log.vehicle_number}</p>}
                          </div>
                          <button
                            onClick={() => removePendingLog(idx)}
                            className="p-1 hover:bg-red-50 text-red-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {pendingLogs.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-500">Queue Total</span>
                      <span className="font-extrabold font-mono text-slate-800">{formatCurrency(pendingTotal)}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSaveLogs}
                  disabled={savingLog || pendingLogs.length === 0}
                  className="flex items-center justify-center gap-1.5 py-3 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-500 transition-all disabled:opacity-40 cursor-pointer"
                >
                  {savingLog ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <><Save className="h-3.5 w-3.5" /> Save All ({pendingLogs.length})</>}
                </button>

                {/* Live shift summary mini */}
                <div className="bg-white border border-slate-100 rounded-2xl p-4">
                  <h3 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">Shift So Far</h3>
                  <div className="flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between"><span className="text-slate-400">Net Amount</span><span className="font-extrabold font-mono">{formatCurrency(activeShift.net_amount)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Total Qty</span><span className="font-bold">{formatLiters(activeShift.total_quantity)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Credit Ratio</span><span className="font-bold">{activeShift.credit_ratio}%</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Transactions</span><span className="font-bold">{activeShift.total_sales_count}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ═══════════════ END SHIFT — VERIFICATION MODAL ═══════════════ */}
      {isEndShiftOpen && activeShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border border-slate-150 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setIsEndShiftOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-slate-400 hover:text-slate-600"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 border border-rose-100 text-rose-600">
                <StopCircle className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">End Shift #{activeShift.shift_id}</h2>
                <p className="text-[10px] text-slate-400">Final totallizer verification required before closure.</p>
              </div>
            </div>

            {pendingLogs.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4 flex items-center gap-2 text-amber-700">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <p className="text-[11px] font-bold">{pendingLogs.length} unsaved sale(s) in queue — save them before ending shift, or they'll be lost.</p>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-3">
              {activeShift.point_summaries.map((p) => {
                const er = endReadings[p.nozzle_id] || { end_reading: '', testing_value: '0' };
                const soldQty = er.end_reading && !isNaN(Number(er.end_reading))
                  ? Math.max(0, (Number(er.end_reading) - p.start_reading) - Number(er.testing_value || 0))
                  : 0;
                const isInvalid = er.end_reading !== '' && !isNaN(Number(er.end_reading)) && Number(er.end_reading) < p.start_reading;

                return (
                  <div key={p.nozzle_id} className="border border-slate-100 rounded-2xl p-4">
                    <p className="text-xs font-extrabold text-slate-700 mb-3">Nozzle #{p.nozzle_id} — {p.item_name}</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Start</label>
                        <div className="px-2.5 py-1.5 text-xs font-mono font-bold bg-slate-50 border border-slate-100 rounded-lg text-slate-500">{p.start_reading.toFixed(2)}</div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">End Totallizer <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          step="any"
                          value={er.end_reading}
                          onChange={(e) => updateEndReading(p.nozzle_id, 'end_reading', e.target.value)}
                          className={`w-full px-2.5 py-1.5 text-xs font-mono font-bold border rounded-lg outline-none transition-colors ${isInvalid ? 'border-rose-300 bg-rose-50 text-rose-600' : 'border-slate-200 focus:border-rose-400'
                            }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Testing Value</label>
                        <input
                          type="number"
                          step="any"
                          value={er.testing_value}
                          onChange={(e) => updateEndReading(p.nozzle_id, 'testing_value', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-200 rounded-lg outline-none focus:border-rose-400 transition-colors"
                        />
                      </div>
                    </div>
                    {isInvalid && (
                      <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> End reading cannot be less than start reading.
                      </p>
                    )}
                    {!isInvalid && er.end_reading && (
                      <p className="text-[10px] text-emerald-600 font-bold mt-2">
                        Net Sold Quantity: {soldQty.toFixed(2)} L (after testing deduction)
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setIsEndShiftOpen(false)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEndShift}
                disabled={endingShift}
                className="flex-1 py-2.5 text-xs font-bold bg-rose-600 text-white rounded-xl shadow-md hover:bg-rose-500 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {endingShift ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <><CheckCircle className="h-3.5 w-3.5" /> Confirm & Close Shift</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ SHIFT SUMMARY MODAL (See Summary / Last Shift / Closed shift view) ═══════════════ */}
      {isSummaryOpen && lastClosedShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white border border-slate-150 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setIsSummaryOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-slate-400 hover:text-slate-600"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
                <Eye className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 capitalize">
                  Shift #{lastClosedShift.shift_id} Summary — {lastClosedShift.shift_type}
                </h2>
                <p className="text-[10px] text-slate-400">
                  {formatDateTime(lastClosedShift.start_time)} {lastClosedShift.end_time ? `→ ${formatDateTime(lastClosedShift.end_time)}` : '(Active)'}
                  {' • '}
                  <span className={`font-bold uppercase ${lastClosedShift.status === 'active' ? 'text-emerald-600' : 'text-slate-500'}`}>{lastClosedShift.status}</span>
                </p>
              </div>
            </div>

            {/* Top stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                <p className="text-[10px] font-bold text-emerald-600 uppercase">Net Amount</p>
                <p className="text-sm font-extrabold font-mono text-emerald-700 mt-1">{formatCurrency(lastClosedShift.net_amount)}</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                <p className="text-[10px] font-bold text-blue-600 uppercase">Total Qty</p>
                <p className="text-sm font-extrabold font-mono text-blue-700 mt-1">{formatLiters(lastClosedShift.total_quantity)}</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                <p className="text-[10px] font-bold text-amber-600 uppercase">Credit Ratio</p>
                <p className="text-sm font-extrabold font-mono text-amber-700 mt-1">{lastClosedShift.credit_ratio}%</p>
              </div>
            </div>

            {/* Point-wise summary */}
            <div className="mb-5">
              <h3 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">Point-wise Summary</h3>
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 font-extrabold text-slate-500">
                      <th className="p-2.5 uppercase">Nozzle</th>
                      <th className="p-2.5 uppercase">Item</th>
                      <th className="p-2.5 uppercase text-right">Start</th>
                      <th className="p-2.5 uppercase text-right">End</th>
                      <th className="p-2.5 uppercase text-right">Testing</th>
                      <th className="p-2.5 uppercase text-right">Sold Qty</th>
                      <th className="p-2.5 uppercase text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {lastClosedShift.point_summaries.map((p) => (
                      <tr key={p.nozzle_id}>
                        <td className="p-2.5 font-bold text-primary">#{p.nozzle_id}</td>
                        <td className="p-2.5">{p.item_name}</td>
                        <td className="p-2.5 text-right font-mono">{p.start_reading.toFixed(2)}</td>
                        <td className="p-2.5 text-right font-mono">{p.end_reading != null ? p.end_reading.toFixed(2) : '—'}</td>
                        <td className="p-2.5 text-right font-mono">{p.testing_value}</td>
                        <td className="p-2.5 text-right font-mono font-bold">{p.sold_quantity.toFixed(2)} L</td>
                        <td className="p-2.5 text-right font-mono font-extrabold">{formatCurrency(p.total_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Item-wise + Payment-wise side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">Item-wise</h3>
                <div className="flex flex-col gap-1.5">
                  {lastClosedShift.item_summaries.length === 0 ? (
                    <p className="text-xs text-slate-400">No sales logged.</p>
                  ) : lastClosedShift.item_summaries.map((it) => (
                    <div key={it.item_name} className="flex justify-between items-center bg-slate-50 rounded-lg px-3 py-2 text-xs">
                      <span className="font-bold">{it.item_name}</span>
                      <div className="text-right">
                        <p className="font-mono font-bold">{formatCurrency(it.total_amount)}</p>
                        <p className="text-[10px] text-slate-400">{formatLiters(it.total_quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">Payment-wise</h3>
                <div className="flex flex-col gap-1.5">
                  {lastClosedShift.payment_summaries.length === 0 ? (
                    <p className="text-xs text-slate-400">No sales logged.</p>
                  ) : lastClosedShift.payment_summaries.map((p) => (
                    <div key={p.payment_mode} className="flex justify-between items-center bg-slate-50 rounded-lg px-3 py-2 text-xs">
                      <PaymentBadge mode={p.payment_mode} />
                      <div className="text-right">
                        <p className="font-mono font-bold">{formatCurrency(p.total_amount)}</p>
                        <p className="text-[10px] text-slate-400">{p.transaction_count} txns</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <button
                onClick={() => setIsSummaryOpen(false)}
                className="w-full py-2.5 text-xs font-bold bg-slate-900 text-white rounded-xl shadow-md hover:bg-slate-800 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ ITEM RATES MODAL ═══════════════ */}
      {isRatesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border border-slate-150 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left">
            <button
              onClick={() => setIsRatesOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-slate-400 hover:text-slate-600"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-600">
                <Settings2 className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Update Item Rates</h2>
                <p className="text-[10px] text-slate-400">Changes apply to all new sales logged after saving.</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {dispensedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-700">{item.name}</p>
                    <p className="text-[10px] text-slate-400">Current: ₹{item.selling_rate.toFixed(2)} / {item.unit}</p>
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={editableRates[item.id] ?? ''}
                    onChange={(e) => setEditableRates((prev) => ({ ...prev, [item.id]: e.target.value }))}
                    className="w-28 px-3 py-2 text-xs font-bold font-mono border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-colors text-right"
                  />
                </div>
              ))}
              {dispensedItems.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No dispensed items found.</p>
              )}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setIsRatesOpen(false)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRates}
                disabled={savingRates}
                className="flex-1 py-2.5 text-xs font-bold bg-primary text-white rounded-xl shadow-md hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {savingRates ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : 'Save Rates'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}