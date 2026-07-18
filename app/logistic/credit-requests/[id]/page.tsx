'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, FileText, CheckCircle2, AlertCircle, Clock,
    Upload, Loader2, X, Building2, Car, User, Phone,
    Shield, PenLine, Download, RefreshCw, ChevronRight,
    IndianRupee, Calendar, Hash, Info, RotateCcw, RotateCw, Crop,
} from 'lucide-react';
import {
    creditService, CreditRequestDetail, CreditStatus,
    STATUS_LABELS, STATUS_COLORS, NEXT_ACTION,
} from '@/services/credit.service';
import { toast } from '@/components/feedback/Toast';

// ─── Status Timeline ──────────────────────────────────────────────────────────

const TIMELINE_STEPS: { status: CreditStatus; label: string; desc: string }[] = [
    { status: 'pending', label: 'Request Sent', desc: 'Waiting for pump owner review' },
    { status: 'deposit_pending', label: 'Deposit Required', desc: 'Upload payment proof' },
    { status: 'contract_generated', label: 'Contract Ready', desc: 'Review and sign' },
    { status: 'logistic_signed', label: 'Your Signature', desc: 'OTP verified' },
    { status: 'active', label: 'Credit Active', desc: 'Ready to fuel' },
];

const STATUS_ORDER: CreditStatus[] = [
    'pending', 'approved', 'deposit_pending', 'deposit_confirmed',
    'contract_generated', 'logistic_signed', 'pump_signed', 'active',
];

function getStepIndex(status: CreditStatus): number {
    if (status === 'rejected') return -1;
    if (status === 'active') return 4;
    if (['logistic_signed', 'pump_signed'].includes(status)) return 3;
    if (['contract_generated', 'deposit_confirmed'].includes(status)) return 2;
    if (status === 'deposit_pending') return 1;
    return 0;
}

