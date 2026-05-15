"use client";
import { useState } from "react";
import { Wallet, QrCode, Upload, Check, ChevronRight, X, Loader2 } from "lucide-react";

const PUMP_OWNERS = [
  { id: "PO001", name: "Sharma Fuel Station", owner: "Rajesh Sharma", city: "Mumbai" },
  { id: "PO002", name: "City Petrol Hub", owner: "Sunil Mehta", city: "Delhi" },
  { id: "PO003", name: "Green Energy Pump", owner: "Kavitha R", city: "Bangalore" },
  { id: "PO004", name: "National Fuels", owner: "Arun Patel", city: "Ahmedabad" },
];

const STEPS = ["Select Pump", "Enter Amount", "Pay via QR", "Upload Proof", "Done"];

export default function FundWalletPage() {
  const [step, setStep] = useState(0);
  const [selectedPump, setSelectedPump] = useState<typeof PUMP_OWNERS[0] | null>(null);
  const [amount, setAmount] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    setStep(4);
  };

  const reset = () => { setStep(0); setSelectedPump(null); setAmount(""); setScreenshot(null); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-800 text-gray-900" style={{ fontWeight: 800 }}>Fund Pump Wallet</h1>
        <p className="text-sm text-gray-500 mt-0.5">Transfer funds to a pump owner's FuelFlux wallet</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className={`step-circle ${i < step ? "completed" : i === step ? "active" : "pending"}`}>
              {i < step ? <Check className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
            </div>
            {i < STEPS.length - 1 && <div className={`step-line ${i < step ? "completed" : ""}`} />}
          </div>
        ))}
      </div>
      <div className="flex justify-between -mt-2">
        {STEPS.map((label, i) => (
          <span key={i} className={`text-xs font-500 ${i === step ? "text-orange-600" : i < step ? "text-green-600" : "text-gray-400"}`} style={{ fontWeight: 500 }}>
            {label}
          </span>
        ))}
      </div>

      <div className="max-w-lg mx-auto">
        <div className="card p-6 animate-fade-in">
          {/* Step 0: Select Pump */}
          {step === 0 && (
            <>
              <h2 className="text-base font-700 text-gray-900 mb-4" style={{ fontWeight: 700 }}>Select Pump Owner</h2>
              <div className="space-y-3">
                {PUMP_OWNERS.map(pump => (
                  <div key={pump.id} onClick={() => setSelectedPump(pump)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPump?.id === pump.id ? "border-orange-500 bg-orange-50" : "border-gray-100 hover:border-orange-200"}`}>
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center font-700 text-orange-600 text-sm" style={{ fontWeight: 700 }}>
                      {pump.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-600 text-gray-900" style={{ fontWeight: 600 }}>{pump.name}</p>
                      <p className="text-xs text-gray-500">{pump.owner} · {pump.city}</p>
                    </div>
                    {selectedPump?.id === pump.id && <Check className="w-5 h-5 text-orange-500" />}
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(1)} disabled={!selectedPump}
                className="btn-primary w-full mt-4 flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Step 1: Amount */}
          {step === 1 && (
            <>
              <h2 className="text-base font-700 text-gray-900 mb-2" style={{ fontWeight: 700 }}>Enter Amount</h2>
              <p className="text-sm text-gray-500 mb-4">Funding: <strong>{selectedPump?.name}</strong></p>
              <div className="mb-4">
                <label className="block text-xs font-600 text-gray-600 mb-1.5" style={{ fontWeight: 600 }}>Amount (₹)</label>
                <input className="input-base text-2xl font-800 text-center" type="number" placeholder="0"
                  value={amount} onChange={e => setAmount(e.target.value)} style={{ fontWeight: 800 }} />
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[5000, 10000, 25000, 50000, 100000, 200000].map(a => (
                  <button key={a} onClick={() => setAmount(String(a))}
                    className="py-2 px-3 rounded-xl border border-orange-200 text-orange-600 text-xs font-600 hover:bg-orange-50 transition-colors" style={{ fontWeight: 600 }}>
                    ₹{a >= 100000 ? `${a / 100000}L` : `${a / 1000}K`}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn-ghost flex-1">Back</button>
                <button onClick={() => setStep(2)} disabled={!amount || Number(amount) <= 0}
                  className="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
                  Generate QR <QrCode className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* Step 2: QR */}
          {step === 2 && (
            <>
              <h2 className="text-base font-700 text-gray-900 mb-4" style={{ fontWeight: 700 }}>Scan & Pay</h2>
              <div className="qr-container mb-4">
                <p className="text-xs text-gray-500 mb-3">Scan to transfer ₹{Number(amount).toLocaleString("en-IN")}</p>
                <div className="w-44 h-44 bg-gray-900 rounded-xl mx-auto flex items-center justify-center relative mb-3">
                  <div className="w-36 h-36 grid grid-cols-7 gap-0.5">
                    {Array.from({ length: 49 }).map((_, i) => (
                      <div key={i} className="rounded-sm" style={{ background: (i * 7 + i) % 3 === 0 ? "white" : "#1f2937" }} />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-white rounded p-1">
                      <div className="w-full h-full rounded-sm bg-orange-500" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">UPI: fuelflux@{selectedPump?.name.toLowerCase().replace(/\s+/g, "")}.upi</p>
                <p className="text-xl font-800 text-gray-900 mt-1" style={{ fontWeight: 800 }}>₹{Number(amount).toLocaleString("en-IN")}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-ghost flex-1">Back</button>
                <button onClick={() => setStep(3)}
                  className="btn-primary flex-1 flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
                  Payment Done <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* Step 3: Upload */}
          {step === 3 && (
            <>
              <h2 className="text-base font-700 text-gray-900 mb-2" style={{ fontWeight: 700 }}>Upload Payment Proof</h2>
              <p className="text-sm text-gray-500 mb-4">Upload the screenshot of your payment confirmation</p>
              <label className={`upload-zone block cursor-pointer mb-4 ${screenshot ? "border-green-400 bg-green-50" : ""}`}>
                <input type="file" accept="image/*" className="hidden" onChange={e => setScreenshot(e.target.files?.[0] || null)} />
                <div className="flex flex-col items-center gap-2">
                  <Upload className={`w-8 h-8 ${screenshot ? "text-green-500" : "text-orange-400"}`} />
                  <p className="text-sm font-500 text-gray-700" style={{ fontWeight: 500 }}>
                    {screenshot ? screenshot.name : "Upload payment screenshot"}
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                </div>
              </label>
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-xs text-orange-700 mb-4">
                Submitting ₹{Number(amount).toLocaleString()} to <strong>{selectedPump?.name}</strong>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-ghost flex-1">Back</button>
                <button onClick={handleSubmit} disabled={!screenshot || loading}
                  className="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center gap-2" style={{ fontWeight: 600 }}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : "Submit for Approval"}
                </button>
              </div>
            </>
          )}

          {/* Step 4: Done */}
          {step === 4 && (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-xl font-800 text-gray-900 mb-2" style={{ fontWeight: 800 }}>Payment Submitted! 🎉</h2>
              <p className="text-sm text-gray-500 mb-2">₹{Number(amount).toLocaleString("en-IN")} funding request to <strong>{selectedPump?.name}</strong> is under verification.</p>
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-xs text-orange-700 mb-6">
                Admin will verify and credit the wallet within 2-4 hours.
              </div>
              <div className="space-y-2">
                <button onClick={reset} className="btn-primary w-full" style={{ fontWeight: 600 }}>
                  Fund Another Pump
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
