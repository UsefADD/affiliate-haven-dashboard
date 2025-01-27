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
        await checkUserProfile(session);
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

      console.log("Active session found:", session);
      await checkUserProfile(session);
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