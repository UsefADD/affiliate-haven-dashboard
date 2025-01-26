import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthStateHandlerProps {
  onAuthStateChange: (profile: any) => void;
}

export function AuthStateHandler({ onAuthStateChange }: AuthStateHandlerProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log("No session found, redirecting to login");
        onAuthStateChange(null);
        navigate('/login');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log("Session found, fetching profile");
        await checkUserProfile();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, onAuthStateChange]);

  const checkSession = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;

      if (!session) {
        console.log("No active session found");
        navigate('/login');
        return;
      }

      await checkUserProfile();
    } catch (error) {
      console.error("Session check error:", error);
      toast({
        title: "Session Error",
        description: "Please try logging in again",
        variant: "destructive",
      });
      navigate('/login');
    }
  };

  const checkUserProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      console.log("Fetching profile for user:", session.user.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      console.log("Fetched profile:", profile);
      
      if (!profile) {
        throw new Error('No profile found');
      }

      onAuthStateChange(profile);
    } catch (error) {
      console.error('Profile fetch error:', error);
      toast({
        title: "Profile Error",
        description: "Unable to load your profile. Please try logging in again.",
        variant: "destructive",
      });
      navigate('/login');
    }
  };

  return null;
}