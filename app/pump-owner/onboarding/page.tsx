"use client";
import { useState } from "react";
import { Check, ChevronRight, Building2, FileText, CreditCard, CheckCircle, Loader2, Upload, Zap } from "lucide-react";
import Image from "next/image";

const STEPS = ["Station Info", "Upload Documents", "Choose Plan", "Review & Submit"];

const plans = [
  {
    id: "free", name: "Free Plan", price: "₹0/mo", color: "border-gray-200", badge: "", badgeColor: "",
    features: ["Basic billing", "1 staff account", "Manual stock tracking", "Email support"],
  },
  {
    id: "gold", name: "Gold Plan", price: "₹2,999/mo", color: "border-orange-500", badge: "Popular",
    badgeColor: "bg-orange-500",
    features: ["Advanced billing", "5 staff accounts", "AI demand prediction", "ANPR camera access", "Priority support", "Monthly reports"],
  },
  {
    id: "diamond", name: "Diamond Plan", price: "₹5,999/mo", color: "border-indigo-500", badge: "Best Value",
    badgeColor: "bg-indigo-600",
    features: ["Unlimited billing", "Unlimited staff", "All AI features", "CCTV monitoring", "Fraud detection", "24/7 support", "Investor dashboard"],
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState("gold");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: "", owner: "", city: "", phone: "", gstin: "", license: "" });
  const [docs, setDocs] = useState<Record<string, File | null>>({ license: null, noc: null, gst: null });

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2200));
    setLoading(false);
    setDone(true);
  };

  if (done) return (
    <div className="max-w-lg mx-auto text-center py-16 animate-fade-in">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <CheckCircle className="w-12 h-12 text-green-500" />
      </div>
      <h1 className="text-2xl font-black text-gray-900 mb-2">Application Submitted! 🎉</h1>
      <p className="text-gray-500 mb-6 text-sm leading-relaxed">
        Your pump station onboarding request has been submitted. Our admin team will review your documents and activate your account within <strong>24–48 hours</strong>.
      </p>
      <div className="card p-4 text-left mb-6">
        <p className="text-xs font-bold text-gray-700 mb-2">What happens next?</p>
        <div className="space-y-2">
          {["Admin reviews your documents", "Account gets activated", "Plan subscription begins", "You get access to your dashboard"].map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold flex-shrink-0">{i + 1}</div>
              {s}
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => { setDone(false); setStep(0); }} className="btn-primary w-full">Start Over</button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl text-gray-900 flex items-center gap-2" style={{ fontWeight: 800 }}>
          <Building2 className="w-6 h-6 text-orange-500" /> Pump Station Onboarding
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Complete the steps below to register your fuel station on FuelFlux</p>
      </div>

      {/* Step Progress */}
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
          <span key={i} className={`text-xs font-medium ${i === step ? "text-orange-600" : i < step ? "text-green-600" : "text-gray-400"}`}>
            {label}
          </span>
        ))}
      </div>

      <div className="max-w-2xl mx-auto card p-6">
        {/* Step 0: Station Info */}
        {step === 0 && (
          <>
            <h2 className="text-base font-bold text-gray-900 mb-5">Fuel Station Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "name", label: "Station Name", placeholder: "e.g. Sharma Fuel Station" },
                { key: "owner", label: "Owner Full Name", placeholder: "e.g. Rajesh Sharma" },
                { key: "city", label: "City / District", placeholder: "e.g. Mumbai" },
                { key: "phone", label: "Contact Number", placeholder: "+91 98765 43210" },
                { key: "gstin", label: "GSTIN Number", placeholder: "e.g. 27AABCU9603R1ZX" },
                { key: "license", label: "Petroleum License No.", placeholder: "e.g. PL/MH/2023/001" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">{f.label}</label>
                  <input className="input-base" placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Station Address</label>
              <textarea className="input-base" rows={2} placeholder="Full address of the fuel station..." />
            </div>
            <button onClick={() => setStep(1)} className="btn-primary w-full mt-5 flex items-center justify-center gap-2">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Step 1: Documents */}
        {step === 1 && (
          <>
            <h2 className="text-base font-bold text-gray-900 mb-2">Upload Documents</h2>
            <p className="text-sm text-gray-500 mb-5">All documents must be in PDF or image format (max 10MB each)</p>
            <div className="space-y-4">
              {[
                { key: "license", label: "Petroleum Business License", required: true },
                { key: "noc", label: "No Objection Certificate (NOC)", required: true },
                { key: "gst", label: "GST Registration Certificate", required: false },
              ].map(d => (
                <div key={d.key}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {d.label} {d.required && <span className="text-red-500">*</span>}
                  </label>
                  <label className={`upload-zone block cursor-pointer ${docs[d.key] ? "border-green-400 bg-green-50" : ""}`}>
                    <input type="file" accept=".pdf,.jpg,.png" className="hidden"
                      onChange={e => setDocs(p => ({ ...p, [d.key]: e.target.files?.[0] || null }))} />
                    <div className="flex items-center gap-3">
                      <Upload className={`w-5 h-5 flex-shrink-0 ${docs[d.key] ? "text-green-500" : "text-gray-400"}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-700">{docs[d.key] ? docs[d.key]!.name : "Click to upload"}</p>
                        <p className="text-xs text-gray-400">PDF, PNG, JPG up to 10MB</p>
                      </div>
                      {docs[d.key] && <Check className="w-5 h-5 text-green-500 ml-auto flex-shrink-0" />}
                    </div>
                  </label>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setStep(0)} className="btn-ghost flex-1">Back</button>
              <button onClick={() => setStep(2)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* Step 2: Plan */}
        {step === 2 && (
          <>
            <h2 className="text-base font-bold text-gray-900 mb-5">Choose Your Subscription Plan</h2>
            <div className="space-y-3">
              {plans.map(p => (
                <div key={p.id} onClick={() => setPlan(p.id)}
                  className={`plan-card relative cursor-pointer transition-all ${p.id === "diamond" ? "diamond" : ""} ${plan === p.id ? (p.id === "diamond" ? "diamond selected" : "selected") : ""}`}>
                  {p.badge && (
                    <span className={`absolute -top-2 right-4 text-xs font-bold px-2 py-0.5 rounded-full text-white ${p.badgeColor}`}>
                      {p.badge}
                    </span>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className={`font-bold ${p.id === "diamond" ? "text-white" : "text-gray-900"}`}>{p.name}</p>
                      <p className={`text-sm ${p.id === "diamond" ? "text-indigo-300" : "text-gray-500"}`}>{p.price}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${plan === p.id ? "bg-orange-500 border-orange-500" : p.id === "diamond" ? "border-indigo-400" : "border-gray-300"}`}>
                      {plan === p.id && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {p.features.map(f => (
                      <div key={f} className={`flex items-center gap-1.5 text-xs ${p.id === "diamond" ? "text-indigo-200" : "text-gray-600"}`}>
                        <Check className="w-3 h-3 flex-shrink-0 text-green-400" /> {f}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setStep(1)} className="btn-ghost flex-1">Back</button>
              <button onClick={() => setStep(3)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <>
            <h2 className="text-base font-bold text-gray-900 mb-5">Review & Submit</h2>
            <div className="space-y-3 mb-5">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Station Details</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Station Name", value: form.name || "Sharma Fuel Station" },
                    { label: "Owner", value: form.owner || "Rajesh Sharma" },
                    { label: "City", value: form.city || "Mumbai" },
                    { label: "Phone", value: form.phone || "+91 98765 43210" },
                  ].map(f => (
                    <div key={f.label}>
                      <p className="text-xs text-gray-400">{f.label}</p>
                      <p className="text-sm font-semibold text-gray-900">{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Documents</p>
                <div className="space-y-1.5">
                  {[
                    { label: "Petroleum License", uploaded: !!docs.license },
                    { label: "NOC Certificate", uploaded: !!docs.noc },
                    { label: "GST Certificate", uploaded: !!docs.gst },
                  ].map(d => (
                    <div key={d.label} className="flex items-center gap-2 text-xs">
                      <Check className={`w-3.5 h-3.5 ${d.uploaded ? "text-green-500" : "text-gray-300"}`} />
                      <span className={d.uploaded ? "text-gray-700" : "text-gray-400"}>{d.label} {!d.uploaded && "(not uploaded)"}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`rounded-xl p-4 border ${plan === "diamond" ? "bg-gradient-to-br from-indigo-900 to-purple-900 border-indigo-700" : plan === "gold" ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"}`}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${plan === "diamond" ? "text-indigo-300" : "text-gray-500"}`}>Selected Plan</p>
                <div className="flex items-center justify-between">
                  <p className={`font-bold ${plan === "diamond" ? "text-white" : "text-gray-900"}`}>
                    {plans.find(p => p.id === plan)?.name}
                  </p>
                  <p className={`font-black ${plan === "diamond" ? "text-indigo-200" : "text-orange-600"}`}>
                    {plans.find(p => p.id === plan)?.price}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-ghost flex-1">Back</button>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Zap className="w-4 h-4" /> Submit Application</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
