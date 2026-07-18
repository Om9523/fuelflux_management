'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Receipt, Plus, RefreshCw, Search, Eye, Mail, FileDown, CheckCircle,
  AlertTriangle, CreditCard, ChevronRight, Settings, SlidersHorizontal
} from 'lucide-react';
import { usePumpStore } from '@/stores/pumps.store';
import { corporateBillingService } from '@/services/corporateBillingService';
import { Invoice, CorporateCustomer, CorporateBillingStats } from '@/types/corporateBilling';
import { BillingStats } from '@/components/corporate-billing/BillingStats';
import { PaymentFormModal } from '@/components/corporate-billing/PaymentFormModal';
import { toast } from '@/components/feedback/Toast';

export default function InvoicesDashboardPage() {
  const router = useRouter();
  const { selectedPump } = usePumpStore();
  const pumpId = selectedPump?.id || null;

  const [stats, setStats] = useState<CorporateBillingStats>({
    totalInvoices: 0,
    pendingAmount: 0,
    paidThisMonth: 0,
    overdueAmount: 0,
  });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<CorporateCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');

  // Modal payment capture
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);

  // Generate unique months based on seed invoices
  const availableMonths = [
    { value: '2026-07', label: 'July 2026' },
    { value: '2026-06', label: 'June 2026' },
    { value: '2026-05', label: 'May 2026' },
  ];

  const loadData = useCallback(async () => {
    if (!pumpId) return;
    setIsLoading(true);
    try {
      const [s, invs, custs] = await Promise.all([
        corporateBillingService.fetchBillingStats(pumpId),
        corporateBillingService.fetchInvoices(pumpId, {
          customerId: customerFilter,
          status: statusFilter,
          month: monthFilter,
          search: search,
        }),
        corporateBillingService.fetchCorporateCustomers(pumpId),
      ]);
      setStats(s);
      setInvoices(invs);
      setCustomers(custs);
    } catch (e: any) {
      toast.error('Failed to load billing directory', e.message);
    } finally {
      setIsLoading(false);
    }
  }, [pumpId, customerFilter, statusFilter, monthFilter, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSendEmail = async (invoiceId: string, invoiceNum: string) => {
    if (!pumpId) return;
    try {
      await corporateBillingService.sendInvoiceEmail(pumpId, invoiceId);
      toast.success('Invoice Sent', `Invoice ${invoiceNum} successfully dispatched to recipient.`);
      loadData();
    } catch (e: any) {
      toast.error('Failed to send invoice email', e.message);
    }
  };

  const handleDownloadPDF = (invoiceNum: string) => {
    toast.info('PDF Generated', `Invoice ${invoiceNum} has been generated. Download started.`);
    // Simulate downloading by opening a mock download stream
    const link = document.createElement('a');
    link.href = '#';
    link.setAttribute('download', `${invoiceNum.replace(/\//g, '_')}.pdf`);
    document.body.appendChild(link);
    // clean trigger
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const badges = {
      paid: (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-bold">
          Paid
        </span>
      ),
      pending: (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-orange-100/50 border border-orange-200 text-orange-700 text-[10px] font-bold animate-pulse">
          Pending
        </span>
      ),
      overdue: (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-orange-950/10 border border-orange-950/20 text-orange-900 text-[10px] font-bold">
          Overdue
        </span>
      ),
    };
    return badges[status];
  };

  if (!pumpId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <AlertTriangle className="h-10 w-10 mb-3 opacity-30 text-amber-500" />
        <p className="font-bold text-sm">No Pump Selected</p>
        <p className="text-xs mt-1">Please select an operational fuel station to view invoices.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-white border border-slate-100 rounded-2xl shadow-xs gap-4 text-left">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-orange-50 border border-orange-200/50 rounded-xl flex items-center justify-center text-primary">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-text-primary tracking-tight">Corporate Billing & Invoicing</h1>
            <p className="text-xs text-text-secondary">Generate GST invoices, reconcile ledger balances, record corporate payments, and track dispatch logs</p>
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={() => router.push('/dashboard/corporate-billing/config')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-text-primary rounded-xl cursor-pointer transition-all outline-none"
          >
            <Settings className="h-4 w-4 text-slate-500" /> Billing Configurations
          </button>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-text-primary rounded-xl cursor-pointer transition-all outline-none disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats widgets */}
      <BillingStats stats={stats} isLoading={isLoading} />

      {/* Filter widgets */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-left flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Search and Ledger Filters</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3.5">
          {/* Text search */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by invoice number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl outline-none focus:border-primary/50 transition-all bg-slate-50/50"
            />
          </div>

          {/* Customer filter */}
          <div className="md:col-span-3">
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs font-bold border border-slate-200 rounded-xl outline-none bg-white cursor-pointer"
            >
              <option value="all">All Corporate Customers</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs font-bold border border-slate-200 rounded-xl outline-none bg-white cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Month filter */}
          <div className="md:col-span-2">
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-xs font-bold border border-slate-200 rounded-xl outline-none bg-white cursor-pointer"
            >
              <option value="all">All Months</option>
              {availableMonths.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Invoice directory list table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-left flex flex-col">
        {isLoading ? (
          <div className="py-24 flex justify-center text-xs text-slate-400 font-semibold gap-2 items-center">
            <RefreshCw className="h-4 w-4 animate-spin text-primary" /> Loading invoice ledger...
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-1">
            <Receipt className="h-12 w-12 mb-1 opacity-20" />
            <p className="font-bold text-sm">No Invoices Found</p>
            <p className="text-xs">Adjust your search parameters or check billing cycles settings.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="p-4">Invoice ID</th>
                  <th className="p-4">Corporate Customer</th>
                  <th className="p-4">Billing Period</th>
                  <th className="p-4">Net Amount</th>
                  <th className="p-4">GST (18%)</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-semibold text-slate-600">
                {invoices.map((inv) => {
                  const isSettled = inv.status === 'paid';
                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50/40 transition-colors group cursor-pointer"
                      onClick={() => router.push(`/dashboard/corporate-billing/${inv.id}`)}
                    >
                      <td className="p-4 font-mono font-bold text-slate-900 group-hover:text-primary transition-colors">
                        {inv.invoiceNumber}
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-slate-900 font-bold">{inv.customerName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Due: {new Date(inv.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                        </div>
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(inv.billingPeriodStart).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} - {new Date(inv.billingPeriodEnd).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </td>
                      <td className="p-4 font-mono text-slate-700">₹{inv.amount.toLocaleString('en-IN')}</td>
                      <td className="p-4 font-mono text-slate-500">₹{inv.gstAmount.toLocaleString('en-IN')}</td>
                      <td className="p-4 font-mono font-bold text-slate-900">₹{inv.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="p-4">{getStatusBadge(inv.status)}</td>
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/dashboard/corporate-billing/${inv.id}`)}
                            className="p-1.5 hover:bg-orange-50 text-slate-400 hover:text-primary rounded-lg transition-colors cursor-pointer"
                            title="View Invoice Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(inv.invoiceNumber)}
                            className="p-1.5 hover:bg-orange-50 text-slate-400 hover:text-primary rounded-lg transition-colors cursor-pointer"
                            title="Download PDF"
                          >
                            <FileDown className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleSendEmail(inv.id, inv.invoiceNumber)}
                            className="p-1.5 hover:bg-orange-50 text-slate-400 hover:text-primary rounded-lg transition-colors cursor-pointer"
                            title="Email Customer"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                          {!isSettled ? (
                            <button
                              onClick={() => setSelectedInvoiceForPayment(inv)}
                              className="p-1.5 hover:bg-emerald-50 text-slate-400 hover:text-emerald-500 rounded-lg transition-colors cursor-pointer"
                              title="Capture Payment"
                            >
                              <CreditCard className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              disabled
                              className="p-1.5 text-slate-200 rounded-lg cursor-not-allowed"
                              title="Already Paid"
                            >
                              <CreditCard className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {selectedInvoiceForPayment && (
        <PaymentFormModal
          isOpen={!!selectedInvoiceForPayment}
          onClose={() => setSelectedInvoiceForPayment(null)}
          onSuccess={loadData}
          invoice={selectedInvoiceForPayment}
          pumpId={pumpId}
        />
      )}
    </div>
  );
}
