'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale, Plus, Trash2, Eye, X, ChevronDown, ChevronRight,
  Building2, Users, Receipt, BookOpen, BarChart3, AlertCircle,
  CheckCircle, ArrowRightLeft, CreditCard, Search, RefreshCw,
  TrendingUp, TrendingDown, Wallet, Info,
} from 'lucide-react';
import { usePumpStore } from '@/stores/pumps.store';
import { toast } from '@/components/feedback/Toast';
import {
  getGroups, createGroup, deleteGroup,
  getAccounts, createAccount, deleteAccount,
  getParties, createParty, deleteParty,
  getVouchers, getVoucherEntries, createQuickVoucher, createJournalVoucher,
  getBalanceSheet,
  AccountGroup, Account, Party, Voucher, BalanceSheet,
  AccountNature, PartyCategory, VoucherType,
  CreateGroupPayload, CreateAccountPayload, CreatePartyPayload,
  QuickVoucherPayload, JournalVoucherPayload, JournalEntryLine,
} from '@/services/accounting.service';

// ─── Types ─────────────────────────────────────────────────────────────────────

type MainTab = 'groups' | 'accounts' | 'parties' | 'vouchers' | 'balance-sheet';

// ─── Small helpers ─────────────────────────────────────────────────────────────

const NatureBadge = ({ nature }: { nature: string }) => {
  const map: Record<string, string> = {
    income: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    expenditure: 'bg-rose-50 text-rose-700 border-rose-200',
    asset: 'bg-sky-50 text-sky-700 border-sky-200',
    liability: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase ${map[nature] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {nature}
    </span>
  );
};

const CategoryBadge = ({ category }: { category: string }) => {
  const map: Record<string, string> = {
    customer: 'bg-violet-50 text-violet-700 border-violet-200',
    supplier: 'bg-orange-50 text-orange-700 border-orange-200',
    other: 'bg-slate-50 text-slate-600 border-slate-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase ${map[category] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {category}
    </span>
  );
};

const VoucherBadge = ({ type }: { type: string }) => {
  const map: Record<string, string> = {
    payment: 'bg-rose-50 text-rose-700 border-rose-200',
    receipt: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    contra: 'bg-sky-50 text-sky-700 border-sky-200',
    journal: 'bg-purple-50 text-purple-700 border-purple-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase ${map[type] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {type}
    </span>
  );
};

const ModalOverlay = ({ onClose, children }: { onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 12 }}
      transition={{ duration: 0.18 }}
      className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 z-10 max-h-[90vh] overflow-y-auto"
    >
      {children}
    </motion.div>
  </div>
);

const ModalHeader = ({ title, onClose }: { title: string; onClose: () => void }) => (
  <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl z-10">
    <h3 className="text-sm font-extrabold text-slate-800">{title}</h3>
    <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
      <X className="h-4 w-4" />
    </button>
  </div>
);

