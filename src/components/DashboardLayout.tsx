import { useState, useEffect } from "react";
import { Menu, X, BarChart2, Link, Settings, LogOut, FileText, Users, Gift, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setIsAdmin(profile?.role === 'admin');
      }
    };

    checkUserRole();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

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
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 transform transition-transform duration-300 ease-in-out",
          !isSidebarOpen && "-translate-x-full"
        )}
      >
        <div className="h-full glass-card border-r">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-semibold text-green-600">SoftDigi</h1>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-secondary"
            >
              <X className="h-5 w-5" />
            </button>
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
            <button onClick={handleLogout} className="nav-link w-full text-destructive">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div
        className={cn(
          "transition-all duration-300",
          isSidebarOpen ? "lg:ml-64" : "ml-0"
        )}
      >
        <header className="sticky top-0 z-30 glass-card border-b">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-secondary"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                Welcome back, {isAdmin ? 'Admin' : 'Affiliate'}
              </div>
            </div>
          </div>
        </header>
        <main className="container py-8 animate-in">
          {children}
        </main>
      </div>
    </div>
  );
}