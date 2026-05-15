"use client";
import { useState } from "react";
import { Users, Search, MoreVertical, ShieldOff, CheckCircle2 } from "lucide-react";

const USERS = [
  { id: "U001", name: "Rajesh Sharma", role: "Pump Owner", pump: "Sharma Fuel Station", plan: "Gold", status: "active", joined: "Dec 2023" },
  { id: "U002", name: "Speedy Logistics", role: "Logistics", pump: "—", plan: "—", status: "active", joined: "Nov 2023" },
  { id: "U003", name: "Sunil Mehta", role: "Pump Owner", pump: "City Petrol Hub", plan: "Diamond", status: "active", joined: "Jan 2024" },
  { id: "U004", name: "FleetPro Co.", role: "Logistics", pump: "—", plan: "—", status: "suspended", joined: "Oct 2023" },
  { id: "U005", name: "Priya Nair", role: "Pump Owner", pump: "Green Valley Fuel", plan: "Gold", status: "active", joined: "Jan 2024" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState(USERS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = users.filter(u =>
    (filter === "All" || u.role === filter || u.status === filter.toLowerCase()) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.pump?.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-800 text-gray-900 flex items-center gap-2" style={{ fontWeight: 800 }}>
          <Users className="w-6 h-6 text-purple-500" /> Manage Users
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">{users.length} registered users</p>
      </div>
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input-base pl-10" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {["All", "Pump Owner", "Logistics"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-2 rounded-xl font-500 transition-colors ${filter === f ? "bg-purple-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-purple-200"}`} style={{ fontWeight: 500 }}>{f}</button>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead><tr><th>User</th><th>Role</th><th>Pump/Company</th><th>Plan</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td><div className="flex items-center gap-2"><div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center font-700 text-purple-600 text-xs" style={{ fontWeight: 700 }}>{u.name[0]}</div><span className="text-sm font-600" style={{ fontWeight: 600 }}>{u.name}</span></div></td>
                  <td><span className={`badge ${u.role === "Pump Owner" ? "badge-orange" : "badge-blue"}`}>{u.role}</span></td>
                  <td className="text-sm text-gray-500">{u.pump}</td>
                  <td>{u.plan !== "—" ? <span className={`badge ${u.plan === "Diamond" ? "badge-blue" : "badge-orange"}`}>{u.plan}</span> : <span className="text-gray-400 text-xs">—</span>}</td>
                  <td className="text-xs text-gray-500">{u.joined}</td>
                  <td><span className={`badge ${u.status === "active" ? "badge-green" : "badge-red"}`}>{u.status}</span></td>
                  <td>
                    <button onClick={() => toggleStatus(u.id)} className={`text-xs font-600 border rounded-lg px-2 py-1 transition-colors ${u.status === "active" ? "text-red-600 border-red-200 hover:bg-red-50" : "text-green-600 border-green-200 hover:bg-green-50"}`} style={{ fontWeight: 600 }}>
                      {u.status === "active" ? <><ShieldOff className="w-3 h-3 inline mr-1" />Suspend</> : <><CheckCircle2 className="w-3 h-3 inline mr-1" />Activate</>}
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
