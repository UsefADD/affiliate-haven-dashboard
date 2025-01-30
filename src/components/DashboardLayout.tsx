import { useState, useEffect } from "react";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Current session:", session);

        if (!session?.user) {
          console.log("No session found, redirecting to login");
          navigate("/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          return;
        }

        console.log("User profile:", profile);
        setUserRole(profile?.role || null);
        setIsLoading(false);

      } catch (error) {
        console.error("Session check failed:", error);
        setIsLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      
      navigate("/login");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-primary to-blue-600">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-primary to-blue-600">
      <div className="absolute inset-0 bg-grid-white/[0.05]" />
      <div className="relative">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-lg border-b border-white/10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link to="/" className="flex items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  ClixAgent
                </h1>
              </Link>

              {/* Navigation */}
              <nav className="flex items-center space-x-1">
                <Link to="/">
                  <Button
                    variant="ghost"
                    className={`text-white hover:bg-white/10 ${
                      isActive("/") ? "bg-white/20" : ""
                    }`}
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link to="/campaigns">
                  <Button
                    variant="ghost"
                    className={`text-white hover:bg-white/10 ${
                      isActive("/campaigns") ? "bg-white/20" : ""
                    }`}
                  >
                    Campaigns
                  </Button>
                </Link>
                <Link to="/reports">
                  <Button
                    variant="ghost"
                    className={`text-white hover:bg-white/10 ${
                      isActive("/reports") ? "bg-white/20" : ""
                    }`}
                  >
                    Reports
                  </Button>
                </Link>
                {userRole === 'admin' && (
                  <Link to="/admin">
                    <Button
                      variant="ghost"
                      className={`text-white hover:bg-white/10 ${
                        location.pathname.startsWith("/admin") ? "bg-white/20" : ""
                      }`}
                    >
                      Admin
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-lg shadow-xl p-6 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
