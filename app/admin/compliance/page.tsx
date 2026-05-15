"use client";
import { ShieldCheck, FileCheck, AlertTriangle, CheckCircle, Clock, Download } from "lucide-react";

const complianceItems = [
  { id: 1, pump: "Sunrise Fuels", doc: "Pump License", dueDate: "Feb 28, 2024", status: "valid", submittedOn: "Jan 2, 2024" },
  { id: 2, pump: "Sharma Fuel Station", doc: "NOC Certificate", dueDate: "Jan 20, 2024", status: "expiring", submittedOn: "Dec 15, 2023" },
  { id: 3, pump: "City Petrol Hub", doc: "Fire Safety Certificate", dueDate: "Mar 15, 2024", status: "valid", submittedOn: "Jan 10, 2024" },
  { id: 4, pump: "Metro Fuels", doc: "Pollution Control", dueDate: "Jan 25, 2024", status: "pending", submittedOn: null },
  { id: 5, pump: "Green Valley Fuel", doc: "Weights & Measures", dueDate: "Feb 10, 2024", status: "valid", submittedOn: "Dec 28, 2023" },
  { id: 6, pump: "Kumar Gas Station", doc: "Pump License", dueDate: "Jan 18, 2024", status: "expired", submittedOn: "Jan 18, 2023" },
  { id: 7, pump: "Mehta Petrolium", doc: "GST Registration", dueDate: "Permanent", status: "valid", submittedOn: "Nov 5, 2023" },
];

const statusStyle: Record<string, string> = {
  valid: "badge-green", expiring: "badge-yellow", pending: "badge-yellow", expired: "badge-red"
};

const statusIcon: Record<string, React.ReactNode> = {
  valid: <CheckCircle className="w-3.5 h-3.5 text-green-500" />,
  expiring: <Clock className="w-3.5 h-3.5 text-amber-500" />,
  pending: <Clock className="w-3.5 h-3.5 text-amber-500" />,
  expired: <AlertTriangle className="w-3.5 h-3.5 text-red-500" />,
};

const checklistCategories = [
  {
    category: "Licensing & Registration",
    items: [
      { label: "Petroleum Business License", done: true },
      { label: "Shop & Establishment Act Registration", done: true },
      { label: "GST Registration", done: true },
      { label: "Explosives Department License", done: false },
    ]
  },
  {
    category: "Safety & Environmental",
    items: [
      { label: "Fire Safety NOC", done: true },
      { label: "Pollution Control Board Certificate", done: false },
      { label: "Weights & Measures Certification", done: true },
      { label: "Hazardous Waste Management Plan", done: false },
    ]
  },
];

export default function CompliancePage() {
  const expiredCount = complianceItems.filter(c => c.status === "expired").length;
  const expiringCount = complianceItems.filter(c => c.status === "expiring").length;
  const pendingCount = complianceItems.filter(c => c.status === "pending").length;
  const validCount = complianceItems.filter(c => c.status === "valid").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2" style={{ fontWeight: 800 }}>
            <ShieldCheck className="w-6 h-6 text-orange-500" /> Compliance Manager
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Track regulatory documents, licenses & certifications</p>
        </div>
        <button className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm">
          <Download className="w-3.5 h-3.5" /> Export Report
        </button>
      </div>

      {/* Alerts */}
      {(expiredCount > 0 || expiringCount > 0) && (
        <div className="space-y-2">
          {expiredCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-red-800">{expiredCount} Expired Document{expiredCount > 1 ? "s" : ""}</p>
                <p className="text-xs text-red-600">Immediate renewal required to maintain platform compliance.</p>
              </div>
            </div>
          )}
          {expiringCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-800">{expiringCount} Document{expiringCount > 1 ? "s" : ""} Expiring Soon</p>
                <p className="text-xs text-amber-600">Please remind pump owners to renew within the next 30 days.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Valid", value: validCount, bg: "bg-green-50 border-green-100", text: "text-green-600" },
          { label: "Expiring Soon", value: expiringCount, bg: "bg-amber-50 border-amber-100", text: "text-amber-600" },
          { label: "Pending Upload", value: pendingCount, bg: "bg-blue-50 border-blue-100", text: "text-blue-600" },
          { label: "Expired", value: expiredCount, bg: "bg-red-50 border-red-100", text: "text-red-600" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-xl p-4`}>
            <p className={`text-3xl font-black ${s.text}`}>{s.value}</p>
            <p className="text-xs font-semibold text-gray-600 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Table */}
        <div className="lg:col-span-2 card">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Document Tracker</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr><th>Pump</th><th>Document</th><th>Expiry Date</th><th>Submitted</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {complianceItems.map(c => (
                  <tr key={c.id}>
                    <td className="font-semibold text-sm text-gray-900">{c.pump}</td>
                    <td className="text-sm text-gray-600">{c.doc}</td>
                    <td className="text-xs text-gray-500 font-mono">{c.dueDate}</td>
                    <td className="text-xs text-gray-500">{c.submittedOn || "—"}</td>
                    <td>
                      <span className={`badge text-xs flex items-center gap-1 w-fit ${statusStyle[c.status]}`}>
                        {statusIcon[c.status]} {c.status}
                      </span>
                    </td>
                    <td>
                      <button className="text-xs font-semibold text-orange-500 hover:text-orange-700">
                        {c.status === "pending" ? "Upload" : "View"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compliance Checklist */}
        <div className="space-y-4">
          {checklistCategories.map(cat => (
            <div key={cat.category} className="card p-4">
              <h3 className="text-xs font-bold text-gray-700 mb-3">{cat.category}</h3>
              <div className="space-y-2.5">
                {cat.items.map(item => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${item.done ? "bg-green-100" : "bg-gray-100"}`}>
                      {item.done
                        ? <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                        : <span className="w-2 h-2 bg-gray-300 rounded-sm" />
                      }
                    </div>
                    <span className={`text-xs ${item.done ? "text-gray-700" : "text-gray-400"}`}>{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-green-500 transition-all"
                    style={{ width: `${(cat.items.filter(i => i.done).length / cat.items.length) * 100}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {cat.items.filter(i => i.done).length}/{cat.items.length} complete
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
