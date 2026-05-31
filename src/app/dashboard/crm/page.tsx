'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { toast } from '@/components/feedback/Toast';
import { Button } from '@/components/ui/Button';

export default function CRMPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'udhaar' | 'limits' | 'alerts' | 'history'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeClient, setActiveClient] = useState<any | null>(null);

  // Seed CRM Customers and credit balances
  const [customers, setCustomers] = useState([
    { id: 'CUST-301', name: 'Apex Logistics Inc.', type: 'Company', phone: '9876543220', email: 'billing@apex.com', creditLimit: '₹5,00,000', creditUsed: '₹3,42,850', paymentTerms: '15 Days', risk: 'high', vehicles: ['TS-08-EJ-9921', 'TS-08-EJ-9922'] },
    { id: 'CUST-302', name: 'GK Cabs Cluster', type: 'Fleet', phone: '9876543230', email: 'accounts@gkcabs.com', creditLimit: '₹2,00,000', creditUsed: '₹8,290', paymentTerms: 'Weekly', risk: 'low', vehicles: ['MH-12-PQ-3049'] },
    { id: 'CUST-303', name: 'Rajesh Kumar', type: 'Individual', phone: '9876543210', email: 'owner@fuelflux.com', creditLimit: '₹50,000', creditUsed: '₹0', paymentTerms: 'Cash/Direct', risk: 'low', vehicles: ['AP-09-CD-1234'] },
    { id: 'CUST-304', name: 'Elite Transport Carriers', type: 'Company', phone: '9876543240', email: 'ops@elitetrans.com', creditLimit: '₹8,00,000', creditUsed: '₹7,80,000', paymentTerms: '30 Days', risk: 'high', vehicles: ['KA-51-MM-8921'] },
  ]);

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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.name || !newCust.phone) {
      toast.error('Customer Name and Phone are required.');
      return;
    }

    const clientObj = {
      id: 'CUST-' + Math.floor(300 + Math.random() * 100),
      name: newCust.name,
      type: newCust.type,
      phone: newCust.phone,
      email: newCust.email || `${newCust.name.toLowerCase().replace(/ /g, '')}@fuelflux.com`,
      creditLimit: newCust.creditLimit,
      creditUsed: '₹0',
      paymentTerms: newCust.paymentTerms,
      risk: 'low' as const,
      vehicles: newCust.vehicles ? newCust.vehicles.split(',') : [],
    };

    setCustomers((prev) => [...prev, clientObj]);
    toast.success(`Registered Customer Profile: ${newCust.name}`);
    setIsAddModalOpen(false);
    setNewCust({
      name: '',
      phone: '',
      email: '',
      type: 'Company',
      creditLimit: '₹1,00,000',
      paymentTerms: '15 Days',
      vehicles: '',
    });
  };

  const triggerWhatsappWarning = (client: any) => {
    toast.success(`WhatsApp repayment reminder successfully dispatched to ${client.name} (${client.phone})!`);
  };

  const generateCreditVoucher = (client: any) => {
    const voucherCode = 'VCH-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    toast.success(`Issued credit voucher: ${voucherCode} for ${client.name}. Linked to vehicles: ${client.vehicles.join(', ')}`);
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

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-4.5 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 transition-all outline-none cursor-pointer"
        >
          <Plus className="h-4 w-4 shrink-0" />
          Add Credit Customer
        </button>
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
              placeholder="Search profiles, GST numbers..."
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
                {filteredCustomers
                  .filter((c) => {
                    if (activeTab === 'udhaar') return c.creditUsed !== '₹0';
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
                      <td className={`p-4 font-extrabold ${c.creditUsed !== '₹0' ? 'text-rose-500 font-mono' : 'text-slate-600'}`}>
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
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. CLIENT SLIDE-OUT LEDGER DETAIL DRAWER */}
      {activeClient && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setActiveClient(null)} />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto border-l border-slate-200 text-left z-50">
            <div className="flex flex-col gap-6">
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
                <div className="h-12 w-12 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center font-extrabold text-primary text-lg">
                  {activeClient.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-text-primary">{activeClient.name}</span>
                  <span className="text-xs text-text-secondary mt-0.5">{activeClient.email} • {activeClient.phone}</span>
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
                    <span className="text-[9px] font-bold text-text-secondary uppercase">Credit Used (Outstanding)</span>
                    <span className="font-bold text-rose-500 font-mono text-sm">{activeClient.creditUsed}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-text-secondary uppercase">Credit terms</span>
                    <span className="font-bold text-text-primary">{activeClient.paymentTerms}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-text-secondary uppercase">Linked Fleet Vehicles</span>
                    <span className="font-bold text-slate-600 font-mono break-all">{activeClient.vehicles.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions group */}
            <div className="flex flex-col gap-2 pt-6 border-t border-slate-100">
              <button
                onClick={() => triggerWarning(activeClient)}
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
              {/* Header */}
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

              {/* Form */}
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
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="flex-1 font-bold"
                  >
                    Register Account
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

// Simple legacy trigger helper wrapper for drawer clicks
function triggerWarning(client: any) {
  toast.success(`WhatsApp repayment reminder successfully dispatched to ${client.name} (${client.phone})!`);
}
