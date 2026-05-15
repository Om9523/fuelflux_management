"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Droplets, MapPin, Navigation, Clock, ChevronRight, Activity, Zap, Star } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useBookingStore } from "@/stores/useBookingStore";
import { DUMMY_STATIONS } from "@/data/stations";

export default function CustomerDashboard() {
  const { user } = useAuthStore();
  const { getActiveBookings } = useBookingStore();
  const activeBookings = getActiveBookings();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2">Welcome back, {user?.name?.split(' ')[0] || 'Customer'}! 👋</h2>
          <p className="text-orange-100 mb-6">You have {activeBookings.length} active bookings and 1,250 Reward Points.</p>
          <div className="flex gap-4">
            <Link href="/customer/book-fuel" className="bg-white text-orange-600 px-6 py-2.5 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-sm inline-flex items-center gap-2">
              <Droplets className="w-4 h-4" /> Book Fuel Now
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Fuel Prices & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-semibold">Petrol Price</h3>
            <div className="w-8 h-8 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center"><Droplets className="w-4 h-4"/></div>
          </div>
          <p className="text-3xl font-black text-gray-900">₹101.94<span className="text-sm font-medium text-gray-500">/L</span></p>
          <p className="text-xs text-green-500 font-medium mt-2 flex items-center gap-1"><Activity className="w-3 h-3"/> Stable today</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-semibold">Diesel Price</h3>
            <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center"><Droplets className="w-4 h-4"/></div>
          </div>
          <p className="text-3xl font-black text-gray-900">₹87.89<span className="text-sm font-medium text-gray-500">/L</span></p>
          <p className="text-xs text-green-500 font-medium mt-2 flex items-center gap-1"><Activity className="w-3 h-3"/> Stable today</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-semibold">Reward Points</h3>
            <div className="w-8 h-8 bg-yellow-50 text-yellow-500 rounded-lg flex items-center justify-center"><Star className="w-4 h-4"/></div>
          </div>
          <p className="text-3xl font-black text-gray-900">1,250</p>
          <p className="text-xs text-gray-500 font-medium mt-2">Worth ₹125 in fuel</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-semibold">Total Saved</h3>
            <div className="w-8 h-8 bg-green-50 text-green-500 rounded-lg flex items-center justify-center"><Zap className="w-4 h-4"/></div>
          </div>
          <p className="text-3xl font-black text-gray-900">₹450</p>
          <p className="text-xs text-gray-500 font-medium mt-2">This month</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Nearby Stations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Nearby Stations</h3>
            <Link href="/customer/stations" className="text-sm font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1">View Map <ChevronRight className="w-4 h-4"/></Link>
          </div>
          <div className="space-y-4">
            {DUMMY_STATIONS.map((station, idx) => (
              <motion.div 
                key={station.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-orange-200 transition-colors shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">⛽</div>
                  <div>
                    <h4 className="font-bold text-gray-900">{station.name}</h4>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {station.address} • <span className="text-green-600 font-semibold">{station.queueTime} mins queue</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/customer/book-fuel?station=${station.id}`} className="bg-orange-50 text-orange-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-100 transition-colors">
                    Book
                  </Link>
                  <button className="bg-gray-50 text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Navigation className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Active Bookings */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Active Bookings</h3>
            <Link href="/customer/bookings" className="text-sm font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1">All <ChevronRight className="w-4 h-4"/></Link>
          </div>
          
          {activeBookings.length === 0 ? (
            <div className="bg-white border border-gray-100 border-dashed rounded-2xl p-8 text-center text-gray-500">
              <Clock className="w-8 h-8 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium">No active bookings</p>
              <Link href="/customer/book-fuel" className="text-orange-500 text-sm font-semibold mt-2 inline-block">Book Fuel Now</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activeBookings.map((booking) => (
                <div key={booking.id} className="bg-white border border-orange-100 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs font-bold px-2 py-1 rounded bg-orange-50 text-orange-600 mb-2 inline-block">{booking.status}</span>
                      <h4 className="font-bold text-gray-900 text-sm">{booking.stationName}</h4>
                    </div>
                    <span className="font-black text-gray-900">₹{booking.amount}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">{booking.quantity}L • {booking.fuelType} • {booking.vehicleNumber}</p>
                  <Link href={`/customer/bookings`} className="block w-full py-2 bg-gray-50 text-center text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                    View QR Code
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
