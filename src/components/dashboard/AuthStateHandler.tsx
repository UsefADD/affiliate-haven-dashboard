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
      
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESH_FAILED') {
        console.log("Session invalid or expired, redirecting to login");
        onAuthStateChange(null);
        navigate('/login');
        return;
      }
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log("Valid session found, fetching profile");
        if (session) {
          await checkUserProfile(session);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, onAuthStateChange]);

  const checkSession = async () => {
    try {
      console.log("Checking session...");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw sessionError;
      }

      if (!session) {
        console.log("No active session found");
        onAuthStateChange(null);
        navigate('/login');
        return;
      }

      // Try to refresh the session
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error("Session refresh error:", refreshError);
        onAuthStateChange(null);
        navigate('/login');
        return;
      }

      if (refreshData.session) {
        console.log("Session refreshed successfully");
        await checkUserProfile(refreshData.session);
      } else {
        console.log("No session after refresh, redirecting to login");
        onAuthStateChange(null);
        navigate('/login');
      }
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

  const checkUserProfile = async (session: any) => {
    try {
      if (!session?.user?.id) {
        throw new Error('No user ID in session');
      }

      console.log("Fetching profile for user:", session.user.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.error("Profile fetch error:", error);
        throw error;
      }
      
      console.log("Fetched profile:", profile);
      
      if (!profile) {
        console.log("No profile found, creating new profile");
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ id: session.user.id }])
          .select()
          .single();

        if (createError) throw createError;
        
        console.log("Created new profile:", newProfile);
        onAuthStateChange(newProfile);
      } else {
        onAuthStateChange(profile);
      }
    } catch (error) {
      console.error('Profile fetch/create error:', error);
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