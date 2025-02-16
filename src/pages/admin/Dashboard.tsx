
import { DashboardLayout } from "@/components/DashboardLayout";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { ClicksOverview } from "@/components/admin/ClicksOverview";
import { AffiliatePerformanceDashboard } from "@/components/admin/AffiliatePerformanceDashboard";
import { RedirectDomainsManager } from "@/components/admin/RedirectDomainsManager";

export default function AdminDashboard() {
  return (
    <AdminRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <RedirectDomainsManager />
          <AffiliatePerformanceDashboard />
          <ClicksOverview />
        </div>
      </DashboardLayout>
    </AdminRoute>
  );
}
