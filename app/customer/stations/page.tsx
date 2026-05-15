"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Clock, Search, Filter, Bookmark } from "lucide-react";
import { DUMMY_STATIONS } from "@/data/stations";
import Link from "next/link";
import { useBookmarkStore } from "@/stores/useBookmarkStore";

import { useSearchParams } from "next/navigation";

export default function StationsMapPage() {
  const searchParams = useSearchParams();
  const navigateStationId = searchParams.get("navigate");
  const [searchTerm, setSearchTerm] = useState("");
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarkStore();

  const filteredStations = DUMMY_STATIONS.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Sidebar List */}
      <div className="w-1/3 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search stations or location..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:bg-white focus:outline-none transition-colors text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredStations.map((station) => (
            <motion.div 
              key={station.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border border-gray-100 rounded-xl hover:border-orange-500 hover:shadow-md cursor-pointer transition-all"
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-gray-900">{station.name}</h3>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    if (isBookmarked(station.id)) removeBookmark(station.id);
                    else addBookmark(station);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${isBookmarked(station.id) ? 'bg-orange-100 text-orange-500' : 'bg-gray-50 text-gray-400 hover:text-orange-500 hover:bg-orange-50'}`}
                >
                  <Bookmark className="w-4 h-4" fill={isBookmarked(station.id) ? "currentColor" : "none"} />
                </button>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1 mb-3"><MapPin className="w-3 h-3"/> {station.address}</p>
              
              <div className="flex gap-2 text-xs font-semibold mb-4">
                <span className="bg-gray-50 px-2 py-1 rounded">P: ₹{station.petrolPrice}</span>
                <span className="bg-gray-50 px-2 py-1 rounded">D: ₹{station.dieselPrice}</span>
              </div>
              
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                  <Clock className="w-3 h-3"/> {station.queueTime} min wait
                </span>
                <Link href={`/customer/book-fuel?station=${station.id}`} className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-orange-600">
                  Book Fuel
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 bg-gray-100 rounded-2xl border border-gray-200 overflow-hidden relative">
        {/* We use an iframe to embed a static map or just a placeholder if not using real Google Maps API key */}
        <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=12.9716,77.5946&zoom=12&size=800x800&style=feature:all|element:labels|visibility:off&key=YOUR_API_KEY')] bg-cover bg-center opacity-50 mix-blend-multiply pointer-events-none"></div>
        
        {/* Simulated Map Pins */}
        {filteredStations.map((station) => (
          <div 
            key={station.id} 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{
               // Very rough conversion of lat/long to percentage for visual purposes only (centered around Bangalore)
               top: `${50 + (12.97 - station.latitude) * 500}%`,
               left: `${50 + (station.longitude - 77.6) * 500}%`
            }}
          >
            <div className="relative">
              <MapPin className="w-8 h-8 text-orange-500 drop-shadow-md" fill="white" />
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-orange-500 rounded-full"></div>
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white rounded-xl shadow-xl p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <p className="text-sm font-bold text-gray-900 mb-1">{station.name}</p>
              <p className="text-xs font-semibold text-green-600">{station.queueTime}m queue</p>
            </div>
          </div>
        ))}

        {/* Customer Location & Simulated Route */}
        {navigateStationId && (
          <>
            <div className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ top: "60%", left: "40%" }}>
              <div className="w-6 h-6 bg-blue-500 border-4 border-white rounded-full shadow-lg relative">
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-900 bg-white px-2 py-0.5 rounded shadow whitespace-nowrap">You</div>
              </div>
            </div>
            
            {DUMMY_STATIONS.map((station) => {
              if (station.id === navigateStationId) {
                const targetTop = 50 + (12.97 - station.latitude) * 500;
                const targetLeft = 50 + (station.longitude - 77.6) * 500;
                return (
                  <svg key={`route-${station.id}`} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                    <path 
                      d={`M ${40}% ${60}% Q ${40 + (targetLeft - 40) / 2}% ${targetTop}% ${targetLeft}% ${targetTop}%`} 
                      fill="none" 
                      stroke="#3b82f6" 
                      strokeWidth="4" 
                      strokeDasharray="8 8" 
                      className="animate-pulse"
                    />
                  </svg>
                );
              }
              return null;
            })}
          </>
        )}

        <div className="absolute top-4 right-4 bg-white p-2 rounded-xl shadow-md flex gap-2">
          <button className="p-2 text-gray-500 hover:text-orange-500 bg-gray-50 rounded-lg"><Filter className="w-5 h-5"/></button>
          <button className="p-2 text-gray-500 hover:text-orange-500 bg-gray-50 rounded-lg"><Navigation className="w-5 h-5"/></button>
        </div>
      </div>
    </div>
  );
}
