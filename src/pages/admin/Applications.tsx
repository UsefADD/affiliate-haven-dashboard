
import { DashboardLayout } from "@/components/DashboardLayout";
import { AffiliateApplicationsList } from "@/components/admin/AffiliateApplicationsList";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Applications() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Affiliate Applications</h1>
        
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Applications</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <AffiliateApplicationsList showAll={true} />
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <AffiliateApplicationsList statusFilter="pending" />
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <AffiliateApplicationsList statusFilter="approved" />
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <AffiliateApplicationsList statusFilter="rejected" />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
