"use client";
import { Gift, Star, ChevronRight, Award, Zap, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useState } from "react";

export default function RewardsPage() {
  const { isPremium, upgradeToPremium } = useAuthStore();
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = () => {
    setUpgrading(true);
    setTimeout(() => {
      upgradeToPremium();
      setUpgrading(false);
    }, 1500);
  };
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
          <Gift className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <p className="text-orange-100 font-semibold mb-2">Available Fuel Points</p>
          <div className="flex items-baseline gap-2 mb-6">
            <h2 className="text-5xl font-black">1,250</h2>
            <span className="text-orange-200 font-bold">pts</span>
          </div>
          <p className="text-sm text-orange-50 mb-6 max-w-sm">
            You earn 10 points for every liter of fuel you book. Use points to get discounts on your next booking!
          </p>
          <button className="bg-white text-orange-600 px-6 py-2.5 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-sm">
            Redeem Points
          </button>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">Membership Benefits</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Star, title: "Priority Queue", desc: "Skip the line at partner stations during peak hours.", color: "text-blue-500", bg: "bg-blue-50" },
          { icon: Zap, title: "Extra Cashback", desc: "Get 2% instant cashback on all premium fuel bookings.", color: "text-green-500", bg: "bg-green-50" },
          { icon: Award, title: "Free PUC Check", desc: "One free pollution check every 6 months at selected stations.", color: "text-purple-500", bg: "bg-purple-50" }
        ].map((benefit, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${benefit.bg} ${benefit.color}`}>
              <benefit.icon className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">{benefit.title}</h4>
            <p className="text-sm text-gray-500 leading-relaxed">{benefit.desc}</p>
          </div>
        ))}
      </div>

      {!isPremium && (
        <div className="mt-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-gray-700">
          <div>
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-transparent bg-clip-text font-black uppercase tracking-wider text-sm mb-2 block">
              FuelFlux Premium
            </span>
            <h3 className="text-2xl font-bold mb-2">Upgrade to Premium</h3>
            <p className="text-gray-400 text-sm max-w-md">
              Unlock free Premium Bookings, skip the queue at any station, and get 2x reward points on every refuel.
            </p>
          </div>
          <button 
            onClick={handleUpgrade}
            disabled={upgrading}
            className="flex-shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-orange-500/20 transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {upgrading ? (
              <span className="animate-pulse">Upgrading...</span>
            ) : (
              <>
                <Star className="w-5 h-5 fill-white" /> Upgrade Now - ₹499/mo
              </>
            )}
          </button>
        </div>
      )}

      {isPremium && (
        <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-green-800 font-bold text-lg">You are a Premium Member</h3>
            <p className="text-green-600 text-sm">Your Standard and Premium booking surcharges are waived, and you always get priority queueing.</p>
          </div>
        </div>
      )}
    </div>
  );
}
