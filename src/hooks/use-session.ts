import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useSession() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        console.log("Checking session...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session check error:", sessionError);
          if (mounted) {
            setIsLoading(false);
            navigate('/login');
          }
          return;
        }

        if (!session?.user) {
          console.log("No active session");
          if (mounted) {
            setIsLoading(false);
            navigate('/login');
          }
          return;
        }

        console.log("Session found, checking profile...");
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          throw profileError;
        }

        if (mounted) {
          setIsLoading(false);
          if (profile?.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
        if (mounted) {
          setIsLoading(false);
          toast({
            title: "Error",
            description: "Failed to check session. Please try logging in again.",
            variant: "destructive",
          });
          navigate('/login');
        }
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, [navigate, toast]);

  return { isLoading };
}