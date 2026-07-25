'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, RefreshCw,
  Plus, CheckCircle, AlertCircle, Wifi, WifiOff, TrendingUp,
  Smartphone, Sparkles, Search, ShieldCheck, HelpCircle,
  Building2, QrCode, Trash2, Star, X, Eye, EyeOff, Send,
  Banknote, BarChart3, Clock, BadgeCheck, BookOpen, AlertTriangle
} from 'lucide-react';
import { usePumpStore } from '@/stores/pumps.store';
import { toast } from '@/components/feedback/Toast';
import {
  ownerWalletService,
  WalletSummary, POSDevice, MerchantPayout, BankAccount, UpiId
} from '@/services/ownerWallet.service';
import {
  userWalletService,
  WalletBalance, WalletTransaction
} from '@/services/userWallet.service';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });

const maskAccount = (acc: string) =>
  acc.length > 4 ? 'XXXX XXXX ' + acc.slice(-4) : acc;

// Load Razorpay Script Dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// ─── Small Components ────────────────────────────────────────────────────────
function StatCard({
  icon, label, value, sub, accent, loading
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col gap-3 shadow-xs hover:shadow-sm transition-all text-left">
      <div className="flex justify-between items-center">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm ${accent || 'bg-orange-50 border border-orange-100 text-primary'}`}>
          {icon}
        </div>
      </div>
      {loading ? (
        <div className="h-7 w-28 bg-slate-100 rounded-lg animate-pulse" />
      ) : (
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
          <span className="text-xl font-black text-slate-800 font-mono tracking-tight">{value}</span>
          {sub && <span className="text-[10px] text-slate-400 font-semibold">{sub}</span>}
        </div>
      )}
    </div>
  );
}

function Tab({ id, active, onClick, children }: {
  id: string; active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 sm:flex-none flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer outline-none whitespace-nowrap
        ${active ? 'bg-white text-primary shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700'}`}
    >
      {children}
    </button>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function WalletPage() {
  const { selectedPump } = usePumpStore();
  const pumpId = selectedPump?.id || '';

  const [tab, setTab] = useState<'overview' | 'ledger' | 'terminals' | 'payouts' | 'accounts'>('overview');
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [terminals, setTerminals] = useState<POSDevice[]>([]);
  const [payouts, setPayouts] = useState<MerchantPayout[]>([]);
  const [loading, setLoading] = useState(false);

  // New production-grade UserWallet state
  const [userWallet, setUserWallet] = useState<WalletBalance | null>(null);
  const [ledgerTxns, setLedgerTxns] = useState<WalletTransaction[]>([]);
  const [ledgerTotal, setLedgerTotal] = useState(0);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  // Modals
  const [modal, setModal] = useState<'recharge' | 'payout' | 'addBank' | 'addUpi' | 'addTerminal' | 'p2p' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [amount, setAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [showAccNums, setShowAccNums] = useState<Record<string, boolean>>({});

  // P2P states
  const [receiverEmailOrPhone, setReceiverEmailOrPhone] = useState('');
  const [transferNote, setTransferNote] = useState('');

  // Add bank form
  const [bankForm, setBankForm] = useState({ account_holder: '', account_number: '', ifsc: '', bank_name: '', account_type: 'current' as 'current' | 'savings' });

  // Add UPI form
  const [upiForm, setUpiForm] = useState({ upi_vpa: '', label: 'GPay' });

  // Add terminal form
  const [termForm, setTermForm] = useState({ terminal_id: '', model: '', serial_number: '', assigned_attendant_name: '' });

  // Search terminals
  const [termSearch, setTermSearch] = useState('');

  // ─── Data fetch ────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!pumpId) return;
    setLoading(true);
    try {
      const [s, t, p, w] = await Promise.all([
        ownerWalletService.getWalletSummary(pumpId),
        ownerWalletService.getTerminals(pumpId),
        ownerWalletService.getPayouts(pumpId),
        userWalletService.getBalance()
      ]);
      setSummary(s);
      setTerminals(t);
      setPayouts(p);
      setUserWallet(w);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to load wallet data.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [pumpId]);

  const fetchLedger = useCallback(async (page: number) => {
    setLedgerLoading(true);
    try {
      const res = await userWalletService.getTransactions(page, 10);
      setLedgerTxns(res.transactions);
      setLedgerTotal(res.total);
      setLedgerPage(res.page);
    } catch (err: any) {
      console.error("Failed to load ledger transactions", err);
    } finally {
      setLedgerLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (tab === 'ledger') {
      fetchLedger(1);
    }
  }, [tab, fetchLedger]);

  const closeModal = () => {
    setModal(null);
    setAmount('');
    setSelectedBank('');
    setReceiverEmailOrPhone('');
    setTransferNote('');
    setBankForm({ account_holder: '', account_number: '', ifsc: '', bank_name: '', account_type: 'current' });
    setUpiForm({ upi_vpa: '', label: 'GPay' });
    setTermForm({ terminal_id: '', model: '', serial_number: '', assigned_attendant_name: '' });
  };

  // ─── Handlers ──────────────────────────────────────────────────
  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    
    setSubmitting(true);
    try {
      // 1. Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Failed to load Razorpay checkout script. Please try again.');
        setSubmitting(false);
        return;
      }

      // 2. Create Razorpay order from backend
      const res = await userWalletService.createOrder(amt);
      
      // 3. Configure Checkout Options
      const options = {
        key: res.key_id,
        amount: res.order.amount,
        currency: res.order.currency,
        name: "FuelFlux Wallet Balance",
        description: "Secure Digital Wallet Recharge",
        order_id: res.order.id,
        handler: async function (response: any) {
          try {
            setSubmitting(true);
            const verifyRes = await userWalletService.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            toast.success(verifyRes.message);
            closeModal();
            fetchAll();
          } catch (verifyErr: any) {
            toast.error(verifyErr?.response?.data?.detail || "Verification failed");
          } finally {
            setSubmitting(false);
          }
        },
        prefill: {
          name: "Station Owner",
        },
        theme: {
          color: "#F59E0B"
        }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        toast.error(`Payment failed: ${resp.error.description}`);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Recharge request failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    if (!selectedBank) { toast.error('Select a bank account for the transfer'); return; }

    const targetAccount = summary?.bank_accounts?.find(b => b.account_number === selectedBank);
    if (!targetAccount) { toast.error('Invalid bank account selected'); return; }

    setSubmitting(true);
    try {
      const res = await userWalletService.initiateWithdrawal(amt, {
        account_holder: targetAccount.account_holder,
        account_number: targetAccount.account_number,
        ifsc: targetAccount.ifsc,
        bank_name: targetAccount.bank_name
      });
      toast.success(res.message);
      closeModal();
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Payout request failed');
    } finally { setSubmitting(false); }
  };

  const handleP2pTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    if (!receiverEmailOrPhone) { toast.error('Enter receiver email or phone number'); return; }
    
    setSubmitting(true);
    try {
      const res = await userWalletService.p2pTransfer(receiverEmailOrPhone, amt, transferNote || undefined);
      toast.success(res.message || 'Transfer completed atomically');
      closeModal();
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Peer transfer failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await ownerWalletService.addBankAccount(pumpId, bankForm);
      toast.success(res.message);
      closeModal();
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to add bank account');
    } finally { setSubmitting(false); }
  };

  const handleRemoveBank = async (accountNumber: string) => {
    if (!confirm('Remove this bank account?')) return;
    try {
      await ownerWalletService.removeBankAccount(pumpId, accountNumber);
      toast.success('Bank account removed');
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Remove failed');
    }
  };

  const handleAddUpi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiForm.upi_vpa.includes('@')) { toast.error('Invalid UPI VPA — must contain @'); return; }
    setSubmitting(true);
    try {
      const res = await ownerWalletService.addUpiId(pumpId, upiForm.upi_vpa, upiForm.label);
      toast.success(res.message);
      closeModal();
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to add UPI');
    } finally { setSubmitting(false); }
  };

  const handleRemoveUpi = async (upi_vpa: string) => {
    if (!confirm('Remove this UPI VPA?')) return;
    try {
      await ownerWalletService.removeUpiId(pumpId, upi_vpa);
      toast.success('UPI VPA removed');
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Remove failed');
    }
  };

  const handleAddTerminal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await ownerWalletService.addTerminal(pumpId, termForm);
      toast.success(res.message);
      closeModal();
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to register terminal');
    } finally { setSubmitting(false); }
  };

  // ─── Derived ───────────────────────────────────────────────────
  const onlineCount = terminals.filter(t => t.status === 'online').length;
  const filteredTerminals = terminals.filter(t =>
    !termSearch ||
    t.terminal_id.toLowerCase().includes(termSearch.toLowerCase()) ||
    t.model.toLowerCase().includes(termSearch.toLowerCase()) ||
    t.attendant.toLowerCase().includes(termSearch.toLowerCase())
  );

  if (!pumpId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <Wallet className="h-12 w-12 text-slate-200" />
        <h2 className="text-sm font-bold text-slate-400">Select a petrol pump to view the wallet console.</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-left">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 rounded-2xl p-5 shadow-xs gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-orange-100 border border-orange-200 text-primary flex items-center justify-center shrink-0">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-800">Station Wallet Console</h1>
            <p className="text-[11px] text-slate-400">Ledger transaction statements, digital transfers, bank settlements &amp; UPI</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => fetchAll()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-600 cursor-pointer transition-all outline-none"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={() => setModal('p2p')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer transition-all outline-none"
          >
            <Send className="h-3.5 w-3.5 text-violet-500" /> P2P Send
          </button>
          <button
            onClick={() => setModal('payout')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer transition-all outline-none"
          >
            <ArrowDownLeft className="h-3.5 w-3.5 text-blue-500" /> Withdraw Payout
          </button>
          <button
            onClick={() => setModal('recharge')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-xs font-bold text-white shadow-md shadow-primary/20 cursor-pointer transition-all outline-none"
          >
            <Plus className="h-3.5 w-3.5" /> Razorpay Top Up
          </button>
        </div>
      </div>

      {/* ── Stat Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ledger Balance (Total Wallet Inflow) */}
        <div className="bg-slate-900 rounded-2xl p-5 flex flex-col justify-between h-36 text-white relative overflow-hidden shadow-lg">
          <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-primary/20 blur-xl" />
          <div className="flex justify-between items-start z-10">
            <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-[9px] font-bold text-primary px-2 py-0.5 bg-primary/20 rounded-md">LEDGER BALANCE</span>
          </div>
          <div className="z-10">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Available Balance</p>
            {loading ? <div className="h-6 w-24 bg-white/10 rounded animate-pulse mt-1" /> :
              <p className="text-xl font-black font-mono tracking-tight">{fmt(userWallet?.available_balance ?? 0)}</p>}
          </div>
        </div>

        <StatCard
          icon={<CreditCard className="h-4.5 w-4.5" />}
          label="Total Balance"
          value={loading ? '...' : fmt(userWallet?.balance ?? 0)}
          sub={loading ? '' : `Nodal account currency: ${userWallet?.currency ?? 'INR'}`}
          accent="bg-blue-50 border border-blue-100 text-blue-600"
          loading={loading}
        />

        <StatCard
          icon={<Smartphone className="h-4.5 w-4.5" />}
          label="Active POS Terminals"
          value={loading ? '...' : `${onlineCount} / ${terminals.length}`}
          sub="registered devices"
          accent="bg-emerald-50 border border-emerald-100 text-emerald-600"
          loading={loading}
        />

        <StatCard
          icon={<Banknote className="h-4.5 w-4.5" />}
          label="Cashless MTD Inflow"
          value={loading ? '...' : fmt(summary?.cashless_mtd ?? 0)}
          sub={`${summary?.txn_count ?? 0} nozzle receipts`}
          accent="bg-amber-50 border border-amber-100 text-amber-600"
          loading={loading}
        />
      </div>

      {/* ── Tab Panel ─────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
        {/* Tab Nav */}
        <div className="flex gap-1 p-2 bg-slate-50 border-b border-slate-100 overflow-x-auto">
          <Tab id="overview" active={tab === 'overview'} onClick={() => setTab('overview')}>
            <BarChart3 className="h-3.5 w-3.5" /> Overview
          </Tab>
          <Tab id="ledger" active={tab === 'ledger'} onClick={() => setTab('ledger')}>
            <BookOpen className="h-3.5 w-3.5" /> Wallet Passbook
          </Tab>
          <Tab id="terminals" active={tab === 'terminals'} onClick={() => setTab('terminals')}>
            <Smartphone className="h-3.5 w-3.5" /> POS Terminals
          </Tab>
          <Tab id="payouts" active={tab === 'payouts'} onClick={() => setTab('payouts')}>
            <ArrowUpRight className="h-3.5 w-3.5" /> Settlement Log
          </Tab>
          <Tab id="accounts" active={tab === 'accounts'} onClick={() => setTab('accounts')}>
            <Building2 className="h-3.5 w-3.5" /> Linked Accounts
          </Tab>
        </div>

        <div className="p-6">

          {/* ── TAB: OVERVIEW ───────────────────────────────────── */}
          {tab === 'overview' && (
            <div className="flex flex-col gap-8">
              {/* MTD Sales Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Forecourt Cash', value: summary?.mtd_breakdown.cash ?? 0, color: '#10B981' },
                  { label: 'UPI QR Inflow', value: summary?.mtd_breakdown.upi ?? 0, color: '#8B5CF6' },
                  { label: 'POS Swipes', value: summary?.mtd_breakdown.pos ?? 0, color: '#3B82F6' },
                  { label: 'Platform Credit', value: summary?.mtd_breakdown.credit ?? 0, color: '#F59E0B' },
                ].map((item) => (
                  <div key={item.label} className="border border-slate-100 rounded-2xl p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                    </div>
                    {loading ? <div className="h-5 w-20 bg-slate-100 rounded animate-pulse" /> :
                      <span className="text-base font-black text-slate-800 font-mono">{fmt(item.value)}</span>}
                  </div>
                ))}
              </div>

              {/* 30-Day Cashless Trend Chart */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">30-Day Cashless Trend</h3>
                  <span className="text-[10px] text-slate-400 font-semibold">UPI + POS daily receipts</span>
                </div>
                {loading ? (
                  <div className="h-52 bg-slate-50 rounded-2xl animate-pulse" />
                ) : !summary?.trend?.length || summary.trend.every(t => t.cashless === 0) ? (
                  <div className="h-52 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <BarChart3 className="h-8 w-8" />
                    <p className="text-xs font-bold">No cashless transactions recorded yet</p>
                    <p className="text-[10px]">Start recording UPI/POS sales to see the trend chart here.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={summary.trend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gUpi" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gPos" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={4} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(v, name) => [fmt(Number(v ?? 0)), name === 'upi' ? 'UPI' : 'POS/Card']}
                        contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 11 }}
                      />
                      <Area type="monotone" dataKey="upi" stroke="#8B5CF6" strokeWidth={2} fill="url(#gUpi)" name="upi" />
                      <Area type="monotone" dataKey="pos" stroke="#3B82F6" strokeWidth={2} fill="url(#gPos)" name="pos" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Gateway Channel Split */}
              {summary?.gateway_shares && summary.gateway_shares.length > 0 && (
                <div>
                  <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-4">Cashless Channel Split (MTD)</h3>
                  <div className="flex flex-col gap-3">
                    {summary.gateway_shares.map((ch) => (
                      <div key={ch.source} className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-500 w-44 shrink-0">{ch.source}</span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${ch.percentage}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: ch.color }}
                          />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-600 w-10 text-right">{ch.percentage}%</span>
                        <span className="text-[10px] font-mono text-slate-500 w-24 text-right">{fmt(ch.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: WALLET LEDGER (PASSBOOK) ────────────────────── */}
          {tab === 'ledger' && (
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Passbook Ledger Statement</h3>
                <span className="text-[10px] text-slate-400 font-semibold">Ledger-based transaction passbook</span>
              </div>

              {ledgerLoading ? (
                <div className="h-40 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse" />
              ) : ledgerTxns.length === 0 ? (
                <div className="flex flex-col items-center py-16 gap-3 text-slate-400 text-center">
                  <BookOpen className="h-10 w-10 text-slate-300" />
                  <p className="text-xs font-bold">No ledger transactions found.</p>
                  <p className="text-[10px]">Your top-ups, spends, and transfers will show up here.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="overflow-x-auto rounded-2xl border border-slate-100">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          <th className="p-4">Txn ID / Ref</th>
                          <th className="p-4">Date</th>
                          <th className="p-4">Type</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4">Balance After</th>
                          <th className="p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {ledgerTxns.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-mono font-bold text-slate-700">
                              <p>{t.id}</p>
                              {t.reference_id && <p className="text-[9px] text-slate-400 mt-0.5 font-normal">Ref: {t.reference_id}</p>}
                            </td>
                            <td className="p-4 text-slate-500 font-mono text-[10px]">
                              {new Date(t.created_at).toLocaleString('en-IN')}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider
                                ${t.type === 'credit' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                {t.type}
                              </span>
                            </td>
                            <td className="p-4 capitalize text-slate-600">{t.category.replace('_', ' ')}</td>
                            <td className={`p-4 font-black font-mono ${t.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {t.type === 'credit' ? '+' : '-'}{fmt(t.amount)}
                            </td>
                            <td className="p-4 font-mono font-bold text-slate-600">{fmt(t.balance_after)}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase
                                ${t.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 
                                  t.status === 'pending' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'}`}>
                                {t.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {ledgerTotal > 10 && (
                    <div className="flex justify-between items-center text-xs mt-2">
                      <button
                        disabled={ledgerPage === 1}
                        onClick={() => fetchLedger(ledgerPage - 1)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 font-bold cursor-pointer"
                      >
                        Previous
                      </button>
                      <span className="text-slate-500">Page {ledgerPage} of {Math.ceil(ledgerTotal / 10)}</span>
                      <button
                        disabled={ledgerPage * 10 >= ledgerTotal}
                        onClick={() => fetchLedger(ledgerPage + 1)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 font-bold cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: POS TERMINALS ──────────────────────────────── */}
          {tab === 'terminals' && (
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <div className="relative flex-1 min-w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    value={termSearch}
                    onChange={e => setTermSearch(e.target.value)}
                    placeholder="Search terminals, model, attendant..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all"
                  />
                </div>
                <button
                  onClick={() => setModal('addTerminal')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer shadow-md shadow-primary/20 hover:bg-primary-hover transition-all outline-none shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" /> Register Terminal
                </button>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1,2,3].map(i => <div key={i} className="h-48 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse" />)}
                </div>
              ) : filteredTerminals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                  <Smartphone className="h-10 w-10" />
                  <p className="text-xs font-bold">
                    {termSearch ? 'No terminals match your search.' : 'No POS terminals registered yet.'}
                  </p>
                  {!termSearch && (
                    <button
                      onClick={() => setModal('addTerminal')}
                      className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      Register your first POS terminal →
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTerminals.map((pos) => (
                    <div key={pos.id} className="bg-slate-50/50 border border-slate-200/60 hover:border-slate-300 rounded-2xl p-5 flex flex-col gap-3 transition-all text-left">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[9px] font-mono text-slate-400">{pos.terminal_id}</p>
                          <p className="text-xs font-extrabold text-slate-700 mt-0.5">{pos.model}</p>
                          <p className="text-[10px] font-mono text-slate-500">{pos.serial}</p>
                        </div>
                        {pos.status === 'online' ? (
                          <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-bold rounded-lg">
                            <Wifi className="h-3 w-3" /> ONLINE
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-200/60 border border-slate-300 text-slate-500 text-[9px] font-bold rounded-lg">
                            <WifiOff className="h-3 w-3" /> OFFLINE
                          </span>
                        )}
                      </div>

                      <div className="border-t border-b border-slate-100 py-2 text-[10px]">
                        <span className="text-slate-400 font-bold uppercase tracking-wider">Attendant: </span>
                        <span className="font-bold text-slate-600">{pos.attendant}</span>
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className={`font-bold ${pos.battery < 20 ? 'text-rose-500 animate-pulse' : pos.battery < 50 ? 'text-amber-500' : 'text-slate-500'}`}>
                          Battery: {pos.battery}%
                        </span>
                        <span className="font-bold text-slate-700">MTD: {fmt(pos.mtdVolume)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: PAYOUTS (SETTLEMENT LOG) ────────────────────── */}
          {tab === 'payouts' && (
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Nodal Account Settlements</h3>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-500" /> Nodal clearing matched via RazorpayX bank integration
                </span>
              </div>

              {loading ? (
                <div className="h-40 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse" />
              ) : payouts.length === 0 ? (
                <div className="flex flex-col items-center py-16 gap-3 text-slate-400">
                  <ArrowUpRight className="h-10 w-10" />
                  <p className="text-xs font-bold">No payouts recorded yet.</p>
                  <p className="text-[10px]">Withdraw nodal funds into primary corporate bank account to settle.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <th className="p-4">Ref</th>
                        <th className="p-4">Date &amp; Time</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Destination Bank</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Reconciliation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {payouts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-mono font-bold text-primary text-[11px]">{p.payout_id}</td>
                          <td className="p-4 text-slate-500 font-mono text-[10px]">{p.date}</td>
                          <td className="p-4 font-black font-mono">{fmt(p.amount)}</td>
                          <td className="p-4 text-slate-600 text-[11px]">{p.bank}</td>
                          <td className="p-4">
                            {p.status === 'settled' ? (
                              <span className="flex items-center gap-1 w-fit px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-bold rounded-lg">
                                <CheckCircle className="h-3 w-3" /> SETTLED
                              </span>
                            ) : p.status === 'processing' ? (
                              <span className="flex items-center gap-1 w-fit px-2.5 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-[9px] font-bold rounded-lg">
                                <Clock className="h-3 w-3 animate-pulse" /> PROCESSING
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 w-fit px-2.5 py-1 bg-red-50 border border-red-100 text-red-700 text-[9px] font-bold rounded-lg">
                                <AlertCircle className="h-3 w-3" /> FAILED
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {p.reconciled ? (
                              <span className="flex items-center gap-1 w-fit px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-bold rounded-lg">
                                <BadgeCheck className="h-3 w-3" /> MATCHED
                              </span>
                            ) : (
                              <div className="group relative inline-block">
                                <span className="flex items-center gap-1 w-fit px-2.5 py-1 bg-rose-50 border border-rose-100 text-rose-700 text-[9px] font-bold rounded-lg cursor-help">
                                  <AlertCircle className="h-3 w-3" /> DISCREPANCY <HelpCircle className="h-3 w-3" />
                                </span>
                                <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-900 text-slate-200 text-[10px] p-3 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible z-20 pointer-events-none transition-all">
                                  <div className="font-bold text-primary border-b border-white/10 pb-1 mb-1">Reconciliation Error</div>
                                  <div className="flex justify-between font-mono"><span>Gateway:</span><span>{fmt(p.amount)}</span></div>
                                  {p.bankAmount && <div className="flex justify-between font-mono mt-0.5"><span>Bank stmt:</span><span>{fmt(p.bankAmount)}</span></div>}
                                  {p.discrepancy && <div className="border-t border-white/10 pt-1 mt-1 text-amber-400">{p.discrepancy}</div>}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: LINKED ACCOUNTS ────────────────────────────── */}
          {tab === 'accounts' && (
            <div className="flex flex-col gap-8">

              {/* Bank Accounts */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Corporate Bank Accounts</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Payout settlement destination accounts</p>
                  </div>
                  <button
                    onClick={() => setModal('addBank')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer shadow-md shadow-primary/20 hover:bg-primary-hover transition-all outline-none"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Bank Account
                  </button>
                </div>

                {loading ? (
                  <div className="h-24 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse" />
                ) : !summary?.bank_accounts?.length ? (
                  <div className="flex flex-col items-center py-10 gap-2 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                    <Building2 className="h-8 w-8" />
                    <p className="text-xs font-bold">No bank accounts linked yet</p>
                    <p className="text-[10px]">Add a corporate bank account to enable payout settlements.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {summary.bank_accounts.map((acc) => (
                      <div key={acc.account_number} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-200/60 rounded-2xl gap-4 hover:border-slate-300 transition-all text-left">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-700">{acc.bank_name}</span>
                              {acc.is_primary && (
                                <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-bold rounded-md">
                                  <Star className="h-2.5 w-2.5" /> PRIMARY
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                              {showAccNums[acc.account_number] ? acc.account_number : maskAccount(acc.account_number)}
                              <button
                                onClick={() => setShowAccNums(p => ({ ...p, [acc.account_number]: !p[acc.account_number] }))}
                                className="ml-1.5 text-primary cursor-pointer"
                              >
                                {showAccNums[acc.account_number] ? <EyeOff className="h-3 w-3 inline" /> : <Eye className="h-3 w-3 inline" />}
                              </button>
                            </p>
                            <p className="text-[9px] font-mono text-slate-400">{acc.ifsc} · {acc.account_type.toUpperCase()} A/C · {acc.account_holder}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveBank(acc.account_number)}
                          className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* UPI IDs */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Linked UPI VPAs</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Merchant UPI IDs for QR-based customer payments</p>
                  </div>
                  <button
                    onClick={() => setModal('addUpi')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer transition-all outline-none"
                  >
                    <QrCode className="h-3.5 w-3.5" /> Add UPI ID
                  </button>
                </div>

                {loading ? (
                  <div className="h-20 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse" />
                ) : !summary?.upi_ids?.length ? (
                  <div className="flex flex-col items-center py-10 gap-2 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                    <QrCode className="h-8 w-8" />
                    <p className="text-xs font-bold">No UPI IDs linked yet</p>
                    <p className="text-[10px]">Add a merchant UPI VPA (e.g. yourstation@okaxis) for customer payments.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {summary.upi_ids.map((upi) => (
                      <div key={upi.upi_vpa} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-200/60 rounded-2xl gap-4 hover:border-slate-300 transition-all text-left">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shrink-0">
                            <QrCode className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-700 font-mono">{upi.upi_vpa}</span>
                              {upi.is_primary && (
                                <span className="flex items-center gap-0.5 bg-primary/10 text-primary text-[9px] font-bold rounded-md font-mono">
                                  <Star className="h-2.5 w-2.5" /> PRIMARY
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">{upi.label} · Added {new Date(upi.added_at).toLocaleDateString('en-IN')}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveUpi(upi.upi_vpa)}
                          className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── MODALS ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={closeModal} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 z-10 text-left"
            >
              {/* ── Add Money (Razorpay) ── */}
              {modal === 'recharge' && (
                <form onSubmit={handleRecharge} className="p-6 flex flex-col gap-5">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                      <CreditCard className="h-4.5 w-4.5 text-primary" /> Razorpay Checkout
                    </h3>
                    <button type="button" onClick={closeModal} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Amount to Add (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input type="number" required min={1} value={amount} onChange={e => setAmount(e.target.value)}
                        placeholder="e.g. 5000"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400">Recharge safely using your debit card, UPI app, netbanking, or wallet via the secure Razorpay Checkout popup.</p>
                  <button type="submit" disabled={submitting}
                    className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm cursor-pointer disabled:opacity-60 hover:bg-primary-hover transition-all shadow-md shadow-primary/20">
                    {submitting ? 'Connecting...' : 'Proceed to Payment'}
                  </button>
                </form>
              )}

              {/* ── Withdraw ── */}
              {modal === 'payout' && (
                <form onSubmit={handlePayout} className="p-6 flex flex-col gap-5">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                      <ArrowDownLeft className="h-4.5 w-4.5 text-blue-500" /> Withdraw Payout
                    </h3>
                    <button type="button" onClick={closeModal} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-[11px] text-amber-700 font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Available: <strong className="font-mono">{fmt(userWallet?.available_balance ?? 0)}</strong> (Limit: ₹100 - ₹20,000 / day)</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Amount (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input type="number" required min={100} max={20000}
                        value={amount} onChange={e => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Settlement Bank Account *</label>
                    {summary?.bank_accounts && summary.bank_accounts.length > 0 ? (
                      <select value={selectedBank} onChange={e => setSelectedBank(e.target.value)} required
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-primary transition-all cursor-pointer">
                        <option value="">-- Select Bank Account --</option>
                        {summary.bank_accounts.map(b => (
                          <option key={b.account_number} value={b.account_number}>
                            {b.bank_name} · {maskAccount(b.account_number)} {b.is_primary ? '(Primary)' : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                        No bank accounts linked. <button type="button" onClick={() => { closeModal(); setModal('addBank'); }} className="text-primary font-bold hover:underline cursor-pointer">Add one first</button>
                      </div>
                    )}
                  </div>
                  <button type="submit" disabled={submitting || !summary?.bank_accounts?.length}
                    className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold text-sm cursor-pointer disabled:opacity-50 hover:bg-slate-900 transition-all">
                    {submitting ? 'Submitting...' : 'Initiate IMPS Payout'}
                  </button>
                </form>
              )}

              {/* ── P2P Transfer ── */}
              {modal === 'p2p' && (
                <form onSubmit={handleP2pTransfer} className="p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                      <Send className="h-4.5 w-4.5 text-violet-500" /> P2P Fund Transfer
                    </h3>
                    <button type="button" onClick={closeModal} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Receiver Phone / Email</label>
                    <input type="text" required placeholder="e.g. user@domain.com or phone"
                      value={receiverEmailOrPhone}
                      onChange={e => setReceiverEmailOrPhone(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Amount to Transfer (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input type="number" required min={1} value={amount} onChange={e => setAmount(e.target.value)}
                        placeholder="e.g. 1500"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Add a Note (optional)</label>
                    <input type="text" placeholder="e.g. For dinner bills"
                      value={transferNote}
                      onChange={e => setTransferNote(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-primary transition-all" />
                  </div>
                  <p className="text-[10px] text-slate-400">All P2P transfers are fee-free and settle atomically into the recipient's ledger wallet instantly.</p>
                  <button type="submit" disabled={submitting}
                    className="w-full py-3 rounded-xl bg-violet-600 text-white font-bold text-sm cursor-pointer disabled:opacity-60 hover:bg-violet-700 transition-all shadow-md shadow-violet-200 mt-2">
                    {submitting ? 'Transferring...' : 'Send Funds Instantly'}
                  </button>
                </form>
              )}

              {/* ── Add Bank Account ── */}
              {modal === 'addBank' && (
                <form onSubmit={handleAddBank} className="p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                      <Building2 className="h-4.5 w-4.5 text-primary" /> Link Bank Account
                    </h3>
                    <button type="button" onClick={closeModal} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X className="h-4 w-4" /></button>
                  </div>
                  {[
                    { key: 'account_holder', label: 'Account Holder Name', placeholder: 'e.g. Rajesh Kumar' },
                    { key: 'bank_name', label: 'Bank Name', placeholder: 'e.g. HDFC Bank' },
                    { key: 'account_number', label: 'Account Number', placeholder: 'Enter bank account number' },
                    { key: 'ifsc', label: 'IFSC Code', placeholder: 'e.g. HDFC0000001' },
                  ].map(f => (
                    <div key={f.key} className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">{f.label}</label>
                      <input
                        type="text"
                        required
                        placeholder={f.placeholder}
                        value={(bankForm as any)[f.key]}
                        onChange={e => setBankForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                    </div>
                  ))}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Account Type</label>
                    <div className="flex gap-3">
                      {['current', 'savings'].map(type => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="acc_type" value={type}
                            checked={bankForm.account_type === type}
                            onChange={() => setBankForm(p => ({ ...p, account_type: type as any }))}
                            className="accent-primary" />
                          <span className="text-xs font-bold text-slate-600 capitalize">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button type="submit" disabled={submitting}
                    className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm cursor-pointer disabled:opacity-60 hover:bg-primary-hover transition-all shadow-md shadow-primary/20 mt-2">
                    {submitting ? 'Linking...' : 'Link Bank Account'}
                  </button>
                </form>
              )}

              {/* ── Add UPI ID ── */}
              {modal === 'addUpi' && (
                <form onSubmit={handleAddUpi} className="p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                      <QrCode className="h-4.5 w-4.5 text-primary" /> Add UPI VPA
                    </h3>
                    <button type="button" onClick={closeModal} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">UPI VPA</label>
                    <input type="text" required placeholder="e.g. yourstation@okaxis"
                      value={upiForm.upi_vpa}
                      onChange={e => setUpiForm(p => ({ ...p, upi_vpa: e.target.value }))}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold font-mono outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all" />
                    <p className="text-[10px] text-slate-400 mt-0.5">Must include @ (e.g. station@okaxis, dealer@ybl)</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-500 uppercase">Label / App</label>
                    <select value={upiForm.label} onChange={e => setUpiForm(p => ({ ...p, label: e.target.value }))}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-primary transition-all cursor-pointer">
                      {['GPay', 'PhonePe', 'Paytm', 'BHIM', 'Amazon Pay', 'Bank UPI'].map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" disabled={submitting}
                    className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm cursor-pointer disabled:opacity-60 hover:bg-primary-hover transition-all shadow-md shadow-primary/20 mt-2">
                    {submitting ? 'Linking...' : 'Link UPI ID'}
                  </button>
                </form>
              )}

              {/* ── Register Terminal ── */}
              {modal === 'addTerminal' && (
                <form onSubmit={handleAddTerminal} className="p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                      <Smartphone className="h-4.5 w-4.5 text-primary" /> Register POS Terminal
                    </h3>
                    <button type="button" onClick={closeModal} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><X className="h-4 w-4" /></button>
                  </div>
                  {[
                    { key: 'terminal_id', label: 'Terminal ID', placeholder: 'e.g. POS-101' },
                    { key: 'model', label: 'Device Model', placeholder: 'e.g. Pax A920 Smart POS' },
                    { key: 'serial_number', label: 'Serial Number', placeholder: 'e.g. SN-9982A81' },
                    { key: 'assigned_attendant_name', label: 'Assigned Attendant', placeholder: 'e.g. Karthik Raju (optional)' },
                  ].map(f => (
                    <div key={f.key} className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase">{f.label}</label>
                      <input
                        type="text"
                        required={f.key !== 'assigned_attendant_name'}
                        placeholder={f.placeholder}
                        value={(termForm as any)[f.key]}
                        onChange={e => setTermForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                    </div>
                  ))}
                  <button type="submit" disabled={submitting}
                    className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm cursor-pointer disabled:opacity-60 hover:bg-primary-hover transition-all shadow-md shadow-primary/20 mt-2">
                    {submitting ? 'Registering...' : 'Register Terminal'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
