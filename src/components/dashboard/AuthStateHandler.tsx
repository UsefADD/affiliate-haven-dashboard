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
    let mounted = true;

    const checkSession = async () => {
      try {
        console.log("Checking initial session...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No active session found, redirecting to login");
          if (mounted) {
            onAuthStateChange(null);
            navigate('/login');
          }
          return;
        }

        console.log("Active session found, fetching profile...");
        await checkUserProfile(session);
      } catch (error) {
        console.error("Session check error:", error);
        if (mounted) {
          toast({
            title: "Error",
            description: "Failed to check session. Please try logging in again.",
            variant: "destructive",
          });
          navigate('/login');
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log("No session found or signed out, redirecting to login");
        if (mounted) {
          onAuthStateChange(null);
          navigate('/login');
        }
        return;
      }
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log("Valid session event received, checking profile");
        await checkUserProfile(session);
      }
    });

    // Initial session check
    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, onAuthStateChange]);

  const checkUserProfile = async (session: any) => {
    if (!session?.user?.id) {
      console.log("No user ID in session, redirecting to login");
      onAuthStateChange(null);
      navigate('/login');
      return;
    }

    try {
      console.log("Fetching profile for user:", session.user.id);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (profileError) {
        console.error("Profile fetch error:", profileError);
        throw profileError;
      }
      
      if (!profile) {
        console.log("No profile found, creating new profile");
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ 
            id: session.user.id,
            email: session.user.email,
            role: 'affiliate'
          }])
          .select()
          .single();

        if (createError) {
          console.error("Profile creation error:", createError);
          throw createError;
        }
        
        console.log("Created new profile:", newProfile);
        onAuthStateChange(newProfile);
      } else {
        console.log("Existing profile found:", profile);
        onAuthStateChange(profile);
      }
    } catch (error) {
      console.error('Profile check/create error:', error);
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