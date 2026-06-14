'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  CreditCard,
  X,
  ArrowRight,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Search,
  MapPin,
  Building2,
} from 'lucide-react';
import { useWalletStore } from '@/stores/wallet.store';
import { useFleetStore } from '@/stores/fleet.store';
import { walletService } from '@/services/wallet.service';
import { toast } from '@/components/feedback/Toast';
import backendApi from '@/lib/backendApi';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Pump {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  fuel_types: string[];
  owner_name: string;
  contact_number: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function WalletPage() {
  const { activeFleetId } = useFleetStore();
  const { wallets, updateAutoRecharge } = useWalletStore();

  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchWallet = async () => {
      setLoading(true);
      try {
        await walletService.getWallet();
      } catch (err) {
        console.warn('[WalletPage] Failed to fetch real backend wallet:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, [activeFleetId]);

  const fleetWallet = wallets[activeFleetId] || {
    balance: 0,
    autoRecharge: { enabled: false, threshold: 20000, rechargeAmount: 50000, paymentMethodId: '' },
    transactions: [],
  };

  // ─── Payment Proof Modal State ──────────────────────────────────────────────
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState<number>(50000);
  const [payStatus, setPayStatus] = useState<'idle' | 'processing_api' | 'success'>('idle');
  const [progressMsg, setProgressMsg] = useState('');

  // Pump selector
  const [pumps, setPumps] = useState<Pump[]>([]);
  const [pumpSearch, setPumpSearch] = useState('');
  const [loadingPumps, setLoadingPumps] = useState(false);
  const [selectedPump, setSelectedPump] = useState<Pump | null>(null);

  // Payment proof fields
  const [transactionRef, setTransactionRef] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');

  // ─── Auto-Recharge State ────────────────────────────────────────────────────
  const [autoEnabled, setAutoEnabled] = useState(fleetWallet.autoRecharge.enabled);
  const [autoThreshold, setAutoThreshold] = useState(fleetWallet.autoRecharge.threshold);
  const [autoAmount, setAutoAmount] = useState(fleetWallet.autoRecharge.rechargeAmount);

  // ─── Pump Fetching ──────────────────────────────────────────────────────────
  const fetchPumps = async (search?: string) => {
    setLoadingPumps(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const { data } = await backendApi.get(`/pumps/${params}`);
      setPumps(data);
    } catch (err) {
      console.error('[WalletPage] Failed to fetch pumps:', err);
    } finally {
      setLoadingPumps(false);
    }
  };

  const handlePumpSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPumpSearch(val);
    if (val.length >= 2) fetchPumps(val);
    else if (val.length === 0) fetchPumps();
  };

  // ─── Open Modal ─────────────────────────────────────────────────────────────
  const handleOpenPayment = (amountVal: number) => {
    setRechargeAmount(amountVal);
    setIsPayModalOpen(true);
    setPayStatus('idle');
    setProgressMsg('');
    setTransactionRef('');
    setScreenshotUrl('');
    setSelectedPump(null);
    setPumpSearch('');
    fetchPumps();
  };

  // ─── Submit Payment Proof ───────────────────────────────────────────────────
  const handlePaymentProof = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPump) {
      toast.error('Please select a pump station.');
      return;
    }
    if (!transactionRef.trim()) {
      toast.error('Transaction reference / UTR number is required.');
      return;
    }
    if (rechargeAmount <= 0) {
      toast.error('Please specify a valid amount.');
      return;
    }

    setPayStatus('processing_api');
    setProgressMsg('Submitting payment proof to pump owner for approval...');

    try {
      await backendApi.post('/payment/request', {
        pump_id: selectedPump.id,           // ← dynamic pump_id, not hardcoded
        amount: rechargeAmount,
        payment_type: 'manual_bank_transfer',
        transaction_reference: transactionRef.trim(),
        remarks: `Payment proof for ₹${rechargeAmount.toLocaleString('en-IN')} — Pump: ${selectedPump.name}`,
        screenshot_url: screenshotUrl.trim() || null,
      });

      setPayStatus('success');
      setProgressMsg('Payment proof submitted! Awaiting pump owner approval.');
      toast.success(`Payment proof for ₹${rechargeAmount.toLocaleString('en-IN')} submitted to ${selectedPump.name}.`);

      setTimeout(() => {
        setIsPayModalOpen(false);
        setPayStatus('idle');
      }, 1800);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to submit payment proof.');
      setPayStatus('idle');
    }
  };

  // ─── Auto-Recharge Save ─────────────────────────────────────────────────────
  const handleSaveAutoRecharge = async () => {
    try {
      await walletService.updateAutoRechargeSettings({
        enabled: autoEnabled,
        threshold: autoThreshold,
        rechargeAmount: autoAmount,
      });
      toast.success('Auto-Recharge rules updated successfully.');
    } catch (err) {
      toast.error('Failed to configure auto-billing.');
    }
  };

  // ─── Loading Skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-200 rounded-3xl" />
          <div className="lg:col-span-2 h-64 bg-slate-200 rounded-3xl" />
        </div>
        <div className="h-32 bg-slate-200 rounded-3xl" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  // ─── Main Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Fund Wallet / Payments
          </h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">
            Submit payment proofs to pump owners, configure auto-recharge, and monitor wallet history
          </p>
        </div>
      </div>

      {/* Main Grid: Balance & Auto-Recharge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black bg-orange-50 text-orange-600 border border-orange-100/50 px-2 py-0.5 rounded-md uppercase">
              Operational Wallet
            </span>
            <div className="flex items-center gap-3.5 mt-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Balance</p>
                <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                  ₹{fleetWallet.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
              </div>
            </div>

            {fleetWallet.balance < 25000 && (
              <div className="mt-4 p-3.5 bg-rose-50/50 border border-rose-100 rounded-xl flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-rose-600 leading-normal">
                  Low balance. Top up to prevent driver card lockouts.
                </p>
              </div>
            )}
          </div>

          {/* Quick Recharge Presets */}
          <div className="space-y-2 border-t border-slate-100 pt-5">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Quick payment amounts</h4>
            <div className="grid grid-cols-3 gap-2">
              {[25000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleOpenPayment(amt)}
                  className="py-2 px-1 bg-slate-50 border border-slate-200 hover:border-orange-500/30 hover:bg-orange-50 text-slate-700 hover:text-orange-500 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  +₹{amt / 1000}k
                </button>
              ))}
            </div>
            <button
              onClick={() => handleOpenPayment(0)}
              className="w-full py-2.5 mt-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Submit Payment Proof
            </button>
          </div>
        </div>

        {/* Auto Recharge Settings */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-5">
          <div className="flex justify-between items-start border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Auto-Recharge ECS Settings</h3>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">Automatically trigger settlement drafts when fuel balances run low</p>
            </div>
            <div className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoEnabled}
                onChange={(e) => setAutoEnabled(e.target.checked)}
                className="sr-only peer"
                id="autoRechargeToggle"
              />
              <label
                htmlFor="autoRechargeToggle"
                className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 cursor-pointer"
              />
            </div>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-5 transition-opacity duration-300 ${autoEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <label>Low Balance Threshold</label>
                <span className="text-slate-900">₹{autoThreshold.toLocaleString()}</span>
              </div>
              <input
                type="range" min="10000" max="50000" step="5000"
                value={autoThreshold}
                onChange={(e) => setAutoThreshold(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <span className="block text-[10px] text-slate-400 font-semibold">Triggers recharge when wallet drops below threshold.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Auto top-up value (INR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={autoAmount}
                  onChange={(e) => setAutoAmount(Number(e.target.value))}
                  className="w-full pl-7 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-4">
            <button
              onClick={handleSaveAutoRecharge}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/10 transition-all cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>

      {/* Linked Cards */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-3">Linked Corporate Payment Accounts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Visa ending in 4242', sub: 'Corporate Fleet card (Apex Logistics)', color: 'orange', primary: true },
            { label: 'Mastercard ending in 9901', sub: 'Backup payment method', color: 'blue', primary: false },
          ].map((card) => (
            <div key={card.label} className="border border-slate-200/80 hover:border-orange-500/30 rounded-2xl p-4 bg-slate-50 flex items-center justify-between transition-all">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-${card.color}-50 text-${card.color}-600 flex items-center justify-center`}>
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{card.label}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{card.sub}</p>
                </div>
              </div>
              {card.primary
                ? <span className="px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-md text-[9px] font-extrabold uppercase">Primary</span>
                : <button className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer">Set Primary</button>
              }
            </div>
          ))}
        </div>
      </div>

      {/* Wallet Settlement Audit Logs */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Wallet settlement audit logs</h3>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">All payment proofs submitted to pump owners</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="p-4 pl-6">Reference ID</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Payment Hub</th>
                <th className="p-4 text-right">Recharge amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {fleetWallet.transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">No payment history yet.</td>
                </tr>
              ) : fleetWallet.transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6 font-bold text-slate-400">{txn.referenceId}</td>
                  <td className="p-4 font-bold text-slate-800">{txn.paymentMethod}</td>
                  <td className="p-4">
                    {txn.processor === 'stripe'
                      ? <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-md text-[9px] font-bold uppercase">Stripe API</span>
                      : <span className="px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-md text-[9px] font-bold uppercase">Razorpay Hub</span>
                    }
                  </td>
                  <td className="p-4 text-right font-black text-slate-900">₹{txn.amount.toLocaleString()}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md text-[9px] font-black uppercase">{txn.status}</span>
                  </td>
                  <td className="p-4 pr-6 text-slate-400 whitespace-nowrap">{txn.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PAYMENT PROOF MODAL ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isPayModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { if (payStatus === 'idle') setIsPayModalOpen(false); }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 text-white border border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-orange-500" />
                  <div>
                    <h3 className="text-sm font-extrabold tracking-tight">Submit Payment Proof</h3>
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">
                      Select pump → enter UTR → submit
                    </p>
                  </div>
                </div>
                {payStatus === 'idle' && (
                  <button onClick={() => setIsPayModalOpen(false)} className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Modal Body */}
              {payStatus === 'idle' ? (
                <form onSubmit={handlePaymentProof} className="p-5 space-y-5 text-xs font-semibold overflow-y-auto">

                  {/* Amount display + custom input */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <p className="text-[10px] text-white/50 font-bold uppercase mb-2">Payment Amount</p>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 font-bold text-sm">₹</span>
                      <input
                        type="number"
                        min="1"
                        value={rechargeAmount || ''}
                        onChange={(e) => setRechargeAmount(Number(e.target.value))}
                        placeholder="Enter amount"
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-8 pr-4 text-lg font-black text-white focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>

                  {/* ── Step 1: Pump Selector ── */}
                  <div>
                    <p className="text-[10px] text-white/50 font-bold uppercase mb-2 flex items-center gap-1.5">
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-black">1</span>
                      Select Pump Station
                    </p>

                    {selectedPump ? (
                      /* Selected pump pill */
                      <div className="flex items-center gap-3 bg-orange-500/20 border border-orange-500/30 rounded-xl px-4 py-3">
                        <Building2 className="h-4 w-4 text-orange-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-orange-200 truncate">{selectedPump.name}</p>
                          <p className="text-[10px] text-orange-400 truncate">{selectedPump.address}{selectedPump.city ? `, ${selectedPump.city}` : ''}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setSelectedPump(null); fetchPumps(); }}
                          className="shrink-0 p-1 text-orange-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      /* Pump search + list */
                      <>
                        <div className="relative mb-2">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                          <input
                            type="text"
                            value={pumpSearch}
                            onChange={handlePumpSearch}
                            placeholder="Search pump by name or city..."
                            className="w-full pl-9 pr-4 py-2.5 bg-black/25 border border-white/10 rounded-xl text-xs font-semibold text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500"
                          />
                        </div>

                        <div className="border border-white/10 rounded-xl overflow-hidden max-h-36 overflow-y-auto divide-y divide-white/5">
                          {loadingPumps ? (
                            <div className="flex items-center justify-center py-4 gap-2 text-white/40 text-xs">
                              <Loader2 className="h-4 w-4 animate-spin" /> Loading stations...
                            </div>
                          ) : pumps.length === 0 ? (
                            <div className="py-4 text-center text-white/30 text-xs">No pump stations found</div>
                          ) : (
                            pumps.map((pump) => (
                              <button
                                key={pump.id}
                                type="button"
                                onClick={() => setSelectedPump(pump)}
                                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 text-left transition-colors cursor-pointer"
                              >
                                <MapPin className="h-4 w-4 text-white/30 mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-white truncate">{pump.name}</p>
                                  <p className="text-[10px] text-white/40 truncate">
                                    {pump.address}{pump.city ? `, ${pump.city}` : ''}
                                  </p>
                                  {pump.fuel_types?.length > 0 && (
                                    <div className="flex gap-1 mt-0.5 flex-wrap">
                                      {pump.fuel_types.map((ft) => (
                                        <span key={ft} className="text-[9px] font-bold bg-white/10 text-white/60 px-1.5 py-0.5 rounded">
                                          {ft.trim()}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* ── Step 2: Transaction Reference ── */}
                  <div>
                    <p className="text-[10px] text-white/50 font-bold uppercase mb-2 flex items-center gap-1.5">
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-black">2</span>
                      UTR / Transaction Reference
                    </p>
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="e.g. UTR123456789012"
                      className="w-full bg-black/25 border border-white/10 rounded-xl py-2.5 px-4 text-xs font-bold tracking-widest text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>

                  {/* ── Step 3: Screenshot URL (optional) ── */}
                  <div>
                    <p className="text-[10px] text-white/50 font-bold uppercase mb-2 flex items-center gap-1.5">
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/20 text-white text-[9px] font-black">3</span>
                      Screenshot URL <span className="text-white/30">(optional)</span>
                    </p>
                    <input
                      type="url"
                      value={screenshotUrl}
                      onChange={(e) => setScreenshotUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-black/25 border border-white/10 rounded-xl py-2.5 px-4 text-xs font-bold text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-black rounded-xl transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Submit Payment Proof
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                /* Processing / Success state */
                <div className="p-10 text-center flex flex-col items-center justify-center space-y-4">
                  {payStatus === 'success' ? (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20"
                    >
                      <CheckCircle2 className="h-7 w-7 text-white" />
                    </motion.div>
                  ) : (
                    <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">
                      {payStatus === 'success' ? 'Submitted!' : 'Submitting...'}
                    </p>
                    <p className="text-[10px] text-white/50 font-semibold">{progressMsg}</p>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden max-w-[220px]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: payStatus === 'success' ? '100%' : '70%' }}
                      transition={{ duration: 1.2 }}
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