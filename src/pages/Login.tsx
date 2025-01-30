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
            .select('role, is_blocked')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error("Profile fetch error:", profileError);
            return;
          }

          console.log("User profile:", profile);
          
          if (profile?.is_blocked) {
            await supabase.auth.signOut();
            toast({
              title: "Account Disabled",
              description: "Your account has been disabled. Please contact support for assistance.",
              variant: "destructive",
            });
            return;
          }

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
            .select('role, is_blocked')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error("Profile fetch error:", profileError);
            return;
          }

          console.log("User profile after auth change:", profile);
          
          if (profile?.is_blocked) {
            await supabase.auth.signOut();
            toast({
              title: "Account Disabled",
              description: "Your account has been disabled. Please contact support for assistance.",
              variant: "destructive",
            });
            return;
          }

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
  }, [navigate, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Attempting login with email:", email);

    try {
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
          .select('role, is_blocked')
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

        if (profile?.is_blocked) {
          await supabase.auth.signOut();
          toast({
            title: "Account Disabled",
            description: "Your account has been disabled. Please contact support for assistance.",
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
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
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/30">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-600">ClixAgent</h1>
            <p className="text-muted-foreground mt-2">Sign in to your account</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                placeholder="Enter your password"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="text-center space-y-2">
              <Button
                type="button"
                variant="link"
                className="text-sm text-green-600 hover:underline"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
              </Button>
              <Button
                type="button"
                variant="link"
                className="text-sm text-green-600 hover:underline block mx-auto"
                onClick={() => setShowApplicationForm(true)}
              >
                Affiliate Application
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
    </>
  );
}
