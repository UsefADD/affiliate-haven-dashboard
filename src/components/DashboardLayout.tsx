import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "./dashboard/Navigation";
import { ProfileMenu } from "./dashboard/ProfileMenu";
import { AuthStateHandler } from "./dashboard/AuthStateHandler";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuthStateChange = (newProfile: any) => {
    setProfile(newProfile);
    setIsAdmin(newProfile?.role === 'admin');
    setIsLoading(false);
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/30">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <AuthStateHandler onAuthStateChange={handleAuthStateChange} />
      
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 transform transition-transform duration-300 ease-in-out",
          !isSidebarOpen && "-translate-x-full"
        )}
      >
        <Navigation isAdmin={isAdmin} onLogout={handleLogout} />
      </aside>

      <div
        className={cn(
          "transition-all duration-300",
          isSidebarOpen ? "lg:ml-64" : "ml-0"
        )}
      >
        <header className="sticky top-0 z-30 glass-card border-b">
          <div className="flex items-center justify-between p-4">
            <Button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              variant="ghost"
              size="icon"
              className="lg:hidden"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <ProfileMenu profile={profile} onLogout={handleLogout} />
          </div>
        </header>
        <main className="container py-8 animate-in">
          {children}
        </main>
      </div>
    </div>
  );
}