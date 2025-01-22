import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Campaign } from "@/types/campaign";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CampaignList } from "@/components/campaigns/CampaignList";
import { CampaignDetails } from "@/components/campaigns/CampaignDetails";
import { SearchBar } from "@/components/campaigns/SearchBar";
import { Offer } from "@/types/offer";

export default function Campaigns() {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [trackingUrl, setTrackingUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      fetchTrackingUrl(selectedCampaign.id.toString());
    }
  }, [selectedCampaign]);

  const fetchTrackingUrl = async (campaignId: string) => {
    try {
      console.log("Fetching tracking URL for campaign:", campaignId);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No user found");
        return;
      }

      const { data, error } = await supabase
        .from('affiliate_links')
        .select('tracking_url')
        .eq('offer_id', campaignId)
        .eq('affiliate_id', user.id)
        .single();

      if (error) {
        console.error("Error fetching tracking URL:", error);
        throw error;
      }

      console.log("Fetched tracking URL:", data?.tracking_url);
      setTrackingUrl(data?.tracking_url || null);
    } catch (error) {
      console.error('Error in fetchTrackingUrl:', error);
      setTrackingUrl(null);
    }
  };

  const fetchOffers = async () => {
    try {
      console.log("Fetching offers for campaigns page...");
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('status', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching offers:", error);
        throw error;
      }

      console.log("Fetched offers for campaigns:", data);
      
      const typedOffers: Offer[] = data.map(offer => ({
        ...offer,
        creatives: offer.creatives as Offer['creatives'] || [],
        links: offer.links || [],
        created_by: offer.created_by || '',
        status: offer.status ?? true,
        created_at: offer.created_at || new Date().toISOString(),
      }));
      
      setOffers(typedOffers);
    } catch (error) {
      console.error('Error in fetchOffers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredOffers = offers.filter(offer =>
    offer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <SearchBar value={searchQuery} onSearch={handleSearch} />
        </div>
        <CampaignList
          campaigns={filteredOffers.map(offer => ({
            id: parseInt(offer.id),
            name: offer.name,
            description: offer.description || '',
            payout: offer.payout.toString(),
            creatives: offer.creatives || [],
          }))}
          onSelect={handleCampaignSelect}
          isLoading={isLoading}
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