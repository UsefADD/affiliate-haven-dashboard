
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Campaign } from "@/types/campaign";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CampaignList } from "@/components/campaigns/CampaignList";
import { CampaignDetails } from "@/components/campaigns/CampaignDetails";
import { SearchBar } from "@/components/campaigns/SearchBar";
import { Offer } from "@/types/offer";
import { useToast } from "@/hooks/use-toast";

export default function Campaigns() {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [trackingUrl, setTrackingUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      fetchTrackingUrl(selectedCampaign.id);
    }
  }, [selectedCampaign]);

  const fetchTrackingUrl = async (campaignId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No user found");
        return;
      }

      // First check for specific affiliate link
      const { data: affiliateLink, error: linkError } = await supabase
        .from('affiliate_links')
        .select('tracking_url')
        .eq('offer_id', campaignId)
        .eq('affiliate_id', user.id)
        .single();

      if (affiliateLink?.tracking_url) {
        console.log("Found specific affiliate link:", affiliateLink.tracking_url);
        setTrackingUrl(affiliateLink.tracking_url);
        return;
      }

      // If no specific link, check for subdomain and offer links
      const { data: profile } = await supabase
        .from('profiles')
        .select('subdomain')
        .eq('id', user.id)
        .single();

      const { data: offer } = await supabase
        .from('offers')
        .select('links')
        .eq('id', campaignId)
        .single();

      if (profile?.subdomain && offer?.links?.[0]) {
        try {
          const defaultLink = offer.links[0];
          const url = new URL(defaultLink.startsWith('http') ? defaultLink : `https://${defaultLink}`);
          const domainParts = url.hostname.split('.');
          const baseDomain = domainParts.length > 2 ? domainParts.slice(-2).join('.') : url.hostname;
          const newUrl = `https://${profile.subdomain}.${baseDomain}${url.pathname}${url.search}`;
          console.log("Generated subdomain URL:", newUrl);
          setTrackingUrl(newUrl);
          return;
        } catch (error) {
          console.error('Error generating tracking URL:', error);
        }
      }

      if (offer?.links?.[0]) {
        setTrackingUrl(offer.links[0]);
        return;
      }

      setTrackingUrl(null);
    } catch (error) {
      console.error('Error in fetchTrackingUrl:', error);
      setTrackingUrl(null);
    }
  };

  const fetchOffers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First, get custom payouts directly from offer_payouts table
      const { data: customPayouts, error: payoutsError } = await supabase
        .from('offer_payouts')
        .select('offer_id, custom_payout')
        .eq('affiliate_id', user.id);

      if (payoutsError) {
        console.error("Error fetching custom payouts:", payoutsError);
        throw payoutsError;
      }

      console.log("Fetched custom payouts:", customPayouts);

      // Create a map of offer_id to custom_payout
      const payoutMap = new Map(
        customPayouts?.map((p) => [p.offer_id, p.custom_payout]) || []
      );

      // Then get all active offers
      const { data: offersData, error: offersError } = await supabase
        .from('offers')
        .select('*')
        .eq('status', true)
        .order('created_at', { ascending: false });

      if (offersError) {
        console.error("Error fetching offers:", offersError);
        throw offersError;
      }

      console.log("Fetched offers:", offersData);

      // Check visibility and apply custom payouts
      const visibleOffers = await Promise.all(
        (offersData || []).map(async (offer) => {
          const { data: visibilityData } = await supabase
            .from('offer_visibility')
            .select('is_visible')
            .eq('offer_id', offer.id)
            .eq('affiliate_id', user.id)
            .maybeSingle();

          // If no visibility rule exists or is_visible is true, show the offer
          if (!visibilityData || visibilityData.is_visible) {
            // Get custom payout if it exists
            const customPayout = payoutMap.get(offer.id);
            console.log(`Offer ${offer.id} custom payout:`, customPayout);
            
            // Transform the offer data
            const transformedOffer: Offer = {
              id: offer.id,
              name: offer.name,
              description: offer.description || '',
              payout: customPayout !== undefined ? customPayout : offer.payout,
              status: offer.status || false,
              created_at: offer.created_at,
              created_by: offer.created_by || user.id,
              creatives: Array.isArray(offer.creatives) 
                ? offer.creatives.map((creative: any) => ({
                    type: creative.type === "email" ? "email" : "image",
                    content: String(creative.content || ""),
                    details: {
                      fromNames: Array.isArray(creative.details?.fromNames) ? creative.details.fromNames : [],
                      subjects: Array.isArray(creative.details?.subjects) ? creative.details.subjects : []
                    },
                    images: Array.isArray(creative.images) ? creative.images : []
                  }))
                : [],
              links: Array.isArray(offer.links) ? offer.links : [],
              is_top_offer: offer.is_top_offer || false,
            };

            console.log(`Transformed offer ${offer.id}:`, transformedOffer);
            return transformedOffer;
          }
          return null;
        })
      );

      const filteredOffers = visibleOffers.filter((offer): offer is Offer => 
        offer !== null
      );

      console.log("Final processed offers with custom payouts:", filteredOffers);
      setOffers(filteredOffers);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch offers",
      });
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredOffers = offers.filter(offer =>
    offer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    offer.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (offer.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const handleCampaignSelect = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
  };

  const handleCloseDetails = () => {
    setSelectedCampaign(null);
    setTrackingUrl(null);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaigns</h1>
          <p className="text-muted-foreground">
            View and manage your active campaigns
          </p>
        </div>
        
        <div className="mb-6 bg-white/50 backdrop-blur-sm rounded-lg p-4 border shadow-sm">
          <SearchBar onSearch={handleSearch} value={searchQuery} />
        </div>

        <CampaignList
          campaigns={filteredOffers}
          onViewDetails={handleCampaignSelect}
        />

        <CampaignDetails
          campaign={selectedCampaign}
          onClose={handleCloseDetails}
          trackingUrl={trackingUrl}
        />
      </div>
    </DashboardLayout>
  );
}
