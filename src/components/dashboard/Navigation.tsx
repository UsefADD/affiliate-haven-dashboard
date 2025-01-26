import { BarChart2, Link, FileText, Users, Gift, FileSpreadsheet, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

interface NavigationProps {
  isAdmin: boolean;
  onLogout: () => void;
}

export function Navigation({ isAdmin, onLogout }: NavigationProps) {
  const location = useLocation();

  const affiliateNavItems = [
    { icon: BarChart2, label: "Dashboard", href: "/" },
    { icon: Link, label: "Campaigns", href: "/campaigns" },
    { icon: FileText, label: "Reports", href: "/reports" },
  ];

  const adminNavItems = [
    { icon: BarChart2, label: "Dashboard", href: "/admin" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: Gift, label: "Offers", href: "/admin/offers" },
    { icon: FileSpreadsheet, label: "Leads", href: "/admin/leads" },
  ];

  const navItems = isAdmin ? adminNavItems : affiliateNavItems;

  return (
    <div className="h-full glass-card border-r">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-xl font-semibold text-green-600">SoftDigi</h1>
      </div>
      <nav className="space-y-1 p-4">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={cn(
              "nav-link",
              location.pathname === item.href && "bg-secondary"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
      <div className="absolute bottom-0 w-full p-4">
        <button onClick={onLogout} className="nav-link w-full text-destructive">
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}