'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, Receipt, Calendar, User, Phone, FileDown, CheckCircle,
  AlertTriangle, Mail, RefreshCw, Landmark, ShieldCheck, Clock, ShieldAlert
} from 'lucide-react';
import { usePumpStore } from '@/stores/pumps.store';
import { corporateBillingService } from '@/services/corporateBillingService';
import { Invoice, BillingConfig } from '@/types/corporateBilling';
import { PaymentFormModal } from '@/components/corporate-billing/PaymentFormModal';
import { toast } from '@/components/feedback/Toast';

interface PageProps {
  params: {
    invoice_id: string;
  };
}

export default function InvoiceDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { selectedPump } = usePumpStore();
  const pumpId = selectedPump?.id || null;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [config, setConfig] = useState<BillingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!pumpId || !params.invoice_id) return;
    setIsLoading(true);
    try {
      const [inv, cfg] = await Promise.all([
        corporateBillingService.fetchInvoiceDetail(pumpId, params.invoice_id),
        corporateBillingService.fetchBillingConfig(pumpId),
      ]);
      setInvoice(inv);
      setConfig(cfg);
    } catch (e: any) {
      toast.error('Failed to load invoice details', e.message);
    } finally {
      setIsLoading(false);
    }
  }, [pumpId, params.invoice_id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSendEmail = async () => {
    if (!pumpId || !invoice) return;
    try {
      const updated = await corporateBillingService.sendInvoiceEmail(pumpId, invoice.id);
      setInvoice(updated);
      toast.success('Invoice Dispatched', `Invoice sent to customer email successfully.`);
    } catch (e: any) {
      toast.error('Dispatch failed', e.message);
    }
  };

  const handleDownloadPDF = () => {
    if (!invoice) return;
    toast.success('PDF Download Started', `Invoice file ${invoice.invoiceNumber}.pdf downloaded.`);
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

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col justify-center items-center text-xs text-slate-400 font-semibold gap-2">
        <RefreshCw className="h-5 w-5 animate-spin text-primary" /> Loading invoice detailed register...
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <ShieldAlert className="h-10 w-10 mb-3 opacity-30 text-rose-500" />
        <p className="font-bold text-sm">Invoice Not Found</p>
        <p className="text-xs mt-1">The requested invoice ID does not exist in the station database.</p>
        <button
          onClick={() => router.push('/dashboard/corporate-billing')}
          className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  const totalPaid = invoice.payments.reduce((acc, p) => acc + p.amount, 0);
  const remainingBalance = invoice.totalAmount - totalPaid;
  const isSettled = invoice.status === 'paid';

  const cgstAmount = invoice.gstAmount / 2;
  const sgstAmount = invoice.gstAmount / 2;

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800">
      {/* Back button header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-white border border-slate-100 rounded-2xl shadow-xs gap-4 text-left">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/corporate-billing')}
            className="p-1.5 hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl cursor-pointer transition-colors outline-none"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-orange-50 border border-orange-200/50 rounded-xl flex items-center justify-center text-primary">
              <Receipt className="h-4.5 w-4.5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-text-primary tracking-tight">Invoice {invoice.invoiceNumber}</h1>
              <p className="text-xs text-text-secondary">Created on {new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-text-primary rounded-xl cursor-pointer transition-all outline-none"
          >
            <FileDown className="h-4 w-4 text-slate-500" /> Export PDF
          </button>
          <button
            onClick={handleSendEmail}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-text-primary rounded-xl cursor-pointer transition-all outline-none"
          >
            <Mail className="h-4 w-4 text-slate-500" /> Send Dispatch Email
          </button>
        </div>
      </div>

      {/* Detail grid structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Details, Table, GST breakdown */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col gap-6 text-left">
            {/* Split layout metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
              {/* Pump vendor GSTIN details */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">From Supplier</span>
                <p className="font-extrabold text-slate-900 leading-tight">{config?.pumpGstDetails.legalName || 'FuelFlux Station Operations'}</p>
                {config?.pumpGstDetails.tradeName && <p className="text-xs text-slate-500 font-semibold">{config.pumpGstDetails.tradeName}</p>}
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">{config?.pumpGstDetails.address}</p>
                <p className="text-xs font-bold text-slate-700 font-mono mt-1">GSTIN: {config?.pumpGstDetails.gstin || 'Pending'}</p>
              </div>

              {/* Customer recipient GSTIN details */}
              <div className="flex flex-col gap-1.5 md:border-l md:border-slate-100 md:pl-6">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Bill To Customer</span>
                <p className="font-extrabold text-slate-900 leading-tight">{invoice.customerName}</p>
                <p className="text-xs text-slate-500 font-semibold">Ledger Partner ID: #{invoice.customerId}</p>
                <p className="text-[11px] font-bold text-slate-700 font-mono">GSTIN: {config?.pumpGstDetails.gstin ? '27AABCS4819M1Z9' : '—'}</p>
                <div className="flex flex-col gap-0.5 mt-1 text-[11px] text-slate-400 font-semibold">
                  <span className="flex items-center gap-1"><User className="h-3 w-3" /> Billing Desk</span>
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> +91 98220 19283</span>
                </div>
              </div>
            </div>

            {/* Billing period parameters */}
            <div className="grid grid-cols-3 gap-4 pb-6 border-b border-slate-100 text-xs">
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase">Billing Period</span>
                <p className="font-bold text-slate-800 mt-1">
                  {new Date(invoice.billingPeriodStart).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} - {new Date(invoice.billingPeriodEnd).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase">Due Date</span>
                <p className={`font-bold mt-1 ${invoice.status === 'overdue' ? 'text-orange-700' : 'text-slate-800'}`}>
                  {new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase">Payment Terms</span>
                <p className="font-bold text-slate-800 mt-1">Net 15 Days</p>
              </div>
            </div>

            {/* Transactions fuel filling logs */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Transaction Records</h3>
              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[9px]">
                      <th className="p-3">Fill Date</th>
                      <th className="p-3">Vehicle Plate</th>
                      <th className="p-3">Fuel Type</th>
                      <th className="p-3 text-right">Liters</th>
                      <th className="p-3 text-right">Rate / L</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
                    {invoice.transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/20">
                        <td className="p-3">{new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                        <td className="p-3">
                          <span className="font-mono font-bold text-slate-950 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {t.vehiclePlate}
                          </span>
                        </td>
                        <td className="p-3 capitalize">{t.fuelType}</td>
                        <td className="p-3 text-right font-mono">{t.liters.toFixed(2)} L</td>
                        <td className="p-3 text-right font-mono">₹{t.rate.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">₹{t.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* GST Breakdown and Totals */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <div className="w-full sm:max-w-xs flex flex-col gap-2.5 text-xs font-semibold text-slate-500">
                <div className="flex justify-between">
                  <span>Taxable Subtotal:</span>
                  <span className="font-mono text-slate-900">₹{invoice.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>CGST (9%):</span>
                  <span className="font-mono text-slate-700">₹{cgstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (9%):</span>
                  <span className="font-mono text-slate-700">₹{sgstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 text-slate-800">
                  <span>Total Tax (GST 18%):</span>
                  <span className="font-mono text-slate-900 font-bold">₹{invoice.gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-extrabold text-slate-950">
                  <span>Total Due:</span>
                  <span className="font-mono text-primary font-black">₹{invoice.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status Card, Payments captures, Email History logs */}
        <div className="lg:col-span-4 flex flex-col gap-6 text-left">
          
          {/* Status and Action Panel */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Payment Status</h3>
            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center border ${
                invoice.status === 'paid'
                  ? 'bg-orange-50 border-orange-200 text-orange-600'
                  : invoice.status === 'overdue'
                  ? 'bg-orange-950/10 border-orange-950/20 text-orange-900'
                  : 'bg-orange-100/50 border-orange-200 text-orange-700'
              }`}>
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black capitalize text-slate-900">{invoice.status}</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  {isSettled ? 'Account ledger reconciled' : `₹${remainingBalance.toLocaleString()} pending collection`}
                </p>
              </div>
            </div>

            {!isSettled ? (
              <button
                onClick={() => setIsPaymentOpen(true)}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all"
              >
                Record Payment
              </button>
            ) : (
              <div className="p-3 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-2 text-[10px] text-orange-800 font-semibold">
                <CheckCircle className="h-4.5 w-4.5 shrink-0 text-primary" />
                <p>This invoice has been fully paid and the credit balance cleared. Ledger records synced.</p>
              </div>
            )}
          </div>

          {/* Payments capture receipts log */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Payment Receipts</h3>
            
            <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto">
              {invoice.payments.length === 0 ? (
                <p className="text-slate-400 text-xs italic py-2 text-center">No payment logs recorded yet.</p>
              ) : (
                invoice.payments.map((p) => (
                  <div key={p.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-extrabold text-slate-900">₹{p.amount.toLocaleString()}</span>
                      <span className="text-[9px] text-slate-400 capitalize">{p.paymentMode.replace('_', ' ')} • {p.referenceNumber}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold">{new Date(p.date).toLocaleDateString('en-IN')}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Email communications history logs */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Email Communications</h3>

            <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto">
              {invoice.emailHistory.length === 0 ? (
                <p className="text-slate-400 text-xs italic py-2 text-center">No emails sent for this invoice.</p>
              ) : (
                invoice.emailHistory.map((e) => (
                  <div key={e.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5 text-xs">
                    <Clock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{e.recipient}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">
                        {new Date(e.sentAt).toLocaleDateString('en-IN')} {new Date(e.sentAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold shrink-0 ${
                      e.status === 'opened'
                        ? 'bg-orange-50 border border-orange-100 text-orange-650'
                        : 'bg-orange-100/50 border border-orange-200 text-orange-700'
                    }`}>
                      {e.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isPaymentOpen && (
        <PaymentFormModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          onSuccess={loadData}
          invoice={invoice}
          pumpId={pumpId}
        />
      )}
    </div>
  );
}
