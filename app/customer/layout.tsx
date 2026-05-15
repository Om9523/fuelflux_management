"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Droplets, Car, CreditCard, Bell, Gift, UserCircle, LogOut, MapPin, FileText, Bookmark, CalendarDays } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import Image from "next/image";

const SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
  { label: "Nearby Stations", href: "/customer/stations", icon: MapPin },
  { label: "Book Fuel", href: "/customer/book-fuel", icon: Droplets },
  { label: "Fuel Logs", href: "/customer/fuel-logs", icon: FileText },
  { label: "Bookmarks", href: "/customer/bookmarks", icon: Bookmark },
  { label: "Vehicles", href: "/customer/vehicles", icon: Car },
  { label: "Bookings", href: "/customer/bookings", icon: CalendarDays },
  { label: "Payments", href: "/customer/payments", icon: CreditCard },
  { label: "Notifications", href: "/customer/notifications", icon: Bell },
  { label: "Rewards", href: "/customer/rewards", icon: Gift },
  { label: "Profile", href: "/customer/profile", icon: UserCircle },
  { label: "Support", href: "/customer/support", icon: FileText },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 backdrop-blur-md border-r border-gray-100 flex flex-col fixed left-0 top-0 h-full shadow-sm z-50">
        <div className="p-6 border-b border-gray-100">
          <Link href="/customer/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-900 shadow-lg flex items-center justify-center flex-shrink-0">
              <Image src="/logo.png" alt="FuelFlux Logo" width={40} height={40} className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-gray-900 block">FuelFlux</span>
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Customer</span>
            </div>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {SIDEBAR_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive 
                  ? "bg-orange-50 text-orange-600 shadow-sm" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-orange-500" : "text-gray-400"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex flex-shrink-0 items-center justify-center overflow-hidden">
               {/* User Avatar Placeholder */}
               <UserCircle className="w-6 h-6 text-gray-400" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Customer'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || 'customer@fuelflux.in'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
           <h1 className="text-lg font-bold text-gray-900 capitalize">
             {pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
           </h1>
           <div className="flex items-center gap-4">
             <button className="p-2 rounded-full hover:bg-gray-100 relative text-gray-500">
               <Bell className="w-5 h-5" />
               <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
             </button>
           </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
