"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useBookingStore } from "@/stores/useBookingStore";
import { Clock, CheckCircle2, XCircle, MapPin, QrCode, FileText, CalendarDays } from "lucide-react";
import Image from "next/image";

export default function BookingsPage() {
  const { bookings } = useBookingStore();
  const [filter, setFilter] = useState<'All' | 'Upcoming' | 'Completed' | 'Cancelled'>('All');

  const filteredBookings = bookings.filter(b => {
    if (filter === 'All') return true;
    if (filter === 'Upcoming') return ['Pending', 'Confirmed'].includes(b.status);
    return b.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Bookings</h2>
          <p className="text-gray-500 text-sm">View and manage your fuel bookings</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 self-start">
          {['All', 'Upcoming', 'Completed', 'Cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                filter === f ? 'bg-orange-50 text-orange-600' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Bookings Found</h3>
          <p className="text-gray-500">You don't have any {filter.toLowerCase()} bookings at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBookings.map((booking, idx) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="card p-5 relative overflow-hidden"
            >
              {/* Status Badge */}
              <div className={`absolute top-4 right-4 badge ${
                ['Pending', 'Confirmed'].includes(booking.status) ? 'badge-orange' : 
                booking.status === 'Completed' ? 'badge-green' : 'badge-red'
              }`}>
                {booking.status === 'Completed' ? <CheckCircle2 className="w-3 h-3"/> :
                 booking.status === 'Cancelled' ? <XCircle className="w-3 h-3"/> :
                 <Clock className="w-3 h-3"/>}
                {booking.status}
              </div>

              <div className="border-b border-gray-100 pb-4 mb-4 pr-24">
                <p className="text-xs text-gray-400 font-medium mb-1">Booking ID: {booking.id}</p>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{booking.stationName}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <CalendarDays className="w-4 h-4"/>
                  {new Date(booking.date).toLocaleDateString()} at {booking.slot}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Fuel Details</p>
                  <p className="font-semibold text-gray-900">{booking.fuelType} • {booking.quantity}L</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Vehicle</p>
                  <p className="font-semibold text-gray-900">{booking.vehicleNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Amount</p>
                  <p className="font-bold text-orange-600 text-lg">₹{booking.amount}</p>
                </div>
              </div>

              <div className="flex gap-3">
                {['Pending', 'Confirmed'].includes(booking.status) && (
                  <>
                    <button className="flex-1 btn-primary py-2 flex items-center justify-center gap-2">
                      <QrCode className="w-4 h-4"/> View QR
                    </button>
                    <button className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 font-semibold rounded-lg text-sm transition-colors">
                      Cancel
                    </button>
                  </>
                )}
                {booking.status === 'Completed' && (
                  <>
                    <button className="flex-1 btn-secondary py-2 flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4"/> Invoice
                    </button>
                    <button className="flex-1 btn-primary py-2 flex items-center justify-center gap-2">
                      Rebook
                    </button>
                  </>
                )}
                {booking.status === 'Cancelled' && (
                  <button className="flex-1 btn-primary py-2 flex items-center justify-center gap-2">
                    Book Again
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
