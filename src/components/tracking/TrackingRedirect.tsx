import { useEffect } from "react";
import { useParams } from "react-router-dom";

export function TrackingRedirect() {
  const { offerId, affiliateId } = useParams();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Call the tracking endpoint
        const response = await fetch(`/functions/v1/track/${offerId}/${affiliateId}`);
        
        if (!response.ok) {
          throw new Error('Failed to track click');
        }

        // Get the redirect URL from the Location header
        const redirectUrl = response.headers.get('Location');
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          throw new Error('No redirect URL provided');
        }
      } catch (error) {
        console.error('Error handling redirect:', error);
        // Redirect to homepage on error
        window.location.href = '/';
      }
    };

    handleRedirect();
  }, [offerId, affiliateId]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Redirecting...</h2>
        <p className="text-gray-600">You are being redirected to the offer.</p>
      </div>
    </div>
  );
}