"use client";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";
import { LayoutDashboard, Users, CreditCard, Wallet, Receipt, BarChart2, Cpu, Camera, Video, Package, Brain } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/pump-owner/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Accounting", href: "/pump-owner/accounting", icon: <Receipt className="w-4 h-4" /> },
  { label: "Sales Register", href: "/pump-owner/sales", icon: <BarChart2 className="w-4 h-4" /> },
  { label: "Inventory", href: "/pump-owner/inventory", icon: <Package className="w-4 h-4" /> },
  { label: "Employees", href: "/pump-owner/employees", icon: <Users className="w-4 h-4" /> },
  { label: "Wallet", href: "/pump-owner/wallet", icon: <Wallet className="w-4 h-4" /> },
  { label: "Subscription", href: "/pump-owner/subscription", icon: <CreditCard className="w-4 h-4" /> },
  { label: "ANPR Camera", href: "/pump-owner/ai/anpr", icon: <Cpu className="w-4 h-4" /> },
  { label: "Vehicle Count", href: "/pump-owner/ai/vehicle-count", icon: <Camera className="w-4 h-4" /> },
  { label: "Attendance AI", href: "/pump-owner/ai/attendance", icon: <Users className="w-4 h-4" /> },
  { label: "Demand AI", href: "/pump-owner/ai/demand", icon: <Brain className="w-4 h-4" /> },
  { label: "Live Monitor", href: "/pump-owner/monitor", icon: <Video className="w-4 h-4" /> },
];

export default function PumpOwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = pathname === "/pump-owner/login" || pathname === "/pump-owner";

  if (isPublicPage) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar navItems={navItems} role="Pump Owner" roleColor="orange" />
      <div className="flex-1 ml-64">
        <TopHeader userName="Rajesh Sharma" userRole="Pump Owner" avatarInitials="RS" notificationCount={3} />
        <main className="pt-16 p-6">{children}</main>
      </div>
    </div>
  );
}
