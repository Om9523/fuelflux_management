'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Plus,
  CheckCircle,
  AlertCircle,
  Building,
  QrCode,
  Wifi,
  WifiOff,
  TrendingUp,
  Smartphone,
  Sparkles,
  Search,
  DollarSign,
  Send,
} from 'lucide-react';
import { usePumpStore } from '@/stores/pumps.store';
import { toast } from '@/components/feedback/Toast';
import { Button } from '@/components/ui/Button';

// Seed Wallet & POS datasets dynamically mapped to pump IDs
const WALLET_SEEDS: Record<string, {
  balance: number;
  cashlessMtd: number;
  gatewaySettled: number;
  terminals: Array<{ id: string; model: string; serial: string; status: 'online' | 'offline'; battery: number; attendant: string; mtdVolume: number }>;
  payouts: Array<{ id: string; date: string; amount: number; bank: string; status: 'settled' | 'processing' }>;
  gatewayShares: Array<{ source: string; amount: number; percentage: number; color: string }>;
}> = {
  pump_1: {
    balance: 340500,
    cashlessMtd: 8240900,
    gatewaySettled: 412500,
    terminals: [
      { id: 'POS-101', model: 'Pax A920 Smart POS', serial: 'SN-9982A81', status: 'online', battery: 88, attendant: 'Karthik Raju', mtdVolume: 2450000 },
      { id: 'POS-102', model: 'PineLabs Pl-40 Premium', serial: 'SN-3048B12', status: 'online', battery: 94, attendant: 'Suresh Kumar', mtdVolume: 1890000 },
      { id: 'POS-103', model: 'Pax A920 Smart POS', serial: 'SN-9982A89', status: 'online', battery: 42, attendant: 'Madan Lal', mtdVolume: 1240000 },
      { id: 'POS-104', model: 'Paytm SoundBox v3', serial: 'SN-PTM9921', status: 'online', battery: 100, attendant: 'Forecourt Auto-QR', mtdVolume: 2660900 },
      { id: 'POS-105', model: 'PineLabs Pl-40 Premium', serial: 'SN-3048B15', status: 'offline', battery: 0, attendant: 'Unassigned', mtdVolume: 0 },
    ],
    payouts: [
      { id: 'PAY-701', date: '2026-05-26', amount: 310500, bank: 'State Bank of India - A/C 9901', status: 'settled' },
      { id: 'PAY-702', date: '2026-05-27', amount: 412500, bank: 'State Bank of India - A/C 9901', status: 'processing' },
      { id: 'PAY-703', date: '2026-05-25', amount: 289400, bank: 'State Bank of India - A/C 9901', status: 'settled' },
    ],
    gatewayShares: [
      { source: 'UPI (GPay/PhonePe)', amount: 3708405, percentage: 45, color: '#3B82F6' },
      { source: 'Visa/Mastercard Credit', amount: 2472270, percentage: 30, color: '#10B981' },
      { source: 'RuPay Debit Cards', amount: 1648180, percentage: 20, color: '#F59E0B' },
      { source: 'FuelFlux Corporate Wallet', amount: 412045, percentage: 5, color: '#FF7A00' },
    ]
  },
  pump_2: {
    balance: 180200,
    cashlessMtd: 5120300,
    gatewaySettled: 198000,
    terminals: [
      { id: 'POS-201', model: 'Pax A920 Smart POS', serial: 'SN-9002B90', status: 'online', battery: 92, attendant: 'Vikram Singh', mtdVolume: 2100000 },
      { id: 'POS-202', model: 'Paytm SoundBox v3', serial: 'SN-PTM8811', status: 'online', battery: 100, attendant: 'Premium Cafe Counter', mtdVolume: 1200000 },
      { id: 'POS-203', model: 'PineLabs Pl-40 Premium', serial: 'SN-4029D88', status: 'online', battery: 75, attendant: 'Ananya Roy', mtdVolume: 1820300 },
    ],
    payouts: [
      { id: 'PAY-801', date: '2026-05-26', amount: 145000, bank: 'HDFC Bank - A/C 4002', status: 'settled' },
      { id: 'PAY-802', date: '2026-05-27', amount: 198000, bank: 'HDFC Bank - A/C 4002', status: 'processing' },
    ],
    gatewayShares: [
      { source: 'UPI (GPay/PhonePe)', amount: 3072180, percentage: 60, color: '#3B82F6' },
      { source: 'Visa/Mastercard Credit', amount: 1792105, percentage: 35, color: '#10B981' },
      { source: 'FuelFlux Corporate Wallet', amount: 256015, percentage: 5, color: '#FF7A00' },
    ]
  },
  default: {
    balance: 0,
    cashlessMtd: 0,
    gatewaySettled: 0,
    terminals: [],
    payouts: [],
    gatewayShares: []
  }
};

