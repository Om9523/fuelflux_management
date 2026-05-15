"use client";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";
import { LayoutDashboard, Wallet, FileText } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/logistics/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Fund Wallet", href: "/logistics/fund-wallet", icon: <Wallet className="w-4 h-4" /> },
  { label: "Transactions", href: "/logistics/transactions", icon: <FileText className="w-4 h-4" /> },
];

const LOGISTICS_NOTIFS = [
  { id: 1, type: "success" as const, message: "₹25,000 transfer to Sharma Fuel Station verified", time: "2h ago" },
  { id: 2, type: "warning" as const, message: "₹50,000 payment to City Petrol Hub still pending", time: "5h ago" },
];

export default function LogisticsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/logistics/login" || pathname === "/logistics";

  if (isLoginPage) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar navItems={navItems} role="Logistics" roleColor="orange" />
      <div className="flex-1 ml-64">
        <TopHeader
          userName="Speedy Logistics"
          userRole="Logistics Partner"
          avatarInitials="SL"
          avatarColor="from-orange-500 to-orange-600"
          notificationCount={2}
          notifications={LOGISTICS_NOTIFS}
        />
        <main className="pt-16 p-6">{children}</main>
      </div>
    </div>
  );
}
