import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Campaign } from "@/types/campaign";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CampaignList } from "@/components/campaigns/CampaignList";
import { CampaignDetails } from "@/components/campaigns/CampaignDetails";
import { SearchBar } from "@/components/campaigns/SearchBar";
import { Offer } from "@/types/offer";

export default function Campaigns() {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [affiliateLinks, setAffiliateLinks] = useState<Record<string, string>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
      if (user?.id) {
        fetchAffiliateLinks(user.id);
      }
    };
    getCurrentUser();
    fetchOffers();
  }, []);

  const fetchAffiliateLinks = async (userId: string) => {
    try {
      console.log("Fetching affiliate links for user:", userId);
      const { data, error } = await supabase
        .from('affiliate_links')
        .select('offer_id, tracking_url')
        .eq('affiliate_id', userId);

      if (error) throw error;

      console.log("Fetched affiliate links:", data);
      
      const linksMap = data?.reduce((acc, link) => ({
        ...acc,
        [link.offer_id]: link.tracking_url
      }), {}) || {};

      console.log("Processed affiliate links map:", linksMap);
      setAffiliateLinks(linksMap);
    } catch (error) {
      console.error('Error fetching affiliate links:', error);
    }
  };

  const getTrackingUrl = (offer: Offer) => {
    if (!currentUserId) return null;
    console.log("Getting tracking URL for offer:", offer.id);
    console.log("Current affiliate links:", affiliateLinks);
    console.log("Specific affiliate link:", affiliateLinks[offer.id]);
    
    // First check if there's a specific affiliate link for this offer
    const affiliateLink = affiliateLinks[offer.id];
    if (affiliateLink) {
      console.log("Using affiliate-specific link:", affiliateLink);
      return affiliateLink;
    }
    
    // If no specific affiliate link is found, return the default offer link if available
    const defaultLink = offer.links && offer.links.length > 0 ? offer.links[0] : null;
    console.log("Using default link:", defaultLink);
    return defaultLink;
  };

  const fetchOffers = async () => {
    try {
      console.log("Fetching offers for campaigns page...");
      const { data: offersData, error } = await supabase
        .from('offers')
        .select(`
          *,
          leads:leads(count),
          last_conversion:leads(conversion_date)
        `)
        .eq('status', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching offers:", error);
        throw error;
      }

      console.log("Fetched offers for campaigns:", offersData);
      
      const typedOffers: Offer[] = offersData.map(offer => ({
        ...offer,
        creatives: offer.creatives as Offer['creatives'] || [],
        links: offer.links || [],
        leads_count: offer.leads?.[0]?.count || 0,
        last_conversion_date: offer.last_conversion?.[0]?.conversion_date || null
      }));
      
      setOffers(typedOffers);
    } catch (error) {
      console.error('Error in fetchOffers:', error);
    }
  };

  const filteredOffers = offers.filter(offer =>
    offer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Email Marketing Campaigns</h2>
          <div className="flex gap-4">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>
        
        <CampaignList 
          campaigns={filteredOffers} 
          onViewDetails={(campaign) => setSelectedCampaign(campaign)} 
        />
      </Card>

      <CampaignDetails 
        campaign={selectedCampaign} 
        onClose={() => setSelectedCampaign(null)}
        trackingUrl={selectedCampaign ? getTrackingUrl(selectedCampaign as unknown as Offer) : null}
      />
    </DashboardLayout>
  );
}