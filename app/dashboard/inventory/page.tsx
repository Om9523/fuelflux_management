'use client';

import React, { useState } from 'react';
import { Layers, Package, ShoppingCart, SlidersHorizontal, BarChart3, Waves } from 'lucide-react';

import TanksTab from './components/TanksTab';
import StockItemsTab from './components/StockItemsTab';
import StockPurchasesTab from './components/StockPurchasesTab';
import StockAdjustmentsTab from './components/StockAdjustmentsTab';
import StockSummaryTab from './components/StockSummaryTab';

const TABS = [
  { id: 'tanks', label: 'Storage Tanks', icon: Waves },
  { id: 'items', label: 'Stock Items', icon: Package },
  { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
  { id: 'adjustments', label: 'Adjustments', icon: SlidersHorizontal },
  { id: 'summary', label: 'Stock Summary', icon: BarChart3 },
];

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState('tanks');

  return (
    <div className="flex flex-col gap-6 w-full font-plus-jakarta text-slate-800">

      {/* ── PAGE HEADER ─────────────────────────────────────── */}
      <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl p-6 shadow-xs text-left">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 border border-orange-200 text-primary">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-text-primary tracking-tight">Inventory Management</h1>
          <p className="text-xs text-text-secondary">
            Manage tanks, stock items, purchases, adjustments and view live stock summary
          </p>
        </div>
      </div>

      {/* ── TABS NAV ────────────────────────────────────────── */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200/60 shadow-xs overflow-x-auto select-none gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 min-w-fit flex justify-center items-center gap-1.5 px-4 py-2.5
                text-xs font-bold rounded-xl transition-all cursor-pointer outline-none whitespace-nowrap
                ${isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }
              `}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENT ─────────────────────────────────────── */}
      {activeTab === 'tanks' && <TanksTab />}
      {activeTab === 'items' && <StockItemsTab />}
      {activeTab === 'purchases' && <StockPurchasesTab />}
      {activeTab === 'adjustments' && <StockAdjustmentsTab />}
      {activeTab === 'summary' && <StockSummaryTab />}
    </div>
  );
}