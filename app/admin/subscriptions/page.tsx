'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, Plus, Edit2, Check, X, RefreshCw, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { toast } from '@/components/feedback/Toast';
import backendApi from '@/lib/backendApi';

// ── Types ─────────────────────────────────────────────────────
interface Plan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_annual: number | null;
  is_active: boolean;
  is_default: boolean;
  default_trial_days: number;
  features: Record<string, boolean>;
  limits: { max_staff: number; max_pumps: number; max_tanks: number; report_history_days: number };
}

interface PumpSub {
  id: string;
  pump_id: string;
  pump_name: string;
  plan_id: string;
  plan_name: string;
  status: string;
  billing_cycle: string;
  start_date: string | null;
  end_date: string | null;
  trial_end: string | null;
  trial_days_granted: number;
  admin_note: string | null;
}

const FEATURE_LABELS: Record<string, string> = {
  sales: 'Sales Register', inventory: 'Inventory', crm: 'CRM',
  udhaar: 'Credit / Udhaar', analytics: 'Analytics & Reports',
  accounting: 'Accounting', logistic: 'Logistics', multi_pump: 'Multi Pump',
  api_access: 'API Access', priority_support: 'Priority Support',
};

const EMPTY_PLAN = {
  name: '', description: '', price_monthly: 0, price_annual: 0,
  default_trial_days: 0, is_default: false,
  features: Object.fromEntries(Object.keys(FEATURE_LABELS).map(k => [k, false])),
  limits: { max_staff: 3, max_pumps: 1, max_tanks: 2, report_history_days: 30 },
};

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subs, setSubs] = useState<PumpSub[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'plans' | 'subscriptions'>('plans');
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<any>(EMPTY_PLAN);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  // Assign modal state
  const [showAssign, setShowAssign] = useState(false);
  const [assignData, setAssignData] = useState({ pump_id: '', plan_id: '', trial_days: '0', billing_cycle: 'monthly', admin_note: '' });
  const [saving, setSaving] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await backendApi.get('/admin/subscriptions/plans');
      setPlans(res.data.data?.plans || []);
    } catch { toast.error('Failed to load plans.'); }
    finally { setLoading(false); }
  };

  const fetchSubs = async () => {
    setLoading(true);
    try {
      const res = await backendApi.get('/admin/subscriptions/pump-subscriptions');
      setSubs(res.data.data?.subscriptions || []);
    } catch { toast.error('Failed to load subscriptions.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPlans(); fetchSubs(); }, []);

  // ── Plan CRUD ─────────────────────────────────────────────
  const handleSavePlan = async () => {
    if (!formData.name.trim()) { toast.error('Plan name required.'); return; }
    setSaving(true);

    const sanitizedData = {
      ...formData,
      price_monthly: formData.price_monthly === '' || Number.isNaN(formData.price_monthly) ? 0 : formData.price_monthly,
      price_annual: formData.price_annual === '' || Number.isNaN(formData.price_annual) ? null : formData.price_annual,
      default_trial_days: formData.default_trial_days === '' || Number.isNaN(formData.default_trial_days) ? 0 : formData.default_trial_days,
      limits: {
        max_staff: formData.limits.max_staff === '' || Number.isNaN(formData.limits.max_staff) ? 0 : formData.limits.max_staff,
        max_pumps: formData.limits.max_pumps === '' || Number.isNaN(formData.limits.max_pumps) ? 0 : formData.limits.max_pumps,
        max_tanks: formData.limits.max_tanks === '' || Number.isNaN(formData.limits.max_tanks) ? 0 : formData.limits.max_tanks,
        report_history_days: formData.limits.report_history_days === '' || Number.isNaN(formData.limits.report_history_days) ? 30 : formData.limits.report_history_days,
      }
    };

    try {
      if (editPlan) {
        await backendApi.patch(`/admin/subscriptions/plans/${editPlan.id}`, sanitizedData);
        toast.success('Plan updated.');
      } else {
        await backendApi.post('/admin/subscriptions/plans', sanitizedData);
        toast.success('Plan created.');
      }
      setShowPlanForm(false); setEditPlan(null); setFormData(EMPTY_PLAN);
      fetchPlans();
    } catch (e: any) { toast.error(e.message || 'Failed to save plan.'); }
    finally { setSaving(false); }
  };

  const handleTogglePlan = async (plan: Plan) => {
    try {
      await backendApi.patch(`/admin/subscriptions/plans/${plan.id}`, { is_active: !plan.is_active });
      toast.success(`Plan ${plan.is_active ? 'deactivated' : 'activated'}.`);
      fetchPlans();
    } catch { toast.error('Failed to update plan.'); }
  };

  const openEdit = (plan: Plan) => {
    setEditPlan(plan);
    setFormData({
      name: plan.name, description: plan.description,
      price_monthly: plan.price_monthly, price_annual: plan.price_annual || 0,
      default_trial_days: plan.default_trial_days, is_default: plan.is_default,
      features: { ...plan.features }, limits: { ...plan.limits },
    });
    setShowPlanForm(true);
  };

  // ── Assign Subscription ───────────────────────────────────
  const handleAssign = async () => {
    if (!assignData.pump_id || !assignData.plan_id) { toast.error('Pump ID and Plan required.'); return; }
    setSaving(true);
    try {
      await backendApi.post('/admin/subscriptions/pump-subscriptions/assign', {
        pump_id: assignData.pump_id,
        plan_id: assignData.plan_id,
        trial_days: parseInt(assignData.trial_days),
        billing_cycle: assignData.billing_cycle,
        admin_note: assignData.admin_note,
      });
      toast.success('Subscription assigned successfully.');
      setShowAssign(false);
      setAssignData({ pump_id: '', plan_id: '', trial_days: '0', billing_cycle: 'monthly', admin_note: '' });
      fetchSubs();
    } catch (e: any) { toast.error(e.message || 'Failed to assign.'); }
    finally { setSaving(false); }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      trial: 'bg-blue-50 text-blue-600 border-blue-100',
      expired: 'bg-slate-100 text-slate-500 border-slate-200',
      cancelled: 'bg-rose-50 text-rose-500 border-rose-100',
    };
    return <span className={`text-[9px] font-extrabold px-2 py-0.5 border rounded-full uppercase ${map[status] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>{status}</span>;
  };

  // ── UI ────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Subscription Management</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Create plans, assign to pumps, manage trials and feature access.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { fetchPlans(); fetchSubs(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-600 outline-none cursor-pointer">
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          {activeTab === 'plans' && (
            <button onClick={() => { setShowPlanForm(true); setEditPlan(null); setFormData(EMPTY_PLAN); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold outline-none cursor-pointer">
              <Plus className="h-3.5 w-3.5" /> New Plan
            </button>
          )}
          {activeTab === 'subscriptions' && (
            <button onClick={() => setShowAssign(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold outline-none cursor-pointer">
              <Zap className="h-3.5 w-3.5" /> Assign Plan
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(['plans', 'subscriptions'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer outline-none capitalize ${activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {tab === 'plans' ? `Plans (${plans.length})` : `Active Subscriptions (${subs.length})`}
          </button>
        ))}
      </div>

      {/* ── PLANS TAB ── */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          {isLoading && <div className="text-center py-10 text-xs font-bold text-slate-400">Loading plans...</div>}
          {!isLoading && plans.length === 0 && (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
              <CreditCard className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-400">No plans yet. Create your first plan.</p>
            </div>
          )}
          {plans.map(plan => (
            <div key={plan.id} className={`bg-white border rounded-2xl overflow-hidden ${plan.is_default ? 'border-orange-200' : 'border-slate-200'}`}>
              {/* Plan Header */}
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${plan.is_default ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-800">{plan.name}</span>
                      {plan.is_default && <span className="text-[9px] font-bold text-orange-500 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full uppercase">Default</span>}
                      {!plan.is_active && <span className="text-[9px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full uppercase">Inactive</span>}
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">₹{plan.price_monthly}/mo · {plan.default_trial_days}d trial</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(plan)}
                    className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer outline-none">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleTogglePlan(plan)}
                    className={`p-1.5 border rounded-lg cursor-pointer outline-none ${plan.is_active ? 'border-rose-100 text-rose-400 hover:bg-rose-50' : 'border-emerald-100 text-emerald-500 hover:bg-emerald-50'}`}>
                    {plan.is_active ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                    className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer outline-none">
                    {expandedPlan === plan.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Expanded Features */}
              {expandedPlan === plan.id && (
                <div className="border-t border-slate-100 p-5 bg-slate-50/50 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Features</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                      {Object.entries(FEATURE_LABELS).map(([key, label]) => (
                        <div key={key} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold ${plan.features[key] ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                          {plan.features[key] ? <Check className="h-3 w-3 shrink-0" /> : <X className="h-3 w-3 shrink-0" />}
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Limits</p>
                    <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
                      <span>Staff: <b>{plan.limits.max_staff || 'Unlimited'}</b></span>
                      <span>Pumps: <b>{plan.limits.max_pumps || 'Unlimited'}</b></span>
                      <span>Tanks: <b>{plan.limits.max_tanks || 'Unlimited'}</b></span>
                      <span>Report history: <b>{plan.limits.report_history_days}d</b></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── SUBSCRIPTIONS TAB ── */}
      {activeTab === 'subscriptions' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                  <th className="px-5 py-4">Pump</th>
                  <th className="px-5 py-4">Plan</th>
                  <th className="px-5 py-4">Billing</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Trial End</th>
                  <th className="px-5 py-4">Expires</th>
                  <th className="px-5 py-4">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                {isLoading ? (
                  <tr><td colSpan={7} className="text-center py-10 text-slate-400 font-bold">Loading...</td></tr>
                ) : subs.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-slate-400 font-bold">No subscriptions assigned yet.</td></tr>
                ) : subs.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="font-extrabold text-slate-800 block">{sub.pump_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">ID: #{sub.pump_id}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md font-extrabold text-slate-700">{sub.plan_name}</span>
                    </td>
                    <td className="px-5 py-3 capitalize">{sub.billing_cycle}</td>
                    <td className="px-5 py-3">{getStatusBadge(sub.status)}</td>
                    <td className="px-5 py-3 text-slate-500">
                      {sub.trial_end ? new Date(sub.trial_end).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {sub.end_date ? new Date(sub.end_date).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-5 py-3 text-slate-400 max-w-[150px] truncate">{sub.admin_note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PLAN FORM MODAL ── */}
      {showPlanForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h2 className="text-sm font-extrabold text-slate-800">{editPlan ? 'Edit Plan' : 'Create New Plan'}</h2>
              <button onClick={() => { setShowPlanForm(false); setEditPlan(null); }} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer outline-none">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Plan Name</label>
                  <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Starter, Pro, Enterprise"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Monthly Price (₹)</label>
                  <input type="number"
                    value={Number.isNaN(formData.price_monthly) ? '' : (formData.price_monthly ?? '')}
                    onChange={e => setFormData({ ...formData, price_monthly: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Annual Price (₹)</label>
                  <input type="number"
                    value={Number.isNaN(formData.price_annual) ? '' : (formData.price_annual ?? '')}
                    onChange={e => setFormData({ ...formData, price_annual: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Default Trial Days</label>
                  <input type="number"
                    value={Number.isNaN(formData.default_trial_days) ? '' : (formData.default_trial_days ?? '')}
                    onChange={e => setFormData({ ...formData, default_trial_days: e.target.value === '' ? '' : parseInt(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Description</label>
                  <input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short description..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500" />
                </div>
              </div>

              {/* Features Toggle */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Features</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(FEATURE_LABELS).map(([key, label]) => (
                    <button key={key} type="button"
                      onClick={() => setFormData({ ...formData, features: { ...formData.features, [key]: !formData.features[key] } })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer outline-none transition-all ${formData.features[key] ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                      {formData.features[key] ? <Check className="h-3.5 w-3.5 shrink-0" /> : <X className="h-3.5 w-3.5 shrink-0" />}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Limits */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Limits (0 = unlimited)</p>
                <div className="grid grid-cols-2 gap-3">
                  {[['max_staff', 'Max Staff'], ['max_pumps', 'Max Pumps'], ['max_tanks', 'Max Tanks'], ['report_history_days', 'Report History (days)']].map(([key, label]) => (
                    <div key={key} className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">{label}</label>
                      <input type="number"
                        value={Number.isNaN(formData.limits[key]) ? '' : (formData.limits[key] ?? '')}
                        onChange={e => setFormData({ ...formData, limits: { ...formData.limits, [key]: e.target.value === '' ? '' : parseInt(e.target.value) } })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-orange-500" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Default toggle */}
              <div className="flex items-center gap-3">
                <input type="checkbox" id="is_default" checked={formData.is_default}
                  onChange={e => setFormData({ ...formData, is_default: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-orange-500" />
                <label htmlFor="is_default" className="text-xs font-bold text-slate-600 cursor-pointer">Set as default plan (auto-assign on registration)</label>
              </div>

              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button onClick={handleSavePlan} disabled={saving}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl cursor-pointer outline-none disabled:opacity-50">
                  {saving ? 'Saving...' : editPlan ? 'Update Plan' : 'Create Plan'}
                </button>
                <button onClick={() => { setShowPlanForm(false); setEditPlan(null); }}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer outline-none">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ASSIGN MODAL ── */}
      {showAssign && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h2 className="text-sm font-extrabold text-slate-800">Assign Plan to Pump</h2>
              <button onClick={() => setShowAssign(false)} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer outline-none">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: 'Pump ID', key: 'pump_id', type: 'text', placeholder: 'e.g. 65f1a2b3c4d5e6f7a8b9c0d1' },
                { label: 'Trial Days (0 = no trial)', key: 'trial_days', type: 'number', placeholder: '0' },
                { label: 'Admin Note (optional)', key: 'admin_note', type: 'text', placeholder: 'e.g. 6 months free for early adopter' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key} className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">{label}</label>
                  <input type={type} placeholder={placeholder} value={(assignData as any)[key]}
                    onChange={e => setAssignData({ ...assignData, [key]: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500" />
                </div>
              ))}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Select Plan</label>
                <select value={assignData.plan_id} onChange={e => setAssignData({ ...assignData, plan_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500 cursor-pointer">
                  <option value="">Choose plan...</option>
                  {plans.filter(p => p.is_active).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.price_monthly}/mo
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Billing Cycle</label>
                <select value={assignData.billing_cycle} onChange={e => setAssignData({ ...assignData, billing_cycle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:border-orange-500 cursor-pointer">
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button onClick={handleAssign} disabled={saving}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl cursor-pointer outline-none disabled:opacity-50">
                  {saving ? 'Assigning...' : 'Assign Subscription'}
                </button>
                <button onClick={() => setShowAssign(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer outline-none">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}