function Timeline({ status }: { status: CreditStatus }) {
    const currentStep = getStepIndex(status);
    const isRejected = status === 'rejected';

    return (
        <div className="flex items-start gap-0">
            {TIMELINE_STEPS.map((step, i) => {
                const done = i < currentStep;
                const active = i === currentStep;
                const isLast = i === TIMELINE_STEPS.length - 1;

                return (
                    <div key={step.status} className="flex flex-col items-center flex-1">
                        <div className="flex items-center w-full">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all
                ${isRejected && active ? 'border-red-500 bg-red-50' :
                                    done ? 'border-emerald-500 bg-emerald-500' :
                                        active ? 'border-primary bg-orange-50' :
                                            'border-slate-200 bg-white'}`}>
                                {isRejected && active
                                    ? <X className="h-4 w-4 text-red-500" />
                                    : done
                                        ? <CheckCircle2 className="h-4 w-4 text-white" />
                                        : active
                                            ? <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                                            : <div className="w-2 h-2 rounded-full bg-slate-200" />
                                }
                            </div>
                            {!isLast && (
                                <div className={`flex-1 h-0.5 ${done ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                            )}
                        </div>
                        <div className="mt-2 text-center px-1">
                            <p className={`text-[10px] font-bold ${active ? 'text-primary' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {step.label}
                            </p>
                            {active && (
                                <p className="text-[9px] text-slate-400 mt-0.5">{step.desc}</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Deposit Upload Section ───────────────────────────────────────────────────

// ─── Image Editor (rotate + crop before upload) ──────────────────────────────

function ImageEditorModal({ file, onCancel, onConfirm }: {
    file: File;
    onCancel: () => void;
    onConfirm: (editedFile: File) => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
    const [imgLoaded, setImgLoaded] = useState(false);
    const [crop, setCrop] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
    const [processing, setProcessing] = useState(false);

    const DISPLAY_MAX = 420;

    const getCanvasDims = () => {
        const img = imgRef.current;
        if (!img) return { w: DISPLAY_MAX, h: DISPLAY_MAX };
        const swapped = rotation % 180 !== 0;
        const natW = swapped ? img.naturalHeight : img.naturalWidth;
        const natH = swapped ? img.naturalWidth : img.naturalHeight;
        const scale = Math.min(DISPLAY_MAX / natW, DISPLAY_MAX / natH, 1);
        return { w: Math.round(natW * scale), h: Math.round(natH * scale) };
    };

    const draw = useCallback(() => {
        const img = imgRef.current;
        const canvas = canvasRef.current;
        if (!img || !canvas) return;
        const { w, h } = getCanvasDims();
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, w, h);
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        const swapped = rotation % 180 !== 0;
        const drawW = swapped ? h : w;
        const drawH = swapped ? w : h;
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
    }, [rotation]);

    useEffect(() => {
        const url = URL.createObjectURL(file);
        const img = new window.Image();
        img.onload = () => { imgRef.current = img; setImgLoaded(true); };
        img.src = url;
        return () => URL.revokeObjectURL(url);
    }, [file]);

    useEffect(() => { if (imgLoaded) draw(); }, [imgLoaded, rotation, draw]);

    const handleMouseDown = (e: React.MouseEvent) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        setDragStart({ x, y });
        setCrop({ x, y, w: 0, h: 0 });
    };
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragStart) return;
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        setCrop({
            x: Math.min(dragStart.x, x), y: Math.min(dragStart.y, y),
            w: Math.abs(x - dragStart.x), h: Math.abs(y - dragStart.y),
        });
    };
    const handleMouseUp = () => setDragStart(null);

    const rotateLeft = () => { setRotation(r => (r + 270) % 360); setCrop(null); };
    const rotateRight = () => { setRotation(r => (r + 90) % 360); setCrop(null); };

    const handleConfirm = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        setProcessing(true);
        try {
            let source: HTMLCanvasElement = canvas;
            if (crop && crop.w > 4 && crop.h > 4) {
                const cropCanvas = document.createElement('canvas');
                cropCanvas.width = Math.round(crop.w);
                cropCanvas.height = Math.round(crop.h);
                const ctx = cropCanvas.getContext('2d');
                ctx?.drawImage(canvas, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
                source = cropCanvas;
            }
            const mime = file.type.includes('png') ? 'image/png' : 'image/jpeg';
            const blob: Blob | null = await new Promise(resolve => source.toBlob(resolve, mime, 0.92));
            if (!blob) { toast.error('Failed', 'Could not process image'); return; }
            onConfirm(new File([blob], file.name, { type: blob.type }));
        } finally { setProcessing(false); }
    };

    const { w: cw, h: ch } = getCanvasDims();

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-5 w-full max-w-md border border-slate-100 shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-extrabold text-slate-900">Edit Screenshot</h3>
                    <button onClick={onCancel} className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 cursor-pointer">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <p className="text-[10px] text-slate-400 mb-2">
                    Drag over the image to crop the relevant part. Galat screenshot hai to rotate/crop karke sahi karo.
                </p>

                <div className="bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden mb-3 select-none" style={{ minHeight: 200 }}>
                    <div className="relative" style={{ width: cw, height: ch }}>
                        <canvas
                            ref={canvasRef}
                            className="cursor-crosshair touch-none"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        />
                        {crop && crop.w > 0 && crop.h > 0 && (
                            <div className="absolute border-2 border-primary bg-primary/10 pointer-events-none"
                                style={{ left: crop.x, top: crop.y, width: crop.w, height: crop.h }} />
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <button type="button" onClick={rotateLeft}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 cursor-pointer">
                        <RotateCcw className="h-3.5 w-3.5" /> Rotate Left
                    </button>
                    <button type="button" onClick={rotateRight}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 cursor-pointer">
                        <RotateCw className="h-3.5 w-3.5" /> Rotate Right
                    </button>
                    {crop && (
                        <button type="button" onClick={() => setCrop(null)}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-red-50 text-red-500 rounded-xl hover:bg-red-100 cursor-pointer">
                            <Crop className="h-3.5 w-3.5" /> Clear Crop
                        </button>
                    )}
                </div>

                <div className="flex gap-3">
                    <button onClick={onCancel}
                        className="flex-1 py-2.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer">
                        Cancel
                    </button>
                    <button onClick={handleConfirm} disabled={processing}
                        className="flex-1 py-2.5 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer">
                        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        Use This Image
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Deposit Upload Section ───────────────────────────────────────────────────

function DepositUpload({ requestId, depositAmount, onSuccess }: {
    requestId: number | string;
    depositAmount: number;
    onSuccess: () => void;
}) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [editingFile, setEditingFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const DOC_TYPES = ['gst', 'aadhaar', 'pan', 'driving_license', 'passport', 'voter_id'];
    const [proofDocType, setProofDocType] = useState('gst');

    // Contract proposal — same field names as pump owner's wizard (billing, credit limit, validity, T&C)
    const [totalCreditLimit, setTotalCreditLimit] = useState('');
    const [validTo, setValidTo] = useState('');
    const [billingFrequency, setBillingFrequency] = useState('recurring');
    const [billBy, setBillBy] = useState('customer');
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [interest, setInterest] = useState('2.0');
    const [depositUtilDays, setDepositUtilDays] = useState('30');
    const [suspensionDays, setSuspensionDays] = useState('7');
    const [disputeDays, setDisputeDays] = useState('15');
    const [customTerms, setCustomTerms] = useState('');

    useEffect(() => {
        if (!selectedFile) { setPreviewUrl(null); return; }
        if (!selectedFile.type.startsWith('image/')) { setPreviewUrl(null); return; }
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [selectedFile]);

    const handleFileChange = (file: File) => {
        const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf', 'image/webp'];
        if (!allowed.includes(file.type)) {
            toast.error('Invalid File', 'Only PNG, JPG, PDF, WEBP allowed');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Too Large', 'Max file size is 10MB');
            return;
        }
        if (file.type.startsWith('image/')) {
            // Image — pehle editor khulega (crop/rotate ka mauka)
            setEditingFile(file);
        } else {
            // PDF — direct select, koi edit option nahi
            setSelectedFile(file);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            toast.error('Required', 'Please select or drag a payment screenshot/receipt');
            return;
        }
        if (!validTo) {
            toast.error('Required', 'Select contract validity date');
            return;
        }
        if (!totalCreditLimit || parseFloat(totalCreditLimit) <= 0) {
            toast.error('Required', 'Enter proposed credit limit');
            return;
        }
        setUploading(true);
        try {
            await creditService.uploadDepositProof(requestId, selectedFile, proofDocType, {
                total_credit_limit: parseFloat(totalCreditLimit),
                valid_to: new Date(validTo).toISOString(),
                billing_frequency: billingFrequency,
                bill_by: billBy,
                billing_cycle: billingCycle,
                late_payment_interest: parseFloat(interest) || 2.0,
                deposit_utilization_days: parseInt(depositUtilDays) || 30,
                suspension_period_days: parseInt(suspensionDays) || 7,
                invoice_dispute_days: parseInt(disputeDays) || 15,
                custom_terms: customTerms.trim() || undefined,
            });
            toast.success('Proof & Contract Proposed!', 'Waiting for pump owner approval');
            onSuccess();
        } catch (e: any) {
            toast.error('Submission Failed', e?.response?.data?.detail || 'Could not submit details');
        } finally { setUploading(false); }
    };

    return (
        <>
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                    <IndianRupee className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-amber-800">
                            Security Deposit Required: ₹{depositAmount.toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-amber-600 mt-0.5">
                            Pay directly to the pump owner via UPI/Bank Transfer, fill in the contract details below, and upload the proof.
                        </p>
                    </div>
                </div>

                {/* Doc type */}
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Proof Document Type</label>
                    <select value={proofDocType} onChange={e => setProofDocType(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-primary/50 cursor-pointer capitalize">
                        {DOC_TYPES.map(d => <option key={d} value={d} className="capitalize">{d.replace('_', ' ')}</option>)}
                    </select>
                </div>

                {/* Contract terms proposed by logistic */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <p className="text-xs font-black text-slate-800 uppercase tracking-wider">Contract Terms Proposal</p>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Proposed Credit Limit (₹)</label>
                            <input type="number" value={totalCreditLimit} onChange={e => setTotalCreditLimit(e.target.value)}
                                placeholder="500000"
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-primary/50" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Valid Until</label>
                            <input type="date" value={validTo} onChange={e => setValidTo(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-primary/50" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Billing Frequency</label>
                            <select value={billingFrequency} onChange={e => setBillingFrequency(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-primary/50">
                                <option value="recurring">Recurring</option>
                                <option value="one_time">One Time</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Billing Cycle</label>
                            <select value={billingCycle} onChange={e => setBillingCycle(e.target.value)}
                                disabled={billingFrequency === 'one_time'}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-primary/50 disabled:opacity-50">
                                <option value="monthly">Monthly</option>
                                <option value="weekly">Weekly</option>
                                <option value="fortnightly">Fortnightly</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Bill By</label>
                        <div className="grid grid-cols-2 gap-2 bg-white p-1 rounded-xl border border-slate-200">
                            {['customer', 'vehicle'].map(b => (
                                <button key={b} type="button" onClick={() => setBillBy(b)}
                                    className={`py-1.5 text-xs font-bold rounded-lg cursor-pointer capitalize transition-all ${billBy === b ? 'bg-primary text-white' : 'text-slate-500'}`}>
                                    By {b}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Late Interest (%)</label>
                            <input type="number" step="0.5" min="0" max="10" value={interest}
                                onChange={e => setInterest(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-primary/50" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Suspension (days)</label>
                            <input type="number" value={suspensionDays}
                                onChange={e => setSuspensionDays(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-primary/50" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Dispute Window (days)</label>
                            <input type="number" min="7" max="30" value={disputeDays}
                                onChange={e => setDisputeDays(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-primary/50" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Custom Terms / Remarks</label>
                        <textarea value={customTerms} onChange={e => setCustomTerms(e.target.value)}
                            placeholder="Any specific requests or requirements..."
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-primary/50 transition-colors h-16 resize-none" />
                    </div>
                </div>

                {/* Screenshot upload / preview */}
                {selectedFile ? (
                    <div className="border border-emerald-200 bg-emerald-50/20 rounded-2xl p-4 flex flex-col items-center gap-2">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Payment proof" className="max-h-48 rounded-xl border border-slate-200 object-contain" />
                        ) : (
                            <div className="flex items-center gap-2 text-slate-600">
                                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                <span className="text-xs font-bold">{selectedFile.name}</span>
                            </div>
                        )}
                        <p className="text-[10px] text-slate-500 font-mono max-w-full truncate px-4">{selectedFile.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                            {selectedFile.type.startsWith('image/') && (
                                <button type="button" onClick={() => setEditingFile(selectedFile)}
                                    className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline cursor-pointer">
                                    <Crop className="h-3 w-3" /> Crop / Rotate Again
                                </button>
                            )}
                            <button type="button" onClick={() => { setSelectedFile(null); fileRef.current?.click(); }}
                                className="text-[10px] text-red-500 hover:underline font-bold cursor-pointer">
                                Wrong Screenshot? Choose Another
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative
                            ${dragOver ? 'border-primary bg-orange-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={e => {
                            e.preventDefault(); setDragOver(false);
                            const file = e.dataTransfer.files[0];
                            if (file) handleFileChange(file);
                        }}
                        onClick={() => fileRef.current?.click()}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="h-6 w-6 text-slate-300" />
                            <p className="text-xs font-bold text-slate-600">Attach Payment Screenshot / Receipt</p>
                            <p className="text-[10px] text-slate-400">PNG, JPG, PDF, WEBP · Max 10MB · Images crop/rotate ho sakte hain</p>
                        </div>
                    </div>
                )}
                <input ref={fileRef} type="file"
                    accept=".png,.jpg,.jpeg,.pdf,.webp"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFileChange(f); e.target.value = ''; }}
                />

                <button type="submit" disabled={uploading || !selectedFile}
                    className="w-full py-3 bg-primary hover:bg-primary/95 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 uppercase tracking-wider shadow-sm">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {uploading ? 'Submitting...' : 'Submit Deposit Proof & Terms'}
                </button>
            </form>

            {editingFile && (
                <ImageEditorModal
                    file={editingFile}
                    onCancel={() => setEditingFile(null)}
                    onConfirm={(edited) => { setSelectedFile(edited); setEditingFile(null); }}
                />
            )}
        </>
    );
}

// ─── OTP Sign Section ─────────────────────────────────────────────────────────

function OTPSignSection({ requestId, onSuccess }: {
    requestId: number | string;
    onSuccess: () => void;
}) {
    const [step, setStep] = useState<'send' | 'verify'>('send');
    const [otp, setOtp] = useState('');
    const [sending, setSending] = useState(false);
    const [signing, setSigning] = useState(false);
    const [devOtp, setDevOtp] = useState<string | null>(null);

    const handleSendOTP = async () => {
        setSending(true);
        try {
            const res = await creditService.requestSigningOTP(requestId);
            setDevOtp(res.otp); // Dev only — remove in prod
            setStep('verify');
            toast.success('OTP Sent', 'Check your registered mobile number');
        } catch (e: any) {
            toast.error('Failed', e?.response?.data?.detail || 'Could not send OTP');
        } finally { setSending(false); }
    };

    const handleSign = async () => {
        if (otp.length !== 6) {
            toast.error('Invalid OTP', 'Enter 6-digit OTP');
            return;
        }
        setSigning(true);
        try {
            const res = await creditService.signContract(requestId, otp);
            toast.success('Signed!', res.message);
            onSuccess();
        } catch (e: any) {
            toast.error('Invalid OTP', e?.response?.data?.detail || 'Signing failed');
        } finally { setSigning(false); }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 p-4 bg-violet-50 border border-violet-100 rounded-2xl">
                <PenLine className="h-5 w-5 text-violet-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-bold text-violet-800">Digital Signature Required</p>
                    <p className="text-xs text-violet-600 mt-0.5">
                        You need to sign this credit agreement using OTP verification.
                        This is legally equivalent to a physical signature.
                    </p>
                </div>
            </div>

            {step === 'send' ? (
                <button onClick={handleSendOTP} disabled={sending}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer">
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                    {sending ? 'Sending OTP...' : 'Send Signing OTP'}
                </button>
            ) : (
                <div className="flex flex-col gap-3">
                    {devOtp && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-700 font-bold">
                            <Info className="h-3.5 w-3.5 flex-shrink-0" />
                            Dev Mode OTP: <span className="font-mono text-yellow-900 ml-1">{devOtp}</span>
                        </div>
                    )}
                    <div>
                        <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                            Enter 6-Digit OTP
                        </label>
                        <input
                            type="text"
                            maxLength={6}
                            value={otp}
                            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="• • • • • •"
                            className="w-full px-4 py-3 text-center text-xl font-bold tracking-[0.5em] border border-slate-200 rounded-xl outline-none focus:border-violet-400 transition-colors"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => { setStep('send'); setOtp(''); setDevOtp(null); }}
                            className="flex-1 py-2.5 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                            ← Resend OTP
                        </button>
                        <button onClick={handleSign} disabled={signing || otp.length !== 6}
                            className="flex-1 py-2.5 text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer">
                            {signing ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4" />}
                            {signing ? 'Signing...' : 'Sign Contract'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Contract Preview ─────────────────────────────────────────────────────────

// ─── Contract Preview ─────────────────────────────────────────────────────────

function fmtRs(v: any) {
    const n = typeof v === 'string' ? parseFloat(v) : v;
    if (!n || isNaN(n)) return '₹0';
    return '₹' + n.toLocaleString('en-IN');
}

function ContractPreview({ data }: { data: CreditRequestDetail }) {
    const terms = data.contract_terms;
    if (!terms) return null;

    const slipTotal = (terms.slip_booklets || []).reduce((sum: number, b: any) => {
        if (b.start_number && b.end_number) return sum + Math.max(0, b.end_number - b.start_number + 1);
        return sum;
    }, 0);

    const fmt = (v: string | number) => {
        const n = typeof v === 'string' ? parseFloat(v) : v;
        if (!n || isNaN(n)) return '₹0.00';
        return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    };

    const fmtDate = (s: string) => {
        if (!s) return '—';
        return new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const today = () => new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const vehiclePlatesList = data.vehicles?.map(v => v.plate) || (data.vehicle?.plate ? [data.vehicle.plate] : []);

    return (
        <div className="bg-white text-slate-800 text-[11px] leading-relaxed p-8 border border-slate-200 shadow-lg rounded-2xl font-serif"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>

            {/* Letterhead */}
            <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-slate-800">
                <div>
                    <h2 className="text-lg font-black text-slate-900 font-sans">
                        {terms.org_name || terms.station_name || data.pump?.name || 'Organisation Name'}
                    </h2>
                    {(terms.address || data.pump?.address) && (
                        <p className="text-[10px] text-slate-500 mt-0.5">Address: {terms.address || data.pump?.address}</p>
                    )}
                    {(terms.gst_number || (data.pump as any)?.gst) && (
                        <p className="text-[10px] text-slate-500">GST: {terms.gst_number || (data.pump as any)?.gst}</p>
                    )}
                </div>
                <div className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <span className="text-slate-300 text-xs font-black">LOGO</span>
                </div>
            </div>

            {/* Title */}
            <h1 className="text-center text-sm font-black uppercase tracking-widest text-slate-900 mb-1">
                Credit Fueling Agreement
            </h1>
            <p className="text-center text-[10px] text-slate-500 mb-6">
                Execution Date: {data.activated_at ? fmtDate(data.activated_at) : today()}
            </p>

            {/* Parties */}
            <p className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
                Parties to the Agreement
            </p>
            <p className="mb-2 text-[11px]">
                This Agreement is entered into on the Execution Date between:
            </p>
            <p className="mb-1">
                <span className="font-bold">The Dealer:</span> Operating under the trade name &quot;{terms.station_name || terms.org_name || data.pump?.name || 'Station Name'}&quot;, being the authorized fuel station operator managing credit facilities.
            </p>
            <p className="mb-2">
                <span className="font-bold">The Customer:</span> <span className="underline">{data.partner?.name || data.partner?.email}</span>, representing the fleet owner or corporate entity authorized to procure fuel on credit.
            </p>
            <p className="mb-4">
                <span className="font-bold">Registered Fleet Vehicles:</span>{' '}
                <span className="font-mono text-[10px] bg-slate-100 px-2.5 py-1 rounded border border-slate-200 font-bold">
                    {vehiclePlatesList.join(', ') || 'No vehicles registered'}
                </span>
            </p>
            <p className="mb-6 text-slate-600 text-[10px]">
                <span className="font-bold">Operational Scope:</span> This agreement governs fueling activities across the Dealer's authorized service network, adhering to any site-specific configurations for all registered vehicles listed above.
            </p>

            {/* Term and Security */}
            <p className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
                Term and Security
            </p>
            <p className="mb-1">
                <span className="font-bold">Effective Period:</span> This Agreement shall be valid from <span className="underline">{data.valid_from ? fmtDate(data.valid_from) : today()}</span> to <span className="underline">{terms.valid_to ? fmtDate(terms.valid_to) : '—'}</span>.
            </p>
            <p className="mb-6">
                <span className="font-bold">Security Deposit:</span> The Customer has provided a refundable security deposit of <span className="font-bold">{fmt(terms.security_deposit)}</span> to mitigate financial risk for the Dealer.
            </p>

            {/* Covenant line */}
            <p className="font-bold text-[10px] mb-4 text-slate-700">
                NOW, THEREFORE, IN CONSIDERATION OF THE MUTUAL PROMISES AND COVENANTS SET FORTH HEREIN, BOTH PARTIES HEREBY AGREE TO BE BOUND BY THE FOLLOWING:
            </p>

            {/* 1. Global Credit */}
            <p className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
                1. Global Credit and Spend Limits
            </p>
            <ul className="mb-4 pl-4 space-y-1 list-none">
                <li><span className="font-bold">a. Total Credit Ceiling:</span> The maximum aggregate credit limit available under this contract is <span className="font-bold">{fmt(terms.total_credit_limit)}</span>.</li>
                {terms.max_spending_slips && <li><span className="font-bold">b. Maximum Spending Slips:</span> The Customer is limited to <span className="font-bold">{terms.max_spending_slips}</span> spending slips.</li>}
                {(terms.money_limit_per_fill || terms.money_limit_per_day || terms.money_limit_per_cycle) && (
                    <li>
                        <span className="font-bold">c. Money Limits:</span>{' '}
                        {[
                            terms.money_limit_per_fill && `Per Fill: ${fmt(terms.money_limit_per_fill)}`,
                            terms.money_limit_per_day && `Per Day: ${fmt(terms.money_limit_per_day)}`,
                            terms.money_limit_per_cycle && `Per Cycle: ${fmt(terms.money_limit_per_cycle)}`,
                        ].filter(Boolean).join(' · ')}
                    </li>
                )}
            </ul>

            {/* 2. Slip Booklets */}
            {slipTotal > 0 && (
                <>
                    <p className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
                        2. Slip Assignment
                    </p>
                    <ul className="mb-4 pl-4 space-y-1">
                        <li><span className="font-bold">Total Slips Assigned:</span> {slipTotal} slips across {terms.slip_booklets.length} booklet(s).</li>
                        {terms.slip_booklets.map((b: any, i: number) => b.booklet_number && (
                            <li key={i}>Booklet {b.booklet_number}: #{b.start_number} – #{b.end_number}{b.start_number && b.end_number ? ` (${Math.max(0, parseInt(b.end_number) - parseInt(b.start_number) + 1)} slips)` : ''}</li>
                        ))}
                    </ul>
                </>
            )}

            {/* 3. Item Limits */}
            {(terms.item_limits || []).length > 0 && (
                <>
                    <p className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
                        3. Item-Specific Quantity Limits
                    </p>
                    <ul className="mb-4 pl-4 space-y-1">
                        {terms.item_limits.map((il: any, i: number) => (
                            <li key={i}>
                                <span className="font-bold capitalize">{il.item_name}:</span>{' '}
                                {[
                                    il.qty_per_fill && `${il.qty_per_fill}L/fill`,
                                    il.qty_per_day && `${il.qty_per_day}L/day`,
                                    il.qty_per_cycle && `${il.qty_per_cycle}L/cycle`,
                                ].filter(Boolean).join(' · ')}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {/* 4. Custom Conditions */}
            {(terms.custom_conditions || []).length > 0 && (
                <>
                    <p className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
                        4. Custom Conditions
                    </p>
                    <ul className="mb-4 pl-4 space-y-2">
                        {terms.custom_conditions.map((c: any, i: number) => (
                            <li key={i}>
                                <span className="font-bold">Condition {i + 1}:</span> Applicable to {c.vehicle_type || 'all vehicles'} using {c.item_name || 'any fuel'}{c.station_id ? ` at Station #${c.station_id}` : ''}.
                                {(c.money_per_fill || c.money_per_day) && (
                                    <span> Money limits: {[c.money_per_fill && `${fmt(c.money_per_fill)}/fill`, c.money_per_day && `${fmt(c.money_per_day)}/day`].filter(Boolean).join(', ')}.</span>
                                )}
                                {(c.qty_per_fill || c.qty_per_day) && (
                                    <span> Qty limits: {[c.qty_per_fill && `${c.qty_per_fill}L/fill`, c.qty_per_day && `${c.qty_per_day}L/day`].filter(Boolean).join(', ')}.</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {/* 5. Billing */}
            <p className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
                5. Billing and Invoicing
            </p>
            <ul className="mb-4 pl-4 space-y-1">
                <li><span className="font-bold">Frequency:</span> {terms.billing_frequency === 'one_time' ? 'One-time invoice' : `Recurring — ${terms.billing_cycle}`}.</li>
                <li><span className="font-bold">Billed By:</span> {terms.bill_by === 'customer' ? 'Consolidated per customer' : 'Individual per vehicle'}.</li>
                {terms.billing_start_date && <li><span className="font-bold">Cycle Start:</span> {fmtDate(terms.billing_start_date)}.</li>}
                {terms.round_off && <li>Invoice amounts will be rounded off to the nearest unit.</li>}
            </ul>

            {/* 6. Operational SOPs */}
            {(terms.require_meter_photo || terms.require_vehicle_photo || terms.require_fueling_video || terms.require_driver_verification) && (
                <>
                    <p className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
                        6. Operational SOPs
                    </p>
                    <p className="mb-1">The following evidence shall be mandatory at each fueling event:</p>
                    <ul className="mb-4 pl-4 list-disc space-y-0.5">
                        {terms.require_meter_photo && <li>Meter reading photograph</li>}
                        {terms.require_vehicle_photo && <li>Vehicle photograph</li>}
                        {terms.require_fueling_video && <li>Fueling video recording</li>}
                        {terms.require_driver_verification && <li>Driver identity verification</li>}
                    </ul>
                </>
            )}

            {/* 7. T&C */}
            {(terms.late_payment_interest || terms.deposit_utilization_days || terms.suspension_period_days || terms.invoice_dispute_days || terms.custom_terms) && (
                <>
                    <p className="font-bold text-[11px] uppercase tracking-wider text-slate-700 mb-2 border-b border-slate-200 pb-1">
                        7. Terms and Conditions
                    </p>
                    <ul className="mb-4 pl-4 space-y-1">
                        {terms.late_payment_interest && <li><span className="font-bold">Late Payment Interest:</span> {terms.late_payment_interest}% per billing cycle on overdue amounts.</li>}
                        {terms.deposit_utilization_days && <li><span className="font-bold">Deposit Utilization:</span> Security deposit will be applied after {terms.deposit_utilization_days} days of non-payment.</li>}
                        {terms.suspension_period_days && <li><span className="font-bold">Suspension Period:</span> {terms.suspension_period_days} days suspension applicable in case of abuse or policy violation.</li>}
                        {terms.invoice_dispute_days && <li><span className="font-bold">Dispute Window:</span> Invoices may be disputed within {terms.invoice_dispute_days} days of generation.</li>}
                        {terms.custom_terms && <li><span className="font-bold">Additional Terms:</span> {terms.custom_terms}</li>}
                    </ul>
                </>
            )}

            {/* Signatures */}
            <div className="mt-8 pt-4 border-t border-slate-300 grid grid-cols-2 gap-8">
                <div>
                    <div className={`h-10 border-b flex items-end justify-center pb-1 mb-1
                        ${data.pump_owner_signed ? 'border-emerald-500' : 'border-slate-300'}`}>
                        {data.pump_owner_signed ? (
                            <span className="text-xs font-bold text-emerald-600">✓ Digitally Signed</span>
                        ) : (
                            <span className="text-[10px] text-slate-300">Awaiting Signature</span>
                        )}
                    </div>
                    <p className="text-[10px] font-bold text-slate-600">Authorised Signatory — Dealer</p>
                    <p className="text-[10px] text-slate-400">{terms.org_name || terms.station_name || data.pump?.name}</p>
                    {data.pump_owner_signed_at && (
                        <p className="text-[9px] text-slate-400 mt-0.5">
                            Signed on: {new Date(data.pump_owner_signed_at).toLocaleDateString('en-IN')}
                        </p>
                    )}
                </div>
                <div>
                    <div className={`h-10 border-b flex items-end justify-center pb-1 mb-1
                        ${data.logistic_signed ? 'border-emerald-500' : 'border-slate-300'}`}>
                        {data.logistic_signed ? (
                            <span className="text-xs font-bold text-emerald-600">✓ Digitally Signed</span>
                        ) : (
                            <span className="text-[10px] text-slate-300">Awaiting Signature</span>
                        )}
                    </div>
                    <p className="text-[10px] font-bold text-slate-600">Authorised Signatory — Customer</p>
                    <p className="text-[10px] text-slate-400">{data.partner?.name || data.partner?.email}</p>
                    {data.logistic_signed_at && (
                        <p className="text-[9px] text-slate-400 mt-0.5">
                            Signed on: {new Date(data.logistic_signed_at).toLocaleDateString('en-IN')}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CreditRequestDetailPage() {
    const params = useParams();
    const router = useRouter();
    const requestId = params.id ? String(params.id) : '';

    const [data, setData] = useState<CreditRequestDetail | null>(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const d = await creditService.getRequestDetail(requestId);
            setData(d);
        } catch (e: any) {
            toast.error('Error', e?.response?.data?.detail || 'Failed to load');
        } finally { setLoading(false); }
    }, [requestId]);

    useEffect(() => { load(); }, [load]);

    if (loading) return (
        <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    if (!data) return (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <AlertCircle className="h-10 w-10 mb-3 opacity-30" />
            <p className="font-bold text-sm">Request not found</p>
        </div>
    );

    const status = data.status as CreditStatus;
    const needsDeposit = status === 'deposit_pending' && !data.deposit_proof_url;
    const needsSign = ['contract_generated', 'pump_signed'].includes(status) && !data.logistic_signed;
    const isActive = status === 'active';
    const isRejected = status === 'rejected';

    return (
        <div className="space-y-6 max-w-3xl mx-auto">

            {/* Header */}
            <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                <button onClick={() => router.push('/logistic/credit-requests')}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 cursor-pointer transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 border border-orange-200 text-primary flex-shrink-0">
                        <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-base font-extrabold text-slate-900">
                            REQ-{data.id} · {data.vehicle?.plate}
                        </h1>
                        <p className="text-xs text-slate-400">{data.pump?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold ${STATUS_COLORS[status]}`}>
                        {STATUS_LABELS[status]}
                    </span>
                    <button onClick={load} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 cursor-pointer">
                        <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* Timeline */}
            {!isRejected && (
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-4">Agreement Progress</p>
                    <Timeline status={status} />
                </div>
            )}

            {/* Rejected Banner */}
            {isRejected && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-red-800">Request Rejected</p>
                        <p className="text-xs text-red-600 mt-0.5">{data.remarks || 'No reason provided'}</p>
                    </div>
                </div>
            )}

            {/* Active Banner */}
            {isActive && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-emerald-800">Credit Agreement Active!</p>
                        <p className="text-xs text-emerald-600 mt-0.5">
                            ₹{(data.credit_limit || 0).toLocaleString('en-IN')} credit available.
                            Valid until {data.valid_to ? new Date(data.valid_to).toLocaleDateString('en-IN') : '—'}.
                        </p>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Left — Info + Actions */}
                <div className="flex flex-col gap-4">

                    {/* Request Details */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Request Details</p>
                        <div className="flex flex-col gap-2 text-xs">
                            {[
                                { label: 'Requested', value: `₹${data.requested_limit.toLocaleString('en-IN')}` },
                                { label: 'Approved', value: data.approved_limit ? `₹${data.approved_limit.toLocaleString('en-IN')}` : '—' },
                                { label: 'Deposit Required', value: data.deposit_amount ? `₹${data.deposit_amount.toLocaleString('en-IN')}` : 'None' },
                                { label: 'Vehicle', value: data.vehicle?.plate || '—' },
                                { label: 'Vehicle Type', value: data.vehicle?.type || '—' },
                                { label: 'Pump', value: data.pump?.name || '—' },
                                { label: 'Submitted', value: data.requested_at ? new Date(data.requested_at).toLocaleDateString('en-IN') : '—' },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between py-1.5 border-b border-slate-50">
                                    <span className="text-slate-400 font-semibold">{label}</span>
                                    <span className="font-bold text-slate-800">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Deposit proof uploaded but not confirmed */}
                    {status === 'deposit_pending' && data.deposit_proof_url && (
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                <p className="text-xs font-bold text-slate-700">Deposit Proof Uploaded</p>
                            </div>
                            <p className="text-[11px] text-slate-500">
                                Waiting for pump owner to confirm receipt of ₹{(data.deposit_amount || 0).toLocaleString('en-IN')}.
                            </p>
                            <div className="mt-3 p-2 bg-slate-50 border border-slate-100 rounded-xl">
                                <a href={data.deposit_proof_url} target="_blank" rel="noopener noreferrer"
                                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                                    <Download className="h-3 w-3" /> View Uploaded Proof
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Action — Deposit Upload */}
                    {needsDeposit && (
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Action Required</p>
                            <DepositUpload
                                requestId={data.id}
                                depositAmount={data.deposit_amount || 0}
                                onSuccess={load}
                            />
                        </div>
                    )}

                    {/* Action — Sign Contract */}
                    {needsSign && (
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Action Required</p>
                            <OTPSignSection requestId={data.id} onSuccess={load} />
                        </div>
                    )}

                    {/* Waiting for pump owner sign */}
                    {status === 'logistic_signed' && (
                        <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                            <Clock className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-indigo-800">Waiting for Pump Owner</p>
                                <p className="text-xs text-indigo-600 mt-0.5">
                                    You have signed. Pump owner needs to countersign to activate credit.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right — Contract Preview */}
                <div className="flex flex-col gap-4">
                    {data.contract_terms && (
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Contract Document</p>
                            <ContractPreview data={data} />
                        </div>
                    )}

                    {/* Signing Status */}
                    {data.contract_terms && (
                        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Signature Status</p>
                            <div className="flex flex-col gap-2">
                                {[
                                    {
                                        label: 'Pump Owner',
                                        signed: data.pump_owner_signed,
                                        at: data.pump_owner_signed_at,
                                    },
                                    {
                                        label: 'Logistic Partner (You)',
                                        signed: data.logistic_signed,
                                        at: data.logistic_signed_at,
                                    },
                                ].map(({ label, signed, at }) => (
                                    <div key={label} className={`flex items-center justify-between p-3 rounded-xl border
                    ${signed ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                                        <div className="flex items-center gap-2">
                                            {signed
                                                ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                : <Clock className="h-4 w-4 text-slate-300" />
                                            }
                                            <p className="text-xs font-bold text-slate-700">{label}</p>
                                        </div>
                                        <p className={`text-[10px] font-bold ${signed ? 'text-emerald-600' : 'text-slate-400'}`}>
                                            {signed ? (at ? new Date(at).toLocaleDateString('en-IN') : 'Signed') : 'Pending'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}