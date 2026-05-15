"use client";
import { useState } from "react";
import { Users, Plus, Upload, X, Check, Eye, EyeOff, Loader2, Search } from "lucide-react";

const SHIFTS = ["Morning (6AM-2PM)", "Afternoon (2PM-10PM)", "Night (10PM-6AM)"];
const DESIGNATIONS = ["Pump Attendant", "Supervisor", "Cashier", "Security Guard", "Maintenance Staff"];
const ROLES = ["Staff", "Supervisor", "Manager"];

const initialEmployees = [
  { id: "EMP001", name: "Suresh Kumar", phone: "9876543210", designation: "Pump Attendant", shift: "Morning (6AM-2PM)", status: "active", photo: null },
  { id: "EMP002", name: "Priya Singh", phone: "9845123456", designation: "Cashier", shift: "Afternoon (2PM-10PM)", status: "active", photo: null },
  { id: "EMP003", name: "Ramu Yadav", phone: "9321654789", designation: "Supervisor", shift: "Night (10PM-6AM)", status: "leave", photo: null },
  { id: "EMP004", name: "Anita Devi", phone: "9765432109", designation: "Pump Attendant", shift: "Morning (6AM-2PM)", status: "active", photo: null },
];

const initForm = { name: "", phone: "", idNumber: "", gender: "Male", designation: "", role: "Staff", shift: "", password: "", enableLogin: false };

export default function EmployeesPage() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [showAdd, setShowAdd] = useState(false);
  const [showLogin, setShowLogin] = useState<string | null>(null);
  const [form, setForm] = useState(initForm);
  const [loginForm, setLoginForm] = useState({ password: "", enabled: false });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.designation.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddEmployee = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setEmployees(e => [...e, {
      id: `EMP${String(e.length + 1).padStart(3, "0")}`,
      name: form.name, phone: form.phone,
      designation: form.designation, shift: form.shift,
      status: "active", photo: null,
    }]);
    setLoading(false);
    setShowAdd(false);
    setForm(initForm);
    setPhotoPreview(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-800 text-gray-900" style={{ fontWeight: 800 }}>Employee Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{employees.length} employees registered</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input className="input-base pl-10" placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Employee Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Phone</th>
                <th>Designation</th>
                <th>Shift</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-700 text-sm" style={{ fontWeight: 700 }}>
                        {emp.name[0]}
                      </div>
                      <div>
                        <p className="font-600 text-gray-900 text-sm" style={{ fontWeight: 600 }}>{emp.name}</p>
                        <p className="text-xs text-gray-400">{emp.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm">{emp.phone}</td>
                  <td><span className="badge badge-orange">{emp.designation}</span></td>
                  <td className="text-xs text-gray-500">{emp.shift}</td>
                  <td>
                    <span className={`badge ${emp.status === "active" ? "badge-green" : "badge-yellow"}`}>
                      {emp.status === "active" ? "Active" : "On Leave"}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => { setShowLogin(emp.id); setLoginForm({ password: "", enabled: true }); }}
                      className="text-xs text-orange-500 hover:text-orange-700 font-600 border border-orange-200 rounded-lg px-2.5 py-1 hover:bg-orange-50" style={{ fontWeight: 600 }}>
                      Setup Login
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}>
          <div className="modal-box max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-700" style={{ fontWeight: 700 }}>Add New Employee</h2>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            {/* Photo Upload */}
            <div className="text-center mb-6">
              <label className="cursor-pointer">
                <div className="w-20 h-20 rounded-full mx-auto border-2 border-dashed border-orange-200 flex items-center justify-center bg-orange-50 hover:bg-orange-100 transition-colors overflow-hidden">
                  {photoPreview ? <img src={photoPreview} alt="preview" className="w-full h-full object-cover" /> :
                    <Upload className="w-6 h-6 text-orange-400" />}
                </div>
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) setPhotoPreview(URL.createObjectURL(f)); }} />
              </label>
              <p className="text-xs text-gray-500 mt-2">Upload employee photo</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-600 text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Full Name *</label>
                <input className="input-base" placeholder="Employee name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-600 text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Phone *</label>
                <input className="input-base" type="tel" placeholder="10-digit phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-600 text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>ID Number</label>
                <input className="input-base" placeholder="Aadhaar / ID" value={form.idNumber} onChange={e => setForm({ ...form, idNumber: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-600 text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Gender</label>
                <select className="input-base" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-600 text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Designation *</label>
                <select className="input-base" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })}>
                  <option value="">Select...</option>
                  {DESIGNATIONS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-600 text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Role</label>
                <select className="input-base" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-600 text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Assign Shift *</label>
                <select className="input-base" value={form.shift} onChange={e => setForm({ ...form, shift: e.target.value })}>
                  <option value="">Select shift...</option>
                  {SHIFTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleAddEmployee} disabled={!form.name || !form.phone || !form.designation || !form.shift || loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Save Employee</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Setup Login Modal */}
      {showLogin && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowLogin(null); }}>
          <div className="modal-box max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-700" style={{ fontWeight: 700 }}>Setup Employee Login</h2>
              <button onClick={() => setShowLogin(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-600 text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Set Password</label>
                <div className="relative">
                  <input className="input-base pr-10" type={showPw ? "text" : "password"} placeholder="Min 6 characters"
                    value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setLoginForm(f => ({ ...f, enabled: !f.enabled }))}
                  className={`w-10 h-6 rounded-full transition-all relative ${loginForm.enabled ? "bg-orange-500" : "bg-gray-200"}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${loginForm.enabled ? "left-5" : "left-1"}`} />
                </div>
                <span className="text-sm text-gray-700 font-500" style={{ fontWeight: 500 }}>Enable Login Access</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowLogin(null)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={() => setShowLogin(null)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Save Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
