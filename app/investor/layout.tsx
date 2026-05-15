"use client";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";
import { LayoutDashboard, TrendingUp, BarChart2, FileText, DollarSign, PieChart } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/investor/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Revenue Analytics", href: "/investor/revenue", icon: <TrendingUp className="w-4 h-4" /> },
  { label: "ROI Charts", href: "/investor/roi", icon: <BarChart2 className="w-4 h-4" /> },
  { label: "Reports", href: "/investor/reports", icon: <FileText className="w-4 h-4" /> },
];

export default function InvestorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/investor/login" || pathname === "/investor";

  if (isLoginPage) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar navItems={navItems} role="Investor" roleColor="indigo" />
      <div className="flex-1 ml-64">
        <TopHeader userName="Capital Partners" userRole="Investor" avatarInitials="CP" notificationCount={0} />
        <main className="pt-16 p-6">{children}</main>
      </div>
    </div>
  );
}
