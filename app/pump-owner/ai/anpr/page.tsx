"use client";
import { useState, useEffect } from "react";
import { Camera, Play, Pause, AlertCircle, Cpu, Search } from "lucide-react";

const DEMO_PLATES = [
  { plate: "MH12AB1234", time: "10:42:18", confidence: 97, type: "Car", fuel: "Petrol", status: "detected" },
  { plate: "DL4C5678XX", time: "10:41:05", confidence: 94, type: "Truck", fuel: "Diesel", status: "alert" },
  { plate: "KA03CD9012", time: "10:39:44", confidence: 99, type: "SUV", fuel: "Petrol", status: "detected" },
  { plate: "TN07EF3456", time: "10:38:22", confidence: 91, type: "Bus", fuel: "Diesel", status: "detected" },
  { plate: "GJ05GH7890", time: "10:36:11", confidence: 96, type: "Car", fuel: "Petrol", status: "detected" },
];

export default function ANPRPage() {
  const [running, setRunning] = useState(false);
  const [plates, setPlates] = useState(DEMO_PLATES);
  const [scanning, setScanning] = useState(false);
  const [scanBox, setScanBox] = useState({ x: 30, y: 40, w: 40, h: 20 });

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setScanBox(b => ({
        x: 20 + Math.random() * 40,
        y: 30 + Math.random() * 30,
        w: 30 + Math.random() * 20,
        h: 15 + Math.random() * 10,
      }));
      setScanning(s => !s);
    }, 1200);
    return () => clearInterval(interval);
  }, [running]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-800 text-gray-900 flex items-center gap-2" style={{ fontWeight: 800 }}>
            <Cpu className="w-6 h-6 text-orange-500" /> ANPR Camera
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Automatic Number Plate Recognition — AI-powered</p>
        </div>
        <div className="flex items-center gap-3">
          {running && <div className="live-badge"><span className="live-dot" />LIVE</div>}
          <button onClick={() => setRunning(r => !r)} className={running ? "btn-secondary" : "btn-primary"} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {running ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Start Camera</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Camera Feed */}
        <div className="lg:col-span-3">
          <div className="camera-feed" style={{ minHeight: 280 }}>
            {!running ? (
              <div className="text-center text-gray-500">
                <Camera className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Camera feed paused</p>
                <p className="text-xs opacity-60 mt-1">Click "Start Camera" to begin ANPR</p>
              </div>
            ) : (
              <>
                {/* Simulated camera grid */}
                <div className="absolute inset-0 opacity-10">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="absolute border border-green-400" style={{
                      left: `${(i % 4) * 25}%`, top: `${Math.floor(i / 4) * 33}%`, width: "25%", height: "33%"
                    }} />
                  ))}
                </div>
                {/* Detection overlay box */}
                <div className="absolute border-2 border-orange-400 bg-orange-400/10 transition-all duration-500 rounded-sm" style={{
                  left: `${scanBox.x}%`, top: `${scanBox.y}%`, width: `${scanBox.w}%`, height: `${scanBox.h}%`
                }}>
                  <div className="absolute -top-6 left-0 bg-orange-500 text-white text-xs px-2 py-0.5 rounded font-mono whitespace-nowrap font-600" style={{ fontWeight: 600 }}>
                    {scanning ? "SCANNING..." : "MH12AB1234 ✓"}
                  </div>
                </div>
                {/* Corner markers */}
                {[["top-2 left-2", "border-t-2 border-l-2"], ["top-2 right-2", "border-t-2 border-r-2"], ["bottom-2 left-2", "border-b-2 border-l-2"], ["bottom-2 right-2", "border-b-2 border-r-2"]].map(([pos, border]) => (
                  <div key={pos} className={`absolute w-5 h-5 border-orange-400 ${pos} ${border}`} />
                ))}
                <div className="camera-overlay" />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="live-badge text-xs"><span className="live-dot" />ANPR ACTIVE</span>
                </div>
                <div className="absolute bottom-3 right-3 text-xs text-green-400 font-mono">CAM-01 | 1080p | 30fps</div>
              </>
            )}
          </div>
        </div>

        {/* Detection Stats */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Detected Today", value: "142", color: "text-orange-600", bg: "bg-orange-50" },
              { label: "Alerts", value: "3", color: "text-red-600", bg: "bg-red-50" },
              { label: "Accuracy", value: "96.4%", color: "text-green-600", bg: "bg-green-50" },
              { label: "Avg. Confidence", value: "95.4%", color: "text-blue-600", bg: "bg-blue-50" },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                <p className={`text-xl font-800 ${s.color}`} style={{ fontWeight: 800 }}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-4 h-4 text-gray-400" />
              <input className="flex-1 text-sm outline-none text-gray-700" placeholder="Search plate..." />
            </div>
          </div>
        </div>
      </div>

      {/* Plate List */}
      <div className="card">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-sm font-700 text-gray-900" style={{ fontWeight: 700 }}>Recent Detections</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Plate Number</th>
                <th>Vehicle Type</th>
                <th>Fuel Type</th>
                <th>Confidence</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {plates.map((p, i) => (
                <tr key={i}>
                  <td><span className="font-mono font-700 text-gray-900 bg-gray-100 px-2 py-1 rounded-lg text-sm" style={{ fontWeight: 700 }}>{p.plate}</span></td>
                  <td className="text-sm">{p.type}</td>
                  <td><span className={`badge ${p.fuel === "Petrol" ? "badge-orange" : "badge-blue"}`}>{p.fuel}</span></td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${p.confidence}%` }} />
                      </div>
                      <span className="text-xs text-gray-600">{p.confidence}%</span>
                    </div>
                  </td>
                  <td className="text-xs font-mono text-gray-500">{p.time}</td>
                  <td>
                    {p.status === "alert" ? (
                      <span className="badge badge-red flex items-center gap-1 w-fit">
                        <AlertCircle className="w-3 h-3" /> Alert
                      </span>
                    ) : <span className="badge badge-green">Detected</span>}
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