const FormField = ({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-slate-700">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400 placeholder:font-normal";
const selectCls = `${inputCls} cursor-pointer`;

const PrimaryBtn = ({ onClick, children, type = 'button', disabled }: {
  onClick?: () => void; children: React.ReactNode; type?: 'button' | 'submit'; disabled?: boolean;
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all cursor-pointer outline-none"
  >
    {children}
  </button>
);

const SecondaryBtn = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition-all cursor-pointer outline-none"
  >
    {children}
  </button>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AccountingPage() {
  const { selectedPump } = usePumpStore();
  const pumpId = selectedPump?.id ? Number(selectedPump.id) : undefined;

  const [activeTab, setActiveTab] = useState<MainTab>('groups');

  // Data state
  const [groups, setGroups] = useState<AccountGroup[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Modal state
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherEntriesModal, setVoucherEntriesModal] = useState<Voucher | null>(null);

  if (!pumpId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <AlertCircle className="h-10 w-10 mb-3 opacity-30" />
        <p className="font-bold text-sm">No pump selected</p>
        <p className="text-xs mt-1">Select a pump to manage accounting.</p>
      </div>
    );
  }

  // ── Fetch helpers ──────────────────────────────────────────────────────────

  const fetchGroups = useCallback(async () => {
    if (!pumpId) return;
    try { setGroups(await getGroups(pumpId)); } catch { toast.error('Failed to load groups'); }
  }, [pumpId]);

  const fetchAccounts = useCallback(async () => {
    if (!pumpId) return;
    try { setAccounts(await getAccounts(pumpId)); } catch { toast.error('Failed to load accounts'); }
  }, [pumpId]);

  const fetchParties = useCallback(async () => {
    if (!pumpId) return;
    try { setParties(await getParties(pumpId)); } catch { toast.error('Failed to load parties'); }
  }, [pumpId]);

  const fetchVouchers = useCallback(async () => {
    if (!pumpId) return;
    try { setVouchers(await getVouchers(pumpId)); } catch { toast.error('Failed to load vouchers'); }
  }, [pumpId]);

  const fetchBalanceSheet = useCallback(async () => {
    if (!pumpId) return;
    try { setBalanceSheet(await getBalanceSheet(pumpId)); } catch { toast.error('Failed to load balance sheet'); }
  }, [pumpId]);

  // Fetch on tab change
  useEffect(() => {
    if (!pumpId) return;
    setLoading(true);
    const map: Record<MainTab, () => Promise<void>> = {
      groups: fetchGroups,
      accounts: fetchAccounts,
      parties: fetchParties,
      vouchers: fetchVouchers,
      'balance-sheet': fetchBalanceSheet,
    };
    map[activeTab]().finally(() => setLoading(false));
  }, [activeTab, pumpId]);

  // ── Tab config ─────────────────────────────────────────────────────────────

  const tabs: { id: MainTab; label: string; icon: React.ReactNode }[] = [
    { id: 'groups', label: 'Groups', icon: <BookOpen className="h-3.5 w-3.5" /> },
    { id: 'accounts', label: 'Accounts', icon: <Wallet className="h-3.5 w-3.5" /> },
    { id: 'parties', label: 'Parties', icon: <Users className="h-3.5 w-3.5" /> },
    { id: 'vouchers', label: 'Vouchers', icon: <Receipt className="h-3.5 w-3.5" /> },
    { id: 'balance-sheet', label: 'Balance Sheet', icon: <BarChart3 className="h-3.5 w-3.5" /> },
  ];

  // ── Renders ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-100 rounded-2xl p-5 shadow-xs gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 border border-orange-200 text-primary">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">Accounting</h1>
            <p className="text-xs text-slate-500">Manage ledgers, parties, vouchers & balance sheet</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'groups' && <PrimaryBtn onClick={() => setShowGroupModal(true)}><Plus className="h-3.5 w-3.5" />New Group</PrimaryBtn>}
          {activeTab === 'accounts' && <PrimaryBtn onClick={() => setShowAccountModal(true)}><Plus className="h-3.5 w-3.5" />New Account</PrimaryBtn>}
          {activeTab === 'parties' && <PrimaryBtn onClick={() => setShowPartyModal(true)}><Plus className="h-3.5 w-3.5" />New Party</PrimaryBtn>}
          {activeTab === 'vouchers' && <PrimaryBtn onClick={() => setShowVoucherModal(true)}><Plus className="h-3.5 w-3.5" />New Voucher</PrimaryBtn>}
          {activeTab === 'balance-sheet' && (
            <SecondaryBtn onClick={fetchBalanceSheet}><RefreshCw className="h-3.5 w-3.5" />Refresh</SecondaryBtn>
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-white border border-slate-100 rounded-2xl p-1.5 shadow-xs overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all outline-none cursor-pointer
              ${activeTab === tab.id
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* Search bar for list tabs */}
      {['groups', 'accounts', 'parties', 'vouchers'].includes(activeTab) && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:max-w-sm bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-slate-400 placeholder:font-normal transition-all"
          />
        </div>
      )}

      {/* Tab Content */}
      {loading ? (
        <div className="flex justify-center items-center h-40 text-slate-400 text-xs font-bold gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" /> Loading...
        </div>
      ) : (
        <>
          {activeTab === 'groups' && <GroupsTab groups={groups} search={search} onDelete={async id => { await deleteGroup(id, pumpId); fetchGroups(); }} />}
          {activeTab === 'accounts' && <AccountsTab accounts={accounts} search={search} onDelete={async id => { await deleteAccount(id, pumpId); fetchAccounts(); }} />}
          {activeTab === 'parties' && <PartiesTab parties={parties} search={search} onDelete={async id => { await deleteParty(id, pumpId); fetchParties(); }} />}
          {activeTab === 'vouchers' && <VouchersTab vouchers={vouchers} search={search} onViewEntries={async v => { const detail = await getVoucherEntries(v.id, pumpId); setVoucherEntriesModal(detail); }} />}
          {activeTab === 'balance-sheet' && <BalanceSheetTab data={balanceSheet} />}
        </>
      )}

      {/* ── Modals ── */}
      <AnimatePresence>
        {showGroupModal && pumpId !== undefined && (
          <GroupModal
            pumpId={pumpId}
            onClose={() => setShowGroupModal(false)}
            onSaved={() => { setShowGroupModal(false); fetchGroups(); }}
          />
        )}
        {showAccountModal && pumpId !== undefined && (
          <AccountModal
            pumpId={pumpId}
            groups={groups}
            parties={parties}
            onClose={() => setShowAccountModal(false)}
            onSaved={() => { setShowAccountModal(false); fetchAccounts(); }}
          />
        )}
        {showPartyModal && pumpId !== undefined && (
          <PartyModal
            pumpId={pumpId}
            onClose={() => setShowPartyModal(false)}
            onSaved={() => { setShowPartyModal(false); fetchParties(); fetchAccounts(); }}
          />
        )}
        {showVoucherModal && pumpId !== undefined && (
          <VoucherModal
            pumpId={pumpId}
            accounts={accounts}
            onClose={() => setShowVoucherModal(false)}
            onSaved={() => { setShowVoucherModal(false); fetchVouchers(); fetchBalanceSheet(); }}
          />
        )}
        {voucherEntriesModal && (
          <VoucherEntriesModal
            voucher={voucherEntriesModal}
            onClose={() => setVoucherEntriesModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUPS TAB
// ═══════════════════════════════════════════════════════════════════════════════

function GroupsTab({ groups, search, onDelete }: {
  groups: AccountGroup[]; search: string; onDelete: (id: number) => void;
}) {
  const filtered = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    (g.category ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (filtered.length === 0)
    return <EmptyState icon={<BookOpen className="h-8 w-8" />} text="No account groups yet. Create one to get started." />;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-5 py-3 font-extrabold text-slate-500 uppercase tracking-wider">Name</th>
            <th className="px-5 py-3 font-extrabold text-slate-500 uppercase tracking-wider">Category</th>
            <th className="px-5 py-3 font-extrabold text-slate-500 uppercase tracking-wider">Nature</th>
            <th className="px-5 py-3 font-extrabold text-slate-500 uppercase tracking-wider">Affects GP</th>
            <th className="px-5 py-3 font-extrabold text-slate-500 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filtered.map(g => (
            <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-5 py-3.5 font-bold text-slate-800">{g.name}</td>
              <td className="px-5 py-3.5 text-slate-500">{g.category ?? '—'}</td>
              <td className="px-5 py-3.5"><NatureBadge nature={g.nature} /></td>
              <td className="px-5 py-3.5">
                {g.affects_gross_profit
                  ? <span className="flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle className="h-3.5 w-3.5" />Yes</span>
                  : <span className="text-slate-400">No</span>}
              </td>
              <td className="px-5 py-3.5 text-right">
                <button onClick={() => onDelete(g.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACCOUNTS TAB
// ═══════════════════════════════════════════════════════════════════════════════

function AccountsTab({ accounts, search, onDelete }: {
  accounts: Account[]; search: string; onDelete: (id: number) => void;
}) {
  const filtered = accounts.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.alias ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (a.group_name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (filtered.length === 0)
    return <EmptyState icon={<Wallet className="h-8 w-8" />} text="No accounts yet. Create your first money container." />;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-5 py-3 font-extrabold text-slate-500 uppercase tracking-wider">Account</th>
            <th className="px-5 py-3 font-extrabold text-slate-500 uppercase tracking-wider">Group</th>
            <th className="px-5 py-3 font-extrabold text-slate-500 uppercase tracking-wider">Party</th>
            <th className="px-5 py-3 font-extrabold text-slate-500 uppercase tracking-wider">Type</th>
            <th className="px-5 py-3 font-extrabold text-slate-500 uppercase tracking-wider text-right">Balance</th>
            <th className="px-5 py-3 font-extrabold text-slate-500 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filtered.map(a => (
            <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-5 py-3.5">
                <div className="font-bold text-slate-800">{a.name}</div>
                {a.alias && <div className="text-[10px] text-slate-400 font-mono">{a.alias}</div>}
              </td>
              <td className="px-5 py-3.5 text-slate-500">{a.group_name ?? '—'}</td>
              <td className="px-5 py-3.5 text-slate-500">{a.party_name ?? '—'}</td>
              <td className="px-5 py-3.5">
                {a.is_bank_account
                  ? <span className="flex items-center gap-1 text-sky-600 font-bold text-[10px]"><CreditCard className="h-3.5 w-3.5" />Bank</span>
                  : <span className="text-slate-400 text-[10px]">Standard</span>}
                {a.tcs_apply && <span className="ml-1 px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded text-[9px] font-bold">TCS</span>}
              </td>
              <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-800">
                ₹{a.current_balance.toLocaleString('en-IN')}
              </td>
              <td className="px-5 py-3.5 text-right">
                <button onClick={() => onDelete(a.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARTIES TAB
// ═══════════════════════════════════════════════════════════════════════════════

function PartiesTab({ parties, search, onDelete }: {
  parties: Party[]; search: string; onDelete: (id: number) => void;
}) {
  const filtered = parties.filter(p =>
    (p.legal_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (p.alias ?? '').toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  if (filtered.length === 0)
    return <EmptyState icon={<Users className="h-8 w-8" />} text="No parties yet. Add suppliers or credit customers." />;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-5 py-3 font-extrabold text-slate-500 uppercase tracking-wider">Name / Alias</th>
            <th className="px-5 py-3 font-extrabold text-slate-500 uppercase tracking-wider">Category</th>
            <th className="px-5 py-3 font-extrabold text-slate-500 uppercase tracking-wider">GST / PAN</th>
            <th className="px-5 py-3 font-extrabold text-slate-500 uppercase tracking-wider">Registration</th>
            <th className="px-5 py-3 font-extrabold text-slate-500 uppercase tracking-wider">Contact</th>
            <th className="px-5 py-3 font-extrabold text-slate-500 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filtered.map(p => (
            <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-5 py-3.5">
                <div className="font-bold text-slate-800">{p.legal_name || '—'}</div>
                {p.alias && <div className="text-[10px] text-slate-400">{p.alias}</div>}
              </td>
              <td className="px-5 py-3.5"><CategoryBadge category={p.category} /></td>
              <td className="px-5 py-3.5 font-mono text-slate-500">
                <div>{p.gst_number || '—'}</div>
                <div className="text-[10px]">{p.pan || ''}</div>
              </td>
              <td className="px-5 py-3.5">
                <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase
                  ${p.registration_type === 'registered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                  {p.registration_type}
                </span>
              </td>
              <td className="px-5 py-3.5 text-slate-500">{p.primary_contact || '—'}</td>
              <td className="px-5 py-3.5 text-right">
                <button onClick={() => onDelete(p.id)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VOUCHERS TAB
// ═══════════════════════════════════════════════════════════════════════════════

function VouchersTab({ vouchers, search, onViewEntries }: {
  vouchers: Voucher[]; search: string; onViewEntries: (v: Voucher) => void;
}) {
  const filtered = vouchers.filter(v =>
    v.voucher_type.toLowerCase().includes(search.toLowerCase()) ||
    (v.narration ?? '').toLowerCase().includes(search.toLowerCase()) ||
    String(v.id).includes(search)
  );

  if (filtered.length === 0)
    return <EmptyState icon={<Receipt className="h-8 w-8" />} text="No vouchers yet. Record a payment or journal entry." />;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-5 py-3 font-extrabold text-slate-500 uppercase tracking-wider">ID</th>
            <th className="px-5 py-3 font-extrabold text-slate-500 uppercase tracking-wider">Type</th>
            <th className="px-5 py-3 font-extrabold text-slate-500 uppercase tracking-wider">Date</th>
            <th className="px-5 py-3 font-extrabold text-slate-500 uppercase tracking-wider">Narration</th>
            <th className="px-5 py-3 font-extrabold text-slate-500 uppercase tracking-wider">Origin</th>
            <th className="px-5 py-3 font-extrabold text-slate-500 uppercase tracking-wider">Status</th>
            <th className="px-5 py-3 font-extrabold text-slate-500 uppercase tracking-wider text-right">Entries</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filtered.map(v => (
            <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-5 py-3.5 font-mono font-bold text-primary">#{v.id}</td>
              <td className="px-5 py-3.5"><VoucherBadge type={v.voucher_type} /></td>
              <td className="px-5 py-3.5 font-mono text-slate-500">
                {new Date(v.voucher_date).toLocaleDateString('en-IN')}
              </td>
              <td className="px-5 py-3.5 text-slate-600 max-w-[180px] truncate">{v.narration || '—'}</td>
              <td className="px-5 py-3.5">
                <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase
                  ${v.origin === 'manual' ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-violet-50 text-violet-600 border-violet-200'}`}>
                  {v.origin}
                </span>
              </td>
              <td className="px-5 py-3.5">
                {v.is_posted
                  ? <span className="flex items-center gap-1 text-emerald-600 font-bold text-[10px]"><CheckCircle className="h-3 w-3" />Posted</span>
                  : <span className="flex items-center gap-1 text-amber-500 font-bold text-[10px]"><AlertCircle className="h-3 w-3" />Pending</span>}
              </td>
              <td className="px-5 py-3.5 text-right">
                <button
                  onClick={() => onViewEntries(v)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-primary hover:text-white border border-slate-200 hover:border-primary text-slate-600 text-[10px] font-bold transition-all cursor-pointer"
                >
                  <Eye className="h-3 w-3" />Entries
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BALANCE SHEET TAB
// ═══════════════════════════════════════════════════════════════════════════════

function BalanceSheetTab({ data }: { data: BalanceSheet | null }) {
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  const toggleGroup = (id: number) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (!data)
    return <EmptyState icon={<BarChart3 className="h-8 w-8" />} text="Click Refresh to load the live balance sheet." />;

  const Section = ({ title, groups, color }: {
    title: string;
    groups: BalanceSheet['income'];
    color: string;
  }) => {
    const sectionTotal = groups.reduce((s, g) => s + g.total, 0);
    return (
      <div className="flex flex-col gap-2">
        <div className={`flex justify-between items-center px-4 py-2 rounded-xl ${color}`}>
          <span className="text-xs font-extrabold uppercase tracking-wider">{title}</span>
          <span className="font-mono font-extrabold text-sm">₹{sectionTotal.toLocaleString('en-IN')}</span>
        </div>
        {groups.map(g => (
          <div key={g.group_id} className="border border-slate-100 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleGroup(g.group_id)}
              className="w-full flex justify-between items-center px-4 py-3 bg-slate-50/50 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-xs">
                {expandedGroups.has(g.group_id)
                  ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                <span className="font-bold text-slate-700">{g.group_name}</span>
                {g.affects_gross_profit && (
                  <span className="px-1.5 py-0.5 bg-orange-50 text-orange-600 border border-orange-200 rounded text-[9px] font-bold">GP</span>
                )}
              </div>
              <span className="font-mono font-bold text-xs text-slate-800">
                ₹{g.total.toLocaleString('en-IN')}
              </span>
            </button>
            {expandedGroups.has(g.group_id) && (
              <div className="divide-y divide-slate-100">
                {g.accounts.map(a => (
                  <div key={a.account_id} className="flex justify-between items-center px-6 py-2.5 bg-white">
                    <div className="text-xs text-slate-600">
                      <span className="font-semibold">{a.account_name}</span>
                      {a.alias && <span className="text-slate-400 ml-1">({a.alias})</span>}
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-800">
                      ₹{a.current_balance.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Profit</span>
          <span className={`text-xl font-black font-mono ${data.gross_profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            ₹{data.gross_profit.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-400">Direct income - direct expenditure</span>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Equity</span>
          <span className={`text-xl font-black font-mono ${data.total_equity >= 0 ? 'text-sky-600' : 'text-rose-600'}`}>
            ₹{data.total_equity.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-400">Assets - liabilities</span>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Updated</span>
          <span className="text-sm font-extrabold text-slate-800">
            {new Date(data.generated_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-[10px] text-slate-400">Live — refreshes on voucher creation</span>
        </div>
      </div>

      {/* Balance Sheet Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
          <Section title="Income" groups={data.income} color="bg-emerald-50 text-emerald-700" />
          <Section title="Expenditure" groups={data.expenditure} color="bg-rose-50 text-rose-700" />
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
          <Section title="Assets" groups={data.assets} color="bg-sky-50 text-sky-700" />
          <Section title="Liabilities" groups={data.liabilities} color="bg-amber-50 text-amber-700" />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODALS
// ═══════════════════════════════════════════════════════════════════════════════

function GroupModal({ pumpId, onClose, onSaved }: {
  pumpId: number; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState<CreateGroupPayload>({
    pump_id: pumpId, name: '', category: '', nature: 'expenditure', affects_gross_profit: false,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Group name is required'); return; }
    setSaving(true);
    try {
      await createGroup(form);
      toast.success(`Group "${form.name}" created`);
      onSaved();
    } catch { toast.error('Failed to create group'); }
    finally { setSaving(false); }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="New Account Group" onClose={onClose} />
      <div className="p-6 flex flex-col gap-4">
        <FormField label="Group Name" required>
          <input className={inputCls} placeholder="e.g. Direct Expense" value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </FormField>
        <FormField label="Category">
          <input className={inputCls} placeholder="e.g. Expense, Income" value={form.category ?? ''}
            onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
        </FormField>
        <FormField label="Nature" required>
          <select className={selectCls} value={form.nature}
            onChange={e => setForm(p => ({ ...p, nature: e.target.value as AccountNature }))}>
            <option value="income">Income</option>
            <option value="expenditure">Expenditure</option>
            <option value="asset">Asset</option>
            <option value="liability">Liability</option>
          </select>
        </FormField>
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <div
            onClick={() => setForm(p => ({ ...p, affects_gross_profit: !p.affects_gross_profit }))}
            className={`w-10 h-5 rounded-full transition-colors ${form.affects_gross_profit ? 'bg-primary' : 'bg-slate-200'} flex items-center`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${form.affects_gross_profit ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
          <span className="text-xs font-semibold text-slate-700">Affects Gross Profit</span>
        </label>
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <SecondaryBtn onClick={onClose}>Cancel</SecondaryBtn>
          <PrimaryBtn onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Add Group'}
          </PrimaryBtn>
        </div>
      </div>
    </ModalOverlay>
  );
}

function AccountModal({ pumpId, groups, parties, onClose, onSaved }: {
  pumpId: number; groups: AccountGroup[]; parties: Party[];
  onClose: () => void; onSaved: () => void;
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CreateAccountPayload>({
    pump_id: pumpId, group_id: 0, name: '', alias: '',
    is_bank_account: false, tcs_apply: false,
    bank_details: { bank_name: '', account_no: '', ifsc: '', branch: '' },
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Account name is required'); return; }
    if (!form.group_id) { toast.error('Please select a group'); return; }
    setSaving(true);
    try {
      const payload = { ...form, bank_details: form.is_bank_account ? form.bank_details : undefined };
      await createAccount(payload);
      toast.success(`Account "${form.name}" created`);
      onSaved();
    } catch { toast.error('Failed to create account'); }
    finally { setSaving(false); }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="New Account" onClose={onClose} />
      <div className="p-6 flex flex-col gap-4">
        {step === 1 && (
          <>
            <FormField label="Account Group" required>
              <select className={selectCls} value={form.group_id}
                onChange={e => setForm(p => ({ ...p, group_id: Number(e.target.value) }))}>
                <option value={0}>— Select Group —</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </FormField>
            <FormField label="Linked Party (optional)">
              <select className={selectCls} value={form.party_id ?? ''}
                onChange={e => setForm(p => ({ ...p, party_id: e.target.value ? Number(e.target.value) : undefined }))}>
                <option value="">— None —</option>
                {parties.map(p => <option key={p.id} value={p.id}>{p.legal_name || p.alias}</option>)}
              </select>
            </FormField>
            <FormField label="Account Name" required>
              <input className={inputCls} placeholder="e.g. Testing Charges" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </FormField>
            <FormField label="Alias / Short Name">
              <input className={inputCls} placeholder="Optional short name" value={form.alias ?? ''}
                onChange={e => setForm(p => ({ ...p, alias: e.target.value }))} />
            </FormField>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div
                onClick={() => setForm(p => ({ ...p, is_bank_account: !p.is_bank_account }))}
                className={`w-10 h-5 rounded-full transition-colors ${form.is_bank_account ? 'bg-primary' : 'bg-slate-200'} flex items-center`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${form.is_bank_account ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <span className="text-xs font-semibold text-slate-700">Bank Account</span>
            </label>
          </>
        )}

        {step === 2 && (
          <>
            {form.is_bank_account && (
              <>
                <p className="text-xs text-slate-500 font-medium">Bank Details</p>
                <FormField label="Bank Name">
                  <input className={inputCls} placeholder="e.g. State Bank of India" value={form.bank_details?.bank_name ?? ''}
                    onChange={e => setForm(p => ({ ...p, bank_details: { ...p.bank_details!, bank_name: e.target.value } }))} />
                </FormField>
                <FormField label="Account Number">
                  <input className={inputCls} placeholder="Account number" value={form.bank_details?.account_no ?? ''}
                    onChange={e => setForm(p => ({ ...p, bank_details: { ...p.bank_details!, account_no: e.target.value } }))} />
                </FormField>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="IFSC Code">
                    <input className={inputCls} placeholder="SBIN0001234" value={form.bank_details?.ifsc ?? ''}
                      onChange={e => setForm(p => ({ ...p, bank_details: { ...p.bank_details!, ifsc: e.target.value } }))} />
                  </FormField>
                  <FormField label="Branch">
                    <input className={inputCls} placeholder="Branch name" value={form.bank_details?.branch ?? ''}
                      onChange={e => setForm(p => ({ ...p, bank_details: { ...p.bank_details!, branch: e.target.value } }))} />
                  </FormField>
                </div>
              </>
            )}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div
                onClick={() => setForm(p => ({ ...p, tcs_apply: !p.tcs_apply }))}
                className={`w-10 h-5 rounded-full transition-colors ${form.tcs_apply ? 'bg-primary' : 'bg-slate-200'} flex items-center`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${form.tcs_apply ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <span className="text-xs font-semibold text-slate-700">TCS Applicable</span>
            </label>
          </>
        )}

        <div className="flex gap-2 pt-2 border-t border-slate-100">
          {step === 1 && <SecondaryBtn onClick={onClose}>Cancel</SecondaryBtn>}
          {step === 2 && <SecondaryBtn onClick={() => setStep(1)}>← Back</SecondaryBtn>}
          {step === 1 && (
            <PrimaryBtn onClick={() => { if (!form.name.trim() || !form.group_id) { toast.error('Fill required fields'); return; } setStep(2); }}>
              Next →
            </PrimaryBtn>
          )}
          {step === 2 && (
            <PrimaryBtn onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Add Account'}
            </PrimaryBtn>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
}

function PartyModal({ pumpId, onClose, onSaved }: {
  pumpId: number; onClose: () => void; onSaved: () => void;
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CreatePartyPayload>({
    pump_id: pumpId, category: 'customer', registration_type: 'unregistered',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await createParty(form);
      toast.success(`Party "${form.legal_name || form.alias}" created with linked account`);
      onSaved();
    } catch { toast.error('Failed to create party'); }
    finally { setSaving(false); }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="New Party" onClose={onClose} />
      <div className="p-6 flex flex-col gap-4">
        {step === 1 && (
          <>
            <FormField label="Alias">
              <input className={inputCls} placeholder="Short name for quick search" value={form.alias ?? ''}
                onChange={e => setForm(p => ({ ...p, alias: e.target.value }))} />
            </FormField>
            <FormField label="Category" required>
              <select className={selectCls} value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value as PartyCategory }))}>
                <option value="customer">Customer</option>
                <option value="supplier">Supplier</option>
                <option value="other">Other</option>
              </select>
            </FormField>
            <FormField label="Address">
              <textarea className={inputCls} rows={2} placeholder="Business address" value={form.address ?? ''}
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
            </FormField>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-xs text-slate-500 font-medium">Legal & Tax Details</p>
            <FormField label="Legal Name">
              <input className={inputCls} placeholder="Registered business name" value={form.legal_name ?? ''}
                onChange={e => setForm(p => ({ ...p, legal_name: e.target.value }))} />
            </FormField>
            <FormField label="Registration Type">
              <select className={selectCls} value={form.registration_type}
                onChange={e => setForm(p => ({ ...p, registration_type: e.target.value }))}>
                <option value="unregistered">Unregistered</option>
                <option value="registered">Registered</option>
                <option value="composition">Composition</option>
                <option value="consumer">Consumer</option>
              </select>
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="PAN">
                <input className={inputCls} placeholder="ABCDE1234F" value={form.pan ?? ''}
                  onChange={e => setForm(p => ({ ...p, pan: e.target.value.toUpperCase() }))} />
              </FormField>
              <FormField label="GST Number">
                <input className={inputCls} placeholder="22AAAAA0000A1Z5" value={form.gst_number ?? ''}
                  onChange={e => setForm(p => ({ ...p, gst_number: e.target.value.toUpperCase() }))} />
              </FormField>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-xs text-slate-500 font-medium">Contact Details</p>
            <FormField label="Primary Contact">
              <input className={inputCls} placeholder="+91 98765 43210" value={form.primary_contact ?? ''}
                onChange={e => setForm(p => ({ ...p, primary_contact: e.target.value }))} />
            </FormField>
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-start gap-2">
              <Info className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-sky-700 leading-relaxed">
                A linked financial account will be automatically created for this party to track credit relations.
              </p>
            </div>
          </>
        )}

        <div className="flex gap-2 pt-2 border-t border-slate-100">
          {step === 1 && <SecondaryBtn onClick={onClose}>Cancel</SecondaryBtn>}
          {step > 1 && <SecondaryBtn onClick={() => setStep(s => s - 1)}>← Back</SecondaryBtn>}
          {step < 3 && <PrimaryBtn onClick={() => setStep(s => s + 1)}>Next →</PrimaryBtn>}
          {step === 3 && <PrimaryBtn onClick={handleSubmit} disabled={saving}>{saving ? 'Saving...' : 'Add Party'}</PrimaryBtn>}
        </div>
      </div>
    </ModalOverlay>
  );
}

function VoucherModal({ pumpId, accounts, onClose, onSaved }: {
  pumpId: number; accounts: Account[]; onClose: () => void; onSaved: () => void;
}) {
  const [mode, setMode] = useState<'quick' | 'journal'>('quick');
  const [quickForm, setQuickForm] = useState<QuickVoucherPayload>({
    pump_id: pumpId, voucher_type: 'payment', from_account_id: 0, to_account_id: 0, amount: 0, narration: '',
  });
  const [journalEntries, setJournalEntries] = useState<JournalEntryLine[]>([
    { account_id: 0, debit_amount: 0, credit_amount: 0, entry_order: 0 },
    { account_id: 0, debit_amount: 0, credit_amount: 0, entry_order: 1 },
  ]);
  const [journalNarration, setJournalNarration] = useState('');
  const [saving, setSaving] = useState(false);

  const totalDebit = journalEntries.reduce((s, e) => s + (e.debit_amount || 0), 0);
  const totalCredit = journalEntries.reduce((s, e) => s + (e.credit_amount || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleQuickSubmit = async () => {
    if (!quickForm.from_account_id || !quickForm.to_account_id) { toast.error('Select both accounts'); return; }
    if (quickForm.amount <= 0) { toast.error('Amount must be positive'); return; }
    setSaving(true);
    try {
      await createQuickVoucher(quickForm);
      toast.success('Voucher created successfully');
      onSaved();
    } catch (e: any) { toast.error(e?.response?.data?.detail ?? 'Failed to create voucher'); }
    finally { setSaving(false); }
  };

  const handleJournalSubmit = async () => {
    if (!isBalanced) { toast.error('Debit and credit totals must be equal'); return; }
    const validEntries = journalEntries.filter(e => e.account_id);
    if (validEntries.length < 2) { toast.error('At least 2 entries with accounts required'); return; }
    setSaving(true);
    try {
      await createJournalVoucher({ pump_id: pumpId, narration: journalNarration, entries: validEntries });
      toast.success('Journal voucher created');
      onSaved();
    } catch (e: any) { toast.error(e?.response?.data?.detail ?? 'Failed to create journal'); }
    finally { setSaving(false); }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="New Voucher" onClose={onClose} />
      <div className="p-6 flex flex-col gap-4">

        {/* Mode toggle */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'quick', label: 'Quick Payment/Receipt' },
            { id: 'journal', label: 'Journal Entry' },
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id as any)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer
                ${mode === m.id ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
              {m.label}
            </button>
          ))}
        </div>

        {mode === 'quick' && (
          <>
            <FormField label="Voucher Type">
              <select className={selectCls} value={quickForm.voucher_type}
                onChange={e => setQuickForm(p => ({ ...p, voucher_type: e.target.value as VoucherType }))}>
                <option value="payment">Payment</option>
                <option value="receipt">Receipt</option>
                <option value="contra">Contra (Bank Transfer)</option>
              </select>
            </FormField>
            <FormField label="From Account (Debit)" required>
              <select className={selectCls} value={quickForm.from_account_id}
                onChange={e => setQuickForm(p => ({ ...p, from_account_id: Number(e.target.value) }))}>
                <option value={0}>— Select Account —</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}{a.alias ? ` (${a.alias})` : ''}</option>)}
              </select>
            </FormField>
            <FormField label="To Account (Credit)" required>
              <select className={selectCls} value={quickForm.to_account_id}
                onChange={e => setQuickForm(p => ({ ...p, to_account_id: Number(e.target.value) }))}>
                <option value={0}>— Select Account —</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}{a.alias ? ` (${a.alias})` : ''}</option>)}
              </select>
            </FormField>
            <FormField label="Amount (₹)" required>
              <input type="number" className={inputCls} placeholder="0.00" value={quickForm.amount || ''}
                onChange={e => setQuickForm(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} />
            </FormField>
            <FormField label="Narration">
              <input className={inputCls} placeholder="Optional note" value={quickForm.narration ?? ''}
                onChange={e => setQuickForm(p => ({ ...p, narration: e.target.value }))} />
            </FormField>
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <SecondaryBtn onClick={onClose}>Cancel</SecondaryBtn>
              <PrimaryBtn onClick={handleQuickSubmit} disabled={saving}>
                {saving ? 'Creating...' : 'Create Voucher'}
              </PrimaryBtn>
            </div>
          </>
        )}

        {mode === 'journal' && (
          <>
            <FormField label="Narration">
              <input className={inputCls} placeholder="Journal description" value={journalNarration}
                onChange={e => setJournalNarration(e.target.value)} />
            </FormField>

            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-[1fr_100px_100px_32px] gap-2 text-[10px] font-bold text-slate-400 uppercase px-1">
                <span>Account</span><span>Debit</span><span>Credit</span><span />
              </div>
              {journalEntries.map((entry, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_100px_100px_32px] gap-2 items-center">
                  <select className={selectCls} value={entry.account_id}
                    onChange={e => {
                      const updated = [...journalEntries];
                      updated[idx].account_id = Number(e.target.value);
                      setJournalEntries(updated);
                    }}>
                    <option value={0}>— Account —</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  <input type="number" className={inputCls} placeholder="0" value={entry.debit_amount || ''}
                    onChange={e => {
                      const updated = [...journalEntries];
                      updated[idx].debit_amount = parseFloat(e.target.value) || 0;
                      setJournalEntries(updated);
                    }} />
                  <input type="number" className={inputCls} placeholder="0" value={entry.credit_amount || ''}
                    onChange={e => {
                      const updated = [...journalEntries];
                      updated[idx].credit_amount = parseFloat(e.target.value) || 0;
                      setJournalEntries(updated);
                    }} />
                  <button
                    onClick={() => journalEntries.length > 2 && setJournalEntries(prev => prev.filter((_, i) => i !== idx))}
                    className="p-1 rounded-lg hover:bg-rose-50 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer disabled:opacity-30"
                    disabled={journalEntries.length <= 2}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setJournalEntries(prev => [...prev, { account_id: 0, debit_amount: 0, credit_amount: 0, entry_order: prev.length }])}
              className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Add Line
            </button>

            {/* Balance check */}
            <div className={`flex justify-between items-center px-3 py-2 rounded-xl border text-xs font-bold ${isBalanced ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
              <span>Debit: ₹{totalDebit.toLocaleString('en-IN')}</span>
              <span>Credit: ₹{totalCredit.toLocaleString('en-IN')}</span>
              <span>{isBalanced ? '✓ Balanced' : '✗ Not Balanced'}</span>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <SecondaryBtn onClick={onClose}>Cancel</SecondaryBtn>
              <PrimaryBtn onClick={handleJournalSubmit} disabled={saving || !isBalanced}>
                {saving ? 'Creating...' : 'Create Journal'}
              </PrimaryBtn>
            </div>
          </>
        )}
      </div>
    </ModalOverlay>
  );
}

function VoucherEntriesModal({ voucher, onClose }: { voucher: Voucher; onClose: () => void }) {
  const totalDebit = voucher.entries.reduce((s, e) => s + e.debit_amount, 0);
  const totalCredit = voucher.entries.reduce((s, e) => s + e.credit_amount, 0);

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title={`Voucher #${voucher.id} — Ledger Entries`} onClose={onClose} />
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <VoucherBadge type={voucher.voucher_type} />
          <span className="text-xs text-slate-500">{new Date(voucher.voucher_date).toLocaleString('en-IN')}</span>
          {voucher.narration && <span className="text-xs text-slate-600 font-medium">— {voucher.narration}</span>}
        </div>
        <div className="border border-slate-100 rounded-2xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-2.5 font-extrabold text-slate-500 uppercase tracking-wider text-left">Account</th>
                <th className="px-4 py-2.5 font-extrabold text-slate-500 uppercase tracking-wider text-right">Debit</th>
                <th className="px-4 py-2.5 font-extrabold text-slate-500 uppercase tracking-wider text-right">Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {voucher.entries.map(e => (
                <tr key={e.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-semibold text-slate-700">{e.account_name ?? `Account #${e.account_id}`}</td>
                  <td className="px-4 py-2.5 font-mono text-right font-bold text-rose-600">
                    {e.debit_amount > 0 ? `₹${e.debit_amount.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-right font-bold text-emerald-600">
                    {e.credit_amount > 0 ? `₹${e.credit_amount.toLocaleString('en-IN')}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200 font-extrabold">
                <td className="px-4 py-2.5 text-slate-700">Total</td>
                <td className="px-4 py-2.5 text-right font-mono text-rose-600">₹{totalDebit.toLocaleString('en-IN')}</td>
                <td className="px-4 py-2.5 text-right font-mono text-emerald-600">₹{totalCredit.toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <SecondaryBtn onClick={onClose}>Close</SecondaryBtn>
      </div>
    </ModalOverlay>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
      <div className="opacity-30">{icon}</div>
      <p className="text-xs font-semibold text-center max-w-xs">{text}</p>
    </div>
  );
}