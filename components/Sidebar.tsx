"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  navItems: NavItem[];
  role: string;
  roleColor?: string;
}

export default function Sidebar({ navItems, role, roleColor = "orange" }: SidebarProps) {
  const pathname = usePathname();

  const colorMap: Record<string, { bg: string; text: string }> = {
    orange: { bg: "from-orange-500 to-orange-600", text: "text-orange-600" },
    blue:   { bg: "from-blue-500 to-blue-600",   text: "text-blue-600"   },
    purple: { bg: "from-purple-500 to-purple-600", text: "text-purple-600" },
    indigo: { bg: "from-indigo-500 to-indigo-600", text: "text-indigo-600" },
  };

  const colors = colorMap[roleColor] || colorMap.orange;

  const activeColor: Record<string, string> = {
    orange: "#f97316",
    blue:   "#3b82f6",
    purple: "#a855f7",
    indigo: "#6366f1",
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-md bg-gray-900">
            <Image src="/logo.png" alt="FuelFlux Logo" width={40} height={40} className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-base font-800 text-gray-900" style={{ fontWeight: 800 }}>FuelFlux</p>
            <p className={cn("text-xs font-600", colors.text)} style={{ fontWeight: 600 }}>{role}</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("sidebar-item", isActive ? "active" : "")}
                style={isActive ? { background: activeColor[roleColor] || activeColor.orange } : {}}
              >
                  <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <Link href="/" className="sidebar-item text-red-400 hover:bg-red-50 hover:text-red-500 flex">
            <span>🚪</span>
            <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
}
