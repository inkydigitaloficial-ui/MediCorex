

// This page can be a redirect or a generic welcome.
// For now, let's keep it simple.
import TenantDashboard from "./dashboard/page";

export default function TenantPage({ params }: { params: { tenantId: string } }) {
  // Render the dashboard directly as the root for a tenant
  return <TenantDashboard params={params} />;
}