export default function WalletPage() {
  const { selectedPump } = usePumpStore();
  const [activeTab, setActiveTab] = useState<'terminals' | 'payouts' | 'channels'>('terminals');
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [rechargeAmt, setRechargeAmt] = useState('');
  const [isRecharging, setIsRecharging] = useState(false);
  const [rechargeStep, setRechargeStep] = useState<'amount' | 'otp' | 'success'>('amount');
  const [otpVal, setOtpVal] = useState('');

  const currentPumpId = selectedPump?.id || 'pump_1';
  const pumpData = WALLET_SEEDS[currentPumpId] || WALLET_SEEDS.pump_1;

  const [walletBalance, setWalletBalance] = useState(pumpData.balance);

  // Sync wallet balance when selected station shifts
  useEffect(() => {
    setWalletBalance(pumpData.balance);
  }, [currentPumpId, pumpData.balance]);

  const handleSimulateTopup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rechargeAmt) {
      toast.error('Please input a recharge amount.');
      return;
    }
    const amt = parseFloat(rechargeAmt);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please input a valid amount.');
      return;
    }

    setIsRecharging(true);
    // Simulate loading/encryption delay
    setTimeout(() => {
      setIsRecharging(false);
      setRechargeStep('otp');
    }, 1200);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpVal !== '123456' && otpVal.length > 0) {
      toast.error('Invalid OTP. Use bypass code 123456');
      return;
    }

    setIsRecharging(true);
    setTimeout(() => {
      setIsRecharging(false);
      const amt = parseFloat(rechargeAmt);
      setWalletBalance((prev) => prev + amt);
      toast.success(`Wallet topped up successfully with ₹${amt.toLocaleString('en-IN')}!`);
      setRechargeStep('success');
    }, 1500);
  };

  const handleCloseModal = () => {
    setIsRechargeOpen(false);
    setRechargeStep('amount');
    setRechargeAmt('');
    setOtpVal('');
  };

  const activeTerminals = pumpData.terminals.filter((t) => t.status === 'online').length;
  const totalTerminals = pumpData.terminals.length;

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800 text-left">
      
      {/* 1. MODULE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 rounded-2xl p-6 shadow-xs gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 border border-orange-200 text-primary">
            <Wallet className="h-5.5 w-5.5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold text-text-primary tracking-tight">Station Wallet & Cashless Terminals</h1>
            <p className="text-xs text-text-secondary">Configure IoT-linked credit card POS machines, audit UPI soundbox registries, and review merchant payout schedules.</p>
          </div>
        </div>

        {selectedPump?.status === 'approved' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                toast.success('Simulating instant digital payout of settled balance to corporate bank account...');
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition-all outline-none cursor-pointer"
            >
              <ArrowDownLeft className="h-4 w-4 text-slate-500" />
              Payout Settled
            </button>
            
            <button
              onClick={() => setIsRechargeOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-4.5 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 transition-all outline-none cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Recharge Wallet
            </button>
          </div>
        )}
      </div>

      {selectedPump?.status !== 'approved' ? (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center max-w-2xl mx-auto gap-4 mt-6">
          <AlertCircle className="h-10 w-10 text-amber-500 animate-pulse" />
          <h3 className="text-sm font-extrabold text-slate-800">Payment Gateway Services Locked</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md">
            Your station wallet and automated POS cashless channel integrations are under verification review. Complete regulatory compliance boarding checklists to unlock direct bank settlement gateways.
          </p>
        </div>
      ) : (
        <>
          {/* 2. DYNAMIC WALLET DASHBOARD CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Main Wallet Balance */}
            <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between h-36 text-white">
              {/* Subtle glass sphere overlay */}
              <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/10 blur-xl pointer-events-none" />
              
              <div className="flex justify-between items-start z-10">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-primary">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <span className="px-2 py-0.5 rounded-md bg-primary/20 text-[9px] font-bold text-primary flex items-center gap-0.5">
                  Secure Wallet
                </span>
              </div>

              <div className="flex flex-col gap-0.5 z-10">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Virtual Balance</span>
                <span className="text-xl font-black font-mono tracking-tight text-white">
                  ₹{walletBalance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Card 2: Cashless Inflow MTD */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[10px] font-bold text-blue-600 flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" /> +12.3%
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cashless MTD Receipts</span>
                <span className="text-xl font-black text-text-primary font-mono tracking-tight">
                  ₹{pumpData.cashlessMtd.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Card 3: POS Terminals online */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600">
                  <Smartphone className="h-5 w-5" />
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[10px] font-bold text-emerald-600 font-mono">
                  Online
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active POS Terminals</span>
                <span className="text-xl font-black text-text-primary font-mono tracking-tight text-emerald-600">
                  {activeTerminals} / {totalTerminals}
                </span>
              </div>
            </div>

            {/* Card 4: Next settlement */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 border border-amber-100 text-amber-600">
                  <RefreshCw className="h-5 w-5 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-[9px] font-bold text-amber-600 font-mono">
                  Daily Settling
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Settled (Payout Pending)</span>
                <span className="text-xl font-black text-text-primary font-mono tracking-tight text-slate-700">
                  ₹{pumpData.gatewaySettled.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* 3. TABS AND REGISTRIES */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col gap-6">
            
            {/* Tab Controller */}
            <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-200/50 max-w-md select-none shrink-0 self-start">
              {[
                { id: 'terminals', label: 'POS Terminal Registry', icon: <Smartphone className="h-3.5 w-3.5" /> },
                { id: 'payouts', label: 'Payout Settlements', icon: <ArrowUpRight className="h-3.5 w-3.5" /> },
                { id: 'channels', label: 'Cashless Split Analytics', icon: <QrCode className="h-3.5 w-3.5" /> },
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

            {/* TAB 1: POS TERMINAL REGISTRY */}
            {activeTab === 'terminals' && (
              <div className="flex flex-col gap-6">
                
                {/* Search Terminals */}
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div className="flex items-center relative w-full sm:max-w-md">
                    <Search className="absolute left-3.5 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search POS terminals by serial, model, employee..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                  </div>

                  <button
                    onClick={() => toast.success('Searching for nearby Bluetooth/Wi-Fi POS devices...')}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-2 text-xs font-bold text-primary transition-all outline-none cursor-pointer"
                  >
                    <Smartphone className="h-4 w-4" /> Pair New Terminal
                  </button>
                </div>

                {/* POS Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pumpData.terminals.map((pos) => (
                    <div key={pos.id} className="bg-slate-50/50 border border-slate-200/40 hover:border-slate-300 rounded-3xl p-5 transition-all flex flex-col justify-between h-48">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-mono text-slate-400">{pos.id}</span>
                          <span className="text-xs font-extrabold text-slate-700">{pos.model}</span>
                          <span className="text-[10px] font-mono text-slate-500 mt-0.5">{pos.serial}</span>
                        </div>

                        {pos.status === 'online' ? (
                          <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-[9px] rounded-lg flex items-center gap-1">
                            <Wifi className="h-3.5 w-3.5 shrink-0" />
                            ACTIVE
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-200/60 border border-slate-300 text-slate-500 font-bold text-[9px] rounded-lg flex items-center gap-1">
                            <WifiOff className="h-3.5 w-3.5 shrink-0" />
                            OFFLINE
                          </span>
                        )}
                      </div>

                      {/* Middle attendant allocation */}
                      <div className="flex flex-col gap-1 py-3 border-t border-b border-slate-100 mt-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Allocated Attendant</span>
                        <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                          <span className={`h-1.5 w-1.5 rounded-full ${pos.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {pos.attendant}
                        </span>
                      </div>

                      {/* Bottom Battery & Volume metrics */}
                      <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 font-mono">
                        <span className="flex items-center gap-1">
                          Battery: <span className={`font-bold ${pos.battery < 30 ? 'text-rose-500 animate-pulse' : 'text-slate-600'}`}>{pos.battery}%</span>
                        </span>
                        <span className="font-bold text-slate-700">
                          MTD: ₹{pos.mtdVolume.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: PAYOUT SETTLEMENTS */}
            {activeTab === 'payouts' && (
              <div className="flex flex-col gap-5">
                <div className="pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Merchant Account Payouts</h3>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 font-extrabold text-text-secondary">
                        <th className="p-4 uppercase tracking-wider">Payout ID</th>
                        <th className="p-4 uppercase tracking-wider">Date Initiated</th>
                        <th className="p-4 uppercase tracking-wider">Settlement Amount</th>
                        <th className="p-4 uppercase tracking-wider">Recipient Corporate Bank</th>
                        <th className="p-4 uppercase tracking-wider">Settlement Status</th>
                        <th className="p-4 uppercase tracking-wider">Reference Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-text-primary">
                      {pumpData.payouts.map((pay) => (
                        <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-mono font-bold text-primary">{pay.id}</td>
                          <td className="p-4 text-slate-500 font-mono">{pay.date}</td>
                          <td className="p-4 font-black font-mono">₹{pay.amount.toLocaleString('en-IN')}</td>
                          <td className="p-4 text-slate-600">{pay.bank}</td>
                          <td className="p-4">
                            {pay.status === 'settled' ? (
                              <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-[9px] rounded-lg flex items-center gap-1 w-fit">
                                <CheckCircle className="h-3 w-3 shrink-0" />
                                BANK DISBURSED
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-amber-50 border border-amber-100 text-amber-600 font-bold text-[9px] rounded-lg flex items-center gap-1 w-fit">
                                <RefreshCw className="h-3 w-3 shrink-0 animate-spin" />
                                GATEWAY BATCH SETTLING
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => toast.success(`Downloaded settlement receipt: ${pay.id}`)}
                              className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                            >
                              Download Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: GATEWAY SPLIT ANALYTICS */}
            {activeTab === 'channels' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Channel List Table */}
                <div className="lg:col-span-2 flex flex-col gap-5">
                  <div className="pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">MTD Cashless Split</h3>
                  </div>

                  <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 font-extrabold text-text-secondary">
                          <th className="p-4 uppercase tracking-wider">Payment Channel</th>
                          <th className="p-4 uppercase tracking-wider">Gateway Status</th>
                          <th className="p-4 uppercase tracking-wider text-right">Channel Split</th>
                          <th className="p-4 uppercase tracking-wider text-right">MTD Volume</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-text-primary">
                        {pumpData.gatewayShares.map((channel, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 flex items-center gap-2">
                              <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: channel.color }} />
                              <span className="font-bold text-slate-700">{channel.source}</span>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-[9px] rounded-lg">
                                Active Gateway
                              </span>
                            </td>
                            <td className="p-4 text-right font-bold text-slate-500 font-mono">{channel.percentage}%</td>
                            <td className="p-4 text-right font-black font-mono text-slate-800">
                              ₹{channel.amount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Animated SVG Pie Chart representer */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-5 flex flex-col items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider self-start">Volume Contribution</span>
                  
                  {/* SVG Bar Chart representing contributions */}
                  <div className="w-full flex flex-col gap-4 py-6">
                    {pumpData.gatewayShares.map((channel, idx) => (
                      <div key={idx} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-slate-600">
                          <span>{channel.source}</span>
                          <span>{channel.percentage}%</span>
                        </div>
                        {/* CSS Bar Gauge */}
                        <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${channel.percentage}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: channel.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="w-full text-[10px] text-slate-400 leading-relaxed border-t border-slate-100 pt-3">
                    Merchant settlements run automatically at 11:30 PM daily. Gateway MDR is processed under standard RBI guidelines.
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* 4. RECHARGE MODAL FLOW */}
      <AnimatePresence>
        {isRechargeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={handleCloseModal} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 z-10 overflow-hidden text-center"
            >
              {rechargeStep === 'amount' && (
                <form onSubmit={handleSimulateTopup} className="flex flex-col gap-5 text-left text-xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4 shrink-0">
                    <h3 className="text-sm font-extrabold text-text-primary flex items-center gap-1.5">
                      <Wallet className="h-5 w-5 text-primary" /> Recharge Wallet
                    </h3>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="p-1 rounded-lg hover:bg-slate-50 text-text-secondary"
                    >
                      <AlertCircle className="h-4.5 w-4.5 rotate-45" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1 mt-2">
                    <label className="text-xs font-semibold text-text-primary">Top-up Value (INR)</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4.5 text-slate-400 font-extrabold text-sm">₹</span>
                      <input
                        type="number"
                        required
                        value={rechargeAmt}
                        onChange={(e) => setRechargeAmt(e.target.value)}
                        placeholder="e.g. 50000"
                        disabled={isRecharging}
                        className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm font-extrabold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-text-primary">Corporate Bank Account</label>
                    <select className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-text-primary outline-none cursor-pointer">
                      <option>State Bank of India Corporate A/C (..9901)</option>
                      <option>HDFC Bank Corporate A/C (..4002)</option>
                    </select>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    Your balance will update immediately after secure authentication. Daily maximum bank draw threshold is ₹10,00,000.
                  </p>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isRecharging}
                    className="w-full mt-4 font-bold"
                  >
                    Proceed Securely
                  </Button>
                </form>
              )}

              {rechargeStep === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5 text-left text-xs">
                  <div className="flex flex-col items-center gap-2 pb-2 text-center">
                    <div className="h-11 w-11 rounded-full bg-orange-100 flex items-center justify-center text-primary border border-orange-200 shrink-0">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-extrabold text-text-primary mt-1">Gateway Authentication</h3>
                    <p className="text-[10px] text-slate-400 max-w-xs">
                      A transaction SMS OTP has been dispatched to Rajesh Kumar's registered mobile number (...3210).
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-2">
                    <label className="text-xs font-semibold text-text-primary text-center">Enter 6-Digit SMS OTP</label>
                    <input
                      type="password"
                      maxLength={6}
                      required
                      value={otpVal}
                      onChange={(e) => setOtpVal(e.target.value)}
                      placeholder="Enter OTP (Use bypass 123456)"
                      disabled={isRecharging}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-bold tracking-widest text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                    />
                  </div>

                  <div className="text-[10px] text-center text-slate-400">
                    Didn't receive it? <button type="button" onClick={() => toast.success('Resent OTP to registered owner number.')} className="text-primary hover:underline font-bold">Resend OTP</button>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isRecharging}
                    className="w-full font-bold"
                  >
                    Confirm Top-up
                  </Button>
                </form>
              )}

              {rechargeStep === 'success' && (
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                  <div className="h-14 w-14 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                    <CheckCircle className="h-7 w-7" />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-extrabold text-slate-800">Recharge Successful!</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      Wallet topped up with ₹{parseFloat(rechargeAmt).toLocaleString('en-IN')}.
                    </p>
                    <span className="text-[9px] font-mono text-slate-400 mt-1">TXN ID: TXN-{Math.floor(100000 + Math.random() * 900000)}</span>
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={handleCloseModal}
                    className="w-full mt-4 font-bold"
                  >
                    Return to Wallet Console
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
