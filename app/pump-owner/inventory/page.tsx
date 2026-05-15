"use client";
import { useState } from "react";
import { Package, AlertTriangle, TrendingDown, Plus, RefreshCw, Download } from "lucide-react";

const stock = [
  { type: "Petrol", current: 6800, capacity: 10000, unit: "L", threshold: 3000, supplier: "HPCL", lastRefill: "Jan 10", price: 110 },
  { type: "Diesel", current: 3360, capacity: 8000, unit: "L", threshold: 2500, supplier: "BPCL", lastRefill: "Jan 8", price: 91 },
  { type: "CNG", current: 4250, capacity: 5000, unit: "Kg", threshold: 1000, supplier: "MGL", lastRefill: "Jan 12", price: 90 },
];

const history = [
  { date: "Jan 12", type: "CNG", qty: "500 Kg", supplier: "MGL", cost: "₹45,000", status: "received" },
  { date: "Jan 10", type: "Petrol", qty: "5,000 L", supplier: "HPCL", cost: "₹5,50,000", status: "received" },
  { date: "Jan 08", type: "Diesel", qty: "4,000 L", supplier: "BPCL", cost: "₹3,64,000", status: "received" },
  { date: "Jan 05", type: "Petrol", qty: "3,000 L", supplier: "HPCL", cost: "₹3,30,000", status: "received" },
  { date: "Jan 02", type: "Diesel", qty: "2,500 L", supplier: "BPCL", cost: "₹2,27,500", status: "received" },
];

export default function InventoryPage() {
  const [showOrder, setShowOrder] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900" style={{ fontWeight: 800 }}>Fuel Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">Stock levels, supplier management & refill history</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowOrder(true)} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
            <Plus className="w-4 h-4" /> Request Refill
          </button>
          <button className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stock.filter(s => s.current < s.threshold).map(s => (
        <div key={s.type} className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-800">Low Stock Alert — {s.type}</p>
            <p className="text-xs text-red-600 mt-0.5">Current stock ({s.current.toLocaleString("en-IN")} {s.unit}) is below the minimum threshold ({s.threshold.toLocaleString("en-IN")} {s.unit}). Request refill immediately.</p>
          </div>
          <button onClick={() => setShowOrder(true)} className="text-xs font-bold text-red-700 border border-red-300 rounded-lg px-3 py-1.5 hover:bg-red-100 whitespace-nowrap">
            Order Now
          </button>
        </div>
      ))}

      {/* Stock Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stock.map(s => {
          const pct = Math.round((s.current / s.capacity) * 100);
          const isLow = s.current < s.threshold;
          const color = isLow ? "#ef4444" : pct > 60 ? "#22c55e" : "#f97316";
          return (
            <div key={s.type} className={`card p-5 ${isLow ? "border-red-200" : ""}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${color}18` }}>
                    ⛽
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{s.type}</p>
                    <p className="text-xs text-gray-400">Supplier: {s.supplier}</p>
                  </div>
                </div>
                {isLow && <span className="badge badge-red text-xs flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Low</span>}
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500">Current Stock</span>
                  <span className="font-bold text-gray-900">{s.current.toLocaleString("en-IN")} / {s.capacity.toLocaleString("en-IN")} {s.unit}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="h-3 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">0</span>
                  <span className="text-xs font-semibold" style={{ color }}>{pct}%</span>
                  <span className="text-xs text-gray-400">{s.capacity.toLocaleString("en-IN")} {s.unit}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400">Current Price</p>
                  <p className="text-sm font-bold text-gray-900">₹{s.price}/{s.unit}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Last Refill</p>
                  <p className="text-sm font-bold text-gray-900">{s.lastRefill}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Min. Threshold</p>
                  <p className="text-sm font-bold text-gray-900">{s.threshold.toLocaleString("en-IN")} {s.unit}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Stock Value</p>
                  <p className="text-sm font-bold text-gray-900">₹{(s.current * s.price / 100000).toFixed(2)}L</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Consumption Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {[
          { label: "Petrol Used Today", value: "3,200 L", sub: "26.4% below weekly avg", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
          { label: "Diesel Used Today", value: "1,840 L", sub: "8.1% above weekly avg", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
          { label: "CNG Used Today", value: "750 Kg", sub: "On target", color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-4`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-sm font-semibold text-gray-700 mt-1">{s.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Refill History */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">Refill History</h2>
          <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr><th>Date</th><th>Fuel Type</th><th>Quantity</th><th>Supplier</th><th>Cost</th><th>Status</th></tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i}>
                  <td className="text-gray-500 text-xs font-mono">{h.date}</td>
                  <td><span className={`badge ${h.type === "Petrol" ? "badge-orange" : h.type === "Diesel" ? "badge-blue" : "badge-green"}`}>{h.type}</span></td>
                  <td className="font-semibold text-gray-900">{h.qty}</td>
                  <td className="text-sm text-gray-600">{h.supplier}</td>
                  <td className="font-bold text-gray-900">{h.cost}</td>
                  <td><span className="badge badge-green">✓ Received</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Modal */}
      {showOrder && (
        <div className="modal-overlay" onClick={() => setShowOrder(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Request Fuel Refill</h2>
            <p className="text-sm text-gray-500 mb-5">Submit a refill request to your supplier</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Fuel Type</label>
                <select className="input-base">
                  <option>Petrol</option><option>Diesel</option><option>CNG</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Quantity</label>
                <input className="input-base" type="number" placeholder="Enter quantity in litres/kg" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Preferred Delivery Date</label>
                <input className="input-base" type="date" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Notes</label>
                <textarea className="input-base" rows={2} placeholder="Additional instructions..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="btn-primary flex-1">Submit Request</button>
              <button className="btn-ghost flex-1" onClick={() => setShowOrder(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
