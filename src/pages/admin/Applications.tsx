
import { DashboardLayout } from "@/components/DashboardLayout";
import { AffiliateApplicationsList } from "@/components/admin/AffiliateApplicationsList";

export default function Applications() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Affiliate Applications</h1>
        <AffiliateApplicationsList showAll={true} />
      </div>
    </DashboardLayout>
  );
}

