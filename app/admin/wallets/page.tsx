"use client";
import { Wallet, TrendingUp, AlertCircle, Eye, Download } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const wallets = [
  { id: "W001", owner: "Rajesh Sharma", station: "Sharma Fuel Station", balance: 48250, funded: 125000, plan: "Gold", status: "active", lastTxn: "Jan 15" },
  { id: "W002", owner: "Sunil Mehta", station: "City Petrol Hub", balance: 182400, funded: 500000, plan: "Diamond", status: "active", lastTxn: "Jan 14" },
  { id: "W003", owner: "Priya Nair", station: "Green Valley Fuel", balance: 12800, funded: 75000, plan: "Gold", status: "active", lastTxn: "Jan 10" },
  { id: "W004", owner: "Arun Patel", station: "National Fuels", balance: 0, funded: 30000, plan: "Free", status: "suspended", lastTxn: "Dec 28" },
  { id: "W005", owner: "Kavitha R", station: "Metro Fuels", balance: 65000, funded: 220000, plan: "Diamond", status: "active", lastTxn: "Jan 12" },
];

const logisticsWallets = [
  { id: "LW001", company: "Speedy Logistics", balance: 185400, funded: 930000, status: "active" },
  { id: "LW002", company: "FleetPro Co.", balance: 0, funded: 120000, status: "suspended" },
];

const trendData = [
  { month: "Aug", volume: 820000 }, { month: "Sep", volume: 945000 },
  { month: "Oct", volume: 880000 }, { month: "Nov", volume: 1120000 },
  { month: "Dec", volume: 1380000 }, { month: "Jan", volume: 1250000 },
];

export default function WalletsPage() {
  const totalPumpBalance = wallets.reduce((a, w) => a + w.balance, 0);
  const totalLogisticsBalance = logisticsWallets.reduce((a, w) => a + w.balance, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2" style={{ fontWeight: 800 }}>
            <Wallet className="w-6 h-6 text-orange-500" /> Wallet Monitor
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform-wide wallet balances and transaction volumes</p>
        </div>
        <button className="btn-secondary flex items-center gap-2 py-2 px-3 text-xs">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pump Wallets Total", value: `₹${(totalPumpBalance / 1000).toFixed(1)}K`, bg: "bg-orange-50 border-orange-100", text: "text-orange-600" },
          { label: "Logistics Wallets Total", value: `₹${(totalLogisticsBalance / 1000).toFixed(1)}K`, bg: "bg-blue-50 border-blue-100", text: "text-blue-600" },
          { label: "Monthly Volume", value: "₹12.5L", bg: "bg-green-50 border-green-100", text: "text-green-600" },
          { label: "Suspended Accounts", value: "2", bg: "bg-red-50 border-red-100", text: "text-red-600" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-xl p-4`}>
            <p className={`text-xl font-black ${s.text}`}>{s.value}</p>
            <p className="text-xs font-semibold text-gray-600 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Volume Trend */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900">Monthly Wallet Volume (₹)</h2>
          <span className="badge badge-green text-xs flex items-center gap-1"><TrendingUp className="w-3 h-3" />+18.4% MoM</span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="walletGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false}
              tickFormatter={v => `₹${(v / 100000).toFixed(1)}L`} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
              formatter={(v: number) => `₹${(v / 100000).toFixed(2)}L`} />
            <Area type="monotone" dataKey="volume" name="Volume" stroke="#f97316" strokeWidth={2.5} fill="url(#walletGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Pump Owner Wallets */}
      <div className="card">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Pump Owner Wallets</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr><th>Wallet ID</th><th>Owner</th><th>Station</th><th>Balance</th><th>Total Funded</th><th>Plan</th><th>Last Txn</th><th>Status</th></tr>
            </thead>
            <tbody>
              {wallets.map(w => (
                <tr key={w.id}>
                  <td className="font-mono text-xs font-bold text-gray-500">{w.id}</td>
                  <td className="font-semibold text-sm text-gray-900">{w.owner}</td>
                  <td className="text-sm text-gray-600">{w.station}</td>
                  <td className={`font-black text-sm ${w.balance === 0 ? "text-red-500" : "text-gray-900"}`}>
                    ₹{w.balance.toLocaleString("en-IN")}
                  </td>
                  <td className="text-sm font-semibold text-gray-700">₹{w.funded.toLocaleString("en-IN")}</td>
                  <td><span className={`badge text-xs ${w.plan === "Diamond" ? "badge-blue" : w.plan === "Gold" ? "badge-orange" : "badge-gray"}`}>{w.plan}</span></td>
                  <td className="text-xs text-gray-400">{w.lastTxn}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className={`badge text-xs ${w.status === "active" ? "badge-green" : "badge-red"}`}>{w.status}</span>
                      {w.balance === 0 && w.status === "active" && (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" title="Zero balance" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logistics Wallets */}
      <div className="card">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Logistics Provider Wallets</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr><th>Wallet ID</th><th>Company</th><th>Balance</th><th>Total Funded</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {logisticsWallets.map(w => (
                <tr key={w.id}>
                  <td className="font-mono text-xs font-bold text-gray-500">{w.id}</td>
                  <td className="font-semibold text-sm text-gray-900">{w.company}</td>
                  <td className={`font-black text-sm ${w.balance === 0 ? "text-red-500" : "text-gray-900"}`}>
                    ₹{w.balance.toLocaleString("en-IN")}
                  </td>
                  <td className="text-sm font-semibold text-gray-700">₹{w.funded.toLocaleString("en-IN")}</td>
                  <td><span className={`badge text-xs ${w.status === "active" ? "badge-green" : "badge-red"}`}>{w.status}</span></td>
                  <td>
                    <button className="text-xs font-semibold text-orange-500 hover:text-orange-700 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
