"use client";
import { useState, useEffect } from "react";
import { Camera, Wifi, WifiOff, AlertCircle, RefreshCw, Maximize2, Settings } from "lucide-react";

const CAMERAS = [
  { id: "CAM-01", label: "Main Entrance", status: "online", alert: false },
  { id: "CAM-02", label: "Petrol Bay A", status: "online", alert: true },
  { id: "CAM-03", label: "Diesel Bay B", status: "online", alert: false },
  { id: "CAM-04", label: "Cash Counter", status: "offline", alert: false },
  { id: "CAM-05", label: "Storage Tank", status: "online", alert: false },
  { id: "CAM-06", label: "Exit Gate", status: "online", alert: false },
];

const ALERTS = [
  { cam: "CAM-02", msg: "Unattended vehicle detected at Petrol Bay A", time: "2 min ago", level: "warning" },
  { cam: "CAM-01", msg: "Unauthorized person detected near entrance", time: "14 min ago", level: "danger" },
  { cam: "CAM-05", msg: "Tank area motion detected outside hours", time: "1 hr ago", level: "warning" },
];

export default function MonitorPage() {
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-2" style={{ fontWeight: 800 }}>
            <Camera className="w-6 h-6 text-orange-500" /> Live CCTV Monitor
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Real-time surveillance — {CAMERAS.filter(c => c.status === "online").length}/{CAMERAS.length} cameras online</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="live-badge"><span className="live-dot" />LIVE</div>
          <button className="btn-secondary flex items-center gap-2 py-2 px-3 text-xs">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Camera Grid */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-3">
          {CAMERAS.map(cam => (
            <div
              key={cam.id}
              onClick={() => setSelected(selected === cam.id ? null : cam.id)}
              className={`camera-feed cursor-pointer transition-all ${selected === cam.id ? "ring-2 ring-orange-500" : ""}`}
              style={{ minHeight: 130 }}
            >
              {cam.status === "offline" ? (
                <div className="text-center text-gray-600">
                  <WifiOff className="w-7 h-7 mx-auto mb-2 opacity-40" />
                  <p className="text-xs opacity-60">Camera Offline</p>
                </div>
              ) : (
                <>
                  {/* Simulated scan lines */}
                  <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)"
                  }} />
                  {/* Moving scan line */}
                  <div className="absolute left-0 right-0 h-px bg-green-400 opacity-40 transition-all duration-1000"
                    style={{ top: `${(tick * 17) % 100}%` }} />
                  {cam.alert && (
                    <div className="absolute top-2 right-2">
                      <AlertCircle className="w-4 h-4 text-red-400 animate-pulse" />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 text-xs text-green-400 font-mono opacity-80">{cam.id}</div>
                  <div className="absolute top-2 left-2">
                    <span className="flex items-center gap-1 text-xs text-green-400 font-mono">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />REC
                    </span>
                  </div>
                  <div className="camera-overlay" />
                </>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Camera List */}
          <div className="card">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">Camera Status</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {CAMERAS.map(cam => (
                <div key={cam.id} className="p-3 flex items-center gap-3 hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(cam.id)}>
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cam.status === "online" ? "bg-green-500" : "bg-gray-300"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900">{cam.id}</p>
                    <p className="text-xs text-gray-400 truncate">{cam.label}</p>
                  </div>
                  {cam.alert && <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="card">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">Alerts</h2>
              <span className="badge badge-red">{ALERTS.length}</span>
            </div>
            <div className="divide-y divide-gray-50">
              {ALERTS.map((a, i) => (
                <div key={i} className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${a.level === "danger" ? "bg-red-500" : "bg-amber-500"}`} />
                    <span className="text-xs font-bold text-gray-700">{a.cam}</span>
                    <span className="text-xs text-gray-400 ml-auto">{a.time}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{a.msg}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="card p-4">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Today's Summary</h2>
            <div className="space-y-3">
              {[
                { label: "Vehicles Entered", value: "142" },
                { label: "Vehicles Exited", value: "138" },
                { label: "Alerts Generated", value: "3" },
                { label: "Uptime", value: "99.1%" },
              ].map(s => (
                <div key={s.label} className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{s.label}</span>
                  <span className="text-sm font-bold text-gray-900">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
