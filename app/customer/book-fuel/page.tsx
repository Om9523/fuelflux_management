"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DUMMY_STATIONS } from "@/data/stations";
import { useVehicleStore } from "@/stores/useVehicleStore";
import { useBookingStore } from "@/stores/useBookingStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { MapPin, CheckCircle2, ChevronRight, Droplets, CreditCard, QRCode as QrIcon, AlertTriangle, Star } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';

const steps = ["Select Station", "Fuel Details", "Payment", "QR Code"];

const bookingSchema = z.object({
  stationId: z.string().min(1, "Please select a station"),
  fuelType: z.enum(["Petrol", "Diesel", "CNG", "EV"]),
  quantity: z.number().min(1, "Minimum 1L").max(100, "Maximum 100L"),
  vehicleId: z.string().min(1, "Please select a vehicle"),
  date: z.string().min(1, "Date is required"),
  slot: z.string().min(1, "Time slot is required"),
  bookingType: z.enum(["Standard", "Premium", "Emergency"]),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function BookFuelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedStation = searchParams.get("station");
  
  const [currentStep, setCurrentStep] = useState(0);
  const { vehicles } = useVehicleStore();
  const { addBooking } = useBookingStore();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [generatedBookingId, setGeneratedBookingId] = useState<string | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      stationId: preSelectedStation || "",
      fuelType: "Petrol",
      quantity: 10,
      vehicleId: vehicles.find(v => v.isDefault)?.id || "",
      date: new Date().toISOString().split('T')[0],
      slot: "09:00 AM - 10:00 AM",
      bookingType: "Standard"
    }
  });

  const selectedStationId = form.watch("stationId");
  const selectedStation = DUMMY_STATIONS.find(s => s.id === selectedStationId);
  const fuelType = form.watch("fuelType");
  const quantity = form.watch("quantity");
  const bookingType = form.watch("bookingType");
  const { isPremium } = useAuthStore();
  
  const baseAmount = selectedStation ? (
    fuelType === 'Petrol' ? selectedStation.petrolPrice : 
    fuelType === 'Diesel' ? selectedStation.dieselPrice : 
    fuelType === 'CNG' ? selectedStation.cngPrice : 
    selectedStation.evPrice
  ) * quantity : 0;
  let surcharge = 0;
  if (bookingType === 'Premium' && !isPremium) surcharge = 50;
  if (bookingType === 'Emergency') surcharge = 200;
  const amount = baseAmount + surcharge;

  const nextStep = async () => {
    const isValid = await form.trigger();
    if (isValid && currentStep < steps.length - 1) {
      if (currentStep === 1) {
        // Handle moving to payment
        setCurrentStep(2);
      } else {
        setCurrentStep(s => s + 1);
      }
    }
  };

  const handlePayment = () => {
    setIsProcessingPayment(true);
    // Simulate payment gateway
    setTimeout(() => {
      setIsProcessingPayment(false);
      
      // Generate booking
      const values = form.getValues();
      const station = DUMMY_STATIONS.find(s => s.id === values.stationId)!;
      const vehicle = vehicles.find(v => v.id === values.vehicleId)!;
      
      const newBookingId = `BKG-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      const qrDataString = JSON.stringify({
        bookingId: newBookingId,
        stationId: station.id,
        vehicleNumber: vehicle.number,
        amount: amount,
        fuelType: values.fuelType,
        quantity: values.quantity
      });

      addBooking({
        id: newBookingId,
        stationId: station.id,
        stationName: station.name,
        fuelType: values.fuelType,
        quantity: values.quantity,
        amount: parseFloat(amount.toFixed(2)),
        vehicleNumber: vehicle.number,
        date: values.date,
        slot: values.slot,
        status: 'Confirmed',
        createdAt: new Date().toISOString(),
        qrCodeData: qrDataString
      });

      setGeneratedBookingId(newBookingId);
      setQrData(qrDataString);
      setCurrentStep(3); // Move to QR step
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Stepper */}
      <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => (
            <div key={step} className="flex flex-col items-center gap-2 relative z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                currentStep > idx ? 'bg-green-500 text-white' : 
                currentStep === idx ? 'bg-orange-500 text-white ring-4 ring-orange-100' : 'bg-gray-100 text-gray-400'
              }`}>
                {currentStep > idx ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
              </div>
              <span className={`text-xs font-semibold ${currentStep === idx ? 'text-orange-600' : 'text-gray-500'}`}>{step}</span>
            </div>
          ))}
          <div className="absolute left-[15%] right-[15%] h-1 bg-gray-100 -z-0 top-11 hidden md:block">
            <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <AnimatePresence mode="wait">
          {/* STEP 1: Select Station */}
          {currentStep === 0 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Select a Petrol Station</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DUMMY_STATIONS.map(station => (
                  <div 
                    key={station.id} 
                    onClick={() => form.setValue("stationId", station.id)}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${selectedStationId === station.id ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-orange-200'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900">{station.name}</h3>
                      {selectedStationId === station.id && <CheckCircle2 className="w-5 h-5 text-orange-500" />}
                    </div>
                    <p className="text-xs text-gray-500 mb-3 flex items-center gap-1"><MapPin className="w-3 h-3"/> {station.address}</p>
                    <div className="flex gap-3 text-xs font-semibold">
                      <span className="text-gray-600 bg-white px-2 py-1 rounded">P: ₹{station.petrolPrice}</span>
                      <span className="text-gray-600 bg-white px-2 py-1 rounded">D: ₹{station.dieselPrice}</span>
                      <span className="text-gray-600 bg-white px-2 py-1 rounded">C: ₹{station.cngPrice}</span>
                      <span className="text-gray-600 bg-white px-2 py-1 rounded">EV: ₹{station.evPrice}</span>
                      <span className="text-green-600 bg-green-50 px-2 py-1 rounded">{station.queueTime}m wait</span>
                    </div>
                  </div>
                ))}
              </div>
              {form.formState.errors.stationId && <p className="text-red-500 text-sm mt-2">{form.formState.errors.stationId.message}</p>}
              <div className="mt-8 flex justify-end">
                <button onClick={nextStep} disabled={!selectedStationId} className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50">Continue</button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Fuel Details */}
          {currentStep === 1 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Fuel Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fuel Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Petrol", "Diesel", "CNG", "EV"].map(type => (
                      <button 
                        key={type}
                        onClick={() => form.setValue("fuelType", type as any)}
                        className={`p-3 rounded-xl border-2 font-bold transition-colors ${fuelType === type ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-500'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity (Liters / kWh)</label>
                  <input 
                    type="number" 
                    {...form.register("quantity", { valueAsNumber: true })}
                    className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-orange-500 focus:ring-0 transition-colors font-bold text-lg" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Vehicle</label>
                  <select {...form.register("vehicleId")} className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-orange-500 font-medium">
                    <option value="">Select a vehicle</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.number} ({v.model})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Booking Date</label>
                  <input type="date" {...form.register("date")} className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-orange-500 font-medium" />
                </div>
                
                <div className="md:col-span-2 mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Booking Type</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div 
                      onClick={() => form.setValue("bookingType", "Standard")}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-colors ${bookingType === "Standard" ? 'border-orange-500 bg-orange-50' : 'border-gray-100'}`}
                    >
                      <h4 className="font-bold text-gray-900 mb-1">Standard</h4>
                      <p className="text-xs text-gray-500 mb-2">Regular queue</p>
                      <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">No Surcharge</span>
                    </div>

                    <div 
                      onClick={() => form.setValue("bookingType", "Premium")}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-colors ${bookingType === "Premium" ? 'border-orange-500 bg-orange-50' : 'border-gray-100'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-gray-900 flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500"/> Premium</h4>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">Priority queue</p>
                      {isPremium ? (
                        <span className="text-xs font-semibold bg-green-100 text-green-600 px-2 py-1 rounded">Free for you</span>
                      ) : (
                        <span className="text-xs font-semibold bg-amber-100 text-amber-600 px-2 py-1 rounded">+₹50 Surcharge</span>
                      )}
                    </div>

                    <div 
                      onClick={() => form.setValue("bookingType", "Emergency")}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-colors ${bookingType === "Emergency" ? 'border-red-500 bg-red-50' : 'border-gray-100'}`}
                    >
                      <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5 text-red-500"/> Emergency</h4>
                      <p className="text-xs text-gray-500 mb-2">Immediate SOS access</p>
                      <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-1 rounded">+₹200 Surcharge</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-gray-50 p-4 rounded-xl flex items-center justify-between">
                <span className="font-semibold text-gray-600">Total Amount:</span>
                <span className="text-2xl font-black text-gray-900">₹{amount.toFixed(2)}</span>
              </div>

              <div className="mt-8 flex justify-between">
                <button onClick={() => setCurrentStep(0)} className="text-gray-500 font-semibold px-4 py-2 hover:bg-gray-50 rounded-xl">Back</button>
                <button onClick={nextStep} className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors">Proceed to Pay</button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Payment */}
          {currentStep === 2 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Complete Payment</h2>
              <p className="text-gray-500 mb-8">Pay securely to generate your booking QR code.</p>
              
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 max-w-sm mx-auto mb-8">
                <p className="text-sm text-orange-600 font-semibold mb-1">Amount to Pay</p>
                <p className="text-4xl font-black text-gray-900">₹{amount.toFixed(2)}</p>
              </div>

              <button 
                onClick={handlePayment} 
                disabled={isProcessingPayment}
                className="bg-gray-900 text-white w-full max-w-sm mx-auto py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isProcessingPayment ? (
                  <><span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> Processing...</>
                ) : (
                  <><CreditCard className="w-5 h-5"/> Pay Now (Mock)</>
                )}
              </button>
              
              <div className="mt-4">
                <button onClick={() => !isProcessingPayment && setCurrentStep(1)} className="text-gray-500 font-semibold text-sm">Cancel</button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: QR Code Success */}
          {currentStep === 3 && qrData && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Booking Confirmed!</h2>
              <p className="text-gray-500 mb-8">Show this QR code at the station to fill fuel instantly.</p>
              
              <div className="bg-white border-2 border-dashed border-gray-200 p-8 rounded-3xl inline-block shadow-sm mb-8">
                <QRCodeSVG value={qrData} size={200} level="H" includeMargin={true} />
                <p className="mt-4 font-mono font-bold text-gray-600 tracking-wider">{generatedBookingId}</p>
              </div>

              <div>
                <button onClick={() => router.push(`/customer/stations?navigate=${form.getValues('stationId')}`)} className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 mx-auto">
                  <MapPin className="w-5 h-5" /> Navigate to Station
                </button>
                <button onClick={() => router.push('/customer/dashboard')} className="mt-4 text-gray-500 font-semibold text-sm">
                  Back to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
