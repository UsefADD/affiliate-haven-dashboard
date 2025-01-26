import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Redirect() {
  const { affiliateId, offerId } = useParams();
  const [countdown, setCountdown] = useState(3);
  const [destination, setDestination] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const recordClick = async () => {
      try {
        // Record the click
        const { error: clickError } = await supabase
          .from('affiliate_clicks')
          .insert({
            affiliate_id: affiliateId,
            offer_id: offerId,
            ip_address: await fetch('https://api.ipify.org?format=json')
              .then(res => res.json())
              .then(data => data.ip),
            user_agent: navigator.userAgent,
            referrer: document.referrer
          });

        if (clickError) {
          console.error('Error recording click:', clickError);
        }

        // Get the offer details
        const { data: offer } = await supabase
          .from('offers')
          .select('links')
          .eq('id', offerId)
          .maybeSingle();

        // Get the affiliate's profile for subdomain
        const { data: profile } = await supabase
          .from('profiles')
          .select('subdomain')
          .eq('id', affiliateId)
          .maybeSingle();

        if (offer?.links?.[0]) {
          let finalUrl = offer.links[0];
          
          if (profile?.subdomain) {
            try {
              const url = new URL(finalUrl.startsWith('http') ? finalUrl : `https://${finalUrl}`);
              const domainParts = url.hostname.split('.');
              const baseDomain = domainParts.length > 2 ? domainParts.slice(-2).join('.') : url.hostname;
              finalUrl = `https://${profile.subdomain}.${baseDomain}${url.pathname}${url.search}`;
            } catch (error) {
              console.error('Error generating subdomain URL:', error);
            }
          }
          
          setDestination(finalUrl);
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error in redirect:', error);
        navigate('/');
      }
    };

    recordClick();

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1 && destination) {
          window.location.href = destination;
          clearInterval(timer);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [affiliateId, offerId, destination, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-green-50 to-green-100">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto" />
        <h1 className="text-2xl font-semibold text-gray-900">
          Redirecting you in {countdown} seconds...
        </h1>
        <p className="text-gray-600">Please wait while we process your request</p>
      </div>
    </div>
  );
}