"use client";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";
import { LayoutDashboard, FileCheck, CreditCard, DollarSign, Users, Wallet, Bot, ShieldCheck, FileText, Calculator, Banknote, Receipt, PieChart } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "CRM", href: "/admin/crm", icon: <Users className="w-4 h-4" /> },
  { label: "Customers", href: "/admin/customers", icon: <Users className="w-4 h-4" /> },
  { label: "Pump Owners", href: "/admin/pump-owners", icon: <Users className="w-4 h-4" /> },
  { label: "Logistics", href: "/admin/logistics", icon: <Bot className="w-4 h-4" /> },
  { label: "Inventory", href: "/admin/inventory", icon: <FileCheck className="w-4 h-4" /> },
  { label: "Orders", href: "/admin/orders", icon: <Receipt className="w-4 h-4" /> },
  { label: "Transactions", href: "/admin/transactions", icon: <DollarSign className="w-4 h-4" /> },
  { label: "Financial Reports", href: "/admin/reports", icon: <PieChart className="w-4 h-4" /> },
  { label: "Analytics", href: "/admin/analytics", icon: <PieChart className="w-4 h-4" /> },
  { label: "Settings", href: "/admin/settings", icon: <ShieldCheck className="w-4 h-4" /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login" || pathname === "/admin";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar navItems={navItems} role="Admin" roleColor="purple" />
      <div className="flex-1 ml-64">
        <TopHeader userName="Admin User" userRole="System Administrator" avatarInitials="AD" notificationCount={8} />
        <main className="pt-16 p-6">{children}</main>
      </div>
    </div>
  );
}
