'use client';

import React, { useEffect, useState } from 'react';
import { Search, RefreshCw, CheckCircle, CreditCard, Banknote } from 'lucide-react';
import { toast } from '@/components/feedback/Toast';
import backendApi from '@/lib/backendApi';

interface Payment {
  id: string;
  amount: number;
  payment_type: string;
  transaction_reference: string | null;
  status: string;
  requested_at: string | null;
  logistic_partner: { id: string; name: string; email: string; phone: string };
  pump: { id: string; name: string };
  pump_owner: { id: string; name: string; email: string };
}

interface SubPayment {
  id: string;
  amount: number;
  currency: string;
  billing_cycle: string;
  status: string;
  razorpay_payment_id: string | null;
  pump_id: string;
  pump_name?: string;
  plan_id: string;
  plan_name?: string;
  owner_name?: string;
  paid_at: string | null;
  created_at: string | null;
}

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<'credit' | 'subscription'>('credit');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subPayments, setSubPayments] = useState<SubPayment[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [markingId, setMarkingId] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await backendApi.get('/admin/payments/pending');
      setPayments(res.data.data?.payments || []);
    } catch { toast.error('Failed to load credit payments.'); }
    finally { setLoading(false); }
  };

  const fetchSubPayments = async () => {
    setLoading(true);
    try {
      const res = await backendApi.get('/admin/subscription-payments');
      setSubPayments(res.data.data?.payments || []);
    } catch { toast.error('Failed to load subscription payments.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (activeTab === 'credit') fetchPayments();
    else fetchSubPayments();
  }, [activeTab]);

  const handleMarkPaid = async (id: string) => {
    setMarkingId(id);
    try {
      await backendApi.post(`/admin/payments/${id}/mark-paid`, { note: 'Verified by admin' });
      toast.success('Payment marked as paid.');
      fetchPayments();
    } catch (e: any) { toast.error(e.message || 'Failed.'); }
    finally { setMarkingId(null); }
  };

  const filteredCredit = payments.filter(p =>
    !searchTerm ||
    p.logistic_partner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.pump?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.transaction_reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSub = subPayments.filter(p =>
    !searchTerm ||
    p.pump_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.plan_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.razorpay_payment_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-amber-50 text-amber-600 border-amber-100',
      approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      paid: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      rejected: 'bg-rose-50 text-rose-500 border-rose-100',
      failed: 'bg-rose-50 text-rose-500 border-rose-100',
    };
    return <span className={`text-[10px] font-extrabold px-2.5 py-0.5 border rounded-full uppercase ${map[status] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Payments Monitor</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Credit requests and subscription payments across the platform.</p>
        </div>
        <button onClick={() => activeTab === 'credit' ? fetchPayments() : fetchSubPayments()}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-600 outline-none cursor-pointer">
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button onClick={() => setActiveTab('credit')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer outline-none ${activeTab === 'credit' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
          <Banknote className="h-3.5 w-3.5" /> Credit Payments ({payments.length})
        </button>
        <button onClick={() => setActiveTab('subscription')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer outline-none ${activeTab === 'subscription' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
          <CreditCard className="h-3.5 w-3.5" /> Subscription Payments ({subPayments.length})
        </button>
      </div>

      <div className="bg-white border border-slate-200 p-4 rounded-2xl">
        <div className="relative max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder={activeTab === 'credit' ? 'Search partner, pump, Tx ref...' : 'Search pump, plan, owner...'}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-orange-500" />
        </div>
      </div>

      {/* ── CREDIT PAYMENTS TABLE ── */}
      {activeTab === 'credit' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                  <th className="px-5 py-4">Partner</th>
                  <th className="px-5 py-4">Pump</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4 text-right">Amount</th>
                  <th className="px-5 py-4">Tx Ref</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                {isLoading ? (
                  <tr><td colSpan={8} className="text-center py-10 text-slate-400 font-bold">Loading...</td></tr>
                ) : filteredCredit.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-slate-400 font-bold">No pending credit payments.</td></tr>
                ) : filteredCredit.map(pay => (
                  <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="font-extrabold text-slate-800 block">{pay.logistic_partner?.name}</span>
                      <span className="text-[10px] text-slate-400">{pay.logistic_partner?.email}</span>
                    </td>
                    <td className="px-5 py-3">{pay.pump?.name}</td>
                    <td className="px-5 py-3">
                      <span className="bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">{pay.payment_type}</span>
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-bold text-slate-800">₹{pay.amount?.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3 font-mono text-[10px] text-slate-500">{pay.transaction_reference || '—'}</td>
                    <td className="px-5 py-3">{getStatusBadge(pay.status)}</td>
                    <td className="px-5 py-3 text-slate-400">{pay.requested_at ? new Date(pay.requested_at).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="px-5 py-3 text-center">
                      {pay.status === 'pending' && (
                        <button onClick={() => handleMarkPaid(pay.id)} disabled={markingId === pay.id}
                          className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-lg cursor-pointer outline-none disabled:opacity-50 mx-auto">
                          <CheckCircle className="h-3.5 w-3.5" /> {markingId === pay.id ? '...' : 'Mark Paid'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400">{filteredCredit.length} payments</div>
        </div>
      )}

      {/* ── SUBSCRIPTION PAYMENTS TABLE ── */}
      {activeTab === 'subscription' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                  <th className="px-5 py-4">Pump</th>
                  <th className="px-5 py-4">Owner</th>
                  <th className="px-5 py-4">Plan</th>
                  <th className="px-5 py-4">Billing</th>
                  <th className="px-5 py-4 text-right">Amount</th>
                  <th className="px-5 py-4">Razorpay ID</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Paid On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                {isLoading ? (
                  <tr><td colSpan={8} className="text-center py-10 text-slate-400 font-bold">Loading...</td></tr>
                ) : filteredSub.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-slate-400 font-bold">No subscription payments yet.</td></tr>
                ) : filteredSub.map(pay => (
                  <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 font-extrabold text-slate-800">{pay.pump_name || `#${pay.pump_id}`}</td>
                    <td className="px-5 py-3">{pay.owner_name || '—'}</td>
                    <td className="px-5 py-3">
                      <span className="bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">{pay.plan_name || `#${pay.plan_id}`}</span>
                    </td>
                    <td className="px-5 py-3 capitalize">{pay.billing_cycle}</td>
                    <td className="px-5 py-3 text-right font-mono font-bold text-slate-800">₹{pay.amount?.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3 font-mono text-[10px] text-slate-500">{pay.razorpay_payment_id || '—'}</td>
                    <td className="px-5 py-3">{getStatusBadge(pay.status)}</td>
                    <td className="px-5 py-3 text-slate-400">{pay.paid_at ? new Date(pay.paid_at).toLocaleDateString('en-IN') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400">{filteredSub.length} payments</div>
        </div>
      )}
    </div>
  );
}