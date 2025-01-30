import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { AffiliateApplicationForm } from "@/components/affiliate/AffiliateApplicationForm";
import { ForgotPassword } from "@/components/auth/ForgotPassword";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Current session:", session);
        
        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error("Profile fetch error:", profileError);
            return;
          }

          console.log("User profile:", profile);
          if (profile?.role === 'admin') {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }
      } catch (error) {
        console.error("Session check failed:", error);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (session?.user) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error("Profile fetch error:", profileError);
            return;
          }

          console.log("User profile after auth change:", profile);
          if (profile?.role === 'admin') {
            navigate("/admin");
          } else {
            navigate("/");
          }
        } catch (error) {
          console.error("Profile check failed:", error);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Attempting login with email:", email);

    try {
      // Trim whitespace from email and password
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      console.log("Making auth request to Supabase...");
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (authError) {
        console.error("Auth error details:", authError);
        let errorMessage = "Invalid email or password.";
        
        if (authError.message.includes("Email not confirmed")) {
          errorMessage = "Please verify your email address before logging in.";
        } else if (authError.message.includes("Invalid login credentials")) {
          errorMessage = "The email or password you entered is incorrect.";
        }
        
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      console.log("Auth successful:", authData);

      if (authData.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .maybeSingle();

        console.log("Profile data:", profile);
        
        if (profileError) {
          console.error("Profile fetch error:", profileError);
          toast({
            title: "Error",
            description: "Failed to fetch user profile. Please try again.",
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });

        // Navigation will be handled by the auth state change listener
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return <ForgotPassword />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-primary to-blue-600">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-grid-white/[0.05]" />
      <div className="absolute inset-0 flex items-center justify-center bg-white/5 backdrop-blur-sm">
        <Card className="w-full max-w-md p-8 bg-white/90 backdrop-blur-lg shadow-xl animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              ClixAgent
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Sign in to your account to continue
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                placeholder="Enter your password"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>

            <div className="flex flex-col items-center space-y-4 pt-4">
              <Button
                type="button"
                variant="link"
                className="text-sm text-primary hover:text-purple-600 transition-colors"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
              </Button>
              <Button
                type="button"
                variant="link"
                className="text-sm text-primary hover:text-purple-600 transition-colors"
                onClick={() => setShowApplicationForm(true)}
              >
                Apply as Affiliate
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <Dialog open={showApplicationForm} onOpenChange={setShowApplicationForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Affiliate Application</DialogTitle>
          </DialogHeader>
          <AffiliateApplicationForm
            onSuccess={() => setShowApplicationForm(false)}
            onCancel={() => setShowApplicationForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}