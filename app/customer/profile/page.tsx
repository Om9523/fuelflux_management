"use client";
import { UserCircle, Mail, Phone, MapPin, Shield, BellRing, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-full flex flex-shrink-0 items-center justify-center border-4 border-white shadow-lg">
          <UserCircle className="w-16 h-16" />
        </div>
        <div className="text-center md:text-left flex-1">
          <h2 className="text-2xl font-black text-gray-900">{user?.name || 'Customer User'}</h2>
          <p className="text-gray-500 font-medium">{user?.email || 'customer@fuelflux.in'}</p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
            <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
              Verified Account
            </span>
            <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold border border-orange-100">
              Premium Member
            </span>
          </div>
        </div>
        <button className="bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-100 border border-gray-200 transition-colors">
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-4">
            <Shield className="w-5 h-5 text-gray-400" /> Account Security
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-gray-900">Password</p>
                <p className="text-xs text-gray-500">Last changed 3 months ago</p>
              </div>
              <button className="text-sm font-semibold text-orange-500 hover:text-orange-600">Update</button>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-gray-900">Two-Factor Auth</p>
                <p className="text-xs text-gray-500">Currently disabled</p>
              </div>
              <button className="text-sm font-semibold text-orange-500 hover:text-orange-600">Enable</button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-4">
            <BellRing className="w-5 h-5 text-gray-400" /> Notification Preferences
          </h3>
          <div className="space-y-4">
            {['Email updates on bookings', 'SMS alerts for payments', 'Marketing and promotional emails'].map((pref, i) => (
              <div key={i} className="flex justify-between items-center">
                <p className="text-sm font-semibold text-gray-700">{pref}</p>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked={i !== 2} />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button 
          onClick={handleLogout}
          className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center gap-2"
        >
          <LogOut className="w-5 h-5" /> Logout from all devices
        </button>
      </div>
    </div>
  );
}
