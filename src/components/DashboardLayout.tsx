import { useState, useEffect } from "react";
import { Menu, X, BarChart2, Link, Settings, LogOut, FileText, Users, Gift, FileSpreadsheet, UserRound } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    checkSession();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log("No session found, redirecting to login");
        setProfile(null);
        setIsAdmin(false);
        navigate('/login');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log("Session found, fetching profile");
        await checkUserRole();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const checkSession = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }

      if (!session) {
        console.log("No active session found");
        navigate('/login');
        return;
      }

      await checkUserRole();
    } catch (error) {
      console.error("Session check error:", error);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No active session found');
        navigate('/login');
        return;
      }

      console.log("Fetching profile for user:", session.user.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      console.log("Fetched profile:", profile);
      
      if (!profile) {
        console.log("No profile found for user");
        toast({
          title: "Profile Error",
          description: "Unable to load user profile. Please try logging in again.",
          variant: "destructive",
        });
        await handleLogout();
        return;
      }

      setIsAdmin(profile?.role === 'admin');
      setProfile(profile);
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile. Please try logging in again.",
        variant: "destructive",
      });
      await handleLogout();
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      setIsAdmin(false);
      navigate("/login");
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

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

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${(firstName?.[0] || "").toUpperCase()}${(lastName?.[0] || "").toUpperCase()}`;
  };

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
        </header>
        <main className="container py-8 animate-in">
          {children}
        </main>
      </div>
    </div>
  );
}
