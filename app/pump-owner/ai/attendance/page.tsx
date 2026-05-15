"use client";
import { useState, useEffect } from "react";
import { Users, Clock, CheckCircle, XCircle, Camera } from "lucide-react";

const staff = [
  { id: 1, name: "Ramesh Kumar", role: "Fuel Attendant", shift: "Morning (6AM-2PM)", status: "present", checkIn: "05:58 AM", checkOut: null, face: "RK" },
  { id: 2, name: "Suresh Mehta", role: "Fuel Attendant", shift: "Morning (6AM-2PM)", status: "present", checkIn: "06:03 AM", checkOut: null, face: "SM" },
  { id: 3, name: "Priya Rao", role: "Cashier", shift: "Morning (6AM-2PM)", status: "present", checkIn: "05:55 AM", checkOut: null, face: "PR" },
  { id: 4, name: "Arjun Patel", role: "Manager", shift: "Morning (6AM-2PM)", status: "late", checkIn: "06:42 AM", checkOut: null, face: "AP" },
  { id: 5, name: "Deepak Sharma", role: "Fuel Attendant", shift: "Evening (2PM-10PM)", status: "absent", checkIn: null, checkOut: null, face: "DS" },
  { id: 6, name: "Kavitha Nair", role: "Cashier", shift: "Evening (2PM-10PM)", status: "not-started", checkIn: null, checkOut: null, face: "KN" },
];

const logs = [
  { name: "Priya Rao", action: "Check-in", time: "05:55 AM", confidence: 99, method: "Face ID" },
  { name: "Ramesh Kumar", action: "Check-in", time: "05:58 AM", confidence: 97, method: "Face ID" },
  { name: "Suresh Mehta", action: "Check-in", time: "06:03 AM", confidence: 96, method: "Face ID" },
  { name: "Arjun Patel", action: "Check-in (LATE)", time: "06:42 AM", confidence: 98, method: "Face ID" },
];

export default function AttendancePage() {
  const [scanning, setScanning] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!scanning) return;
    const t = setInterval(() => setTick(x => x + 1), 800);
    return () => clearInterval(t);
  }, [scanning]);

  const presentCount = staff.filter(s => s.status === "present" || s.status === "late").length;
  const absentCount = staff.filter(s => s.status === "absent").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2" style={{ fontWeight: 800 }}>
            <Users className="w-6 h-6 text-orange-500" /> AI Attendance
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Face recognition–based staff attendance tracking</p>
        </div>
        <div className="flex items-center gap-3">
          {scanning && <div className="live-badge"><span className="live-dot" />SCANNING</div>}
          <button onClick={() => setScanning(s => !s)}
            className={scanning ? "btn-secondary flex items-center gap-2 py-2 px-4 text-sm" : "btn-primary flex items-center gap-2 py-2 px-4 text-sm"}>
            <Camera className="w-4 h-4" /> {scanning ? "Stop Camera" : "Start Face Scan"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "On Duty", value: presentCount, icon: "✅", color: "bg-green-50 border-green-100 text-green-700" },
          { label: "Late Arrivals", value: 1, icon: "⏰", color: "bg-amber-50 border-amber-100 text-amber-700" },
          { label: "Absent", value: absentCount, icon: "❌", color: "bg-red-50 border-red-100 text-red-700" },
          { label: "Total Staff", value: staff.length, icon: "👥", color: "bg-blue-50 border-blue-100 text-blue-700" },
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-xl p-4 flex items-center gap-3`}>
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-xs font-semibold">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Feed */}
        <div className="lg:col-span-1">
          <div className="camera-feed" style={{ minHeight: 220 }}>
            {!scanning ? (
              <div className="text-center text-gray-500">
                <Camera className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Start camera to scan</p>
              </div>
            ) : (
              <>
                <div className="absolute inset-0 opacity-5" style={{
                  backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)"
                }} />
                {/* Moving face box */}
                <div className="absolute border-2 border-green-400 rounded transition-all duration-500"
                  style={{ left: "30%", top: "20%", width: "40%", height: "55%" }}>
                  <div className="absolute -top-6 left-0 bg-green-500 text-white text-xs px-2 py-0.5 rounded font-mono whitespace-nowrap">
                    {tick % 3 === 0 ? "SCANNING..." : tick % 3 === 1 ? "Ramesh Kumar ✓" : "Conf: 97%"}
                  </div>
                </div>
                <div className="camera-overlay" style={{ borderColor: "rgba(34,197,94,0.6)" }} />
                <div className="absolute top-2 left-2">
                  <span className="live-badge text-xs"><span className="live-dot" />FACE AI ACTIVE</span>
                </div>
                <div className="absolute bottom-2 right-2 text-xs text-green-400 font-mono">ENTRANCE-CAM | 1080p</div>
              </>
            )}
          </div>

          {/* Today's Log */}
          <div className="card mt-4">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">Today's Check-ins</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {logs.map((l, i) => (
                <div key={i} className="p-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-600">
                    {l.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{l.name}</p>
                    <p className="text-xs text-gray-400">{l.action} · {l.time}</p>
                  </div>
                  <span className="text-xs text-green-600 font-bold">{l.confidence}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Staff Grid */}
        <div className="lg:col-span-2 card">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Staff Status — Today</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr><th>Staff Member</th><th>Role</th><th>Shift</th><th>Check-In</th><th>Status</th></tr>
              </thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{s.face}</div>
                        <span className="text-sm font-semibold text-gray-900">{s.name}</span>
                      </div>
                    </td>
                    <td className="text-xs text-gray-500">{s.role}</td>
                    <td className="text-xs text-gray-500">{s.shift}</td>
                    <td className="text-xs font-mono text-gray-700">{s.checkIn || "—"}</td>
                    <td>
                      <span className={`badge text-xs ${
                        s.status === "present" ? "badge-green" :
                        s.status === "late" ? "badge-yellow" :
                        s.status === "absent" ? "badge-red" : "badge-gray"
                      }`}>
                        {s.status === "present" ? "✓ Present" :
                         s.status === "late" ? "⏰ Late" :
                         s.status === "absent" ? "✗ Absent" : "Not Started"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
