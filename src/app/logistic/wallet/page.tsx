'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  ArrowUpRight,
  CreditCard,
  History,
  SlidersHorizontal,
  Info,
  ShieldCheck,
  CheckCircle2,
  X,
  Lock,
  ArrowRight,
  RefreshCw,
  Loader2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useWalletStore } from '@/stores/wallet.store';
import { useFleetStore } from '@/stores/fleet.store';
import { walletService } from '@/services/wallet.service';
import { toast } from '@/components/feedback/Toast';

export default function WalletPage() {
  const { activeFleetId } = useFleetStore();
  const { wallets, rechargeWallet, updateAutoRecharge } = useWalletStore();

  const fleetWallet = wallets[activeFleetId] || {
    balance: 0,
    autoRecharge: { enabled: false, threshold: 20000, rechargeAmount: 50000, paymentMethodId: '' },
    transactions: [],
  };

  // Payment Modal Simulator State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState<number>(50000);
  const [paymentProcessor, setPaymentProcessor] = useState<'stripe' | 'razorpay'>('stripe');
  
  // Card Inputs
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/29');
  const [cardCvv, setCardCvv] = useState('099');
  
  // Simulation Steps
  const [payStatus, setPayStatus] = useState<'idle' | 'encrypting' | 'processing_api' | 'success'>('idle');
  const [progressMsg, setProgressMsg] = useState('');

  // Auto-Recharge States
  const [autoEnabled, setAutoEnabled] = useState(fleetWallet.autoRecharge.enabled);
  const [autoThreshold, setAutoThreshold] = useState(fleetWallet.autoRecharge.threshold);
  const [autoAmount, setAutoAmount] = useState(fleetWallet.autoRecharge.rechargeAmount);

  const handleOpenPayment = (amountVal: number) => {
    setRechargeAmount(amountVal);
    setIsPayModalOpen(true);
    setPayStatus('idle');
    setProgressMsg('');
    if (paymentProcessor === 'stripe') {
      setCardNumber('4242 4242 4242 4242');
    } else {
      setCardNumber('5412 7511 9901 1234');
    }
  };

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rechargeAmount <= 0) {
      toast.error('Please specify a valid recharge amount.');
      return;
    }

    // Step 1: Encrypting
    setPayStatus('encrypting');
    setProgressMsg('Performing AES-256 Card details encryption...');
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Step 2: Hitting Server
    setPayStatus('processing_api');
    setProgressMsg(`Contacting secure ${paymentProcessor === 'stripe' ? 'Stripe Gateway tokenizer' : 'Razorpay payments API'}...`);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setProgressMsg('Performing 3D-Secure validation checks...');
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Step 3: Trigger Zustand Store State Adjustment
    try {
      const cardNumLast4 = cardNumber.replace(/\s+/g, '').slice(-4) || '4242';
      await walletService.recharge(rechargeAmount, paymentProcessor, cardNumLast4);
      
      setPayStatus('success');
      setProgressMsg('Transaction Approved! Wallet balance updated.');
      toast.success(`₹${rechargeAmount.toLocaleString()} recharge successful.`);
      
      setTimeout(() => {
        setIsPayModalOpen(false);
        setPayStatus('idle');
      }, 1000);
    } catch (err) {
      toast.error('Prepaid recharge gateway failed.');
      setPayStatus('idle');
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Prepaid Wallet
          </h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">
            Top up prepaid fuel cards, configure auto-recharge thresholds, and monitor settlement histories
          </p>
        </div>
      </div>

      {/* Main Grid: Balance & Auto-Recharge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Balance card */}
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
                  Low Balance warning. Balance has fallen below safety thresholds. Top up soon to prevent driver card lockouts.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-5">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Quick recharge presets</h4>
            <div className="grid grid-cols-3 gap-2">
              {[25000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleOpenPayment(amt)}
                  className="py-2 px-1 bg-slate-50 border border-slate-200 hover:border-orange-500/30 hover:bg-orange-50 text-slate-700 hover:text-orange-500 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  +₹{(amt / 1000)}k
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Auto Recharge Settings Panel */}
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

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-5 transition-opacity duration-300 ${
            autoEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'
          }`}>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <label>Low Balance Threshold Trigger</label>
                <span className="text-slate-900">₹{autoThreshold.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="10000"
                max="50000"
                step="5000"
                value={autoThreshold}
                onChange={(e) => setAutoThreshold(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <span className="block text-[10px] text-slate-400 font-semibold">Triggers recharge when wallet drops below threshold.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Auto-Recharge top-up Value (INR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  value={autoAmount}
                  onChange={(e) => setAutoAmount(Number(e.target.value))}
                  className="w-full pl-7 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-orange-500"
                />
              </div>
              <span className="block text-[10px] text-slate-400 font-semibold">Charges linked Visa/Mastercard account directly.</span>
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

      {/* Linked Credit Cards Panel */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-3">Linked Corporate Payment Accounts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-slate-200/80 hover:border-orange-500/30 rounded-2xl p-4.5 bg-slate-50 flex items-center justify-between transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Visa ending in 4242</p>
                <p className="text-[10px] text-slate-400 font-semibold">Corporate Fleet card (Apex Logistics)</p>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-md text-[9px] font-extrabold uppercase">Primary</span>
          </div>

          <div className="border border-slate-200/80 hover:border-orange-500/30 rounded-2xl p-4.5 bg-slate-50 flex items-center justify-between transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Mastercard ending in 9901</p>
                <p className="text-[10px] text-slate-400 font-semibold">Backup payment method</p>
              </div>
            </div>
            <button className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer">
              Set Primary
            </button>
          </div>
        </div>
      </div>

      {/* Recharge Ledger Logs */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Wallet settlement audit logs</h3>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Complete list of banking transaction recharges across Stripe/Razorpay hubs</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="p-4 pl-6">Reference ID</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Payment Hub</th>
                <th className="p-4 text-right">Recharge amount</th>
                <th className="p-4">Billing Status</th>
                <th className="p-4 pr-6">Settlement Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {fleetWallet.transactions.map((txn) => {
                const gatewayBadge = txn.processor === 'stripe'
                  ? <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-md text-[9px] font-bold uppercase">Stripe API</span>
                  : <span className="px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-md text-[9px] font-bold uppercase">Razorpay Hub</span>;

                return (
                  <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-400">{txn.referenceId}</td>
                    <td className="p-4 font-bold text-slate-800">{txn.paymentMethod}</td>
                    <td className="p-4">{gatewayBadge}</td>
                    <td className="p-4 text-right font-black text-slate-900">₹{txn.amount.toLocaleString()}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md text-[9px] font-black uppercase">
                        {txn.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-slate-400 whitespace-nowrap">{txn.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stripe/Razorpay secure payment checkout modal simulator */}
      <AnimatePresence>
        {isPayModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (payStatus === 'idle') setIsPayModalOpen(false); }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden z-10 transition-colors duration-300 ${
                paymentProcessor === 'stripe' ? 'bg-indigo-950 text-white border-indigo-900' : 'bg-slate-900 text-white border-slate-800'
              }`}
            >
              {/* Decorative brand stripes */}
              <div className="p-5 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Lock className="h-4.5 w-4.5 text-orange-500" />
                  <div>
                    <h3 className="text-sm font-extrabold tracking-tight">Secure Payment Checkout</h3>
                    <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">
                      Gateway: {paymentProcessor.toUpperCase()} API
                    </p>
                  </div>
                </div>
                {payStatus === 'idle' && (
                  <button
                    onClick={() => setIsPayModalOpen(false)}
                    className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {payStatus === 'idle' ? (
                <form onSubmit={handleSimulatePayment} className="p-5 space-y-4 text-xs font-semibold text-slate-200">
                  {/* Gateways Toggle selectors */}
                  <div className="grid grid-cols-2 gap-2 bg-black/20 p-1.5 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentProcessor('stripe');
                        setCardNumber('4242 4242 4242 4242');
                      }}
                      className={`py-2 text-center rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                        paymentProcessor === 'stripe' ? 'bg-indigo-600 text-white shadow-sm' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Stripe Gateway
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentProcessor('razorpay');
                        setCardNumber('5412 7511 9901 1234');
                      }}
                      className={`py-2 text-center rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                        paymentProcessor === 'razorpay' ? 'bg-orange-600 text-white shadow-sm' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Razorpay Checkout
                    </button>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <p className="text-[10px] text-white/50 font-bold uppercase">Prepaid Settlement value</p>
                    <h3 className="text-2xl font-black text-white mt-1">₹{rechargeAmount.toLocaleString()}</h3>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-white/40 font-bold uppercase">Cardholder account Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-black/25 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold tracking-widest text-white focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-white/40 font-bold uppercase">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-black/25 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs font-bold text-white focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-white/40 font-bold uppercase">CVV Code</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full bg-black/25 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs font-bold text-white tracking-widest focus:outline-none focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-orange-500/10 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Authorize Payment <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
                  {payStatus === 'success' ? (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20"
                    >
                      <CheckCircle2 className="h-6 w-6 animate-bounce" />
                    </motion.div>
                  ) : (
                    <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
                  )}
                  
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white capitalize">{payStatus.replace('_', ' ')}...</p>
                    <p className="text-[10px] text-white/50 font-semibold">{progressMsg}</p>
                  </div>

                  {/* Visual simulated loading bar */}
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden max-w-[240px]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: payStatus === 'success' ? '100%' : '75%' }}
                      transition={{ duration: 1.5 }}
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
