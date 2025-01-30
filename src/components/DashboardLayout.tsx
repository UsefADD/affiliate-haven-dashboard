import { useState, useEffect } from "react";
import { BarChart2, Link, LogOut, FileText, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkUserRole();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const checkUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No active session found');
        navigate('/login');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      setIsAdmin(profile?.role === 'admin');
      setProfile(profile);
    } catch (error) {
      console.error('Session error:', error);
      localStorage.removeItem("isLoggedIn");
      navigate('/login');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("isLoggedIn");
      navigate("/login");
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const affiliateNavItems = [
    { icon: BarChart2, label: "Dashboard", href: "/" },
    { icon: Link, label: "Campaigns", href: "/campaigns" },
    { icon: FileText, label: "Reports", href: "/reports" },
  ];

  const adminNavItems = [
    { icon: BarChart2, label: "Dashboard", href: "/admin" },
    { icon: Link, label: "Users", href: "/admin/users" },
    { icon: FileText, label: "Offers", href: "/admin/offers" },
    { icon: FileText, label: "Leads", href: "/admin/leads" },
  ];

  const navItems = isAdmin ? adminNavItems : affiliateNavItems;

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${(firstName?.[0] || "").toUpperCase()}${(lastName?.[0] || "").toUpperCase()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <header className="sticky top-0 z-30 glass-card border-b">
        <div className="container mx-auto">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-green-600">ClixAgent</h1>
              <nav className="hidden md:flex items-center space-x-6">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                      location.pathname === item.href ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </a>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                Welcome back, {profile?.first_name || (isAdmin ? 'Admin' : 'Affiliate')}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar>
                      <AvatarFallback>
                        {getInitials(profile?.first_name, profile?.last_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <UserRound className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-8 animate-in">
        {children}
      </main>
    </div>
  );
}