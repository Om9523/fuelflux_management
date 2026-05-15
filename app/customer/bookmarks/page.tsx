"use client";
import { motion } from "framer-motion";
import { MapPin, Navigation, Clock, Trash2 } from "lucide-react";
import { useBookmarkStore } from "@/stores/useBookmarkStore";
import Link from "next/link";
import Image from "next/image";

export default function BookmarksPage() {
  const { bookmarkedStations, removeBookmark } = useBookmarkStore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bookmarked Stations</h2>
          <p className="text-gray-500 text-sm">Manage your favorite and frequently visited stations</p>
        </div>
      </div>

      {bookmarkedStations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-10 h-10 text-orange-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Bookmarks Yet</h3>
          <p className="text-gray-500 mb-6">You haven't bookmarked any stations. Start exploring nearby stations to add them here.</p>
          <Link href="/customer/stations" className="btn-primary inline-flex items-center gap-2">
            <Navigation className="w-4 h-4" />
            Explore Stations
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarkedStations.map((station, idx) => (
            <motion.div 
              key={station.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="card p-5 group relative"
            >
              <div className="flex gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                   {station.images && station.images[0] ? (
                     <Image src={station.images[0]} alt={station.name} layout="fill" objectFit="cover" />
                   ) : (
                     <MapPin className="w-8 h-8 text-orange-500" />
                   )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 line-clamp-1">{station.name}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-1 mt-1">
                    <MapPin className="w-3 h-3"/> {station.address}
                  </p>
                  <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3"/> {station.queueTime}m queue
                  </p>
                </div>
              </div>

              <div className="flex gap-2 text-xs font-semibold mb-5 bg-gray-50 p-2 rounded-lg">
                <div className="flex-1 text-center border-r border-gray-200 last:border-0">
                  <p className="text-gray-400 text-[10px] uppercase">Petrol</p>
                  <p className="text-gray-900">₹{station.petrolPrice}</p>
                </div>
                <div className="flex-1 text-center border-r border-gray-200 last:border-0">
                  <p className="text-gray-400 text-[10px] uppercase">Diesel</p>
                  <p className="text-gray-900">₹{station.dieselPrice}</p>
                </div>
                <div className="flex-1 text-center border-r border-gray-200 last:border-0">
                  <p className="text-gray-400 text-[10px] uppercase">CNG</p>
                  <p className="text-gray-900">₹{station.cngPrice}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => removeBookmark(station.id)}
                  className="p-2.5 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-xl transition-colors"
                  title="Remove Bookmark"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <Link 
                  href={`/customer/book-fuel?station=${station.id}`} 
                  className="flex-1 btn-primary text-center py-2.5"
                >
                  Book Fuel
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
