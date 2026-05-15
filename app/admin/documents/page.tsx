"use client";
import { useState } from "react";
import { FileCheck, Eye, Check, X, Loader2 } from "lucide-react";

const DOCS = [
  { id: "D001", pump: "Sunrise Fuels", owner: "Arjun Verma", city: "Hyderabad", doc: "Pump License", submitted: "Jan 15, 2024", status: "pending", priority: "high" },
  { id: "D002", pump: "Kumar Gas Station", owner: "Ramesh Kumar", city: "Chennai", doc: "NOC Certificate", submitted: "Jan 14, 2024", status: "pending", priority: "medium" },
  { id: "D003", pump: "Green Valley Fuel", owner: "Priya Nair", city: "Kochi", doc: "Ownership Proof", submitted: "Jan 13, 2024", status: "approved", priority: "low" },
  { id: "D004", pump: "Highway Pumps", owner: "Sanjay Rao", city: "Pune", doc: "Pump License", submitted: "Jan 12, 2024", status: "rejected", priority: "low" },
  { id: "D005", pump: "Metro Fuels", owner: "Deepa Sharma", city: "Kolkata", doc: "NOC Certificate", submitted: "Jan 11, 2024", status: "pending", priority: "high" },
];

export default function AdminDocumentsPage() {
  const [docs, setDocs] = useState(DOCS);
  const [selected, setSelected] = useState<typeof DOCS[0] | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    setLoading(id + action);
    await new Promise(r => setTimeout(r, 1200));
    setDocs(prev => prev.map(d => d.id === id ? { ...d, status: action } : d));
    setSelected(null);
    setNote("");
    setLoading(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-800 text-gray-900 flex items-center gap-2" style={{ fontWeight: 800 }}>
          <FileCheck className="w-6 h-6 text-purple-500" /> Verify Documents
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Review and approve pump registration documents</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending Review", count: docs.filter(d => d.status === "pending").length, color: "badge-yellow" },
          { label: "Approved", count: docs.filter(d => d.status === "approved").length, color: "badge-green" },
          { label: "Rejected", count: docs.filter(d => d.status === "rejected").length, color: "badge-red" },
        ].map(s => (
          <div key={s.label} className="stat-card text-center p-4">
            <p className="text-3xl font-800 text-gray-900" style={{ fontWeight: 800 }}>{s.count}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-sm font-700 text-gray-900" style={{ fontWeight: 700 }}>Document Queue</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Pump</th>
                <th>Owner</th>
                <th>Document</th>
                <th>Submitted</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(doc => (
                <tr key={doc.id}>
                  <td>
                    <div>
                      <p className="font-600 text-sm text-gray-900" style={{ fontWeight: 600 }}>{doc.pump}</p>
                      <p className="text-xs text-gray-400">{doc.city}</p>
                    </div>
                  </td>
                  <td className="text-sm">{doc.owner}</td>
                  <td><span className="badge badge-blue">{doc.doc}</span></td>
                  <td className="text-xs text-gray-500">{doc.submitted}</td>
                  <td><span className={`badge ${doc.priority === "high" ? "badge-red" : doc.priority === "medium" ? "badge-yellow" : "badge-gray"}`}>{doc.priority}</span></td>
                  <td><span className={`badge ${doc.status === "approved" ? "badge-green" : doc.status === "rejected" ? "badge-red" : "badge-yellow"}`}>{doc.status}</span></td>
                  <td>
                    {doc.status === "pending" ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelected(doc)} className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-600 border border-purple-200 rounded-lg px-2 py-1 hover:bg-purple-50" style={{ fontWeight: 600 }}>
                          <Eye className="w-3 h-3" /> Review
                        </button>
                        <button onClick={() => handleAction(doc.id, "approved")} disabled={loading === doc.id + "approved"}
                          className="text-xs text-green-600 hover:text-green-800 font-600 border border-green-200 rounded-lg px-2 py-1 hover:bg-green-50" style={{ fontWeight: 600 }}>
                          {loading === doc.id + "approved" ? <Loader2 className="w-3 h-3 animate-spin" /> : "✓ Approve"}
                        </button>
                        <button onClick={() => handleAction(doc.id, "rejected")} disabled={loading === doc.id + "rejected"}
                          className="text-xs text-red-600 hover:text-red-800 font-600 border border-red-200 rounded-lg px-2 py-1 hover:bg-red-50" style={{ fontWeight: 600 }}>
                          {loading === doc.id + "rejected" ? <Loader2 className="w-3 h-3 animate-spin" /> : "✗ Reject"}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selected && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="modal-box max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-700" style={{ fontWeight: 700 }}>Review Document</h2>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Pump</span><span className="font-600" style={{ fontWeight: 600 }}>{selected.pump}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Owner</span><span className="font-600" style={{ fontWeight: 600 }}>{selected.owner}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Document</span><span className="font-600" style={{ fontWeight: 600 }}>{selected.doc}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Submitted</span><span className="font-600" style={{ fontWeight: 600 }}>{selected.submitted}</span></div>
            </div>
            {/* Simulated Document */}
            <div className="bg-gray-100 rounded-xl h-32 flex items-center justify-center mb-4 border border-gray-200">
              <div className="text-center text-gray-400">
                <p className="text-3xl mb-1">📄</p>
                <p className="text-xs">Document Preview</p>
                <button className="text-xs text-purple-600 mt-1 underline">Open Full Size</button>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-600 text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Review Note (optional)</label>
              <textarea className="input-base resize-none" rows={2} placeholder="Add a note for pump owner..." value={note}
                onChange={e => setNote(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleAction(selected.id, "rejected")} className="flex-1 py-2.5 rounded-xl font-600 text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
                <X className="w-4 h-4" /> Reject
              </button>
              <button onClick={() => handleAction(selected.id, "approved")} className="flex-1 py-2.5 rounded-xl font-600 text-white bg-green-500 hover:bg-green-600 transition-colors flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
                <Check className="w-4 h-4" /> Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
