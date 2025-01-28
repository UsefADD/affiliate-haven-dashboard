import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function RedirectPage() {
  const [countdown, setCountdown] = useState(3);
  const [destinationUrl, setDestinationUrl] = useState<string | null>(null);
  const { affiliateId, offerId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const trackClick = async () => {
      try {
        if (!affiliateId || !offerId) {
          console.error("Missing parameters:", { affiliateId, offerId });
          toast({
            title: "Error",
            description: "Invalid tracking link",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        console.log("Recording click for:", { affiliateId, offerId });
        
        // Record the click
        const { error: clickError } = await supabase.functions.invoke('track-click', {
          body: { 
            affiliateId, 
            offerId,
            referrer: document.referrer,
            userAgent: navigator.userAgent
          }
        });

        if (clickError) {
          console.error('Error recording click:', clickError);
          toast({
            title: "Error",
            description: "Failed to record click",
            variant: "destructive",
          });
        }

        // Get the destination URL
        const { data: offer, error: offerError } = await supabase
          .from('offers')
          .select('links')
          .eq('id', offerId)
          .maybeSingle();

        if (offerError) {
          console.error('Error fetching offer:', offerError);
          toast({
            title: "Error",
            description: "Failed to fetch offer details",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        if (!offer?.links?.[0]) {
          console.error('No destination URL found for offer');
          toast({
            title: "Error",
            description: "Invalid offer link",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        const url = offer.links[0];
        setDestinationUrl(url.startsWith('http') ? url : `https://${url}`);
      } catch (error) {
        console.error('Error in trackClick:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
        navigate("/");
      }
    };

    trackClick();
  }, [affiliateId, offerId, navigate, toast]);

  useEffect(() => {
    if (!destinationUrl) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = destinationUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [destinationUrl]);

  if (!destinationUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center">
        <div className="text-center space-y-4 p-8 rounded-lg bg-white/50 backdrop-blur-sm shadow-lg border">
          <h1 className="text-2xl font-bold text-destructive">Error</h1>
          <p className="text-muted-foreground">
            Invalid tracking link. Redirecting to home page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center">
      <div className="text-center space-y-4 p-8 rounded-lg bg-white/50 backdrop-blur-sm shadow-lg border">
        <h1 className="text-2xl font-bold text-green-600">Please wait...</h1>
        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-muted-foreground">
          You will be redirected in {countdown} seconds...
        </p>
      </div>
    </div>
  );
}