"use client";
import { useState } from "react";
import { Receipt, Check, Loader2, X } from "lucide-react";
import Image from "next/image";

const FUEL_PRICES: Record<string, number> = {
  Petrol: 110,
  Diesel: 91,
  CNG: 76,
  "Premium Petrol": 120,
};

const recentBills = [
  { id: "FF042", vehicle: "MH12AB1234", fuel: "Petrol", qty: 12, amount: 1320, time: "09:42 AM", settled: true },
  { id: "FF041", vehicle: "DL4C5678", fuel: "Diesel", qty: 25, amount: 2275, time: "09:15 AM", settled: true },
  { id: "FF040", vehicle: "KA03CD9012", fuel: "Petrol", qty: 8, amount: 880, time: "08:51 AM", settled: true },
];

export default function BillingPage() {
  const [form, setForm] = useState({ vehicle: "", fuel: "Petrol", qty: "", price: "" });
  const [bills, setBills] = useState(recentBills);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lastBill, setLastBill] = useState<typeof recentBills[0] | null>(null);

  const pricePerL = FUEL_PRICES[form.fuel] || 0;
  const qty = parseFloat(form.qty) || 0;
  const customPrice = parseFloat(form.price) || pricePerL;
  const total = qty * customPrice;

  const handleFuelChange = (fuel: string) => {
    setForm(f => ({ ...f, fuel, price: String(FUEL_PRICES[fuel]) }));
  };

  const handleCreate = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    const bill = {
      id: `FF${String(bills.length + 43).padStart(3, "0")}`,
      vehicle: form.vehicle.toUpperCase(),
      fuel: form.fuel,
      qty,
      amount: total,
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      settled: true,
    };
    setBills(b => [bill, ...b]);
    setLastBill(bill);
    setLoading(false);
    setSuccess(true);
    setForm({ vehicle: "", fuel: "Petrol", qty: "", price: "" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-800 text-gray-900" style={{ fontWeight: 800 }}>Billing System</h1>
        <p className="text-sm text-gray-500 mt-0.5">Create and settle fuel bills instantly</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Bill Form */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-sm font-700 text-gray-900 mb-5 flex items-center gap-2" style={{ fontWeight: 700 }}>
            <Image src="/logo.png" alt="FuelFlux" width={18} height={18} className="object-contain" /> New Bill
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-600 text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Vehicle Number *</label>
              <input className="input-base uppercase font-mono" placeholder="e.g. MH12AB1234" value={form.vehicle}
                onChange={e => setForm({ ...form, vehicle: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-600 text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Fuel Type *</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(FUEL_PRICES).map(fuel => (
                  <button key={fuel} onClick={() => handleFuelChange(fuel)}
                    className={`py-2 px-3 rounded-xl text-xs font-600 border transition-all ${form.fuel === fuel ? "bg-orange-500 text-white border-orange-500 shadow-brand" : "bg-white text-gray-600 border-gray-200 hover:border-orange-200"}`}
                    style={{ fontWeight: 600 }}>
                    {fuel}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-600 text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Quantity (Litres) *</label>
                <input className="input-base" type="number" placeholder="0.00" value={form.qty}
                  onChange={e => setForm({ ...form, qty: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-600 text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Price / Litre (₹)</label>
                <input className="input-base" type="number" value={form.price || pricePerL}
                  onChange={e => setForm({ ...form, price: e.target.value })} />
              </div>
            </div>

            {/* Auto Total */}
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-orange-700">Quantity</span>
                <span className="text-xs font-600 text-orange-800" style={{ fontWeight: 600 }}>{qty}L</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-orange-700">Rate</span>
                <span className="text-xs font-600 text-orange-800" style={{ fontWeight: 600 }}>₹{customPrice || pricePerL}/L</span>
              </div>
              <div className="border-t border-orange-200 pt-2 mt-2 flex justify-between items-center">
                <span className="text-sm font-700 text-orange-900" style={{ fontWeight: 700 }}>Total Amount</span>
                <span className="text-xl font-800 text-orange-600" style={{ fontWeight: 800 }}>₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <button onClick={handleCreate} disabled={!form.vehicle || !form.qty || loading}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Receipt className="w-4 h-4" /> Create & Settle Bill</>}
            </button>
          </div>
        </div>

        {/* Recent Bills */}
        <div className="lg:col-span-3 card">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-sm font-700 text-gray-900" style={{ fontWeight: 700 }}>Today's Bills</h2>
            <p className="text-xs text-gray-400 mt-0.5">{bills.length} transactions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>Vehicle</th>
                  <th>Fuel</th>
                  <th>Qty</th>
                  <th>Amount</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(b => (
                  <tr key={b.id}>
                    <td className="font-600 text-orange-600 font-mono text-xs" style={{ fontWeight: 600 }}>{b.id}</td>
                    <td className="font-mono text-sm">{b.vehicle}</td>
                    <td><span className={`badge ${b.fuel === "Petrol" || b.fuel === "Premium Petrol" ? "badge-orange" : b.fuel === "Diesel" ? "badge-blue" : "badge-green"}`}>{b.fuel}</span></td>
                    <td>{b.qty}L</td>
                    <td className="font-700 text-gray-900" style={{ fontWeight: 700 }}>₹{b.amount.toLocaleString("en-IN")}</td>
                    <td className="text-gray-400 text-xs">{b.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {success && lastBill && (
        <div className="toast success">
          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
          <div>
            <p className="font-600" style={{ fontWeight: 600 }}>Bill #{lastBill.id} Created</p>
            <p className="text-xs text-gray-500">₹{lastBill.amount.toLocaleString("en-IN")} settled · Wallet updated</p>
          </div>
          <button onClick={() => setSuccess(false)}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
      )}
    </div>
  );
}
