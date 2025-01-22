import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { CampaignList } from "@/components/campaigns/CampaignList";
import { CampaignDetails } from "@/components/campaigns/CampaignDetails";
import { SearchBar } from "@/components/campaigns/SearchBar";
import { Offer } from "@/types/offer";

export default function Campaigns() {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchOffers();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
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
        id: offer.id,
        name: offer.name,
        description: offer.description,
        payout: offer.payout,
        status: offer.status ?? true,
        created_at: offer.created_at,
        created_by: offer.created_by,
        creatives: Array.isArray(offer.creatives) ? offer.creatives.map((creative: any) => ({
          type: creative.type || "image",
          content: creative.content || "",
          details: creative.details || {},
          images: creative.images || []
        })) : [],
        links: offer.links || [],
        is_top_offer: offer.is_top_offer ?? false
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
    offer.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (offer.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const handleCloseDetails = () => {
    setSelectedCampaignId(null);
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
          profile={profile}
        />

        {selectedCampaignId && (
          <CampaignDetails
            campaignId={selectedCampaignId}
            isOpen={!!selectedCampaignId}
            onClose={handleCloseDetails}
          />
        )}
      </div>
    </DashboardLayout>
  );
}