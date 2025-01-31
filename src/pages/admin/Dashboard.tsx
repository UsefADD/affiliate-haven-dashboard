import { DashboardLayout } from "@/components/DashboardLayout";
import { AffiliatePerformanceDashboard } from "@/components/admin/AffiliatePerformanceDashboard";
import { AffiliateApplicationsManager } from "@/components/admin/AffiliateApplicationsManager";
import { ClicksOverview } from "@/components/admin/ClicksOverview";

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8 p-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        
        <div className="grid gap-8 md:grid-cols-2">
          <ClicksOverview />
          <AffiliatePerformanceDashboard />
        </div>
        
        <AffiliateApplicationsManager />
      </div>
    </DashboardLayout>
  );
}