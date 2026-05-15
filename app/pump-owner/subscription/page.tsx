"use client";
import { useState } from "react";
import { Check, Crown, Diamond, Upload, QrCode, Loader2, X } from "lucide-react";

const PLANS = [
  {
    id: "gold",
    name: "Gold",
    price: "₹4,999",
    period: "/month",
    icon: "🥇",
    color: "from-yellow-400 to-amber-500",
    features: [
      "Billing System (unlimited bills)",
      "Employee Management (up to 20)",
      "Wallet & Transactions",
      "Sales Register",
      "Basic AI Reports",
      "Email Support",
    ],
    badge: "Popular",
  },
  {
    id: "diamond",
    name: "Diamond",
    price: "₹9,999",
    period: "/month",
    icon: "💎",
    color: "from-indigo-600 to-purple-700",
    dark: true,
    features: [
      "Everything in Gold",
      "ANPR Camera System",
      "Vehicle Count AI",
      "Attendance AI (Face Recognition)",
      "Live CCTV Monitor",
      "Unlimited Employees",
      "Priority Support 24/7",
      "Advanced Analytics",
    ],
    badge: "Premium",
  },
];

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1=select, 2=payment, 3=submitted
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [signedDoc, setSignedDoc] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    setStep(3);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-800 text-gray-900" style={{ fontWeight: 800 }}>Subscription Plans</h1>
        <p className="text-sm text-gray-500 mt-0.5">Choose a plan to unlock FuelFlux features</p>
      </div>

      {/* Current Status */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center text-lg">🆓</div>
        <div>
          <p className="text-sm font-600 text-gray-900" style={{ fontWeight: 600 }}>Current Plan: Free</p>
          <p className="text-xs text-gray-500">Limited to 50 bills/month · No AI features</p>
        </div>
      </div>

      {step === 1 && (
        <>
          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PLANS.map(plan => (
              <div key={plan.id} onClick={() => setSelectedPlan(plan.id)}
                className={`plan-card relative cursor-pointer ${plan.dark ? "diamond" : ""} ${selectedPlan === plan.id ? "selected" : ""}`}>
                {plan.badge && (
                  <div className={`absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-700 ${plan.dark ? "bg-indigo-400 text-white" : "bg-orange-500 text-white"}`} style={{ fontWeight: 700 }}>
                    {plan.badge}
                  </div>
                )}
                <div className="text-3xl mb-3">{plan.icon}</div>
                <h2 className={`text-xl font-800 mb-1 ${plan.dark ? "text-white" : "text-gray-900"}`} style={{ fontWeight: 800 }}>
                  {plan.name} Plan
                </h2>
                <div className={`flex items-baseline gap-1 mb-5 ${plan.dark ? "text-white" : "text-gray-900"}`}>
                  <span className="text-3xl font-800" style={{ fontWeight: 800 }}>{plan.price}</span>
                  <span className={`text-sm ${plan.dark ? "text-indigo-200" : "text-gray-500"}`}>{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className={`w-4 h-4 flex-shrink-0 ${plan.dark ? "text-indigo-300" : "text-orange-500"}`} />
                      <span className={plan.dark ? "text-indigo-100" : "text-gray-700"}>{f}</span>
                    </li>
                  ))}
                </ul>
                {selectedPlan === plan.id && (
                  <div className={`text-center text-sm font-600 ${plan.dark ? "text-indigo-200" : "text-orange-600"}`} style={{ fontWeight: 600 }}>
                    ✓ Selected
                  </div>
                )}
              </div>
            ))}
          </div>

          <button disabled={!selectedPlan} onClick={() => setStep(2)} className="btn-primary w-full flex items-center justify-center gap-2">
            Continue to Payment <QrCode className="w-4 h-4" />
          </button>
        </>
      )}

      {step === 2 && (
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-orange-500">← Back</button>
            <span className="text-sm font-600 text-gray-900" style={{ fontWeight: 600 }}>
              Paying for: {PLANS.find(p => p.id === selectedPlan)?.name} Plan — {PLANS.find(p => p.id === selectedPlan)?.price}
            </span>
          </div>

          {/* QR Payment */}
          <div className="qr-container">
            <p className="text-sm font-600 text-gray-700 mb-4" style={{ fontWeight: 600 }}>Scan QR to Pay</p>
            <div className="w-48 h-48 bg-gray-900 rounded-xl mx-auto flex items-center justify-center mb-4 relative">
              {/* Simulated QR */}
              <div className="w-40 h-40 grid grid-cols-7 gap-0.5">
                {Array.from({ length: 49 }).map((_, i) => (
                  <div key={i} className={`rounded-sm ${Math.random() > 0.5 ? "bg-white" : "bg-gray-900"}`} />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded p-1">
                  <div className="w-full h-full bg-orange-500 rounded-sm" />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500">UPI ID: fuelflux@upi</p>
            <p className="text-lg font-800 text-gray-900 mt-1" style={{ fontWeight: 800 }}>{PLANS.find(p => p.id === selectedPlan)?.price}</p>
          </div>

          {/* Upload Payment Proof */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-600 text-gray-700 mb-2" style={{ fontWeight: 600 }}>Upload Payment Screenshot *</label>
              <label className={`upload-zone block cursor-pointer ${screenshot ? "border-green-400 bg-green-50" : ""}`}>
                <input type="file" accept="image/*" className="hidden" onChange={e => setScreenshot(e.target.files?.[0] || null)} />
                <div className="flex items-center gap-3">
                  <Upload className={`w-5 h-5 ${screenshot ? "text-green-500" : "text-orange-400"}`} />
                  <div>
                    <p className="text-sm font-500 text-gray-700" style={{ fontWeight: 500 }}>
                      {screenshot ? screenshot.name : "Click to upload payment screenshot"}
                    </p>
                    <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </label>
            </div>
            <div>
              <label className="block text-xs font-600 text-gray-700 mb-2" style={{ fontWeight: 600 }}>Upload Signed Agreement *</label>
              <label className={`upload-zone block cursor-pointer ${signedDoc ? "border-green-400 bg-green-50" : ""}`}>
                <input type="file" accept=".pdf,.jpg,.png" className="hidden" onChange={e => setSignedDoc(e.target.files?.[0] || null)} />
                <div className="flex items-center gap-3">
                  <Upload className={`w-5 h-5 ${signedDoc ? "text-green-500" : "text-orange-400"}`} />
                  <div>
                    <p className="text-sm font-500 text-gray-700" style={{ fontWeight: 500 }}>
                      {signedDoc ? signedDoc.name : "Upload signed subscription document"}
                    </p>
                    <p className="text-xs text-gray-400">PDF, PNG up to 5MB</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={!screenshot || !signedDoc || loading}
            className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : "Submit for Verification"}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-md mx-auto text-center py-8">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="text-2xl font-800 text-gray-900 mb-2" style={{ fontWeight: 800 }}>Submitted! 🎉</h2>
          <p className="text-gray-500 mb-6 text-sm">Your {PLANS.find(p => p.id === selectedPlan)?.name} plan payment is under verification by the admin team.</p>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700 mb-6">
            <strong>Expected approval:</strong> 2-4 business hours.<br />
            You'll receive an SMS confirmation once approved.
          </div>
          <div className="space-y-2 text-sm text-gray-500">
            <p className="flex items-center justify-center gap-2"><span className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center text-xs">⏳</span> Waiting for admin verification</p>
          </div>
        </div>
      )}
    </div>
  );
}
