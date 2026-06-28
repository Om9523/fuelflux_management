'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Notebook,
  Plus,
  Search,
  Users,
  AlertTriangle,
  Clock,
  User,
  MessageSquare,
  FileText,
  Building,
  CheckCircle,
  X,
  CreditCard,
  Ban,
  Coins,
  Trash2,
  History,
  ChevronDown,
  ChevronUp,
  IndianRupee,
  RefreshCw,
} from 'lucide-react';
import { toast } from '@/components/feedback/Toast';
import { Button } from '@/components/ui/Button';
import { usePumpStore } from '@/stores/pumps.store';
import { crmService, UdhaarHistoryItem } from '@/services/crm.service';

export default function CRMPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'udhaar' | 'limits' | 'alerts' | 'history'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeClient, setActiveClient] = useState<any | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [udhaarFuelType, setUdhaarFuelType] = useState('');
  const [udhaarVolume, setUdhaarVolume] = useState('');

  // Udhaar transaction states (drawer inline)
  const [udhaarAmount, setUdhaarAmount] = useState('');
  const [udhaarDesc, setUdhaarDesc] = useState('');
  const [isUdhaarSubmitting, setIsUdhaarSubmitting] = useState(false);

  // Udhaar history states (drawer)
  const [udhaarHistory, setUdhaarHistory] = useState<UdhaarHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Udhaar Modal states
  const [isRecordUdhaarModalOpen, setIsRecordUdhaarModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [modalUdhaarAmount, setModalUdhaarAmount] = useState('');
  const [modalUdhaarDesc, setModalUdhaarDesc] = useState('');

  const { selectedPump } = usePumpStore();
  const [modalFuelType, setModalFuelType] = useState('');
  const [modalVolume, setModalVolume] = useState('');

  // ─── Load CRM customers ──────────────────────────────────────────────────────
  const loadCrmData = useCallback(async () => {
    if (!selectedPump) return;

    setIsLoading(true);

    try {
      const backendCustomers = await crmService.getCustomers(
        selectedPump.id
      );

      const mapped = backendCustomers.map((c) => ({
        id: `CUST-${c.id}`,
        dbId: c.id,
        name: c.name,
        type: c.is_fleet ? 'Fleet' : 'Individual',
        phone: c.phone || '',
        email: `${c.name.toLowerCase().replace(/ /g, '')}@fuelflux.com`,
        creditLimit: `₹${c.credit_limit.toLocaleString('en-IN')}`,
        creditLimitRaw: c.credit_limit,
        creditUsed: `₹${c.outstanding_amount.toLocaleString('en-IN')}`,
        creditUsedRaw: c.outstanding_amount,
        paymentTerms: c.is_fleet ? '15 Days' : 'Cash/Direct',
        risk:
          c.outstanding_amount > c.credit_limit * 0.8
            ? 'high'
            : 'low',
        vehicles: c.vehicle_plate ? [c.vehicle_plate] : [],
      }));

      setCustomers(mapped);
    } catch (err: any) {
      console.error('Failed to load CRM data:', err);
      toast.error(err.message || 'Failed to load CRM data.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedPump]);

  useEffect(() => {
    loadCrmData();
  }, [loadCrmData]);

  // ─── Load udhaar history when drawer opens ───────────────────────────────────
  const loadUdhaarHistory = useCallback(async (customerId: string) => {
    setIsHistoryLoading(true);
    try {
      const history = await crmService.getUdhaarHistory(customerId);
      setUdhaarHistory(history);
    } catch (err: any) {
      console.error('Failed to load udhaar history:', err);
      toast.error('Could not load udhaar history.');
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  // When activeClient changes, reset history panel and reload
  useEffect(() => {
    if (!activeClient) {
      setUdhaarHistory([]);
      setIsHistoryOpen(false);
      return;
    }
    loadUdhaarHistory(activeClient.dbId);
  }, [activeClient, loadUdhaarHistory]);

  // ─── New customer form state ─────────────────────────────────────────────────
  const [newCust, setNewCust] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'Company',
    creditLimit: '₹1,00,000',
    paymentTerms: '15 Days',
    vehicles: '',
  });

  const handleInputChange = (field: string, val: string) => {
    setNewCust((prev) => ({ ...prev, [field]: val }));
  };

  // ─── Add customer ────────────────────────────────────────────────────────────
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.name || !newCust.phone) {
      toast.error('Customer Name and Phone are required.');
      return;
    }
    if (!selectedPump) {
      toast.error('Please select an active pump first.');
      return;
    }

    const rawLimit = parseFloat(newCust.creditLimit.replace(/[^\d.]/g, '')) || 0;
    const vehiclePlate = newCust.vehicles ? newCust.vehicles.split(',')[0]?.trim() : '';
    if (!vehiclePlate) {
      toast.error('At least one vehicle registration plate is required.');
      return;
    }

    try {
      setIsLoading(true);
      const newCustomer = await crmService.addCustomer({
        name: newCust.name,
        phone: newCust.phone,
        vehicle_plate: vehiclePlate,
        vehicle_type: newCust.type,
        credit_limit: rawLimit,
        is_fleet: newCust.type === 'Fleet' || newCust.type === 'Company',
        pump_id: selectedPump.id,
      });

      const mappedNew = {
        id: `CUST-${newCustomer.id}`,
        dbId: newCustomer.id,
        name: newCustomer.name,
        type: newCustomer.is_fleet ? 'Fleet' : 'Individual',
        phone: newCustomer.phone || '',
        email: `${newCustomer.name.toLowerCase().replace(/ /g, '')}@fuelflux.com`,
        creditLimit: `₹${newCustomer.credit_limit.toLocaleString('en-IN')}`,
        creditLimitRaw: newCustomer.credit_limit,
        creditUsed: `₹${newCustomer.outstanding_amount.toLocaleString('en-IN')}`,
        creditUsedRaw: newCustomer.outstanding_amount,
        paymentTerms: newCustomer.is_fleet ? '15 Days' : 'Cash/Direct',
        risk: newCustomer.outstanding_amount > newCustomer.credit_limit * 0.8 ? 'high' : 'low',
        vehicles: newCustomer.vehicle_plate ? [newCustomer.vehicle_plate] : [],
      };

      setCustomers((prev) => [...prev, mappedNew]);
      toast.success(`Registered Customer Profile: ${newCust.name}`);
      setIsAddModalOpen(false);
      setNewCust({ name: '', phone: '', email: '', type: 'Company', creditLimit: '₹1,00,000', paymentTerms: '15 Days', vehicles: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to register customer on backend.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Helper: update customer outstanding in state ────────────────────────────
  const updateCustomerOutstanding = (clientId: string, deltaAmount: number) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        const newUsed = Math.max(0, c.creditUsedRaw + deltaAmount);
        return {
          ...c,
          creditUsedRaw: newUsed,
          creditUsed: `₹${newUsed.toLocaleString('en-IN')}`,
          risk: newUsed > c.creditLimitRaw * 0.8 ? 'high' : 'low',
        };
      })
    );
    if (activeClient && activeClient.id === clientId) {
      const newUsed = Math.max(0, activeClient.creditUsedRaw + deltaAmount);
      setActiveClient((prev: any) => ({
        ...prev,
        creditUsedRaw: newUsed,
        creditUsed: `₹${newUsed.toLocaleString('en-IN')}`,
        risk: newUsed > prev.creditLimitRaw * 0.8 ? 'high' : 'low',
      }));
    }
  };

  // ─── Drawer: Add udhaar ──────────────────────────────────────────────────────
  const handleRecordUdhaar = async () => {
    if (!activeClient || !selectedPump) return;
    const amountVal = parseFloat(udhaarAmount.replace(/[^\d.]/g, ''));
    if (isNaN(amountVal) || amountVal <= 0) {
      toast.error('Please enter a valid positive amount.');
      return;
    }

    try {
      setIsUdhaarSubmitting(true);
      await crmService.addUdhaar({
        customer_id: activeClient.dbId,
        amount: amountVal,
        description: udhaarDesc || 'Fuel purchase',
        pump_id: selectedPump.id,
        udhaar_type: 'manual',
        fuel_type: udhaarFuelType || null,
        volume: udhaarVolume ? parseFloat(udhaarVolume) : null,
      });

      toast.success(`Udhaar ₹${amountVal.toLocaleString('en-IN')} recorded for ${activeClient.name}`);
      updateCustomerOutstanding(activeClient.id, amountVal);

      // Reload history
      await loadUdhaarHistory(activeClient.dbId);

      setUdhaarAmount('');
      setUdhaarDesc('');
      setUdhaarFuelType('');
      setUdhaarVolume('');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to record udhaar on backend.');
    } finally {
      setIsUdhaarSubmitting(false);
    }
  };

  // ─── Drawer: Delete udhaar ───────────────────────────────────────────────────
  const handleDeleteUdhaar = async (udhaarId: string, amount: number) => {
    if (!activeClient) return;
    try {
      setDeletingId(udhaarId);
      await crmService.deleteUdhaar(udhaarId);

      // Remove from history list
      setUdhaarHistory((prev) => prev.filter((u) => u.id !== udhaarId));

      // Update outstanding in state
      updateCustomerOutstanding(activeClient.id, -amount);

      toast.success('Udhaar entry deleted successfully.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete udhaar entry.');
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Modal: Add udhaar ───────────────────────────────────────────────────────
  const handleModalUdhaarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      toast.error('Please select a customer.');
      return;
    }
    if (!selectedPump) {
      toast.error('Please select an active pump first.');
      return;
    }

    const amountVal = parseFloat(modalUdhaarAmount.replace(/[^\d.]/g, ''));
    if (isNaN(amountVal) || amountVal <= 0) {
      toast.error('Please enter a valid positive amount.');
      return;
    }

    const targetCustomer = customers.find((c) => c.id === selectedCustomerId);
    if (!targetCustomer) {
      toast.error('Selected customer not found.');
      return;
    }

    try {
      setIsUdhaarSubmitting(true);
      await crmService.addUdhaar({
        customer_id: targetCustomer.dbId,
        amount: amountVal,
        description: modalUdhaarDesc || 'Fuel purchase',
        pump_id: selectedPump.id,           // ← pump_id fixed
        udhaar_type: 'manual',
        fuel_type: modalFuelType || null,
        volume: modalVolume ? parseFloat(modalVolume) : null,
      });

      toast.success(`Udhaar ₹${amountVal.toLocaleString('en-IN')} recorded for ${targetCustomer.name}`);
      updateCustomerOutstanding(selectedCustomerId, amountVal);

      setIsRecordUdhaarModalOpen(false);
      setSelectedCustomerId('');
      setModalUdhaarAmount('');
      setModalUdhaarDesc('');
      setModalFuelType('');
      setModalVolume('');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to record udhaar on backend.');
    } finally {
      setIsUdhaarSubmitting(false);
    }
  };

  const triggerWhatsappWarning = (client: any) => {
    toast.success(`WhatsApp reminder dispatched to ${client.name} (${client.phone})!`);
  };

  const generateCreditVoucher = (client: any) => {
    const voucherCode = 'VCH-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    toast.success(`Issued credit voucher: ${voucherCode} for ${client.name}. Linked to: ${client.vehicles.join(', ')}`);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800">
      {/* 1. MODULE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 rounded-2xl p-6 shadow-xs gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 border border-orange-200 text-primary">
            <Notebook className="h-5.5 w-5.5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold text-text-primary tracking-tight">CRM & Udhaar Ledgers</h1>
            <p className="text-xs text-text-secondary">Oversee business client files, assign credit ceilings, audit ledger payments, and trigger warnings</p>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={loadCrmData}
            disabled={isLoading}
            title="Refresh customer list"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-500 transition-all outline-none cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>
          <button
            onClick={() => setIsRecordUdhaarModalOpen(true)}
            className="inline-flex flex-1 sm:flex-none justify-center items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 px-4.5 py-2.5 text-xs font-bold text-primary transition-all outline-none cursor-pointer"
          >
            <Coins className="h-4 w-4 shrink-0 text-primary" />
            Record Udhaar
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex flex-1 sm:flex-none justify-center items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-4.5 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 transition-all outline-none cursor-pointer"
          >
            <Plus className="h-4 w-4 shrink-0" />
            Add Credit Customer
          </button>
        </div>
      </div>

      {/* 2. TABBED PANEL CONTROL */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200/60 shadow-xs max-w-lg select-none">
        {[
          { id: 'all', label: 'All Accounts', icon: <Users className="h-3.5 w-3.5" /> },
          { id: 'udhaar', label: 'Udhaar Summary', icon: <Coins className="h-3.5 w-3.5" /> },
          { id: 'alerts', label: 'Risk & Overdue', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
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

      {/* 3. WIDGET DIRECTORY CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col gap-6">
          {/* Search box */}
          <div className="flex items-center relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search profiles, vehicle plates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 font-extrabold text-text-secondary">
                  <th className="p-4 uppercase tracking-wider">Customer ID</th>
                  <th className="p-4 uppercase tracking-wider">Account name</th>
                  <th className="p-4 uppercase tracking-wider">Type</th>
                  <th className="p-4 uppercase tracking-wider">Outstanding Udhaar</th>
                  <th className="p-4 uppercase tracking-wider">Assigned Credit Limit</th>
                  <th className="p-4 uppercase tracking-wider">Payment Terms</th>
                  <th className="p-4 uppercase tracking-wider">Risk Level</th>
                  <th className="p-4 uppercase tracking-wider">Linked Vehicles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-text-primary">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                      <div className="flex justify-center items-center gap-2">
                        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        Loading CRM customers...
                      </div>
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                      No customer profiles found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers
                    .filter((c) => {
                      if (activeTab === 'udhaar') return c.creditUsedRaw > 0;
                      if (activeTab === 'alerts') return c.risk === 'high';
                      return true;
                    })
                    .map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => {
                          setActiveClient(c);
                          toast.info(`Opened credit details for ${c.name}`);
                        }}
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                      >
                        <td className="p-4 font-mono font-bold text-primary">{c.id}</td>
                        <td className="p-4 font-bold">{c.name}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-slate-50 border border-slate-200/50 rounded-lg font-bold text-[10px] text-slate-600">
                            {c.type}
                          </span>
                        </td>
                        <td className={`p-4 font-extrabold ${c.creditUsedRaw > 0 ? 'text-rose-500 font-mono' : 'text-slate-600'}`}>
                          {c.creditUsed}
                        </td>
                        <td className="p-4 font-bold text-slate-700 font-mono">{c.creditLimit}</td>
                        <td className="p-4">{c.paymentTerms}</td>
                        <td className="p-4">
                          {c.risk === 'high' ? (
                            <span className="px-2.5 py-1 bg-red-50 border border-red-100 text-red-600 font-bold text-[9px] rounded-lg flex items-center gap-1 w-fit">
                              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                              CRITICAL RISK
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-[9px] rounded-lg flex items-center gap-1 w-fit">
                              <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                              LOW RISK
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-text-secondary font-mono tracking-tight truncate max-w-[150px]">
                          {c.vehicles.join(', ')}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. CLIENT SLIDE-OUT LEDGER DETAIL DRAWER */}
      {activeClient && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setActiveClient(null)} />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 z-50">
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col gap-6">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Notebook className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-extrabold text-text-primary">Ledger Sheet</h3>
                </div>
                <button
                  onClick={() => setActiveClient(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-50 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Client Profile overview */}
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl shadow-xs">
                <div className="h-12 w-12 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center font-extrabold text-primary text-lg shrink-0">
                  {activeClient.name.charAt(0)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-extrabold text-text-primary">{activeClient.name}</span>
                  <span className="text-xs text-text-secondary mt-0.5 truncate">{activeClient.email} • {activeClient.phone}</span>
                  <span className="text-[10px] text-slate-400 font-mono tracking-tight mt-1">{activeClient.id}</span>
                </div>
              </div>

              {/* Credit Status details */}
              <div className="flex flex-col gap-4 text-xs">
                <h4 className="font-extrabold text-text-primary uppercase tracking-wider border-b border-slate-50 pb-2">Credit Parameters</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-text-secondary uppercase">Assigned Credit Limit</span>
                    <span className="font-bold text-text-primary font-mono text-sm">{activeClient.creditLimit}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-text-secondary uppercase">Outstanding Udhaar</span>
                    <span className={`font-bold font-mono text-sm ${activeClient.creditUsedRaw > 0 ? 'text-rose-500' : 'text-slate-600'}`}>
                      {activeClient.creditUsed}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-text-secondary uppercase">Credit Terms</span>
                    <span className="font-bold text-text-primary">{activeClient.paymentTerms}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-text-secondary uppercase">Linked Vehicles</span>
                    <span className="font-bold text-slate-600 font-mono break-all">{activeClient.vehicles.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Record Udhaar Section */}
              <div className="flex flex-col gap-3 text-xs border-t border-slate-100 pt-4">
                <h4 className="font-extrabold text-text-primary uppercase tracking-wider pb-1 flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-orange-500" />
                  Record Udhaar Transaction
                </h4>

                {/* Row 1 — Amount + Fuel Type + Volume */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Amount (₹)"
                    value={udhaarAmount}
                    onChange={(e) => setUdhaarAmount(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                  />
                  <select
                    value={udhaarFuelType}
                    onChange={(e) => setUdhaarFuelType(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  >
                    <option value="">Fuel Type</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="CNG">CNG</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Litres (L)"
                    value={udhaarVolume}
                    onChange={(e) => setUdhaarVolume(e.target.value)}
                    className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                  />
                </div>

                {/* Row 2 — Note + Submit */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Note (e.g. Fuel purchase)"
                    value={udhaarDesc}
                    onChange={(e) => setUdhaarDesc(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                  <button
                    onClick={handleRecordUdhaar}
                    disabled={isUdhaarSubmitting}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-sm outline-none transition-all cursor-pointer disabled:bg-slate-300 shrink-0"
                  >
                    {isUdhaarSubmitting ? (
                      <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : 'Add'}
                  </button>
                </div>
              </div>
              {/* ── Udhaar History Collapsible ─────────────────────────────────── */}
              <div className="flex flex-col gap-0 text-xs border border-slate-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setIsHistoryOpen((prev) => !prev)}
                  className="flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer outline-none"
                >
                  <div className="flex items-center gap-2 font-extrabold text-text-primary uppercase tracking-wider text-[10px]">
                    <History className="h-3.5 w-3.5 text-slate-500" />
                    Udhaar History
                    {udhaarHistory.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-md font-bold text-[9px]">
                        {udhaarHistory.length}
                      </span>
                    )}
                  </div>
                  {isHistoryOpen ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </button>

                <AnimatePresence>
                  {isHistoryOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col divide-y divide-slate-100 max-h-64 overflow-y-auto">
                        {isHistoryLoading ? (
                          <div className="flex items-center justify-center gap-2 p-6 text-slate-400 font-bold text-xs">
                            <div className="h-3.5 w-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            Loading history...
                          </div>
                        ) : udhaarHistory.length === 0 ? (
                          <div className="p-6 text-center text-slate-400 font-semibold text-xs">
                            No udhaar transactions yet.
                          </div>
                        ) : (
                          udhaarHistory.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors group"
                            >
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <IndianRupee className="h-3 w-3 text-rose-400 shrink-0" />
                                  <span className="font-mono font-extrabold text-rose-500 text-xs">
                                    {item.amount.toLocaleString('en-IN')}
                                  </span>
                                  {item.fuel_type && (
                                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase">
                                      {item.fuel_type}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 truncate">
                                  {item.remarks || 'Fuel purchase'} •{' '}
                                  {item.used_at
                                    ? new Date(item.used_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                    : '—'}
                                </span>
                              </div>

                              {/* Delete button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteUdhaar(item.id, item.amount);
                                }}
                                disabled={deletingId === item.id}
                                className="ml-3 p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all outline-none cursor-pointer shrink-0 disabled:opacity-50"
                                title="Delete udhaar entry"
                              >
                                {deletingId === item.id ? (
                                  <div className="h-3.5 w-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Fixed bottom action buttons */}
            <div className="flex flex-col gap-2 p-6 sm:px-8 border-t border-slate-100 bg-white shrink-0">
              <button
                onClick={() => triggerWhatsappWarning(activeClient)}
                className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all outline-none cursor-pointer"
              >
                <MessageSquare className="h-4.5 w-4.5" />
                Trigger WhatsApp Reminder
              </button>

              <button
                onClick={() => generateCreditVoucher(activeClient)}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 transition-all outline-none cursor-pointer"
              >
                <FileText className="h-4.5 w-4.5" />
                Issue Digital Credit Voucher
              </button>

              <button
                onClick={() => {
                  toast.error(`Blocked credit profile for ${activeClient.name}`);
                  setActiveClient(null);
                }}
                className="w-full py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all outline-none cursor-pointer"
              >
                <Ban className="h-4.5 w-4.5" />
                Suspend Account Credit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. ADD CUSTOMER MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsAddModalOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 z-10 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-base font-extrabold text-text-primary flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" /> Onboard Credit Customer
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-50 text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="flex flex-col gap-5 text-left text-xs">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-text-primary">Customer Name / Company</label>
                    <input
                      type="text"
                      required
                      value={newCust.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g. Elite Carriers Inc."
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-text-primary">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={newCust.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="9876543240"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-text-primary">Customer Type</label>
                    <select
                      value={newCust.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer font-bold"
                    >
                      <option value="Company">Company</option>
                      <option value="Fleet">Fleet Owner</option>
                      <option value="Individual">Individual</option>
                      <option value="Retail">Retail</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-text-primary">Credit Limit (INR)</label>
                    <input
                      type="text"
                      required
                      value={newCust.creditLimit}
                      onChange={(e) => handleInputChange('creditLimit', e.target.value)}
                      placeholder="₹2,00,000"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-text-primary">Payment Roster Terms</label>
                    <select
                      value={newCust.paymentTerms}
                      onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer font-bold"
                    >
                      <option value="15 Days">15 Days (Bi-weekly)</option>
                      <option value="30 Days">30 Days (Monthly)</option>
                      <option value="Weekly">Weekly (7 Days)</option>
                      <option value="Cash/Direct">Immediate / Cash direct</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-text-primary">Linked Vehicles (Comma Separated)</label>
                    <input
                      type="text"
                      value={newCust.vehicles}
                      onChange={(e) => handleInputChange('vehicles', e.target.value)}
                      placeholder="e.g. AP-09-CD-1234, TS-08-EJ-9922"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-4 shrink-0 border-t border-slate-100 pt-4">
                  <Button type="button" variant="outline" size="lg" onClick={() => setIsAddModalOpen(false)} className="flex-1 font-bold">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="flex-1 font-bold">
                    Register Account
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. RECORD UDHAAR MODAL */}
      <AnimatePresence>
        {isRecordUdhaarModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsRecordUdhaarModalOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 z-10 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-base font-extrabold text-text-primary flex items-center gap-2 font-plus-jakarta">
                  <Coins className="h-5 w-5 text-orange-500" /> Record Udhaar Transaction
                </h3>
                <button
                  onClick={() => setIsRecordUdhaarModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-50 text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <form onSubmit={handleModalUdhaarSubmit} className="flex flex-col gap-5 text-left text-xs">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-primary">Select Customer</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer font-bold"
                  >
                    <option value="">-- Select Customer --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-primary">Udhaar Amount (INR)</label>
                  <input
                    type="text"
                    required
                    value={modalUdhaarAmount}
                    onChange={(e) => setModalUdhaarAmount(e.target.value)}
                    placeholder="₹5,000"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-text-primary">Fuel Type</label>
                    <select
                      value={modalFuelType}
                      onChange={(e) => setModalFuelType(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                    >
                      <option value="">Select Fuel</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Petrol">Petrol</option>
                      <option value="CNG">CNG</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-text-primary">Volume (Litres)</label>
                    <input
                      type="text"
                      value={modalVolume}
                      onChange={(e) => setModalVolume(e.target.value)}
                      placeholder="e.g. 50"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-primary">Description / Note</label>
                  {/* existing description input */}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-text-primary">Description / Note</label>
                  <input
                    type="text"
                    value={modalUdhaarDesc}
                    onChange={(e) => setModalUdhaarDesc(e.target.value)}
                    placeholder="e.g. Diesel purchase 50L"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-text-primary outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div className="flex gap-3 mt-4 shrink-0 border-t border-slate-100 pt-4">
                  <Button type="button" variant="outline" size="lg" onClick={() => setIsRecordUdhaarModalOpen(false)} className="flex-1 font-bold">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="lg" isLoading={isUdhaarSubmitting} className="flex-1 font-bold">
                    Add Udhaar
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